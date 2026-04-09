'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Phone, Clock, Shield, CheckCircle2, Truck } from 'lucide-react';
import { Provider } from '@/lib/mock-data';

interface ProviderDetailSheetProps {
  provider: Provider | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinWaitlist: (provider: Provider) => void;
}

const statusConfig = {
  'available-now': {
    label: 'Available Now',
    className: 'bg-green-100 text-green-700',
  },
  'waitlist-open': {
    label: 'Waitlist Open',
    className: 'bg-blue-100 text-blue-700',
  },
  'next-slot-tomorrow': {
    label: 'Next: Tomorrow',
    className: 'bg-amber-100 text-amber-700',
  },
  'fully-booked': {
    label: 'Fully Booked',
    className: 'bg-gray-100 text-gray-600',
  },
};

export function ProviderDetailSheet({
  provider,
  isOpen,
  onClose,
  onJoinWaitlist,
}: ProviderDetailSheetProps) {
  if (!provider) return null;

  const status = statusConfig[provider.status];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{provider.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          
          <div className="flex items-center gap-3">
            <Badge className={status.className}>{status.label}</Badge>
            <span className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {provider.rating} ({provider.reviewCount} reviews)
            </span>
          </div>

          
          <p className="text-muted-foreground">{provider.description}</p>

          <Separator />

          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Contact & Location</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{provider.address}</span>
                {provider.isMobile && (
                  <Badge variant="secondary" className="ml-auto gap-1 text-xs">
                    <Truck className="h-3 w-3" />
                    Mobile
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{provider.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{provider.hours}</span>
              </div>
            </div>
          </div>

          <Separator />

          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Services Offered</h4>
            <div className="flex flex-wrap gap-2">
              {provider.services.map((service) => (
                <Badge key={service} variant="outline">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Trust Indicators
            </h4>
            <div className="flex flex-wrap gap-2">
              {provider.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Next Availability</h4>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next open slot:</span>
                <span className="font-semibold text-foreground">{provider.nextAvailable}</span>
              </div>
            </div>
          </div>

          
          <div className="pt-4">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => onJoinWaitlist(provider)}
              disabled={provider.status === 'fully-booked'}
            >
              <CheckCircle2 className="h-5 w-5" />
              Join Waitlist
            </Button>
            {provider.status === 'fully-booked' && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                This provider is currently fully booked
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
