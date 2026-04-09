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
    name: 'Pawsome Veterinary Clinic',
    category: 'pet-care',
    services: ['General Checkup', 'Vaccination', 'Emergency Care', 'Dental Cleaning'],
    address: '123 Oak Street, Downtown',
    distance: '0.8 mi',
    rating: 4.9,
    reviewCount: 234,
    nextAvailable: '2:30 PM Today',
    status: 'available-now',
    isMobile: false,
    tags: ['Emergency', 'Open Late', 'Cats & Dogs'],
    phone: '(555) 123-4567',
    hours: 'Mon-Sat 8am-8pm',
    description: 'Full-service veterinary care with experienced staff and state-of-the-art facilities.',
  },
  {
    id: 'p2',
    name: 'Dr. Sarah Chen, DDS',
    category: 'medical',
    services: ['General Practice', 'Dentist', 'Dental Cleaning'],
    address: '456 Medical Plaza, Suite 200',
    distance: '1.2 mi',
    rating: 4.8,
    reviewCount: 189,
    nextAvailable: 'Tomorrow 9:00 AM',
    status: 'next-slot-tomorrow',
    isMobile: false,
    tags: ['Accepts Insurance', 'New Patients'],
    phone: '(555) 234-5678',
    hours: 'Mon-Fri 9am-5pm',
    description: 'Gentle dental care for the whole family with a focus on preventive treatments.',
  },
  {
    id: 'p3',
    name: 'Quick Fix Plumbing',
    category: 'home-services',
    services: ['Plumbing Repair', 'Emergency Service', 'Installation'],
    address: 'Mobile Service',
    distance: '2.5 mi',
    rating: 4.7,
    reviewCount: 156,
    nextAvailable: '4:00 PM Today',
    status: 'waitlist-open',
    isMobile: true,
    tags: ['Mobile Service', '24/7 Emergency', 'Licensed'],
    phone: '(555) 345-6789',
    hours: '24/7 Emergency Available',
    description: 'Licensed plumbers ready to help with any residential or commercial plumbing needs.',
  },
  {
    id: 'p4',
    name: 'Bella Nail Studio',
    category: 'beauty-wellness',
    services: ['Manicure', 'Pedicure', 'Nail Art', 'Gel Nails'],
    address: '789 Fashion Ave',
    distance: '0.5 mi',
    rating: 4.9,
    reviewCount: 312,
    nextAvailable: 'Available Now',
    status: 'available-now',
    isMobile: false,
    tags: ['Walk-ins Welcome', 'Organic Products'],
    phone: '(555) 456-7890',
    hours: 'Tue-Sun 10am-7pm',
    description: 'Premium nail services using organic and cruelty-free products.',
  },
  {
    id: 'p5',
    name: 'The Golden Fork',
    category: 'food-dining',
    services: ['Dinner Reservation', 'Private Dining', 'Catering'],
    address: '321 Restaurant Row',
    distance: '1.8 mi',
    rating: 4.6,
    reviewCount: 428,
    nextAvailable: '7:30 PM Today',
    status: 'waitlist-open',
    isMobile: false,
    tags: ['Fine Dining', 'Private Rooms', 'Wine List'],
    phone: '(555) 567-8901',
    hours: 'Daily 5pm-11pm',
    description: 'Contemporary American cuisine in an elegant setting. Perfect for special occasions.',
  },
  {
    id: 'p6',
    name: 'Spark Electric Co.',
    category: 'home-services',
    services: ['Electrical Work', 'Panel Upgrade', 'Lighting Installation'],
    address: 'Mobile Service',
    distance: '3.1 mi',
    rating: 4.8,
    reviewCount: 98,
    nextAvailable: 'Tomorrow 10:00 AM',
    status: 'next-slot-tomorrow',
    isMobile: true,
    tags: ['Licensed', 'Insured', 'Free Estimates'],
    phone: '(555) 678-9012',
    hours: 'Mon-Sat 7am-6pm',
    description: 'Master electricians providing safe, reliable electrical services for homes and businesses.',
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
    joinedAt: '10:30 AM',
    position: 2,
    estimatedTime: '~30 min',
    status: 'active',
    preferredContact: 'sms',
  },
  {
    id: 'w2',
    provider: mockProviders[4],
    service: 'Dinner Reservation',
    joinedAt: '11:45 AM',
    position: 5,
    estimatedTime: '~1 hour',
    status: 'active',
    preferredContact: 'sms',
  },
  {
    id: 'w3',
    provider: mockProviders[3],
    service: 'Manicure',
    joinedAt: '9:00 AM',
    position: 0,
    estimatedTime: 'Ready!',
    status: 'ready',
    preferredContact: 'email',
  },
];
export interface ProviderDashboardStats {
  openSlots: number;
  pendingRequests: number;
  activeWaitlists: number;
  fillRate: number;
  todayAppointments: number;
  weeklyBookings: number;
}

