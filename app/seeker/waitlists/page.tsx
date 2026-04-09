'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, MapPin, CheckCircle, XCircle, Bell, Plus, Star } from 'lucide-react';
import { mockUserWaitlists, UserWaitlist } from '@/lib/mock-data';

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-blue-100 text-blue-700',
    icon: Clock,
  },
  ready: {
    label: 'Spot Available!',
    className: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-600',
    icon: XCircle,
  },
  completed: {
    label: 'Completed',
    className: 'bg-gray-100 text-gray-600',
    icon: CheckCircle,
  },
};

export default function WaitlistsPage() {
  const [waitlists, setWaitlists] = useState<UserWaitlist[]>(mockUserWaitlists);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedWaitlist, setSelectedWaitlist] = useState<UserWaitlist | null>(null);

  const activeWaitlists = waitlists.filter((w) => w.status === 'active' || w.status === 'ready');
  const pastWaitlists = waitlists.filter((w) => w.status === 'expired' || w.status === 'completed');

  const handleCancelClick = (waitlist: UserWaitlist) => {
    setSelectedWaitlist(waitlist);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedWaitlist) {
      setWaitlists((prev) => prev.filter((w) => w.id !== selectedWaitlist.id));
    }
    setCancelDialogOpen(false);
    setSelectedWaitlist(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">My Waitlists</h1>
              <p className="text-muted-foreground">Track your position and get notified when a spot opens</p>
            </div>
            <Link href="/seeker/search">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Join More
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active" className="gap-2">
                Active
                {activeWaitlists.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeWaitlists.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeWaitlists.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No active waitlists</h3>
                    <p className="text-muted-foreground mb-6">
                      Search for services and join waitlists to see them here
                    </p>
                    <Link href="/seeker/search">
                      <Button>Find Services</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                activeWaitlists.map((waitlist) => (
                  <WaitlistCard
                    key={waitlist.id}
                    waitlist={waitlist}
                    onCancel={() => handleCancelClick(waitlist)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastWaitlists.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No past waitlists</p>
                  </CardContent>
                </Card>
              ) : (
                pastWaitlists.map((waitlist) => (
                  <WaitlistCard key={waitlist.id} waitlist={waitlist} isPast />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this waitlist?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll lose your position at {selectedWaitlist?.provider.name}. You can always
              rejoin later, but you&apos;ll start at the back of the line.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep My Spot</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Leave Waitlist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface WaitlistCardProps {
  waitlist: UserWaitlist;
  onCancel?: () => void;
  isPast?: boolean;
}

function WaitlistCard({ waitlist, onCancel, isPast = false }: WaitlistCardProps) {
  const status = statusConfig[waitlist.status];
  const StatusIcon = status.icon;

  return (
    <Card className={waitlist.status === 'ready' ? 'ring-2 ring-green-500 border-green-500' : ''}>
      <CardContent className="p-5">
        {waitlist.status === 'ready' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 -mx-5 -mt-5 px-5 py-3 mb-4 rounded-t-lg border-b border-green-100">
            <Bell className="h-5 w-5" />
            <span className="font-semibold">A spot just opened up! Confirm your appointment now.</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg text-foreground">{waitlist.provider.name}</h3>
              <Badge className={status.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{waitlist.service}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {waitlist.provider.distance}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {waitlist.provider.rating}
              </span>
            </div>

            {!isPast && waitlist.status === 'active' && (
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="text-2xl font-bold text-foreground">#{waitlist.position}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Est. Wait</p>
                  <p className="text-lg font-semibold text-foreground">{waitlist.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm text-foreground">{waitlist.joinedAt}</p>
                </div>
              </div>
            )}
          </div>

          {!isPast && (
            <div className="flex gap-2">
              {waitlist.status === 'ready' && (
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Confirm Appointment
                </Button>
              )}
              <Button variant="outline" onClick={onCancel}>
                Leave Waitlist
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
