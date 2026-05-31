import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

const quickLinks = [
  { href: '/seeker/search', label: 'Find Services' },
  { href: '/seeker/waitlists', label: 'My Waitlists' },
  { href: '/provider/onboarding', label: 'List Your Business' },
  { href: '/notifications', label: 'Notifications' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2">
              <BrandLogo markClassName="h-8 w-8" textClassName="text-lg" />
            </Link>
            <p className="max-w-[320px] text-sm text-muted-foreground">
              Stop wasting time. Get matched with local services instantly.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bizskip. All rights reserved.
          </p>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            Made with care for local businesses
          </span>
        </div>
      </div>
    </footer>
  );
}
