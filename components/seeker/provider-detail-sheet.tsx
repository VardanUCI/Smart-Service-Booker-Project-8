'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle2 } from 'lucide-react';
import type { ProviderResult } from '@/lib/types';
import { formatDistance } from '@/lib/types';

interface ProviderDetailSheetProps {
  provider: ProviderResult | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinWaitlist: (provider: ProviderResult) => void;
}

export function ProviderDetailSheet({ provider, isOpen, onClose, onJoinWaitlist }: ProviderDetailSheetProps) {
  if (!provider) return null;

  return (
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

          <p className="text-sm text-muted-foreground">
            This provider is currently accepting waitlist entries. Join now and you&apos;ll be notified when a spot opens.
          </p>

          <div className="pt-4">
            <Button size="lg" className="w-full gap-2" onClick={() => onJoinWaitlist(provider)}>
              <CheckCircle2 className="h-5 w-5" /> Join Waitlist
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
