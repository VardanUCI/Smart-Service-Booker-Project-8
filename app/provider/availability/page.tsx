'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Clock, Users, Zap, Trash2, Loader2, UserCheck, Hand } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { AvailabilitySlot } from '@/lib/types';
import { formatSlotTime, getTodayTomorrow } from '@/lib/types';

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailableNow, setIsAvailableNow] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const { today, tomorrow } = getTodayTomorrow();
  const [newSlot, setNewSlot] = useState({ date: today, start_time: '09:00', end_time: '10:00', capacity: 1 });

  // "I Have One Opening" state (Model B)
  const [openSlotLoading, setOpenSlotLoading] = useState(false);
  const [openSlotResult, setOpenSlotResult] = useState<{ matched: boolean; customerName?: string; message?: string } | null>(null);
  const [showOpenSlotDialog, setShowOpenSlotDialog] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch<{ slots: AvailabilitySlot[] }>('/api/availability');
      setSlots(data.slots);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }

  const handleAddSlot = async () => {
    setAddLoading(true);
    setAddError(null);
    try {
      const data = await apiFetch<{ slot: AvailabilitySlot }>('/api/availability', {
        method: 'POST',
        body: JSON.stringify({
          date: newSlot.date,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          capacity: newSlot.capacity,
        }),
      });
      setSlots((prev) => [...prev, data.slot].sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)));
      setIsAddDialogOpen(false);
      setNewSlot({ date: today, start_time: '09:00', end_time: '10:00', capacity: 1 });
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to add slot');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await apiFetch(`/api/availability/${id}`, { method: 'DELETE' });
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete slot');
    }
  };

  const handleOpenOneSlot = async () => {
    setOpenSlotLoading(true);
    setOpenSlotResult(null);
    try {
      const data = await apiFetch<{ matched: boolean; message?: string; booking?: { id: string }; waitlist_entry?: { contact_value?: string } }>('/api/providers/open-slot', {
        method: 'POST',
      });
      setOpenSlotResult({
        matched: data.matched,
        customerName: data.waitlist_entry?.contact_value ?? undefined,
        message: data.message ?? undefined,
      });
      setShowOpenSlotDialog(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open slot');
    } finally {
      setOpenSlotLoading(false);
    }
  };

  const handleToggleAvailableNow = (checked: boolean) => {
    setIsAvailableNow(checked);
  };

  const todaySlots = slots.filter((s) => s.date === today);
  const tomorrowSlots = slots.filter((s) => s.date === tomorrow);
  const upcomingSlots = slots.filter((s) => s.date > tomorrow);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/provider/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Availability</h1>
              <p className="text-muted-foreground">Manage your open time slots</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Add Slot</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Time Slot</DialogTitle>
                  <DialogDescription>Create a new availability slot for customers</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="slot-date">Date</Label>
                    <Input id="slot-date" type="date" min={today} value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="slot-start">Start Time</Label>
                      <Input id="slot-start" type="time" value={newSlot.start_time}
                        onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slot-end">End Time</Label>
                      <Input id="slot-end" type="time" value={newSlot.end_time}
                        onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-cap">Capacity (max appointments)</Label>
                    <Input id="slot-cap" type="number" min={1} max={50} value={newSlot.capacity}
                      onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) || 1 })} />
                  </div>
                  {addError && <p className="text-sm text-destructive">{addError}</p>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={addLoading}>Cancel</Button>
                  <Button onClick={() => void handleAddSlot()} disabled={addLoading}>
                    {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Slot'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isAvailableNow ? 'bg-green-100' : 'bg-muted'}`}>
                    <Zap className={`h-6 w-6 ${isAvailableNow ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <Label htmlFor="available-now" className="text-lg font-semibold">Available Now</Label>
                    <p className="text-sm text-muted-foreground">Accept walk-ins and urgent requests immediately</p>
                  </div>
                </div>
                <Switch id="available-now" checked={isAvailableNow}
                  onCheckedChange={handleToggleAvailableNow} className="scale-125" />
              </div>
              {isAvailableNow && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  You&apos;re now visible to people looking for immediate availability.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model B: "I Have One Opening" Card */}
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Hand className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">I Have One Opening</p>
                    <p className="text-sm text-muted-foreground">Someone cancelled or left early? Notify the next person on your waitlist</p>
                  </div>
                </div>
                <Button
                  onClick={() => void handleOpenOneSlot()}
                  disabled={openSlotLoading}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {openSlotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserCheck className="h-4 w-4" /> Notify Next</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Open Slot Result Dialog */}
          <Dialog open={showOpenSlotDialog} onOpenChange={setShowOpenSlotDialog}>
            <DialogContent>
              {openSlotResult?.matched ? (
                <div className="text-center py-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-center">Customer Notified!</DialogTitle>
                    <DialogDescription className="text-center">
                      The next person on your waitlist has been selected and notified. They have 15 minutes to confirm their appointment.
                      {openSlotResult.customerName && (
                        <span className="block mt-2 font-medium text-foreground">{openSlotResult.customerName}</span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-6">
                    <Button onClick={() => setShowOpenSlotDialog(false)}>Got it</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-center">No One Waiting</DialogTitle>
                    <DialogDescription className="text-center">
                      {openSlotResult?.message ?? 'No one is currently on your waitlist. When customers join, you can use this to instantly notify the next person.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-6">
                    <Button variant="outline" onClick={() => setShowOpenSlotDialog(false)}>OK</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-6">
              {[{ label: 'Today', items: todaySlots }, { label: 'Tomorrow', items: tomorrowSlots }, { label: 'Upcoming', items: upcomingSlots }].map(({ label, items }) => (
                <Card key={label}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" /> {label}
                    </CardTitle>
                    <CardDescription>{items.length} time slot{items.length !== 1 ? 's' : ''}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {items.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                          <Clock className="h-7 w-7 text-indigo-300" />
                        </div>
                        <p className="text-muted-foreground">No slots for {label.toLowerCase()}</p>
                        <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4" /> Add Slot</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((slot) => <SlotCard key={slot.id} slot={slot} onDelete={handleDeleteSlot} />)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SlotCard({ slot, onDelete }: { slot: AvailabilitySlot; onDelete: (id: string) => void }) {
  const isFull = slot.booked_count >= slot.capacity;
  const available = slot.capacity - slot.booked_count;
  return (
    <div className={`p-4 rounded-lg border ${isFull ? 'bg-muted/50 border-border' : 'bg-background border-primary/20'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-foreground">{formatSlotTime(slot.start_time, slot.end_time)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(slot.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{slot.booked_count} / {slot.capacity} booked</span>
        </div>
        {isFull ? (
          <Badge variant="secondary">Full</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-700">{available} available</Badge>
        )}
      </div>
    </div>
  );
}
