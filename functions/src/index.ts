import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, GeoPoint, Timestamp } from 'firebase-admin/firestore';
import { auth } from 'firebase-functions/v1';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import type { Slot, WaitlistEntryDoc, AvailabilityDoc } from './types';

initializeApp();
setGlobalOptions({ maxInstances: 10 });

const MATCH_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

// ─── Helper: match next pending user to an open slot ─────────────────────────
// Called by onAvailabilityUpdate and timeoutUnconfirmed.
// Uses a transaction to prevent two users matching the same slot.

async function matchAndNotify(serviceId: string, slotTime: string, date: string) {
  const db = getFirestore();

  const pendingSnap = await db
    .collection('waitlistEntries')
    .where('serviceIds', 'array-contains', serviceId)
    .where('status', '==', 'pending')
    .orderBy('position')
    .limit(1)
    .get();

  if (pendingSnap.empty) return;

  const entryRef = pendingSnap.docs[0].ref;
  const availRef = db.doc(`services/${serviceId}/availability/${date}`);

  await db.runTransaction(async (tx) => {
    const [entrySnap, availSnap] = await Promise.all([
      tx.get(entryRef),
      tx.get(availRef),
    ]);

    const entry = entrySnap.data() as WaitlistEntryDoc | undefined;
    const avail = availSnap.data() as AvailabilityDoc | undefined;

    if (!entry || entry.status !== 'pending') return;
    if (!avail) return;

    // Verify slot is still open
    const slots = [...avail.slots];
    const slotIdx = slots.findIndex((s) => s.time === slotTime && s.status === 'open');
    if (slotIdx === -1) return;

    const slot = slots[slotIdx];
    if (slot.booked >= slot.capacity) return;

    // Decrement slot and flip to full if needed
    const newBooked = slot.booked + 1;
    slots[slotIdx] = {
      ...slot,
      booked: newBooked,
      status: newBooked >= slot.capacity ? 'full' : 'open',
    };

    tx.update(availRef, { slots, updatedAt: Timestamp.now() });
    tx.update(entryRef, {
      status: 'matched',
      matchedServiceId: serviceId,
      matchedSlot: slotTime,
      notifiedAt: Timestamp.now(),
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
      sentAt: Timestamp.now(),
    });
  });
}

// ─── 1. createUserDoc ─────────────────────────────────────────────────────────
// Triggered when a new user signs up via Firebase Auth.
// Automatically creates their /users/{uid} document.

export const createUserDoc = auth.user().onCreate(async (user) => {
  const db = getFirestore();
  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    name: user.displayName ?? '',
    phone: user.phoneNumber ?? '',
    email: user.email ?? '',
    location: new GeoPoint(0, 0), // user updates their location later
    createdAt: Timestamp.now(),
  });
});

// ─── 2. joinWaitlist ──────────────────────────────────────────────────────────
// Callable from the frontend. Creates a waitlist entry with a queue position.

export const joinWaitlist = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to join a waitlist.');
  }

  const { serviceIds, preferredDate } = request.data as {
    serviceIds: string[];
    preferredDate: string; // ISO date string from client
  };

  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new HttpsError('invalid-argument', 'serviceIds must be a non-empty array.');
  }
  if (!preferredDate) {
    throw new HttpsError('invalid-argument', 'preferredDate is required.');
  }

  const db = getFirestore();

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
    preferredDate: Timestamp.fromDate(new Date(preferredDate)),
    status: 'pending',
    position,
    createdAt: Timestamp.now(),
  });

  return { eid: entryRef.id, position };
});

// ─── 3. cancelWaitlist ────────────────────────────────────────────────────────
// Callable from the frontend. Soft-cancels the entry and repositions the queue.

export const cancelWaitlist = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to cancel a waitlist.');
  }

  const { eid } = request.data as { eid: string };
  if (!eid) {
    throw new HttpsError('invalid-argument', 'eid is required.');
  }

  const db = getFirestore();
  const entryRef = db.collection('waitlistEntries').doc(eid);

  // Validate ownership and status inside a transaction
  let cancelledPosition: number;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(entryRef);
    if (!snap.exists) throw new HttpsError('not-found', 'Waitlist entry not found.');

    const entry = snap.data() as WaitlistEntryDoc;
    if (entry.userUid !== request.auth!.uid) {
      throw new HttpsError('permission-denied', 'You do not own this entry.');
    }
    if (entry.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'Only pending entries can be cancelled.');
    }

    cancelledPosition = entry.position;
    tx.update(entryRef, { status: 'cancelled' });
  });

  // Shift everyone behind the cancelled entry up by one position
  const toShift = await db
    .collection('waitlistEntries')
    .where('status', '==', 'pending')
    .where('position', '>', cancelledPosition!)
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

export const onAvailabilityUpdate = onDocumentUpdated(
  'services/{serviceId}/availability/{date}',
  async (event) => {
    const before = event.data?.before.data() as AvailabilityDoc | undefined;
    const after = event.data?.after.data() as AvailabilityDoc | undefined;

    if (!before || !after) return;

    const { serviceId, date } = event.params;

    // Find slots that are newly open (were not open before)
    const newlyOpen = (after.slots as Slot[]).filter((slot, i) => {
      const prev = (before.slots as Slot[])[i];
      return slot.status === 'open' && prev?.status !== 'open';
    });

    for (const slot of newlyOpen) {
      await matchAndNotify(serviceId, slot.time, date);
    }
  }
);

// ─── 5. timeoutUnconfirmed ────────────────────────────────────────────────────
// Runs every 5 minutes. Reclaims matched slots that were never confirmed,
// resets the entry to pending, and tries the next person in queue.

export const timeoutUnconfirmed = onSchedule('every 5 minutes', async () => {
  const db = getFirestore();
  const cutoff = Timestamp.fromMillis(Date.now() - MATCH_TIMEOUT_MS);

  const expiredSnap = await db
    .collection('waitlistEntries')
    .where('status', '==', 'matched')
    .where('notifiedAt', '<', cutoff)
    .get();

  if (expiredSnap.empty) return;

  for (const doc of expiredSnap.docs) {
    const entry = doc.data() as WaitlistEntryDoc;
    const { matchedServiceId, matchedSlot, preferredDate } = entry;

    if (!matchedServiceId || !matchedSlot) continue;

    const dateStr = preferredDate.toDate().toISOString().split('T')[0];
    const availRef = db.doc(`services/${matchedServiceId}/availability/${dateStr}`);

    await db.runTransaction(async (tx) => {
      const [entrySnap, availSnap] = await Promise.all([
        tx.get(doc.ref),
        tx.get(availRef),
      ]);

      // Guard: another process may have already resolved this entry
      if (entrySnap.data()?.status !== 'matched') return;

      // Reset entry back to pending
      tx.update(doc.ref, {
        status: 'pending',
        matchedServiceId: FieldValue.delete(),
        matchedSlot: FieldValue.delete(),
        notifiedAt: FieldValue.delete(),
      });

      // Reclaim the slot
      if (availSnap.exists) {
        const avail = availSnap.data() as AvailabilityDoc;
        const slots = [...avail.slots];
        const slotIdx = slots.findIndex((s) => s.time === matchedSlot);
        if (slotIdx !== -1) {
          const newBooked = Math.max(0, slots[slotIdx].booked - 1);
          slots[slotIdx] = {
            ...slots[slotIdx],
            booked: newBooked,
            status: 'open',
          };
          tx.update(availRef, { slots, updatedAt: Timestamp.now() });
        }
      }
    });

    // Try to match the next person in queue for this slot
    await matchAndNotify(matchedServiceId, matchedSlot, dateStr);
  }
});
