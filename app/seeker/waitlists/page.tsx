'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { Clock, CheckCircle, XCircle, Bell, Plus, Loader2, Search } from 'lucide-react';
import { EmptyWaitlistIllustration } from '@/components/illustrations';
import { apiFetch } from '@/lib/api';
import type { WaitlistEntry } from '@/lib/types';
import { mapWaitlistStatus } from '@/lib/types';

type UiStatus = 'active' | 'ready' | 'expired' | 'completed';

const statusConfig: Record<UiStatus, { label: string; className: string; icon: React.ElementType }> = {
  active:    { label: 'Active',           className: 'bg-blue-100 text-blue-700',  icon: Clock },
  ready:     { label: 'Spot Available!',  className: 'bg-green-100 text-green-700', icon: CheckCircle },
  expired:   { label: 'Expired',          className: 'bg-gray-100 text-gray-600',  icon: XCircle },
  completed: { label: 'Completed',        className: 'bg-gray-100 text-gray-600',  icon: CheckCircle },
};

export default function WaitlistsPage() {
  const [waitlists, setWaitlists] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selected, setSelected] = useState<WaitlistEntry | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch<{ waitlists: WaitlistEntry[] }>('/api/waitlists');
      setWaitlists(data.waitlists);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load waitlists');
    } finally {
      setLoading(false);
    }
  }

  const handleCancelClick = (w: WaitlistEntry) => { setSelected(w); setCancelDialogOpen(true); };

  const handleConfirmCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      await apiFetch(`/api/waitlists/${selected.id}`, { method: 'DELETE' });
      setWaitlists((prev) => prev.filter((w) => w.id !== selected.id));
      setCancelDialogOpen(false);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to leave waitlist');
    } finally {
      setCancelling(false);
    }
  };

  const active = waitlists.filter((w) => ['waiting', 'notified'].includes(w.status));
  const past = waitlists.filter((w) => ['booked', 'expired'].includes(w.status));

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="relative py-12 md:py-16 overflow-hidden">
        <Image src="/waitlist-bg.jpg" alt="" fill className="object-cover object-center" quality={80} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.93) 0%, rgba(30,27,75,0.90) 50%, rgba(30,58,95,0.88) 100%)' }} />
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">My Waitlists</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)' }}>Track your position and get notified when a spot opens</p>
          </div>
          <Link href="/seeker/search">
            <Button className="gap-2 bg-white text-indigo-900 hover:bg-zinc-100"><Plus className="h-4 w-4" /> Join More</Button>
          </Link>
        </div>
      </div>
      <main className="flex-1 py-8 md:py-10">
        <div className="container mx-auto px-4">

          {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList>
                <TabsTrigger value="active" className="gap-2">
                  Active
                  {active.length > 0 && <Badge variant="secondary" className="ml-1">{active.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {active.length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <div className="max-w-[180px] mx-auto mb-2">
                      <EmptyWaitlistIllustration />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No active waitlists yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Find a service you need and join their waitlist. We&apos;ll notify you the moment a spot opens up.
                    </p>
                    <Link href="/seeker/search"><Button className="gap-2"><Search className="h-4 w-4" /> Find Services</Button></Link>
                  </CardContent></Card>
                ) : active.map((w) => (
                  <WaitlistCard key={w.id} waitlist={w} onCancel={() => handleCancelClick(w)} />
                ))}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {past.length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">No past waitlists yet — your history will appear here</p>
                  </CardContent></Card>
                ) : past.map((w) => (
                  <WaitlistCard key={w.id} waitlist={w} isPast />
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this waitlist?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll lose your position at {selected?.business_name ?? 'this provider'}. You can always rejoin later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep My Spot</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmCancel()}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Leave Waitlist'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WaitlistCard({ waitlist, onCancel, isPast = false }: { waitlist: WaitlistEntry; onCancel?: () => void; isPast?: boolean }) {
  const uiStatus = mapWaitlistStatus(waitlist.status);
  const cfg = statusConfig[uiStatus];
  const StatusIcon = cfg.icon;

  return (
    <Card className={uiStatus === 'ready' ? 'ring-2 ring-green-500 border-green-500' : ''}>
      <CardContent className="p-5">
        {uiStatus === 'ready' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 -mx-5 -mt-5 px-5 py-3 mb-4 rounded-t-lg border-b border-green-100">
            <Bell className="h-5 w-5" />
            <span className="font-semibold">A spot just opened up! Confirm your appointment now.</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg text-foreground">{waitlist.business_name ?? 'Unknown provider'}</h3>
              <Badge className={cfg.className}>
                <StatusIcon className="h-3 w-3 mr-1" /> {cfg.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{waitlist.service ?? waitlist.category}</p>

            {!isPast && uiStatus === 'active' && (
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="text-2xl font-bold text-foreground">#{waitlist.position}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm text-foreground">{new Date(waitlist.joined_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="text-sm text-foreground">{new Date(waitlist.expires_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {!isPast && (
            <div className="flex gap-2">
              {uiStatus === 'ready' && (
                <Button className="bg-green-600 hover:bg-green-700 text-white">Confirm Appointment</Button>
              )}
              <Button variant="outline" onClick={onCancel}>Leave Waitlist</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
