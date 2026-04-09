import Link from 'next/link';
import { PawPrint, Stethoscope, UtensilsCrossed, Wrench, Sparkles, Briefcase } from 'lucide-react';

const categories = [
  {
    id: 'pet-care',
    name: 'Pet Care',
    description: 'Vets, groomers, pet sitters',
    icon: PawPrint,
    cardClass: 'border-neutral-200 hover:border-amber-300 hover:bg-amber-50',
    iconBgClass: 'bg-amber-100',
    iconColorClass: 'text-amber-600',
  },
  {
    id: 'medical',
    name: 'Medical Care',
    description: 'Doctors, dentists, specialists',
    icon: Stethoscope,
    cardClass: 'border-neutral-200 hover:border-rose-300 hover:bg-rose-50',
    iconBgClass: 'bg-rose-100',
    iconColorClass: 'text-rose-600',
  },
  {
    id: 'food-dining',
    name: 'Food & Dining',
    description: 'Restaurants, cafes, bakeries',
    icon: UtensilsCrossed,
    cardClass: 'border-neutral-200 hover:border-orange-300 hover:bg-orange-50',
    iconBgClass: 'bg-orange-100',
    iconColorClass: 'text-orange-600',
  },
  {
    id: 'home-services',
    name: 'Home Services',
    description: 'Plumbers, electricians, cleaners',
    icon: Wrench,
    cardClass: 'border-neutral-200 hover:border-sky-300 hover:bg-sky-50',
    iconBgClass: 'bg-sky-100',
    iconColorClass: 'text-sky-600',
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    description: 'Salons, spas, nail studios',
    icon: Sparkles,
    cardClass: 'border-neutral-200 hover:border-fuchsia-300 hover:bg-fuchsia-50',
    iconBgClass: 'bg-fuchsia-100',
    iconColorClass: 'text-fuchsia-600',
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'Lawyers, accountants, consultants',
    icon: Briefcase,
    cardClass: 'border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50',
    iconBgClass: 'bg-indigo-100',
    iconColorClass: 'text-indigo-600',
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
                className={`h-full rounded-2xl border bg-white transition-all duration-200 p-5 md:p-6 hover:-translate-y-0.5 hover:shadow-lg ${category.cardClass}`}
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 ${category.iconBgClass}`}
                >
                  <category.icon className={`h-6 w-6 ${category.iconColorClass}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
