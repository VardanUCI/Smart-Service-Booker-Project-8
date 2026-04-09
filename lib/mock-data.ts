export const categories = [
  {
    id: 'pet-care',
    name: 'Pet Care',
    icon: 'PawPrint',
    description: 'Vets, groomers, pet sitters',
  },
  {
    id: 'medical',
    name: 'Medical Care',
    icon: 'Stethoscope',
    description: 'Doctors, nurses, clinics',
  },
  {
    id: 'home-services',
    name: 'Home Services',
    icon: 'Home',
    description: 'Plumbers, electricians, cleaners',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'Book',
    description: 'Tutors, trainers, coaches',
  },
];
export const serviceTypes = [];
export const urgencyLevels = [];
export interface Provider {
  id: string;
  name: string;
  category: CategoryId;
  services: string[];
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  status: ProviderStatus;
  isMobile: boolean;
  tags: string[];
  phone: string;
  hours: string;
  description: string;
  image?: string;
}

export const mockProviders: Provider[] = [];
export interface UserWaitlist {
  id: string;
  provider: Provider;
  service: string;
  joinedAt: string;
  position: number;
  estimatedTime: string;
  status: 'active' | 'ready' | 'expired' | 'completed';
  preferredContact: 'sms' | 'email';
}

export const mockUserWaitlists: UserWaitlist[] = [];
export interface ProviderDashboardStats {
  openSlots?: number;
  pendingRequests?: number;
  activeWaitlists?: number;
  fillRate?: number;
  todayAppointments?: number;
  weeklyBookings?: number;
}

export const mockProviderStats: ProviderDashboardStats = {};
export interface SeekerRequest {
  id: string;
  name: string;
  service: string;
  urgency: 'now' | 'today' | 'this-week' | 'flexible';
  requestedAt: string;
  contactMethod: 'sms' | 'email';
  phone?: string;
  email?: string;
  notes?: string;
  distance?: string;
}

export const mockSeekerRequests: SeekerRequest[] = [];
export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  isAvailableNow: boolean;
}

export const mockTimeSlots: TimeSlot[] = [];
export interface Notification {
  id: string;
  type: 'spot-available' | 'reminder' | 'confirmation' | 'update' | 'request';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export const mockNotifications: Notification[] = [];
export interface NearbyDemand {
  id: string;
  service: string;
  urgency: 'now' | 'today' | 'this-week';
  seekerCount: number;
  area: string;
  averageDistance: string;
}

export const mockNearbyDemand: NearbyDemand[] = [];

// Define or adjust types to handle empty data gracefully
export type CategoryId = string; // Adjusted to string for simplicity
export type ProviderStatus = 'active' | 'inactive'; // Example statuses
