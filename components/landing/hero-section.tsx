import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Building2, CheckCircle2, Star, Users, Clock } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Real photo background */}
      <Image
        src="/hero-bg.jpg"
        alt=""
        fill
        className="object-cover object-center"
        priority
        quality={85}
      />
      {/* Dark gradient overlay so text stays readable */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,27,75,0.92) 40%, rgba(30,58,95,0.90) 100%)' }} />

      <div className="absolute -top-48 -right-48 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
              <CheckCircle2 className="h-4 w-4" style={{ color: '#34d399' }} />
              <span>Trusted by local businesses &amp; customers everywhere</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Stop calling around.
              <br />
              <span style={{ background: 'linear-gradient(90deg, #93c5fd, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Get matched instantly.
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed mx-auto" style={{ color: 'rgba(255,255,255,0.68)' }}>
              Join multiple waitlists for your local vet, doctor, restaurant, or any service. Get notified the moment a spot opens.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button
                asChild
                size="lg"
                className="group w-full sm:w-auto text-base px-8 h-12 font-semibold bg-white text-indigo-950 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-100 hover:text-indigo-950 hover:shadow-2xl active:translate-y-0 active:scale-[0.98] active:bg-zinc-200"
              >
                <Link href="/seeker/search">
                  Find a Service
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group w-full sm:w-auto text-base px-8 h-12 border-white/30 bg-transparent text-white shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:border-white/45 hover:shadow-lg active:translate-y-0 active:scale-[0.98] active:bg-white/15 focus-visible:ring-white/35"
              >
                <Link href="/provider/onboarding">
                  <Building2 className="mr-2 h-4 w-4" />
                  List Your Business
                </Link>
              </Button>
            </div>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 pt-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Users className="h-5 w-5" style={{ color: '#93c5fd' }} />
                <span className="text-sm font-medium">Multiple waitlists</span>
              </div>
              <div className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Star className="h-5 w-5" style={{ color: '#fde68a' }} />
                <span className="text-sm font-medium">No phone tag</span>
              </div>
              <div className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Search className="h-5 w-5" style={{ color: '#6ee7b7' }} />
                <span className="text-sm font-medium">Live alerts</span>
              </div>
              <div className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <Clock className="h-5 w-5" style={{ color: '#c4b5fd' }} />
                <span className="text-sm font-medium">Local services</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
