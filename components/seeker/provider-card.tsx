'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, CheckCircle2, Star, Users } from 'lucide-react';
import type { ProviderResult } from '@/lib/types';

interface ProviderCardProps {
  provider: ProviderResult;
  distanceLabel: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onJoin: () => void;
}

export function ProviderCard({ provider, distanceLabel, isSelected, onToggleSelect, onJoin }: ProviderCardProps) {
  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/30'}`}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="pt-1">
            <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{provider.business_name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {distanceLabel}
                  </span>
                  {provider.rating !== undefined && provider.rating !== null && (
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {provider.rating.toFixed(1)}
                      {provider.review_count !== undefined && provider.review_count > 0 && (
                        <span className="text-muted-foreground font-normal text-xs">({provider.review_count} reviews)</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200" variant="outline">
                Waitlist Open
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary/70" />
                <span>
                  {provider.waitlist_count ?? 0} {provider.waitlist_count === 1 ? 'person' : 'people'} waiting
                </span>
              </div>
              <Button size="sm" onClick={onJoin} className="gap-1">
                <CheckCircle2 className="h-4 w-4" /> Join
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
