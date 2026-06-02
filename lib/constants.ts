/**
 * Static UI configuration constants.
 * These are app-level enumerations used across search, onboarding, and filter
 * UIs. They are NOT fetched from the server.
 */

export type CategoryId = string;
export type ProviderStatus = 'active' | 'inactive';

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
    id: 'food-dining',
    name: 'Dining',
    icon: 'Utensils',
    description: 'Restaurants, cafes, catering',
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
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    icon: 'Sparkles',
    description: 'Salons, spas, wellness services',
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: 'Briefcase',
    description: 'Consultants, legal, financial',
  },
] as const;

export const serviceTypes: Record<string, string[]> = {
  'pet-care': ['Veterinary visit', 'Grooming', 'Pet boarding', 'Pet sitting'],
  medical: ['Primary care', 'Urgent care', 'Dental visit', 'Physical therapy'],
  'food-dining': ['Restaurant table', 'Cafe seating', 'Catering', 'Private dining'],
  'home-services': ['Plumbing', 'Electrical', 'Cleaning', 'Handyman'],
  education: ['Tutoring', 'Coaching', 'Music lesson', 'Test prep'],
  'beauty-wellness': ['Salons', 'Spas', 'Nail studios'],
  'professional-services': ['Lawyers', 'Accountants', 'Consultants'],
};

export const urgencyLevels = [
  { id: 'now',       label: 'Right now',   description: 'Join the first available opening' },
  { id: 'today',     label: 'Today',        description: 'Looking for something later today' },
  { id: 'this-week', label: 'This week',    description: 'Flexible within the next few days' },
  { id: 'flexible',  label: 'Flexible',     description: 'Just let me know when something opens' },
] as const;
