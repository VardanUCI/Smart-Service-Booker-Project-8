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

export const mockProviders: Provider[] = [
  {
    id: 'p1',
    name: 'Paws & Claws Veterinary Clinic',
    category: 'pet-care',
    services: ['General Checkup', 'Vaccination', 'Dental Cleaning', 'Emergency Care'],
    address: '1242 Sunset Blvd, Los Angeles, CA 90026',
    distance: '0.8 mi',
    rating: 4.8,
    reviewCount: 312,
    nextAvailable: 'Today, 3:30 PM',
    status: 'waitlist-open',
    isMobile: false,
    tags: ['Walk-ins welcome', 'Same-day appointments', 'Emergency care'],
    phone: '(213) 555-0192',
    hours: 'Mon–Sat 8am–7pm, Sun 9am–5pm',
    description: 'Full-service veterinary clinic serving Los Angeles for over 15 years. We offer preventive care, diagnostics, dental cleanings, and emergency services for dogs and cats.',
  },
  {
    id: 'p2',
    name: 'Westside Family Medicine',
    category: 'medical',
    services: ['General Practice', 'Urgent Care', 'Physical Therapy', 'Specialist Consultation'],
    address: '8810 Santa Monica Blvd, West Hollywood, CA 90069',
    distance: '1.4 mi',
    rating: 4.6,
    reviewCount: 189,
    nextAvailable: 'Today, 4:00 PM',
    status: 'waitlist-open',
    isMobile: false,
    tags: ['Accepts insurance', 'Walk-in urgent care', 'Online check-in'],
    phone: '(310) 555-0147',
    hours: 'Mon–Fri 8am–6pm, Sat 9am–2pm',
    description: 'Board-certified family medicine practice offering comprehensive care for adults and children. Same-day urgent care slots available daily.',
  },
  {
    id: 'p3',
    name: 'Café Soleil',
    category: 'food-dining',
    services: ['Dinner Reservation', 'Brunch', 'Private Dining'],
    address: '405 N Fairfax Ave, Los Angeles, CA 90036',
    distance: '2.1 mi',
    rating: 4.9,
    reviewCount: 527,
    nextAvailable: 'Tonight, 7:30 PM',
    status: 'fully-booked',
    isMobile: false,
    tags: ['James Beard nominee', 'Outdoor seating', 'Vegan options'],
    phone: '(323) 555-0183',
    hours: 'Tue–Sun 11am–10pm',
    description: 'Award-winning bistro serving seasonal California cuisine with a French influence. Brunch on weekends draws a long waitlist — join early.',
  },
  {
    id: 'p4',
    name: 'Luxe Hair Studio',
    category: 'beauty-wellness',
    services: ['Haircut', 'Hair Color', 'Facial', 'Massage'],
    address: '123 Melrose Ave, Los Angeles, CA 90046',
    distance: '1.7 mi',
    rating: 4.7,
    reviewCount: 241,
    nextAvailable: 'Tomorrow, 10:00 AM',
    status: 'next-slot-tomorrow',
    isMobile: false,
    tags: ['Top-rated stylists', 'Organic products', 'Online booking'],
    phone: '(323) 555-0261',
    hours: 'Tue–Sat 9am–7pm',
    description: 'Upscale hair and wellness studio specializing in color, cuts, and skin treatments. Our stylists have 10+ years of experience with all hair types.',
  },
  {
    id: 'p5',
    name: 'QuickFix Plumbing & Electric',
    category: 'home-services',
    services: ['Plumbing Repair', 'Electrical Work', 'HVAC Service', 'Handyman'],
    address: 'Service area: Greater Los Angeles',
    distance: '3.2 mi',
    rating: 4.5,
    reviewCount: 98,
    nextAvailable: 'Today, 2:00 PM',
    status: 'available-now',
    isMobile: true,
    tags: ['Licensed & insured', 'Same-day service', 'Free estimate'],
    phone: '(818) 555-0374',
    hours: 'Mon–Sat 7am–8pm',
    description: 'Licensed plumbing and electrical contractor offering same-day emergency and non-emergency services across Greater LA. Free estimates on all jobs.',
  },
];
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

export const mockUserWaitlists: UserWaitlist[] = [
  {
    id: 'w1',
    provider: mockProviders[0],
    service: 'General Checkup',
    joinedAt: '9:14 AM',
    position: 2,
    estimatedTime: '~35 min',
    status: 'active',
    preferredContact: 'sms',
  },
  {
    id: 'w2',
    provider: mockProviders[2],
    service: 'Dinner Reservation',
    joinedAt: '8:45 AM',
    position: 1,
    estimatedTime: '~10 min',
    status: 'ready',
    preferredContact: 'sms',
  },
  {
    id: 'w3',
    provider: mockProviders[1],
    service: 'Urgent Care',
    joinedAt: 'Yesterday, 2:30 PM',
    position: 0,
    estimatedTime: '',
    status: 'completed',
    preferredContact: 'email',
  },
];
export interface ProviderDashboardStats {
  openSlots?: number;
  pendingRequests?: number;
  activeWaitlists?: number;
  fillRate?: number;
  todayAppointments?: number;
  weeklyBookings?: number;
}

