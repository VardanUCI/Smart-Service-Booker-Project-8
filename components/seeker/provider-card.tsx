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
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{provider.business_name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {distanceLabel}
                  </span>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200" variant="outline">
                Waitlist Open
              </Badge>
            </div>

            <div className="flex items-center justify-end mt-4">
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
