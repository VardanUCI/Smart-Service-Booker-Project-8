import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <Image src="/cta-bg.jpg" alt="" fill className="object-cover object-center" quality={80} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.94) 0%, rgba(30,27,75,0.91) 40%, rgba(30,58,95,0.90) 100%)' }} />
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

      
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)' }}>
            <Sparkles className="h-4 w-4" style={{ color: '#fde68a' }} />
            <span>Free for service seekers. Always.</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Ready to stop wasting time?
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
            Join thousands of people getting matched with local services instantly. No more calling around, no more waiting in the dark.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="group w-full sm:w-auto text-base px-8 h-12 font-semibold bg-white text-indigo-950 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-100 hover:text-indigo-950 hover:shadow-2xl active:translate-y-0 active:scale-[0.98] active:bg-zinc-200"
            >
              <Link href="/seeker/search">
                Get Started Free
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
                List Your Business
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M4.5 7 L6.5 9 L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M4.5 7 L6.5 9 L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Free for service seekers
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M4.5 7 L6.5 9 L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Set up in 2 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