export const mockProviderStats: ProviderDashboardStats = {
  openSlots: 4,
  pendingRequests: 7,
  activeWaitlists: 23,
  fillRate: 87,
  todayAppointments: 11,
  weeklyBookings: 48,
};
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

export const mockSeekerRequests: SeekerRequest[] = [
  {
    id: 'r1',
    name: 'Marcus T.',
    service: 'General Checkup',
    urgency: 'now',
    requestedAt: '10 min ago',
    contactMethod: 'sms',
    phone: '(310) 555-0192',
    distance: '0.4 mi',
  },
  {
    id: 'r2',
    name: 'Sofia R.',
    service: 'Vaccination',
    urgency: 'today',
    requestedAt: '28 min ago',
    contactMethod: 'sms',
    phone: '(323) 555-0118',
    distance: '1.1 mi',
  },
  {
    id: 'r3',
    name: 'James L.',
    service: 'Dental Cleaning',
    urgency: 'this-week',
    requestedAt: '1 hr ago',
    contactMethod: 'email',
    email: 'james.l@email.com',
    distance: '2.3 mi',
  },
  {
    id: 'r4',
    name: 'Priya K.',
    service: 'Emergency Care',
    urgency: 'now',
    requestedAt: '2 min ago',
    contactMethod: 'sms',
    phone: '(818) 555-0247',
    distance: '0.9 mi',
    notes: 'Dog may have ingested something — acting lethargic',
  },
];
export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  isAvailableNow: boolean;
}

export const mockTimeSlots: TimeSlot[] = [
  { id: 'ts1', date: 'Today', startTime: '2:00 PM', endTime: '2:30 PM', capacity: 1, booked: 0, isAvailableNow: true },
  { id: 'ts2', date: 'Today', startTime: '3:30 PM', endTime: '4:00 PM', capacity: 1, booked: 0, isAvailableNow: false },
  { id: 'ts3', date: 'Today', startTime: '4:30 PM', endTime: '5:00 PM', capacity: 1, booked: 1, isAvailableNow: false },
  { id: 'ts4', date: 'Tomorrow', startTime: '9:00 AM', endTime: '9:30 AM', capacity: 1, booked: 0, isAvailableNow: false },
  { id: 'ts5', date: 'Tomorrow', startTime: '10:00 AM', endTime: '10:30 AM', capacity: 1, booked: 0, isAvailableNow: false },
];
export interface Notification {
  id: string;
  type: 'spot-available' | 'reminder' | 'confirmation' | 'update' | 'request';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'spot-available',
    title: 'Spot available at Café Soleil!',
    message: 'A table just opened up for tonight at 7:30 PM. You have 15 minutes to confirm.',
    timestamp: '2 min ago',
    read: false,
    actionUrl: '/seeker/waitlists',
  },
  {
    id: 'n2',
    type: 'reminder',
    title: 'Upcoming appointment reminder',
    message: 'Your checkup at Paws & Claws is in 30 minutes. They\'re located at 1242 Sunset Blvd.',
    timestamp: '28 min ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'confirmation',
    title: 'Waitlist joined successfully',
    message: 'You\'re #2 in line at Paws & Claws Veterinary Clinic for a General Checkup. Estimated wait: ~35 min.',
    timestamp: '1 hr ago',
    read: true,
    actionUrl: '/seeker/waitlists',
  },
  {
    id: 'n4',
    type: 'update',
    title: 'You moved up in line',
    message: 'You\'re now #1 at Westside Family Medicine. Someone ahead of you cancelled.',
    timestamp: '3 hrs ago',
    read: true,
    actionUrl: '/seeker/waitlists',
  },
];
export interface NearbyDemand {
  id: string;
  service: string;
  urgency: 'now' | 'today' | 'this-week';
  seekerCount: number;
  area: string;
  averageDistance: string;
}

export const mockNearbyDemand: NearbyDemand[] = [
  {
    id: 'nd1',
    service: 'General Checkup',
    urgency: 'now',
    seekerCount: 8,
    area: 'Silver Lake',
    averageDistance: '0.6 mi',
  },
  {
    id: 'nd2',
    service: 'Emergency Care',
    urgency: 'now',
    seekerCount: 3,
    area: 'Echo Park',
    averageDistance: '1.2 mi',
  },
  {
    id: 'nd3',
    service: 'Vaccination',
    urgency: 'today',
    seekerCount: 14,
    area: 'Los Feliz',
    averageDistance: '1.8 mi',
  },
];
