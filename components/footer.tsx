import Link from 'next/link';
import { Clock } from 'lucide-react';

const quickLinks = [
  { href: '/seeker/search', label: 'Find Services' },
  { href: '/seeker/waitlists', label: 'My Waitlists' },
  { href: '/provider/onboarding', label: 'List Your Business' },
  { href: '/provider/dashboard', label: 'Provider Dashboard' },
  { href: '/notifications', label: 'Notifications' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)' }}
              >
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">Smart Service Booker</span>
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
            &copy; {new Date().getFullYear()} Smart Service Booker. All rights reserved.
          </p>
          <span className="text-sm text-muted-foreground">Made for local businesses</span>
        </div>
      </div>
    </footer>
  );
}
