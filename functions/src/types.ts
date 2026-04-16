import type { GeoPoint, Timestamp } from 'firebase-admin/firestore';

// ─── Shared sub-types ─────────────────────────────────────────────────────────

export type SlotStatus = 'open' | 'full' | 'closed';
export type WaitlistStatus = 'pending' | 'matched' | 'cancelled';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Slot {
  time: string;       // "HH:MM"
  capacity: number;
  booked: number;
  status: SlotStatus;
}

// ─── Firestore document shapes (admin SDK) ────────────────────────────────────

export interface UserDoc {
  uid: string;
  name: string;
  phone: string;
  email: string;
  location: GeoPoint;
  createdAt: Timestamp;
}

export interface AvailabilityDoc {
  date: string; // "YYYY-MM-DD"
  slots: Slot[];
  updatedAt: Timestamp;
}

export interface WaitlistEntryDoc {
  eid: string;
  userUid: string;
  serviceIds: string[];
  preferredDate: Timestamp;
  status: WaitlistStatus;
  matchedServiceId?: string;
  matchedSlot?: string;
  notifiedAt?: Timestamp;
  position: number;
  createdAt: Timestamp;
}

export interface NotificationDoc {
  nid: string;
  userUid: string;
  entryId: string;
  type: 'sms' | 'push' | 'email';
  message: string;
  status: NotificationStatus;
  sentAt: Timestamp;
}
