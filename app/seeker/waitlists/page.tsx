'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Clock, CheckCircle, XCircle, Bell, Plus, Loader2, Search, Timer, MapPin, AlertTriangle } from 'lucide-react';
import { EmptyWaitlistIllustration } from '@/components/illustrations';
import { apiFetch } from '@/lib/api';
import type { WaitlistEntry, BookingEntry, DispatchRequest } from '@/lib/types';
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
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selected, setSelected] = useState<WaitlistEntry | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Confirm appointment dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmingBooking, setConfirmingBooking] = useState<BookingEntry | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const [wlData, bookingData, dispatchData] = await Promise.all([
        apiFetch<{ waitlists: WaitlistEntry[] }>('/api/waitlist'),
        apiFetch<{ bookings: BookingEntry[] }>('/api/bookings').catch(() => ({ bookings: [] })),
        apiFetch<{ dispatch_requests: DispatchRequest[] }>('/api/dispatch').catch(() => ({ dispatch_requests: [] })),
      ]);
      setWaitlists(wlData.waitlists);
      setBookings(bookingData.bookings);
      setDispatches(dispatchData.dispatch_requests);
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
      await apiFetch(`/api/waitlist/${selected.id}`, { method: 'DELETE' });
      setWaitlists((prev) => prev.filter((w) => w.id !== selected.id));
      setCancelDialogOpen(false);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to leave waitlist');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmAppointment = (waitlistEntry: WaitlistEntry) => {
    const pendingBooking = bookings.find(
      (b) => b.waitlist_id === waitlistEntry.id && b.status === 'pending'
    );
    if (pendingBooking) {
      setConfirmingBooking(pendingBooking);
    } else {
      setConfirmingBooking({
        id: waitlistEntry.id,
        provider_id: waitlistEntry.provider_id ?? '',
        customer_id: '',
        waitlist_id: waitlistEntry.id,
        slot_id: null,
        status: 'pending',
        notes: null,
        created_at: new Date().toISOString(),
        provider: { id: waitlistEntry.provider_id ?? '', business_name: waitlistEntry.business_name ?? 'Provider', category: waitlistEntry.category },
        slot: null,
      });
    }
    setConfirmError(null);
    setConfirmSuccess(false);
    setConfirmDialogOpen(true);
  };

  const doConfirmAppointment = async () => {
    if (!confirmingBooking) return;
    setConfirmLoading(true);
    setConfirmError(null);
    try {
      await apiFetch(`/api/bookings/${confirmingBooking.id}/confirm`, { method: 'POST' });
      setConfirmSuccess(true);
      setBookings((prev) =>
        prev.map((b) => b.id === confirmingBooking.id ? { ...b, status: 'confirmed' } : b)
      );
      setWaitlists((prev) =>
        prev.map((w) => w.id === confirmingBooking.waitlist_id ? { ...w, status: 'booked' } : w)
      );
    } catch (e) {
      setConfirmError(e instanceof Error ? e.message : 'Failed to confirm');
    } finally {
      setConfirmLoading(false);
    }
  };

  const active = waitlists.filter((w) => ['waiting', 'notified'].includes(w.status));
  const past = waitlists.filter((w) => ['booked', 'expired'].includes(w.status));
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeDispatches = dispatches.filter((d) => d.status === 'open');

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

          {/* Pending Bookings - needs confirmation */}
          {pendingBookings.length > 0 && (
            <div className="mb-6 space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Timer className="h-5 w-5 text-amber-500" />
                Awaiting Your Confirmation
              </h2>
              {pendingBookings.map((booking) => (
                <PendingBookingCard
                  key={booking.id}
                  booking={booking}
                  onConfirm={() => {
                    setConfirmingBooking(booking);
                    setConfirmError(null);
                    setConfirmSuccess(false);
                    setConfirmDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* Active Dispatch Requests */}
          {activeDispatches.length > 0 && (
            <div className="mb-6 space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Active Urgent Requests
              </h2>
              {activeDispatches.map((dispatch) => (
                <DispatchTracker key={dispatch.id} dispatch={dispatch} />
              ))}
            </div>
          )}

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
                  <WaitlistCard
                    key={w.id}
                    waitlist={w}
                    onCancel={() => handleCancelClick(w)}
                    onConfirm={() => handleConfirmAppointment(w)}
                    pendingBooking={pendingBookings.find((b) => b.waitlist_id === w.id) ?? null}
                  />
                ))}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {past.length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">No past waitlists yet — your history will appear here</p>
                  </CardContent></Card>
                ) : past.map((w) => (
                  <WaitlistCard key={w.id} waitlist={w} isPast pendingBooking={null} />
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />

      {/* Cancel Waitlist Dialog */}
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

      {/* Confirm Appointment Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={(open) => { setConfirmDialogOpen(open); if (!open) setConfirmSuccess(false); }}>
        <DialogContent>
          {confirmSuccess ? (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="mb-2">Appointment Confirmed!</DialogTitle>
              <DialogDescription>
                Your appointment with {confirmingBooking?.provider?.business_name ?? 'the provider'} is now confirmed.
                {confirmingBooking?.slot && (
                  <> Scheduled for {new Date(confirmingBooking.slot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</>
                )}
              </DialogDescription>
              <DialogFooter className="mt-6 sm:justify-center">
                <Button onClick={() => { setConfirmDialogOpen(false); setConfirmSuccess(false); }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Your Appointment</DialogTitle>
                <DialogDescription>
                  A spot has opened up at {confirmingBooking?.provider?.business_name ?? 'the provider'}. Confirm within 15 minutes to secure it.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
                  <p className="font-semibold text-green-800">{confirmingBooking?.provider?.business_name}</p>
                  {confirmingBooking?.slot && (
                    <p className="text-sm text-green-700">
                      {new Date(confirmingBooking.slot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                  {confirmingBooking?.notes && (
                    <p className="text-sm text-green-600">{confirmingBooking.notes}</p>
                  )}
                </div>
                {confirmError && <p className="text-sm text-destructive mt-3">{confirmError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={confirmLoading}>Not Now</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => void doConfirmAppointment()} disabled={confirmLoading}>
                  {confirmLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Appointment'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Countdown Timer Hook ── */
function useCountdown(targetDate: string) {
  const calcRemaining = useCallback(() => {
    const diff = new Date(targetDate).getTime() - Date.now();
    return Math.max(0, diff);
  }, [targetDate]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    const interval = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(interval);
  }, [calcRemaining]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isExpired = remaining <= 0;
  const isUrgent = remaining < 5 * 60 * 1000 && !isExpired;

  return { minutes, seconds, isExpired, isUrgent, remaining };
}

/* ── Pending Booking Card (Model B - awaiting customer confirmation) ── */
function PendingBookingCard({ booking, onConfirm }: { booking: BookingEntry; onConfirm: () => void }) {
  const confirmDeadline = new Date(new Date(booking.created_at).getTime() + 15 * 60 * 1000).toISOString();
  const { minutes, seconds, isExpired, isUrgent } = useCountdown(confirmDeadline);

  return (
    <Card className="ring-2 ring-amber-400 border-amber-400">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 -mx-5 -mt-5 px-5 py-3 mb-4 rounded-t-lg border-b border-amber-100">
          <Timer className="h-5 w-5" />
          <span className="font-semibold">
            {isExpired ? 'Confirmation window expired' : 'Confirm within'}
          </span>
          {!isExpired && (
            <span className={`ml-auto font-mono font-bold text-lg ${isUrgent ? 'text-red-600' : 'text-amber-800'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground">{booking.provider?.business_name ?? 'Provider'}</h3>
            <p className="text-sm text-muted-foreground">{booking.provider?.category}</p>
            {booking.slot && (
              <p className="text-sm text-foreground">
                {new Date(booking.slot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {' · '}{booking.slot.start_time} – {booking.slot.end_time}
              </p>
            )}
            {booking.notes && <p className="text-xs text-muted-foreground italic">{booking.notes}</p>}
          </div>
          {!isExpired && (
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-1 shrink-0" onClick={onConfirm}>
              <CheckCircle className="h-4 w-4" /> Confirm Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Dispatch Tracker Card (Model C - customer active request) ── */
function DispatchTracker({ dispatch }: { dispatch: DispatchRequest }) {
  const { minutes, seconds, isExpired, isUrgent } = useCountdown(dispatch.expires_at);

  const statusLabel = dispatch.status === 'claimed' ? 'Claimed' : dispatch.status === 'expired' || isExpired ? 'Expired' : 'Searching...';
  const statusColor = dispatch.status === 'claimed'
    ? 'bg-green-100 text-green-700'
    : isExpired ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700';

  return (
    <Card className={dispatch.status === 'claimed' ? 'ring-2 ring-green-500 border-green-500' : isExpired ? '' : 'ring-2 ring-red-400 border-red-400'}>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg text-foreground capitalize">{dispatch.category.replace(/-/g, ' ')}</h3>
              <Badge className={statusColor}>{statusLabel}</Badge>
            </div>
            {dispatch.description && <p className="text-sm text-muted-foreground">{dispatch.description}</p>}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{dispatch.address}</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            {dispatch.status === 'open' && !isExpired && (
              <>
                <p className="text-xs text-muted-foreground">Expires in</p>
                <p className={`font-mono font-bold text-2xl ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Notifying nearby providers</span>
                </div>
              </>
            )}
            {dispatch.status === 'claimed' && (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Provider accepted!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Waitlist Card ── */
function WaitlistCard({ waitlist, onCancel, onConfirm, isPast = false, pendingBooking }: {
  waitlist: WaitlistEntry;
  onCancel?: () => void;
  onConfirm?: () => void;
  isPast?: boolean;
  pendingBooking: BookingEntry | null;
}) {
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
            {pendingBooking && <ConfirmCountdown createdAt={pendingBooking.created_at} />}
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
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={onConfirm}>Confirm Appointment</Button>
              )}
              <Button variant="outline" onClick={onCancel}>Leave Waitlist</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── 15-min countdown shown inside the green banner ── */
function ConfirmCountdown({ createdAt }: { createdAt: string }) {
  const deadline = new Date(new Date(createdAt).getTime() + 15 * 60 * 1000).toISOString();
  const { minutes, seconds, isExpired, isUrgent } = useCountdown(deadline);

  if (isExpired) return null;

  return (
    <span className={`ml-auto font-mono font-bold ${isUrgent ? 'text-red-600' : 'text-green-800'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}
