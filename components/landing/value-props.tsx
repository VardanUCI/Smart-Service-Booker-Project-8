import { Clock, Users, TrendingUp, Shield, Zap, Calendar } from 'lucide-react';

const seekerBenefits = [
  {
    icon: Clock,
    title: 'Stop the Phone Tag',
    description: 'No more endless calling or being stuck on hold. We handle the matchmaking for you.',
  },
  {
    icon: Users,
    title: 'Better Odds',
    description: 'Join multiple waitlists at once. Your chances of getting an appointment go way up.',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'The second a spot opens, you know about it. First come, first served.',
  },
];

const providerBenefits = [
  {
    icon: Calendar,
    title: 'Fill Gaps Instantly',
    description: 'Last-minute cancellations? Turn them into actual revenue, not lost time.',
  },
  {
    icon: TrendingUp,
    title: 'More Revenue',
    description: 'Less empty slots means more money. Simple math.',
  },
  {
    icon: Shield,
    title: 'Real Customers',
    description: 'People actively looking for your service, not random browsing.',
  },
];

export function ValueProps() {
  return (
    <section className="py-16 md:py-24" style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #f8faff 100%)' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-4" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            Why It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Works Better for Everyone
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Customers get faster service. Businesses fill slots. Everyone wins.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          <div
            className="rounded-2xl p-8 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', border: '1px solid #c7d2fe' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6" style={{ background: '#c7d2fe', color: '#3730a3' }}>
              For Service Seekers
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Stop wasting time waiting
            </h3>
            <div className="space-y-6">
              {seekerBenefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#c7d2fe' }}
                  >
                    <benefit.icon className="h-5 w-5" style={{ color: '#4338ca' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
          <div
            className="rounded-2xl p-8 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6" style={{ background: '#a7f3d0', color: '#065f46' }}>
              For Service Providers
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Turn no-shows into revenue
            </h3>
            <div className="space-y-6">
              {providerBenefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#a7f3d0' }}
                  >
                    <benefit.icon className="h-5 w-5" style={{ color: '#047857' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
