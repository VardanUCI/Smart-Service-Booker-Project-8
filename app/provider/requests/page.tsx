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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, MessageSquare, Mail, Clock, CheckCircle, XCircle, Bell, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { ProviderRequest } from '@/lib/types';

const urgencyConfig: Record<string, { label: string; className: string; priority: number }> = {
  now:       { label: 'Urgent',    className: 'bg-red-100 text-red-700',    priority: 1 },
  today:     { label: 'Today',     className: 'bg-amber-100 text-amber-700', priority: 2 },
  'this-week':{ label: 'This Week', className: 'bg-blue-100 text-blue-700',  priority: 3 },
  flexible:  { label: 'Flexible',  className: 'bg-gray-100 text-gray-600',  priority: 4 },
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ProviderRequest | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'notify' | 'dismiss'>('accept');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<{ requests: ProviderRequest[] }>('/api/providers/requests');
        setRequests(data.requests);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const sortedRequests = [...requests].sort(
    (a, b) => (urgencyConfig[a.urgency]?.priority ?? 5) - (urgencyConfig[b.urgency]?.priority ?? 5)
  );

  const handleAction = (request: ProviderRequest, action: 'accept' | 'notify' | 'dismiss') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionError(null);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;
    setSubmitting(true);
    setActionError(null);
    try {
      if (actionType === 'accept') {
        await apiFetch('/api/bookings', {
          method: 'POST',
          body: JSON.stringify({ waitlist_id: selectedRequest.id }),
        });
        setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      } else if (actionType === 'notify') {
        await apiFetch(`/api/waitlist/${selectedRequest.id}/notify`, { method: 'PATCH' });
        setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      } else if (actionType === 'dismiss') {
        await apiFetch(`/api/waitlist/${selectedRequest.id}`, { method: 'DELETE' });
        setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      }
      setActionDialogOpen(false);
      setSelectedRequest(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/provider/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Incoming Requests</h1>
              <p className="text-muted-foreground">{requests.length} people waiting for your services</p>
            </div>
          </div>

          {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">
                  All Requests <Badge variant="secondary" className="ml-2">{requests.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="urgent">
                  Urgent <Badge className="ml-2 bg-red-100 text-red-700">{requests.filter((r) => r.urgency === 'now').length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {sortedRequests.length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No pending requests</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">When customers join your waitlist, their requests will show up here for you to manage.</p>
                  </CardContent></Card>
                ) : sortedRequests.map((r) => (
                  <RequestCard key={r.id} request={r} onAction={handleAction} />
                ))}
              </TabsContent>

              <TabsContent value="urgent" className="space-y-4">
                {sortedRequests.filter((r) => r.urgency === 'now').length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No urgent requests</h3>
                    <p className="text-muted-foreground">All clear — no one needs you urgently right now</p>
                  </CardContent></Card>
                ) : sortedRequests.filter((r) => r.urgency === 'now').map((r) => (
                  <RequestCard key={r.id} request={r} onAction={handleAction} />
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' && 'Accept Request'}
              {actionType === 'notify' && 'Send Notification'}
              {actionType === 'dismiss' && 'Dismiss Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' && `Confirm ${selectedRequest?.customer_name}'s booking for ${selectedRequest?.service ?? selectedRequest?.category}`}
              {actionType === 'notify' && `Send a notification to ${selectedRequest?.customer_name} about their position`}
              {actionType === 'dismiss' && `Remove ${selectedRequest?.customer_name} from your waitlist`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedRequest.customer_name}</span>
                  <Badge className={urgencyConfig[selectedRequest.urgency]?.className ?? ''}>
                    {urgencyConfig[selectedRequest.urgency]?.label ?? selectedRequest.urgency}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedRequest.service ?? selectedRequest.category}</p>
              </div>
              {actionError && <p className="text-sm text-destructive mt-2">{actionError}</p>}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              onClick={() => void confirmAction()}
              disabled={submitting}
              className={actionType === 'dismiss' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  {actionType === 'accept' && 'Confirm Booking'}
                  {actionType === 'notify' && 'Send Notification'}
                  {actionType === 'dismiss' && 'Dismiss'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestCard({ request, onAction }: { request: ProviderRequest; onAction: (r: ProviderRequest, a: 'accept' | 'notify' | 'dismiss') => void }) {
  const urgency = urgencyConfig[request.urgency] ?? { label: request.urgency, className: 'bg-gray-100 text-gray-600' };

  return (
    <Card className={request.urgency === 'now' ? 'border-red-200 bg-red-50/30' : ''}>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {request.customer_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-foreground">{request.customer_name}</h3>
                <Badge className={urgency.className}>{urgency.label}</Badge>
                {request.contact_method === 'sms' && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="h-3 w-3" /> SMS</span>
                )}
                {request.contact_method === 'email' && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> Email</span>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{request.service ?? request.category}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {new Date(request.requested_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 md:flex-col lg:flex-row">
            <Button size="sm" onClick={() => onAction(request, 'accept')} className="gap-1">
              <CheckCircle className="h-4 w-4" /> Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction(request, 'notify')} className="gap-1">
              <Bell className="h-4 w-4" /> Notify
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onAction(request, 'dismiss')} className="gap-1 text-muted-foreground">
              <XCircle className="h-4 w-4" /> Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
