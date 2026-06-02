'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, KeyRound, Loader2, MapPin, Save, ShieldCheck, Upload } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/password-input';
import { apiFetch } from '@/lib/api';

type AccountProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'user' | 'business';
  onboardingCompleted: boolean;
};

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetch('/api/account', { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          user?: AccountProfile;
          error?: string;
        };

        if (response.status === 401) {
          router.replace('/signin?next=/account');
          return;
        }

        if (!response.ok || !payload.user) {
          throw new Error(payload.error ?? 'Failed to load account profile');
        }

        return payload.user;
      })
      .then((user) => {
        if (!user) return;
        if (!isMounted) return;
        setAccount(user);
        setDisplayName(user.name);
        setBusinessLocation('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Failed to load account profile');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  useEffect(() => {
    const previousHtmlOverflowX = document.documentElement.style.overflowX;
    const previousBodyOverflowX = document.body.style.overflowX;
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.documentElement.style.overflowX = previousHtmlOverflowX;
      document.body.style.overflowX = previousBodyOverflowX;
    };
  }, []);

  const initials = useMemo(() => {
    const source = displayName || account?.email || 'A';
    return source
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }, [account?.email, displayName]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setIsSavingProfile(true);

    try {
      const { user } = await apiFetch<{ user: AccountProfile }>('/api/account', {
        method: 'PATCH',
        body: JSON.stringify({
          name: displayName,
          avatarUrl: account?.avatarUrl ?? null,
        }),
      });
      setAccount(user);
      setDisplayName(user.name);
      setProfileMessage('Profile saved.');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    setProfileError('');
    setProfileMessage('');
    setIsUploadingAvatar(true);

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const response = await fetch('/api/account/avatar', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json()) as { avatarUrl?: string; error?: string };

      if (!response.ok || !payload.avatarUrl) {
        throw new Error(payload.error ?? 'Failed to upload avatar');
      }

      const avatarUrl = payload.avatarUrl;
      setAccount((current) => (current ? { ...current, avatarUrl } : current));
      setAvatarFile(null);
      setProfileMessage('Photo updated.');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await apiFetch<{ message: string }>('/api/account/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated.');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8 md:py-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Account</h1>
              <p className="text-muted-foreground">Manage your Bizskip profile.</p>
            </div>
            {account ? (
              <Badge variant="outline" className="h-8 gap-2 capitalize">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {account.role}
              </Badge>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : loadError ? (
            <Card>
              <CardHeader>
                <CardTitle>Account Unavailable</CardTitle>
                <CardDescription>We could not load your account details right now.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-destructive">{loadError}</p>
              </CardContent>
            </Card>
          ) : account ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-6">
                <Card className="min-w-0">
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Your public account details.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Avatar className="h-20 w-20 border border-border">
                          <AvatarImage src={avatarPreview ?? account.avatarUrl ?? undefined} alt={displayName} />
                          <AvatarFallback className="text-lg font-semibold text-primary">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-wrap items-center gap-2">
                          <Label
                            htmlFor="avatar"
                            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                          >
                            <Camera className="h-4 w-4" />
                            Choose Photo
                          </Label>
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="sr-only"
                            onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!avatarFile || isUploadingAvatar}
                            onClick={() => void handleAvatarUpload()}
                          >
                            {isUploadingAvatar ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            Upload
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={account.email} readOnly className="bg-muted/60" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Role</Label>
                        <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm capitalize">
                          {account.role}
                        </div>
                      </div>

                      {account.role === 'business' ? (
                        <div className="space-y-2">
                          <Label htmlFor="businessLocation" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Business Location
                          </Label>
                          <Input
                            id="businessLocation"
                            placeholder="Street address, city, ZIP code, or service area"
                            value={businessLocation}
                            onChange={(event) => setBusinessLocation(event.target.value)}
                          />
                        </div>
                      ) : null}

                      {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
                      {profileMessage ? <p className="text-sm text-green-700">{profileMessage}</p> : null}

                      <Button type="submit" disabled={isSavingProfile}>
                        {isSavingProfile ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Profile
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-primary" />
                      Change Password
                    </CardTitle>
                    <CardDescription>Update the password used to sign in.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <PasswordInput
                            id="currentPassword"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <PasswordInput
                            id="newPassword"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmNewPassword">Confirm Password</Label>
                          <PasswordInput
                            id="confirmNewPassword"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
                      {passwordMessage ? <p className="text-sm text-green-700">{passwordMessage}</p> : null}

                      <Button type="submit" variant="outline" disabled={isChangingPassword}>
                        {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Change Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <Card className="h-fit min-w-0">
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={account.avatarUrl ?? undefined} alt={account.name} />
                      <AvatarFallback className="font-semibold text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{account.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{account.email}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-medium capitalize">{account.role}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Provider setup</span>
                      <span className="font-medium">{account.onboardingCompleted ? 'Complete' : 'Not complete'}</span>
                    </div>
                    {account.role === 'business' ? (
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <span className="text-muted-foreground">Location</span>
                        <span className="max-w-[170px] text-right font-medium">
                          {businessLocation || 'Not set'}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
