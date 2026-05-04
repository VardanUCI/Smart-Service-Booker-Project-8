'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, LogIn, UserPlus, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function getSafeRedirect(nextValue: string | null) {
  if (!nextValue || !nextValue.startsWith('/')) return '/seeker/search';
  return nextValue;
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? 'Sign in failed');
        return;
      }

      const nextPath = getSafeRedirect(searchParams.get('next'));
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const nextPath = searchParams.get('next');
  const createUserHref = nextPath ? `/signup?role=user&next=${encodeURIComponent(nextPath)}` : '/signup?role=user';
  const createBusinessHref = nextPath
    ? `/signup?role=business&next=${encodeURIComponent(nextPath)}`
    : '/signup?role=business';

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
              <LogIn className="h-5 w-5 text-primary" />
              Sign In
            </CardTitle>
            <CardDescription>Access your account and continue where you left off.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">Create account</p>
              <p className="text-sm text-muted-foreground mt-1">Choose how you want to sign up:</p>
              <div className="mt-3 grid gap-2">
                <Button asChild variant="outline" className="justify-start">
                  <Link href={createUserHref}>
                    <User className="mr-2 h-4 w-4" />
                    Sign up as User
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href={createBusinessHref}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Sign up as Business
                  </Link>
                </Button>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Need to sign out?{' '}
              <Link href="/signout" className="text-primary hover:underline">
                Go to sign out
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-white/75">
          By continuing, you agree to use this service responsibly.
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
