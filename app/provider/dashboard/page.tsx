'use client';

import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Bell,
  ArrowRight,
  MapPin,
  Zap,
} from 'lucide-react';
import { mockProviderStats, mockSeekerRequests, mockNearbyDemand } from '@/lib/mock-data';

const quickActions = [
  {
    title: 'Add Availability',
    description: 'Open up new time slots',
    icon: Calendar,
    href: '/provider/availability',
    variant: 'default' as const,
  },
  {
    title: 'Mark Available Now',
    description: 'Accept walk-ins right now',
    icon: Zap,
    href: '/provider/availability',
    variant: 'outline' as const,
  },
  {
    title: 'View Requests',
    description: `${mockProviderStats.pendingRequests} pending`,
    icon: Users,
    href: '/provider/requests',
    variant: 'outline' as const,
  },
];

const urgencyColors = {
  now: 'bg-red-100 text-red-700',
  today: 'bg-amber-100 text-amber-700',
  'this-week': 'bg-blue-100 text-blue-700',
  flexible: 'bg-gray-100 text-gray-600',
};

export default function ProviderDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Pawsome Veterinary Clinic</p>
            </div>
            <div className="flex gap-3">
              <Link href="/notifications">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                    5
                  </Badge>
                </Button>
              </Link>
              <Link href="/provider/availability">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Slot
                </Button>
              </Link>
            </div>
          </div>

          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Open Slots</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">{mockProviderStats.openSlots}</p>
                <p className="text-xs text-muted-foreground mt-1">Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Pending Requests</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">{mockProviderStats.pendingRequests}</p>
                <p className="text-xs text-primary mt-1">Action needed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Active Waitlists</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">{mockProviderStats.activeWaitlists}</p>
                <p className="text-xs text-muted-foreground mt-1">People waiting</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Fill Rate</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">{mockProviderStats.fillRate}%</p>
                <Progress value={mockProviderStats.fillRate} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                      <Link key={action.title} href={action.href}>
                        <Button
                          variant={action.variant}
                          className="w-full h-auto py-4 flex-col gap-2 justify-start"
                        >
                          <action.icon className="h-5 w-5" />
                          <span className="font-medium">{action.title}</span>
                          <span className="text-xs opacity-70">{action.description}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg">Recent Requests</CardTitle>
                    <CardDescription>People waiting for your services</CardDescription>
                  </div>
                  <Link href="/provider/requests">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockSeekerRequests.slice(0, 4).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {request.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{request.name}</p>
                            <p className="text-sm text-muted-foreground">{request.service}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={urgencyColors[request.urgency]}>
                            {request.urgency === 'now' ? 'Urgent' : request.urgency.replace('-', ' ')}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{request.requestedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            
            <div className="space-y-6">
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Nearby Demand
                  </CardTitle>
                  <CardDescription>People looking for services near you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockNearbyDemand.map((demand) => (
                      <div
                        key={demand.id}
                        className="p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{demand.service}</span>
                          <Badge className={urgencyColors[demand.urgency]}>
                            {demand.urgency === 'now' ? 'Now' : demand.urgency.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{demand.seekerCount} people looking</span>
                          <span>{demand.area}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Expand your reach by offering mobile services
                  </p>
                </CardContent>
              </Card>

              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Appointments</span>
                      <span className="font-semibold">{mockProviderStats.todayAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Open Slots</span>
                      <span className="font-semibold">{mockProviderStats.openSlots}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">This Week</span>
                      <span className="font-semibold">{mockProviderStats.weeklyBookings} booked</span>
                    </div>
                  </div>
                  <Link href="/provider/availability">
                    <Button variant="outline" className="w-full mt-4">
                      Manage Schedule
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
