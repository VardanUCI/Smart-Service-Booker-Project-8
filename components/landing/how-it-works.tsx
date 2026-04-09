import { Search, ListChecks, Bell } from 'lucide-react';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Search & Filter',
    description: 'Find what you need by type, location, and urgency. See who has real openings right now.',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    glow: 'rgba(99,102,241,0.25)',
  },
  {
    icon: ListChecks,
    step: '02',
    title: 'Join Multiple Waitlists',
    description: "Don't bet on just one option. Join several at once and dramatically improve your chances.",
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glow: 'rgba(139,92,246,0.25)',
  },
  {
    icon: Bell,
    step: '03',
    title: 'Get Notified Instantly',
    description: 'When a spot opens up, we alert you right away. Claim it or skip it — completely your call.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    glow: 'rgba(168,85,247,0.25)',
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

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto relative">
          
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+2.5rem)] right-[calc(16.66%+2.5rem)] h-px" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)' }} />

          {steps.map((step) => (
            <div key={step.title} className="relative z-10 flex flex-col items-center text-center">
              
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                style={{ background: step.gradient, boxShadow: `0 8px 24px ${step.glow}` }}
              >
                <step.icon className="h-9 w-9 text-white" />
              </div>

              <span className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#a5b4fc' }}>
                Step {step.step}
              </span>
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