export const mockProviderStats: ProviderDashboardStats = {
  openSlots: 4,
  pendingRequests: 8,
  activeWaitlists: 12,
  fillRate: 87,
  todayAppointments: 15,
  weeklyBookings: 68,
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
    id: 'sr1',
    name: 'John D.',
    service: 'General Checkup',
    urgency: 'now',
    requestedAt: '5 min ago',
    contactMethod: 'sms',
    phone: '(555) ***-1234',
    notes: 'My dog has been limping since this morning',
    distance: '0.5 mi',
  },
  {
    id: 'sr2',
    name: 'Emily R.',
    service: 'Vaccination',
    urgency: 'today',
    requestedAt: '20 min ago',
    contactMethod: 'email',
    email: 'e***@email.com',
    distance: '1.2 mi',
  },
  {
    id: 'sr3',
    name: 'Michael S.',
    service: 'Dental Cleaning',
    urgency: 'this-week',
    requestedAt: '1 hour ago',
    contactMethod: 'sms',
    phone: '(555) ***-5678',
    distance: '2.0 mi',
  },
  {
    id: 'sr4',
    name: 'Lisa M.',
    service: 'Emergency Care',
    urgency: 'now',
    requestedAt: '2 min ago',
    contactMethod: 'sms',
    phone: '(555) ***-9012',
    notes: 'Cat not eating for 2 days',
    distance: '0.8 mi',
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
  { id: 'ts1', date: 'Today', startTime: '2:00 PM', endTime: '3:00 PM', capacity: 3, booked: 2, isAvailableNow: true },
  { id: 'ts2', date: 'Today', startTime: '3:00 PM', endTime: '4:00 PM', capacity: 3, booked: 3, isAvailableNow: false },
  { id: 'ts3', date: 'Today', startTime: '4:00 PM', endTime: '5:00 PM', capacity: 3, booked: 1, isAvailableNow: false },
  { id: 'ts4', date: 'Tomorrow', startTime: '9:00 AM', endTime: '10:00 AM', capacity: 3, booked: 0, isAvailableNow: false },
  { id: 'ts5', date: 'Tomorrow', startTime: '10:00 AM', endTime: '11:00 AM', capacity: 3, booked: 1, isAvailableNow: false },
  { id: 'ts6', date: 'Tomorrow', startTime: '11:00 AM', endTime: '12:00 PM', capacity: 3, booked: 2, isAvailableNow: false },
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
    title: 'Spot Available!',
    message: 'Bella Nail Studio has an opening now. Tap to confirm your appointment.',
    timestamp: '2 min ago',
    read: false,
    actionUrl: '/seeker/waitlists',
  },
  {
    id: 'n2',
    type: 'reminder',
    title: 'Coming Up',
    message: 'Your position at The Golden Fork: #3 in line',
    timestamp: '15 min ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'confirmation',
    title: 'Waitlist Joined',
    message: 'You\'ve been added to the waitlist at Pawsome Veterinary Clinic',
    timestamp: '1 hour ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'update',
    title: 'Position Update',
    message: 'You moved up! Now #2 in line at Pawsome Veterinary Clinic',
    timestamp: '2 hours ago',
    read: true,
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
  { id: 'nd1', service: 'Emergency Plumbing', urgency: 'now', seekerCount: 3, area: 'Downtown', averageDistance: '1.5 mi' },
  { id: 'nd2', service: 'Electrical Repair', urgency: 'today', seekerCount: 5, area: 'Westside', averageDistance: '2.3 mi' },
  { id: 'nd3', service: 'AC Repair', urgency: 'now', seekerCount: 7, area: 'North District', averageDistance: '3.1 mi' },
];
