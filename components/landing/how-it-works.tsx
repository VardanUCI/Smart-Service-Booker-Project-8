import Image from 'next/image';
import { Search, ListChecks, Bell } from 'lucide-react';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Search & Filter',
    description: 'Find what you need by type, location, and urgency. See who has real openings right now.',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    glow: 'rgba(99,102,241,0.25)',
    photo: '/step-search.jpg',
  },
  {
    icon: ListChecks,
    step: '02',
    title: 'Join Multiple Waitlists',
    description: "Don't bet on just one option. Join several at once and dramatically improve your chances.",
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glow: 'rgba(139,92,246,0.25)',
    photo: '/step-calendar.jpg',
  },
  {
    icon: Bell,
    step: '03',
    title: 'Get Notified Instantly',
    description: 'When a spot opens up, we alert you right away. Claim it or skip it — completely your call.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    glow: 'rgba(168,85,247,0.25)',
    photo: '/step-notify.jpg',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #f0f4ff 100%)' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-4" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Three steps to your appointment
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From searching to confirmed in minutes, not days
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+2.5rem)] right-[calc(16.66%+2.5rem)] h-px" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)' }} />

          {steps.map((step) => (
            <div
              key={step.title}
              className="relative z-10 flex flex-col bg-white rounded-2xl shadow-sm border border-indigo-100/60 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Step photo */}
              <div className="relative h-40 w-full">
                <Image src={step.photo} alt={step.title} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.95) 100%)' }} />
                {/* Icon badge over the photo */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: step.gradient, boxShadow: `0 8px 24px ${step.glow}` }}
                >
                  <step.icon className="h-7 w-7 text-white" />
                </div>
              </div>

              <div className="flex flex-col items-center text-center px-6 pb-7 pt-3">
                <span className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: '#6366f1' }}>
                  Step {step.step}
                </span>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
