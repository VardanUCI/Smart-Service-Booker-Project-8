'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, UserPlus, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/password-input';

type AccountType = 'user' | 'business';

function getSafeRedirect(nextValue: string | null) {
  if (!nextValue || !nextValue.startsWith('/')) return '/seeker/search';
  return nextValue;
}

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accountType, setAccountType] = useState<AccountType>(
    searchParams.get('role') === 'business' ? 'business' : 'user'
  );
  const [name, setName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const nextPath = searchParams.get('next');
  const signInHref = nextPath ? `/signin?next=${encodeURIComponent(nextPath)}` : '/signin';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          businessLocation: accountType === 'business' && businessLocation.trim() ? businessLocation : undefined,
          email,
          phone: phone.trim() ? phone : undefined,
          role: accountType,
          password,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        requiresEmailVerification?: boolean;
      };
      if (!response.ok) {
        setError(payload.error ?? 'Sign up failed');
        return;
      }

      if (payload.requiresEmailVerification) {
        setSuccessMessage(payload.message ?? 'Check your email to verify your account before signing in.');
        setVerifiedEmail(email);
        setPassword('');
        setConfirmPassword('');
        return;
      }

      if (accountType === 'business') {
        router.replace('/provider/onboarding');
      } else {
        router.replace(getSafeRedirect(nextPath));
      }
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!verifiedEmail || resendStatus === 'sending') return;
    setResendStatus('sending');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifiedEmail }),
      });
      setResendStatus(response.ok ? 'sent' : 'error');
    } catch {
      setResendStatus('error');
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
              <UserPlus className="h-5 w-5 text-primary" />
              Create Account
            </CardTitle>
            <CardDescription>Set up your account to start booking or listing services.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-foreground">Account Type</legend>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className="account-type-option flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all border-border hover:border-primary/40"
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value="user"
                      checked={accountType === 'user'}
                      onChange={() => setAccountType('user')}
                      className="accent-[var(--color-primary)]"
                    />
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">User</span>
                  </label>
                  <label
                    className="account-type-option flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all border-border hover:border-primary/40"
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value="business"
                      checked={accountType === 'business'}
                      onChange={() => setAccountType('business')}
                      className="accent-[var(--color-primary)]"
                    />
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Business</span>
                  </label>
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {accountType === 'business' ? 'Business Name' : 'Full Name'}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              {accountType === 'business' ? (
                <div className="space-y-2">
                  <Label htmlFor="businessLocation">Business Location</Label>
                  <Input
                    id="businessLocation"
                    placeholder="City, ZIP code, or street address"
                    value={businessLocation}
                    onChange={(event) => setBusinessLocation(event.target.value)}
                    required
                  />
                </div>
              ) : null}
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
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {successMessage ? (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 space-y-2">
                  <p>{successMessage}</p>
                  {verifiedEmail ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                        className="text-green-700 underline underline-offset-2 hover:text-green-900 disabled:opacity-50 disabled:no-underline text-xs"
                      >
                        {resendStatus === 'sending'
                          ? 'Sending…'
                          : resendStatus === 'sent'
                            ? 'Email resent!'
                            : resendStatus === 'error'
                              ? 'Failed — try again'
                              : "Didn't receive it? Resend email"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={isLoading || !!successMessage}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href={signInHref} className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}
