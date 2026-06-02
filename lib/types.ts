// Canonical API response types derived from route file signatures and database.types.ts

export interface ProviderDashboardStats {
  openSlots: number;
  pendingRequests: number;
  activeWaitlists: number;
  fillRate: number;
  todayAppointments: number;
  weeklyBookings: number;
}

/** From GET /api/providers/requests — RPC get_requests_for_provider */
export interface ProviderRequest {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  service: string | null;
  category: string;
  urgency: 'now' | 'today' | 'this-week' | 'flexible';
  contact_method: 'sms' | 'email' | null;
  contact_value: string | null;
  status: string;
  requested_at: string;
  expires_at: string;
}

/** From GET /api/availability — availability_slots row */
export interface AvailabilitySlot {
  id: string;
  provider_id: string;
  date: string;        // YYYY-MM-DD
  start_time: string;  // HH:MM
  end_time: string;    // HH:MM
  capacity: number;
  booked_count: number;
  created_at: string;
}

/** From GET /api/waitlists — RPC get_user_waitlists */
export interface WaitlistEntry {
  id: string;
  provider_id: string | null;
  business_name: string | null;
  category: string;
  service: string | null;
  urgency: string | null;
  status: string;  // 'waiting' | 'notified' | 'booked' | 'expired'
  joined_at: string;
  expires_at: string;
  position: number;
  contact_method: string | null;
  contact_value: string | null;
}

/** From GET /api/notifications — notifications row */
export interface ApiNotification {
  id: string;
  user_id: string;
  type: 'spot-available' | 'reminder' | 'confirmation' | 'update' | 'request';
  title: string;
  message: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

/** From GET /api/search — RPC get_available_providers_nearby */
export interface ProviderResult {
  id: string;
  business_name: string;
  dist_meters: number;
  rating?: number | null;
  review_count?: number;
  waitlist_count?: number;
  address?: string | null;
  phone?: string | null;
  latitude?: number;
  longitude?: number;
}

/** Dispatch request (Model C) */
export interface DispatchRequest {
  id: string;
  customer_id: string;
  category: string;
  description: string | null;
  address: string;
  radius_meters: number;
  status: 'open' | 'claimed' | 'expired';
  claimed_by: string | null;
  expires_at: string;
  created_at: string;
}

/** Provider-facing dispatch (from get_open_dispatch_requests_for_provider RPC) */
export interface ProviderDispatchRequest {
  id: string;
  category: string;
  description: string | null;
  address: string;
  status: string;
  expires_at: string;
  created_at: string;
  dist_meters?: number;
}

/** Booking with provider/slot details (from GET /api/bookings) */
export interface BookingEntry {
  id: string;
  provider_id: string;
  customer_id: string;
  waitlist_id: string | null;
  slot_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'declined';
  notes: string | null;
  created_at: string;
  provider: { id: string; business_name: string; category: string } | null;
  slot: { id: string; date: string; start_time: string; end_time: string } | null;
}

/** Maps DB waitlist status → UI status */
export function mapWaitlistStatus(status: string): 'active' | 'ready' | 'expired' | 'completed' {
  switch (status) {
    case 'waiting':  return 'active';
    case 'notified': return 'ready';
    case 'booked':   return 'completed';
    case 'expired':  return 'expired';
    default:         return 'active';
  }
}

/** Formats YYYY-MM-DD + HH:MM into "Mon May 5 · 9:00 AM – 10:00 AM" */
export function formatSlotTime(start: string, end: string): string {
  const toAmPm = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  return `${toAmPm(start)} – ${toAmPm(end)}`;
}

/** Formats dist_meters into a readable string like "0.8 mi" */
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return miles < 0.1 ? `${Math.round(meters)} m` : `${miles.toFixed(1)} mi`;
}

/** Returns today's and tomorrow's date strings in YYYY-MM-DD */
export function getTodayTomorrow(): { today: string; tomorrow: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const tom = new Date(now);
  tom.setDate(tom.getDate() + 1);
  return { today: fmt(now), tomorrow: fmt(tom) };
}
