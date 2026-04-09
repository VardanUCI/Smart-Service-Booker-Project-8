import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { CategoryGrid } from '@/components/landing/category-grid';
import { ValueProps } from '@/components/landing/value-props';
import { CTASection } from '@/components/landing/cta-section';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <CategoryGrid />
        <ValueProps />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
