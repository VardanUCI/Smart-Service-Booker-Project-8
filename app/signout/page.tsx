'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignOutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignOut() {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Sign out failed');
        return;
      }

      router.replace('/signin');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen py-14 px-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 42%, #1e3a5f 100%)' }}
    >
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)' }}
          >
            <Clock className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold">Smart Service Booker</span>
        </Link>

        <Card className="border-white/20 bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-primary" />
              Sign Out
            </CardTitle>
            <CardDescription>You can sign out from your current session here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button onClick={handleSignOut} className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Cancel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
