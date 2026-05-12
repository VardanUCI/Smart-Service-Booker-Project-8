'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Building2, LogOut, Menu, Bell, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type NavbarAccount = {
  email: string | null;
  role: 'user' | 'business';
  emailVerified: boolean;
  onboardingCompleted: boolean;
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    fetch('/api/notifications', { headers: { 'Content-Type': 'application/json' } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { notifications: { read: boolean }[] }) => {
        setUnreadNotificationCount(data.notifications.filter((n) => !n.read).length);
      })
      .catch(() => {
        // Not signed in or fetch failed — badge stays at 0
      });
  }, []);
  const [account, setAccount] = useState<NavbarAccount | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const unreadNotificationCount = mockNotifications.filter((notification) => !notification.read).length;
  const isSignedIn = Boolean(account);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload: { user?: NavbarAccount | null }) => {
        if (isMounted) setAccount(payload.user ?? null);
      })
      .catch(() => {
        if (isMounted) setAccount(null);
      })
      .finally(() => {
        if (isMounted) setIsAuthLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = useMemo(() => {
    const links = [{ href: '/seeker/search', label: 'Find Services' }];

    if (isSignedIn) {
      links.push({ href: '/seeker/waitlists', label: 'My Waitlists' });
    }

    if (!isSignedIn) {
      links.push({ href: '/provider/onboarding', label: 'For Providers' });
    } else if (account?.role === 'business') {
      if (!account.onboardingCompleted) {
        links.push({ href: '/provider/onboarding', label: 'Onboarding' });
      }
      links.push({ href: '/provider/dashboard', label: 'Dashboard' });
    } else {
      links.push({ href: '/provider/access-denied', label: 'Looking to provide?' });
    }

    return links;
  }, [account?.onboardingCompleted, account?.role, isSignedIn]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)' }}>
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">Smart Service Booker</span>
          </Link>

          
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                        {unreadNotificationCount}
                      </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm">
                  {account?.role === 'business' ? (
                    <Building2 className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                  <span className="max-w-[180px] truncate">
                    Signed in as {account?.role === 'business' ? 'Business' : 'User'}
                  </span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/signout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]">
                  <Link href="/seeker/search">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          
          <div className="flex md:hidden items-center gap-2">
            {isSignedIn && isAuthLoaded ? (
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                      {unreadNotificationCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ) : null}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="my-2 border-border" />
                  {isSignedIn ? (
                    <>
                      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                        {account?.role === 'business' ? (
                          <Building2 className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                        <span>Signed in as {account?.role === 'business' ? 'Business' : 'User'}</span>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/signout" onClick={() => setIsOpen(false)}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/signin" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]">
                        <Link href="/seeker/search" onClick={() => setIsOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
