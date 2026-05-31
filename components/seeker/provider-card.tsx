'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, CheckCircle2, Star, Users, Phone } from 'lucide-react';
import type { ProviderResult } from '@/lib/types';

interface ProviderCardProps {
  provider: ProviderResult;
  distanceLabel: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onJoin: () => void;
}

export function ProviderCard({ provider, distanceLabel, isSelected, onToggleSelect, onJoin }: ProviderCardProps) {
  // Helper to render 5 gold stars based on the rating value
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        // Full star
        stars.push(
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
        );
      } else if (rating > i - 1) {
        // Partial/Fractional star with overflow container to clip filled star
        const fillPercentage = (rating - (i - 1)) * 100;
        stars.push(
          <div key={i} className="relative h-4 w-4 shrink-0">
            {/* Base empty star */}
            <Star className="absolute inset-0 h-4 w-4 text-slate-300 dark:text-slate-700 fill-transparent" />
            {/* Clipped filled star */}
            <div 
              className="absolute inset-0 overflow-hidden" 
              style={{ width: `${fillPercentage}%` }}
            >
              <Star className="h-4 w-4 text-amber-400 fill-amber-400 max-w-none" style={{ width: '16px', minWidth: '16px' }} />
            </div>
          </div>
        );
      } else {
        // Empty star
        stars.push(
          <Star key={i} className="h-4 w-4 text-slate-300 dark:text-slate-700 fill-transparent shrink-0" />
        );
      }
    }
    return <div className="flex items-center gap-0.5" title={`${rating.toFixed(1)} out of 5 stars`}>{stars}</div>;
  };

  return (
    <Card className={`transition-all duration-200 bg-white dark:bg-slate-900 border overflow-hidden ${
      isSelected 
        ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-sm' 
        : 'border-slate-200/80 dark:border-slate-800/80 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/60'
    }`}>
      <CardContent className="p-5">
        <div className="flex gap-4 items-start">
          <div className="pt-1.5 shrink-0">
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={onToggleSelect} 
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-600" 
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap mb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-sm">
                  {provider.business_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-snug truncate">{provider.business_name}</h3>
                  
                  {/* Rating Stars row */}
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {provider.rating !== undefined && provider.rating !== null ? (
                      <>
                        {renderStars(provider.rating)}
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{provider.rating.toFixed(1)}</span>
                        {provider.review_count !== undefined && provider.review_count > 0 && (
                          <span className="text-xs text-muted-foreground font-normal">({provider.review_count} reviews)</span>
                        )}
                      </>
                    ) : (
                      <>
                        {renderStars(0)}
                        <span className="text-xs text-muted-foreground font-medium">No reviews</span>
                      </>
                    )}
                  </div>

                  {/* Address & Phone details */}
                  {(provider.address || provider.phone) && (
                    <div className="mt-2 space-y-1">
                      {provider.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{provider.address}</span>
                        </p>
                      )}
                      {provider.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{provider.phone}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 rounded-full shrink-0 flex items-center gap-1" variant="outline">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Waitlist Open
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-5 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex-wrap">
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/40 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-slate-800/40">
                  <Users className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {provider.waitlist_count ?? 0} {provider.waitlist_count === 1 ? 'person' : 'people'} ahead
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {distanceLabel}
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={onJoin} 
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 rounded-lg cursor-pointer shrink-0"
              >
                <CheckCircle2 className="h-4 w-4 mr-1 shrink-0" /> Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
