export const categories = [
  { id: 'pet-care', name: 'Pet Care', icon: 'PawPrint', description: 'Vets, groomers, pet sitters' },
  { id: 'medical', name: 'Medical Care', icon: 'Stethoscope', description: 'Doctors, dentists, specialists' },
  { id: 'food-dining', name: 'Food & Dining', icon: 'UtensilsCrossed', description: 'Restaurants, cafes, bakeries' },
  { id: 'home-services', name: 'Home Services', icon: 'Wrench', description: 'Plumbers, electricians, cleaners' },
  { id: 'beauty-wellness', name: 'Beauty & Wellness', icon: 'Sparkles', description: 'Salons, spas, nail studios' },
  { id: 'professional', name: 'Professional Services', icon: 'Briefcase', description: 'Lawyers, accountants, consultants' },
] as const;

export type CategoryId = typeof categories[number]['id'];
export const serviceTypes: Record<CategoryId, string[]> = {
  'pet-care': ['General Checkup', 'Vaccination', 'Emergency Care', 'Dental Cleaning', 'Grooming', 'Surgery'],
  'medical': ['General Practice', 'Dentist', 'Eye Exam', 'Specialist Consultation', 'Physical Therapy', 'Urgent Care'],
  'food-dining': ['Dinner Reservation', 'Brunch', 'Private Dining', 'Takeout Order', 'Catering Inquiry'],
  'home-services': ['Plumbing Repair', 'Electrical Work', 'HVAC Service', 'House Cleaning', 'Landscaping', 'Handyman'],
  'beauty-wellness': ['Haircut', 'Manicure', 'Massage', 'Facial', 'Waxing', 'Hair Color'],
  'professional': ['Legal Consultation', 'Tax Preparation', 'Financial Planning', 'Business Consulting'],
};
export const urgencyLevels = [
  { id: 'now', label: 'Right Now', description: 'Within the next hour' },
  { id: 'today', label: 'Today', description: 'Anytime today' },
  { id: 'this-week', label: 'This Week', description: 'Within the next 7 days' },
  { id: 'flexible', label: 'Flexible', description: 'No rush, best available' },
] as const;
export type ProviderStatus = 'available-now' | 'waitlist-open' | 'next-slot-tomorrow' | 'fully-booked';
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
