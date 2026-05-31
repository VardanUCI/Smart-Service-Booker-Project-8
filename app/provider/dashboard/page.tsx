'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Clock, TrendingUp, Plus, Bell, ArrowRight, MapPin, Zap, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { ProviderDashboardStats, ProviderRequest } from '@/lib/types';

const urgencyColors: Record<string, string> = {
  now: 'bg-red-100 text-red-700',
  today: 'bg-amber-100 text-amber-700',
  'this-week': 'bg-blue-100 text-blue-700',
  flexible: 'bg-gray-100 text-gray-600',
};

export default function ProviderDashboard() {
  const [stats, setStats] = useState<ProviderDashboardStats | null>(null);
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, reqRes] = await Promise.all([
          apiFetch<{ stats: ProviderDashboardStats }>('/api/providers/dashboard'),
          apiFetch<{ requests: ProviderRequest[] }>('/api/providers/requests'),
        ]);
        setStats(statsRes.stats);
        setRequests(reqRes.requests);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const openSlots = stats?.openSlots ?? 0;
  const pendingRequests = stats?.pendingRequests ?? 0;
  const activeWaitlists = stats?.activeWaitlists ?? 0;
  const fillRate = stats?.fillRate ?? 0;
  const todayAppointments = stats?.todayAppointments ?? 0;
  const weeklyBookings = stats?.weeklyBookings ?? 0;

  const quickActions = [
    { title: 'Add Availability', description: 'Open up new time slots', icon: Calendar, href: '/provider/availability', variant: 'default' as const },
    { title: 'Mark Available Now', description: 'Accept walk-ins right now', icon: Zap, href: '/provider/availability', variant: 'outline' as const },
    { title: 'View Requests', description: `${pendingRequests} pending`, icon: Users, href: '/provider/requests', variant: 'outline' as const },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="py-8 md:py-12" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a5f 100%)' }}>
        <div className="container mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)' }}>Here&apos;s what&apos;s happening with your business today</p>
          </div>
          <div className="flex gap-3">
            <Link href="/notifications">
              <Button size="sm" className="relative bg-white/10 text-white border border-white/20 hover:bg-white/20">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {pendingRequests > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white">
                    {pendingRequests}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/provider/availability">
              <Button size="sm" className="gap-2 bg-white text-indigo-900 hover:bg-zinc-100">
                <Plus className="h-4 w-4" /> Add Slot
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5 flex items-center justify-center h-24"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></CardContent></Card>
            )) : (<>
              <Card><CardContent className="p-5">
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Open Slots</span><Calendar className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-3xl font-bold text-foreground">{openSlots}</p>
                <p className="text-xs text-muted-foreground mt-1">Today</p>
              </CardContent></Card>
              <Card><CardContent className="p-5">
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Pending Requests</span><Users className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-3xl font-bold text-foreground">{pendingRequests}</p>
                <p className="text-xs text-primary mt-1">Action needed</p>
              </CardContent></Card>
              <Card><CardContent className="p-5">
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Active Waitlists</span><Clock className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-3xl font-bold text-foreground">{activeWaitlists}</p>
                <p className="text-xs text-muted-foreground mt-1">People waiting</p>
              </CardContent></Card>
              <Card><CardContent className="p-5">
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Fill Rate</span><TrendingUp className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-3xl font-bold text-foreground">{fillRate}%</p>
                <Progress value={fillRate} className="h-1.5 mt-2" />
              </CardContent></Card>
            </>)}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                      <Link key={action.title} href={action.href}>
                        <Button variant={action.variant} className="w-full h-auto py-4 flex-col gap-2 justify-start">
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
                    <Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : requests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 p-8 text-center">
                      <Users className="h-10 w-10 text-indigo-300 mx-auto mb-3" />
                      <p className="font-medium text-foreground">No requests yet</p>
                      <p className="text-sm text-muted-foreground mt-1">When customers join your waitlist, their requests will show up here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.slice(0, 4).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {request.customer_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{request.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{request.service ?? request.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={urgencyColors[request.urgency] ?? 'bg-gray-100 text-gray-600'}>
                              {request.urgency === 'now' ? 'Urgent' : request.urgency.replace('-', ' ')}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Nearby Demand
                  </CardTitle>
                  <CardDescription>People looking for services near you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center">
                    <MapPin className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
                    <p className="font-medium text-foreground text-sm">No nearby demand data yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Demand insights will appear here as customers search near you.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">Today&apos;s Schedule</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Appointments</span>
                      <span className="font-semibold">{todayAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Open Slots</span>
                      <span className="font-semibold">{openSlots}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">This Week</span>
                      <span className="font-semibold">{weeklyBookings} booked</span>
                    </div>
                  </div>
                  <Link href="/provider/availability">
                    <Button variant="outline" className="w-full mt-4">Manage Schedule</Button>
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
