'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react';
import { mockSeekerRequests, SeekerRequest } from '@/lib/mock-data';

const urgencyConfig = {
  now: {
    label: 'Urgent',
    className: 'bg-red-100 text-red-700',
    priority: 1,
  },
  today: {
    label: 'Today',
    className: 'bg-amber-100 text-amber-700',
    priority: 2,
  },
  'this-week': {
    label: 'This Week',
    className: 'bg-blue-100 text-blue-700',
    priority: 3,
  },
  flexible: {
    label: 'Flexible',
    className: 'bg-gray-100 text-gray-600',
    priority: 4,
  },
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<SeekerRequest[]>(mockSeekerRequests);
  const [selectedRequest, setSelectedRequest] = useState<SeekerRequest | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'notify' | 'dismiss'>('accept');

  const pendingRequests = requests.filter((r) => true); // All are pending in mock
  const sortedRequests = [...pendingRequests].sort(
    (a, b) => urgencyConfig[a.urgency].priority - urgencyConfig[b.urgency].priority
  );

  const handleAction = (request: SeekerRequest, action: 'accept' | 'notify' | 'dismiss') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedRequest && actionType === 'dismiss') {
      setRequests(requests.filter((r) => r.id !== selectedRequest.id));
    }
    setActionDialogOpen(false);
    setSelectedRequest(null);
  };

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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Incoming Requests</h1>
              <p className="text-muted-foreground">{pendingRequests.length} people waiting for your services</p>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All Requests
                <Badge variant="secondary" className="ml-2">{pendingRequests.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="urgent">
                Urgent
                <Badge className="ml-2 bg-red-100 text-red-700">
                  {pendingRequests.filter((r) => r.urgency === 'now').length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {sortedRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">
                      New customer requests will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sortedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} onAction={handleAction} />
                ))
              )}
            </TabsContent>

            <TabsContent value="urgent" className="space-y-4">
              {sortedRequests.filter((r) => r.urgency === 'now').length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No urgent requests</h3>
                    <p className="text-muted-foreground">You&apos;re all caught up!</p>
                  </CardContent>
                </Card>
              ) : (
                sortedRequests
                  .filter((r) => r.urgency === 'now')
                  .map((request) => (
                    <RequestCard key={request.id} request={request} onAction={handleAction} />
                  ))
              )}
            </TabsContent>
          </Tabs>
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
              {actionType === 'accept' && `Confirm ${selectedRequest?.name}'s appointment for ${selectedRequest?.service}`}
              {actionType === 'notify' && `Send a notification to ${selectedRequest?.name} about their position`}
              {actionType === 'dismiss' && `Remove ${selectedRequest?.name} from your waitlist`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedRequest.name}</span>
                  <Badge className={urgencyConfig[selectedRequest.urgency].className}>
                    {urgencyConfig[selectedRequest.urgency].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedRequest.service}</p>
                {selectedRequest.notes && (
                  <p className="text-sm text-foreground italic">&quot;{selectedRequest.notes}&quot;</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={actionType === 'dismiss' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {actionType === 'accept' && 'Confirm Appointment'}
              {actionType === 'notify' && 'Send Notification'}
              {actionType === 'dismiss' && 'Dismiss'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RequestCardProps {
  request: SeekerRequest;
  onAction: (request: SeekerRequest, action: 'accept' | 'notify' | 'dismiss') => void;
}

function RequestCard({ request, onAction }: RequestCardProps) {
  const urgency = urgencyConfig[request.urgency];

  return (
    <Card className={request.urgency === 'now' ? 'border-red-200 bg-red-50/30' : ''}>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          
          <div className="flex items-start gap-4 flex-1">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {request.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-foreground">{request.name}</h3>
                <Badge className={urgency.className}>{urgency.label}</Badge>
                {request.contactMethod === 'sms' && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> SMS
                  </span>
                )}
                {request.contactMethod === 'email' && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{request.service}</p>
              {request.notes && (
                <p className="text-sm text-foreground mt-2 italic bg-muted/50 p-2 rounded">
                  &quot;{request.notes}&quot;
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {request.distance && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {request.distance}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {request.requestedAt}
                </span>
              </div>
            </div>
          </div>

          
          <div className="flex gap-2 md:flex-col lg:flex-row">
            <Button size="sm" onClick={() => onAction(request, 'accept')} className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction(request, 'notify')} className="gap-1">
              <Bell className="h-4 w-4" />
              Notify
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onAction(request, 'dismiss')} className="gap-1 text-muted-foreground">
              <XCircle className="h-4 w-4" />
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
