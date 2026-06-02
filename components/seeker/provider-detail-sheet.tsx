'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, CheckCircle2, Clock, Users, Calendar, Loader2, CheckCircle } from 'lucide-react';
import type { ProviderResult, AvailabilitySlot } from '@/lib/types';
import { formatDistance, formatSlotTime } from '@/lib/types';
import { apiFetch } from '@/lib/api';

interface ProviderDetailSheetProps {
  provider: ProviderResult | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinWaitlist: (provider: ProviderResult) => void;
}

export function ProviderDetailSheet({ provider, isOpen, onClose, onJoinWaitlist }: ProviderDetailSheetProps) {
  const [slots, setSlots] = useState<(AvailabilitySlot & { is_available?: boolean })[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<AvailabilitySlot | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && provider) {
      void loadSlots(provider.id);
    }
    if (!isOpen) {
      setSlots([]);
      setSlotsError(null);
      setBookingSuccess(false);
    }
  }, [isOpen, provider]);

  async function loadSlots(providerId: string) {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const data = await apiFetch<{ slots: (AvailabilitySlot & { is_available?: boolean })[] }>(
        `/api/providers/${providerId}/availability`
      );
      setSlots(data.slots);
    } catch (e) {
      setSlotsError(e instanceof Error ? e.message : 'Failed to load slots');
    } finally {
      setLoadingSlots(false);
    }
  }

  const handleBookSlot = (slot: AvailabilitySlot) => {
    setBookingSlot(slot);
    setBookingError(null);
    setBookingSuccess(false);
    setBookingDialogOpen(true);
  };

  const confirmBookSlot = async () => {
    if (!bookingSlot) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ slot_id: bookingSlot.id }),
      });
      setBookingSuccess(true);
      setSlots((prev) =>
        prev.map((s) =>
          s.id === bookingSlot.id ? { ...s, booked_count: s.booked_count + 1 } : s
        )
      );
    } catch (e) {
      setBookingError(e instanceof Error ? e.message : 'Failed to book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!provider) return null;

  const availableSlots = slots.filter((s) => s.booked_count < s.capacity);
  const fullSlots = slots.filter((s) => s.booked_count >= s.capacity);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">{provider.business_name}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-700">Waitlist Open</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{formatDistance(provider.dist_meters)} away</span>
            </div>

            {/* Available Time Slots Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Available Time Slots
              </h3>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : slotsError ? (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{slotsError}</div>
              ) : availableSlots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center">
                  <Clock className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
                  <p className="font-medium text-foreground text-sm">No open slots right now</p>
                  <p className="text-xs text-muted-foreground mt-1">Join the waitlist to be notified when a spot opens</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableSlots.map((slot) => {
                    const available = slot.capacity - slot.booked_count;
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-background hover:bg-primary/5 transition-colors"
                      >
                          <p className="font-medium text-foreground text-sm">
                            {new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-muted-foreground">{formatSlotTime(slot.start_time, slot.end_time)}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{available} spot{available !== 1 ? 's' : ''} left</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleBookSlot(slot)} className="gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Book
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {fullSlots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Slots</p>
                  {fullSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                      <div>
                        <p className="font-medium text-muted-foreground text-sm">
                          {new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatSlotTime(slot.start_time, slot.end_time)}</p>
                      </div>
                      <Badge variant="secondary">Full</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                {availableSlots.length > 0
                  ? 'Book a slot directly, or join the waitlist to be notified of future openings.'
                  : 'All slots are full. Join the waitlist and we\'ll notify you when a spot opens.'}
              </p>
              <Button size="lg" className="w-full gap-2" onClick={() => onJoinWaitlist(provider)}>
                <CheckCircle2 className="h-5 w-5" /> Join Waitlist
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Booking Confirmation Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={(open) => { setBookingDialogOpen(open); if (!open) setBookingSuccess(false); }}>
        <DialogContent>
          {bookingSuccess ? (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="mb-2">Appointment Booked!</DialogTitle>
              <DialogDescription>
                Your appointment with {provider.business_name} has been confirmed for{' '}
                {bookingSlot && (
                  <>
                    {new Date(bookingSlot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at{' '}
                    {formatSlotTime(bookingSlot.start_time, bookingSlot.end_time)}
                  </>
                )}
                .
              </DialogDescription>
              <DialogFooter className="mt-6 sm:justify-center">
                <Button onClick={() => { setBookingDialogOpen(false); setBookingSuccess(false); }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Booking</DialogTitle>
                <DialogDescription>Book this time slot at {provider.business_name}</DialogDescription>
              </DialogHeader>
              {bookingSlot && (
                <div className="py-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {new Date(bookingSlot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{formatSlotTime(bookingSlot.start_time, bookingSlot.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {bookingSlot.capacity - bookingSlot.booked_count} spot{bookingSlot.capacity - bookingSlot.booked_count !== 1 ? 's' : ''} remaining
                      </span>
                    </div>
                  </div>
                  {bookingError && <p className="text-sm text-destructive mt-3">{bookingError}</p>}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setBookingDialogOpen(false)} disabled={bookingLoading}>Cancel</Button>
                <Button onClick={() => void confirmBookSlot()} disabled={bookingLoading}>
                  {bookingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Booking'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
