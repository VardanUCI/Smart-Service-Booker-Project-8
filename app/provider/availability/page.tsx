'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Clock, Users, Zap, Trash2, Edit2 } from 'lucide-react';
import { mockTimeSlots, TimeSlot } from '@/lib/mock-data';

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<TimeSlot[]>(mockTimeSlots);
  const [isAvailableNow, setIsAvailableNow] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: 'Today',
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    capacity: '3',
  });

  const handleAddSlot = () => {
    const slot: TimeSlot = {
      id: `ts-${Date.now()}`,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      capacity: parseInt(newSlot.capacity),
      booked: 0,
      isAvailableNow: false,
    };
    setSlots([...slots, slot]);
    setIsAddDialogOpen(false);
    setNewSlot({ date: 'Today', startTime: '9:00 AM', endTime: '10:00 AM', capacity: '3' });
  };

  const handleDeleteSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const todaySlots = slots.filter((s) => s.date === 'Today');
  const tomorrowSlots = slots.filter((s) => s.date === 'Tomorrow');

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          
          <div className="flex items-center gap-4 mb-6">
            <Link href="/provider/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Availability</h1>
              <p className="text-muted-foreground">Manage your open time slots</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Time Slot</DialogTitle>
                  <DialogDescription>Create a new availability slot for customers</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Select value={newSlot.date} onValueChange={(v) => setNewSlot({ ...newSlot, date: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Today">Today</SelectItem>
                        <SelectItem value="Tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="This Week">This Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Select value={newSlot.startTime} onValueChange={(v) => setNewSlot({ ...newSlot, startTime: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Select value={newSlot.endTime} onValueChange={(v) => setNewSlot({ ...newSlot, endTime: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity (max appointments)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newSlot.capacity}
                      onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddSlot}>Add Slot</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          
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
                <Switch
                  id="available-now"
                  checked={isAvailableNow}
                  onCheckedChange={setIsAvailableNow}
                  className="scale-125"
                />
              </div>
              {isAvailableNow && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  You&apos;re now visible to people looking for immediate availability. You&apos;ll receive notifications for urgent requests.
                </div>
              )}
            </CardContent>
          </Card>

          
          <div className="grid md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today
                </CardTitle>
                <CardDescription>{todaySlots.length} time slots</CardDescription>
              </CardHeader>
              <CardContent>
                {todaySlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No slots for today</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                      Add Slot
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaySlots.map((slot) => (
                      <SlotCard key={slot.id} slot={slot} onDelete={handleDeleteSlot} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Tomorrow
                </CardTitle>
                <CardDescription>{tomorrowSlots.length} time slots</CardDescription>
              </CardHeader>
              <CardContent>
                {tomorrowSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No slots for tomorrow</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                      Add Slot
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tomorrowSlots.map((slot) => (
                      <SlotCard key={slot.id} slot={slot} onDelete={handleDeleteSlot} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface SlotCardProps {
  slot: TimeSlot;
  onDelete: (id: string) => void;
}

function SlotCard({ slot, onDelete }: SlotCardProps) {
  const isFull = slot.booked >= slot.capacity;
  const available = slot.capacity - slot.booked;

  return (
    <div className={`p-4 rounded-lg border ${isFull ? 'bg-muted/50 border-border' : 'bg-background border-primary/20'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {slot.startTime} - {slot.endTime}
          </span>
          {slot.isAvailableNow && (
            <Badge className="bg-green-100 text-green-700">Available Now</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(slot.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{slot.booked} / {slot.capacity} booked</span>
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
