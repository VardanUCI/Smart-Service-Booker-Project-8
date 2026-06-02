'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Bell, CheckCircle, Clock, AlertCircle, RefreshCw, MessageSquare, Loader2 } from 'lucide-react';
import { EmptyNotificationsIllustration } from '@/components/illustrations';
import { apiFetch } from '@/lib/api';
import type { ApiNotification } from '@/lib/types';

const notificationIcons: Record<ApiNotification['type'], React.ElementType> = {
  'spot-available': CheckCircle,
  reminder: Clock,
  confirmation: CheckCircle,
  update: RefreshCw,
  request: AlertCircle,
};

const notificationColors: Record<ApiNotification['type'], string> = {
  'spot-available': 'text-green-600 bg-green-100',
  reminder: 'text-blue-600 bg-blue-100',
  confirmation: 'text-green-600 bg-green-100',
  update: 'text-amber-600 bg-amber-100',
  request: 'text-red-600 bg-red-100',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch<{ notifications: ApiNotification[] }>('/api/notifications');
      setNotifications(data.notifications);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    try {
      await apiFetch(`/api/notifications/${id}`, { method: 'PATCH' });
    } catch {
      // revert on failure
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: false } : n));
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiFetch('/api/notifications', { method: 'PATCH' });
    } catch {
      void load();
    }
  };

  const smsPreview = notifications.slice(0, 2).map((n) => ({
    id: n.id,
    body: `Bizskip: ${n.message}`,
    timestamp: new Date(n.created_at).toLocaleString(),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <div className="py-8 md:py-12" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a5f 100%)' }}>
        <div className="container mx-auto px-4 max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/"><Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <Badge className="bg-white text-indigo-900">{unreadCount}</Badge>}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)' }}>Stay updated on your waitlists and bookings</p>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button size="sm" className="bg-white text-indigo-900 hover:bg-zinc-100" onClick={() => void markAllAsRead()}>Mark all read</Button>
            )}
          </div>
        </div>
      </div>
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-3xl">

          {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && <Badge variant="secondary" className="ml-1.5">{unreadCount}</Badge>}
                </TabsTrigger>
              </TabsList>

              {(['all', 'unread'] as const).map((tab) => {
                const items = tab === 'all' ? notifications : notifications.filter((n) => !n.read);
                return (
                  <TabsContent key={tab} value={tab}>
                    <Card><CardContent className="p-0">
                      <ScrollArea className="h-[500px]">
                        {items.length === 0 ? (
                          <div className="py-12 text-center px-4">
                            {tab === 'unread' ? (
                              <>
                                <div className="max-w-[160px] mx-auto mb-2">
                                  <EmptyNotificationsIllustration />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                                <p className="text-muted-foreground">No unread notifications right now</p>
                              </>
                            ) : (
                              <>
                                <div className="max-w-[160px] mx-auto mb-2">
                                  <EmptyNotificationsIllustration />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                  When you join waitlists or get spot updates, notifications will appear here
                                </p>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="divide-y">
                            {items.map((n) => (
                              <NotificationItem key={n.id} notification={n} onMarkRead={() => void markAsRead(n.id)} />
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent></Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> SMS Notifications Preview
              </CardTitle>
              <CardDescription>This is how notifications will appear when Twilio is connected</CardDescription>
            </CardHeader>
            <CardContent>
              {smsPreview.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="font-medium text-foreground">No SMS preview available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Once notification events are available, SMS previews will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {smsPreview.map((msg) => (
                    <div key={msg.id} className="max-w-xs">
                      <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-bl-md text-sm">{msg.body}</div>
                      <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-6 text-center">SMS notifications require Twilio integration (coming soon)</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function NotificationItem({ notification, onMarkRead }: { notification: ApiNotification; onMarkRead: () => void }) {
  const Icon = notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];

  return (
    <div
      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
      onClick={onMarkRead}
    >
      <div className="flex gap-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</h4>
            {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">{new Date(notification.created_at).toLocaleString()}</p>
        </div>
      </div>
      {notification.action_url && (
        <div className="mt-3 ml-14">
          <Link href={notification.action_url}>
            <Button size="sm" variant="outline">View Details</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
