'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockNotifications } from '@/lib/mock-data';

const navLinks = [
  { href: '/seeker/search', label: 'Find Services' },
  { href: '/seeker/waitlists', label: 'My Waitlists' },
  { href: '/provider/dashboard', label: 'For Providers' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadNotificationCount = mockNotifications.filter((notification) => !notification.read).length;

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
            <Button variant="outline" size="sm">Sign In</Button>
            <Button asChild size="sm" className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]">
              <Link href="/seeker/search">Get Started</Link>
            </Button>
          </div>

          
          <div className="flex md:hidden items-center gap-2">
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
                  <Button variant="outline" className="w-full">Sign In</Button>
                  <Button asChild className="w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]">
                    <Link href="/seeker/search" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
