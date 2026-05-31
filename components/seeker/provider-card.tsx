'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, CheckCircle2 } from 'lucide-react';
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
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {provider.business_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg leading-snug">{provider.business_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {distanceLabel}
                    </span>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                Open
              </Badge>
            </div>

            <div className="flex items-center justify-end">
              <Button size="sm" onClick={onJoin} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
