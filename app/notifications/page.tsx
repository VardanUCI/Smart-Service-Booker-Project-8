'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { mockNotifications, Notification } from '@/lib/mock-data';

const notificationIcons = {
  'spot-available': CheckCircle,
  reminder: Clock,
  confirmation: CheckCircle,
  update: RefreshCw,
  request: AlertCircle,
};

const notificationColors = {
  'spot-available': 'text-green-600 bg-green-100',
  reminder: 'text-blue-600 bg-blue-100',
  confirmation: 'text-green-600 bg-green-100',
  update: 'text-amber-600 bg-amber-100',
  request: 'text-red-600 bg-red-100',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const smsPreviewMessages = notifications.slice(0, 2).map((notification) => ({
    id: notification.id,
    body: `Smart Service Booker: ${notification.message}`,
    timestamp: notification.timestamp,
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>
                  )}
                </h1>
                <p className="text-muted-foreground">Stay updated on your waitlists and bookings</p>
              </div>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1.5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
                        <p className="text-muted-foreground">You&apos;re all caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkRead={() => markAsRead(notification.id)}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unread">
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {notifications.filter((n) => !n.read).length === 0 ? (
                      <div className="py-12 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                        <p className="text-muted-foreground">No unread notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications
                          .filter((n) => !n.read)
                          .map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkRead={() => markAsRead(notification.id)}
                            />
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                SMS Notifications Preview
              </CardTitle>
              <CardDescription>
                This is how notifications will appear when Twilio is connected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {smsPreviewMessages.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="font-medium text-foreground">No SMS preview available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once notification events are available, SMS previews will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {smsPreviewMessages.map((message) => (
                    <div key={message.id} className="max-w-xs">
                      <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-bl-md text-sm">
                        {message.body}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{message.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-6 text-center">
                SMS notifications require Twilio integration (coming soon)
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: () => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];

  return (
    <div
      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
      onClick={onMarkRead}
    >
      <div className="flex gap-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
        </div>
      </div>
      {notification.actionUrl && (
        <div className="mt-3 ml-14">
          <Link href={notification.actionUrl}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
