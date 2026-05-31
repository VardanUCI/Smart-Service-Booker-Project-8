'use client';

import Link from 'next/link';
import { PawPrint, Stethoscope, UtensilsCrossed, Wrench, Sparkles, Briefcase } from 'lucide-react';

const categories = [
  {
    id: 'pet-care',
    name: 'Pet Care',
    description: 'Vets, groomers, pet sitters',
    icon: PawPrint,
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    iconBg: 'bg-amber-400',
    iconColor: 'text-white',
    hoverShadow: '0 8px 28px rgba(251,191,36,0.35)',
  },
  {
    id: 'medical',
    name: 'Medical Care',
    description: 'Doctors, dentists, specialists',
    icon: Stethoscope,
    gradient: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
    iconBg: 'bg-rose-500',
    iconColor: 'text-white',
    hoverShadow: '0 8px 28px rgba(244,63,94,0.25)',
  },
  {
    id: 'food-dining',
    name: 'Food & Dining',
    description: 'Restaurants, cafes, bakeries',
    icon: UtensilsCrossed,
    gradient: 'linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)',
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    hoverShadow: '0 8px 28px rgba(249,115,22,0.25)',
  },
  {
    id: 'home-services',
    name: 'Home Services',
    description: 'Plumbers, electricians, cleaners',
    icon: Wrench,
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 100%)',
    iconBg: 'bg-sky-500',
    iconColor: 'text-white',
    hoverShadow: '0 8px 28px rgba(14,165,233,0.25)',
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    description: 'Salons, spas, nail studios',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #fae8ff 0%, #e879f9 100%)',
    iconBg: 'bg-fuchsia-500',
    iconColor: 'text-white',
    hoverShadow: '0 8px 28px rgba(217,70,239,0.25)',
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'Lawyers, accountants, consultants',
    icon: Briefcase,
    gradient: 'linear-gradient(135deg, #e0e7ff 0%, #818cf8 100%)',
    iconBg: 'bg-indigo-500',
    iconColor: 'text-white',
    hoverShadow: '0 8px 28px rgba(99,102,241,0.25)',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-4" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            Categories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find trusted local providers across every type of service
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/seeker/search?category=${category.id}`}
              className="group"
            >
              <div
                className="h-full rounded-2xl border-0 transition-all duration-200 p-5 md:p-6 hover:-translate-y-1 cursor-pointer"
                style={{ background: category.gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = category.hoverShadow; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 ${category.iconBg}`}
                >
                  <category.icon className={`h-6 w-6 ${category.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
