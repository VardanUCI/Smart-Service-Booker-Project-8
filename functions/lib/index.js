"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutUnconfirmed = exports.onAvailabilityUpdate = exports.cancelWaitlist = exports.joinWaitlist = exports.createUserDoc = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const v1_1 = require("firebase-functions/v1");
const https_1 = require("firebase-functions/v2/https");
const firestore_2 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const v2_1 = require("firebase-functions/v2");
(0, app_1.initializeApp)();
(0, v2_1.setGlobalOptions)({ maxInstances: 10 });
const MATCH_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
// ─── Helper: match next pending user to an open slot ─────────────────────────
// Called by onAvailabilityUpdate and timeoutUnconfirmed.
// Uses a transaction to prevent two users matching the same slot.
async function matchAndNotify(serviceId, slotTime, date) {
    const db = (0, firestore_1.getFirestore)();
    const pendingSnap = await db
        .collection('waitlistEntries')
        .where('serviceIds', 'array-contains', serviceId)
        .where('status', '==', 'pending')
        .orderBy('position')
        .limit(1)
        .get();
    if (pendingSnap.empty)
        return;
    const entryRef = pendingSnap.docs[0].ref;
    const availRef = db.doc(`services/${serviceId}/availability/${date}`);
    await db.runTransaction(async (tx) => {
        const [entrySnap, availSnap] = await Promise.all([
            tx.get(entryRef),
            tx.get(availRef),
        ]);
        const entry = entrySnap.data();
        const avail = availSnap.data();
        if (!entry || entry.status !== 'pending')
            return;
        if (!avail)
            return;
        // Verify slot is still open
        const slots = [...avail.slots];
        const slotIdx = slots.findIndex((s) => s.time === slotTime && s.status === 'open');
        if (slotIdx === -1)
            return;
        const slot = slots[slotIdx];
        if (slot.booked >= slot.capacity)
            return;
        // Decrement slot and flip to full if needed
        const newBooked = slot.booked + 1;
        slots[slotIdx] = Object.assign(Object.assign({}, slot), { booked: newBooked, status: newBooked >= slot.capacity ? 'full' : 'open' });
        tx.update(availRef, { slots, updatedAt: firestore_1.Timestamp.now() });
        tx.update(entryRef, {
            status: 'matched',
            matchedServiceId: serviceId,
            matchedSlot: slotTime,
            notifiedAt: firestore_1.Timestamp.now(),
        });
        // Write notification doc — integration engineer's Twilio listener picks this up
        const notifRef = db.collection('notifications').doc();
        tx.set(notifRef, {
            nid: notifRef.id,
            userUid: entry.userUid,
            entryId: entrySnap.id,
            type: 'sms',
            message: `Your spot opened at service ${serviceId} on ${date} at ${slotTime}. You have 15 minutes to confirm.`,
            status: 'pending',
            sentAt: firestore_1.Timestamp.now(),
        });
    });
}
// ─── 1. createUserDoc ─────────────────────────────────────────────────────────
// Triggered when a new user signs up via Firebase Auth.
// Automatically creates their /users/{uid} document.
exports.createUserDoc = v1_1.auth.user().onCreate(async (user) => {
    var _a, _b, _c;
    const db = (0, firestore_1.getFirestore)();
    await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        name: (_a = user.displayName) !== null && _a !== void 0 ? _a : '',
        phone: (_b = user.phoneNumber) !== null && _b !== void 0 ? _b : '',
        email: (_c = user.email) !== null && _c !== void 0 ? _c : '',
        location: new firestore_1.GeoPoint(0, 0), // user updates their location later
        createdAt: firestore_1.Timestamp.now(),
    });
});
// ─── 2. joinWaitlist ──────────────────────────────────────────────────────────
// Callable from the frontend. Creates a waitlist entry with a queue position.
exports.joinWaitlist = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in to join a waitlist.');
    }
    const { serviceIds, preferredDate } = request.data;
    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'serviceIds must be a non-empty array.');
    }
    if (!preferredDate) {
        throw new https_1.HttpsError('invalid-argument', 'preferredDate is required.');
    }
    const db = (0, firestore_1.getFirestore)();
    // Position = current count of pending entries + 1
    const countSnap = await db
        .collection('waitlistEntries')
        .where('status', '==', 'pending')
        .count()
        .get();
    const position = countSnap.data().count + 1;
    const entryRef = db.collection('waitlistEntries').doc();
    await entryRef.set({
        eid: entryRef.id,
        userUid: request.auth.uid,
        serviceIds,
        preferredDate: firestore_1.Timestamp.fromDate(new Date(preferredDate)),
        status: 'pending',
        position,
        createdAt: firestore_1.Timestamp.now(),
    });
    return { eid: entryRef.id, position };
});
// ─── 3. cancelWaitlist ────────────────────────────────────────────────────────
// Callable from the frontend. Soft-cancels the entry and repositions the queue.
exports.cancelWaitlist = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in to cancel a waitlist.');
    }
    const { eid } = request.data;
    if (!eid) {
        throw new https_1.HttpsError('invalid-argument', 'eid is required.');
    }
    const db = (0, firestore_1.getFirestore)();
    const entryRef = db.collection('waitlistEntries').doc(eid);
    // Validate ownership and status inside a transaction
    let cancelledPosition;
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(entryRef);
        if (!snap.exists)
            throw new https_1.HttpsError('not-found', 'Waitlist entry not found.');
        const entry = snap.data();
        if (entry.userUid !== request.auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'You do not own this entry.');
        }
        if (entry.status !== 'pending') {
            throw new https_1.HttpsError('failed-precondition', 'Only pending entries can be cancelled.');
        }
        cancelledPosition = entry.position;
        tx.update(entryRef, { status: 'cancelled' });
    });
    // Shift everyone behind the cancelled entry up by one position
    const toShift = await db
        .collection('waitlistEntries')
        .where('status', '==', 'pending')
        .where('position', '>', cancelledPosition)
        .get();
    if (!toShift.empty) {
        const batch = db.batch();
        toShift.docs.forEach((doc) => {
            batch.update(doc.ref, { position: doc.data().position - 1 });
        });
        await batch.commit();
    }
    return { success: true };
});
// ─── 4. onAvailabilityUpdate ──────────────────────────────────────────────────
// Triggered when a provider updates their availability doc.
// Detects newly opened slots and kicks off the match process.
exports.onAvailabilityUpdate = (0, firestore_2.onDocumentUpdated)('services/{serviceId}/availability/{date}', async (event) => {
    var _a, _b;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!before || !after)
        return;
    const { serviceId, date } = event.params;
    // Find slots that are newly open (were not open before)
    const newlyOpen = after.slots.filter((slot, i) => {
        const prev = before.slots[i];
        return slot.status === 'open' && (prev === null || prev === void 0 ? void 0 : prev.status) !== 'open';
    });
    for (const slot of newlyOpen) {
        await matchAndNotify(serviceId, slot.time, date);
    }
});
// ─── 5. timeoutUnconfirmed ────────────────────────────────────────────────────
// Runs every 5 minutes. Reclaims matched slots that were never confirmed,
// resets the entry to pending, and tries the next person in queue.
exports.timeoutUnconfirmed = (0, scheduler_1.onSchedule)('every 5 minutes', async () => {
    const db = (0, firestore_1.getFirestore)();
    const cutoff = firestore_1.Timestamp.fromMillis(Date.now() - MATCH_TIMEOUT_MS);
    const expiredSnap = await db
        .collection('waitlistEntries')
        .where('status', '==', 'matched')
        .where('notifiedAt', '<', cutoff)
        .get();
    if (expiredSnap.empty)
        return;
    for (const doc of expiredSnap.docs) {
        const entry = doc.data();
        const { matchedServiceId, matchedSlot, preferredDate } = entry;
        if (!matchedServiceId || !matchedSlot)
            continue;
        const dateStr = preferredDate.toDate().toISOString().split('T')[0];
        const availRef = db.doc(`services/${matchedServiceId}/availability/${dateStr}`);
        await db.runTransaction(async (tx) => {
            var _a;
            const [entrySnap, availSnap] = await Promise.all([
                tx.get(doc.ref),
                tx.get(availRef),
            ]);
            // Guard: another process may have already resolved this entry
            if (((_a = entrySnap.data()) === null || _a === void 0 ? void 0 : _a.status) !== 'matched')
                return;
            // Reset entry back to pending
            tx.update(doc.ref, {
                status: 'pending',
                matchedServiceId: firestore_1.FieldValue.delete(),
                matchedSlot: firestore_1.FieldValue.delete(),
                notifiedAt: firestore_1.FieldValue.delete(),
            });
            // Reclaim the slot
            if (availSnap.exists) {
                const avail = availSnap.data();
                const slots = [...avail.slots];
                const slotIdx = slots.findIndex((s) => s.time === matchedSlot);
                if (slotIdx !== -1) {
                    const newBooked = Math.max(0, slots[slotIdx].booked - 1);
                    slots[slotIdx] = Object.assign(Object.assign({}, slots[slotIdx]), { booked: newBooked, status: 'open' });
                    tx.update(availRef, { slots, updatedAt: firestore_1.Timestamp.now() });
                }
            }
        });
        // Try to match the next person in queue for this slot
        await matchAndNotify(matchedServiceId, matchedSlot, dateStr);
    }
});
//# sourceMappingURL=index.js.map