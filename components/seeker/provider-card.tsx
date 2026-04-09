'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, MapPin, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { Provider } from '@/lib/mock-data';

interface ProviderCardProps {
  provider: Provider;
  isSelected: boolean;
  onView: () => void;
  onToggleSelect: () => void;
  onJoin: () => void;
}

const statusConfig = {
  'available-now': {
    label: 'Available Now',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  'waitlist-open': {
    label: 'Waitlist Open',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  'next-slot-tomorrow': {
    label: 'Next: Tomorrow',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  'fully-booked': {
    label: 'Fully Booked',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

export function ProviderCard({
  provider,
  isSelected,
  onView,
  onToggleSelect,
  onJoin,
}: ProviderCardProps) {
  const status = statusConfig[provider.status];

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/30'}`}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              className="h-5 w-5"
            />
          </div>

          
          <div className="flex-1 min-w-0">
            
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{provider.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {provider.rating} ({provider.reviewCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {provider.distance}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>

            
            <p className="text-sm text-muted-foreground mb-3">
              {provider.services.slice(0, 3).join(' · ')}
              {provider.services.length > 3 && ` +${provider.services.length - 3} more`}
            </p>

            
            <div className="flex flex-wrap gap-2 mb-4">
              {provider.isMobile && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Truck className="h-3 w-3" />
                  Mobile Service
                </Badge>
              )}
              {provider.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{provider.nextAvailable}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onView}>
                  View Details
                </Button>
                <Button size="sm" onClick={onJoin} className="gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
