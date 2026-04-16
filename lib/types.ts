import { GeoPoint, Timestamp } from 'firebase/firestore';

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  name: string;
  phone: string;
  email: string;
  location: GeoPoint;
  createdAt: Timestamp;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export type ServiceCategory = 'veterinarian' | 'restaurant' | 'doctor' | 'other';

export interface Service {
  sid: string;
  providerUid: string;
  name: string;
  category: ServiceCategory;
  location: GeoPoint;
  address: string;
  phone: string;
  isAcceptingWaitlist: boolean;
  isActive: boolean;
  avgWaitMinutes: number;
  createdAt: Timestamp;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export type SlotStatus = 'open' | 'full' | 'closed';

export interface Slot {
  time: string; // "HH:MM" e.g. "14:00"
  capacity: number;
  booked: number;
  status: SlotStatus;
}

export interface AvailabilityDay {
  date: string; // "YYYY-MM-DD"
  slots: Slot[];
  updatedAt: Timestamp;
}

// ─── Waitlist Entries ─────────────────────────────────────────────────────────

export type WaitlistStatus = 'pending' | 'matched' | 'cancelled';

export interface WaitlistEntry {
  eid: string;
  userUid: string;
  serviceIds: string[]; // user can waitlist multiple services at once
  preferredDate: Timestamp;
  status: WaitlistStatus;
  matchedServiceId?: string;
  matchedSlot?: string;
  notifiedAt?: Timestamp;
  position: number;
  createdAt: Timestamp;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'sms' | 'push' | 'email';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  nid: string;
  userUid: string;
  entryId: string;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  sentAt: Timestamp;
}
