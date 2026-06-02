'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProviderCard } from '@/components/seeker/provider-card';
import { JoinWaitlistDialog } from '@/components/seeker/join-waitlist-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';
import { NoResultsIllustration } from '@/components/illustrations';
import { apiFetch } from '@/lib/api';
import type { ProviderResult } from '@/lib/types';
import { formatDistance } from '@/lib/types';

function ResultsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const location = searchParams.get('location') ?? '';
  const urgency = searchParams.get('urgency') ?? 'flexible';
  const paramLat = searchParams.get('lat');
  const paramLng = searchParams.get('lng');

  const [providers, setProviders] = useState<ProviderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedProviders, setSelectedProviders] = useState<ProviderResult[]>([]);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  useEffect(() => {
    void fetchProviders();
  }, [category, location, paramLat, paramLng]);

  async function fetchProviders() {
    setLoading(true);
    setError(null);
    try {
      let lat: number, lng: number;

      if (paramLat && paramLng) {
        // GPS coords passed directly from search page — no geocode round-trip needed.
        lat = parseFloat(paramLat);
        lng = parseFloat(paramLng);
      } else if (location) {
        const geo = await apiFetch<{ lat: number; lng: number }>('/api/geocode', {
          method: 'POST',
          body: JSON.stringify({ location }),
        });
        lat = geo.lat;
        lng = geo.lng;
      } else {
        // Fall back to browser geolocation
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser. Enter a ZIP or city on the search page.');
        }
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      const data = await apiFetch<{ providers: ProviderResult[] }>(
        `/api/search?lat=${lat}&lon=${lng}&radius=5000${category ? `&category=${encodeURIComponent(category)}` : ''}`
      );
      setProviders(data.providers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }

  const filtered = providers.filter((p) =>
    p.business_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'distance') return a.dist_meters - b.dist_meters;
    return 0;
  });

  const handleToggleSelect = (provider: ProviderResult) => {
    setSelectedProviders((prev) =>
      prev.find((p) => p.id === provider.id)
        ? prev.filter((p) => p.id !== provider.id)
        : [...prev, provider]
    );
  };

  const handleJoinWaitlist = (provider: ProviderResult) => {
    if (!selectedProviders.find((p) => p.id === provider.id)) {
      setSelectedProviders((prev) => [...prev, provider]);
    }
    setIsJoinDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
      <Navbar />
      
      {/* Immersive Header Banner */}
      <div className="relative py-12 md:py-16 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl bg-indigo-500 animate-pulse" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="container mx-auto px-4 relative z-10 flex items-center gap-4">
          <Link href="/seeker/search">
            <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/10 hover:text-white rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Available Providers</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {loading ? 'Searching nearby…' : `${sorted.length} provider${sorted.length !== 1 ? 's' : ''} found`}
              {location && ` near "${location}"`}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          {/* Search/Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search providers by name…" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 h-11 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-indigo-500" 
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 border-slate-200 dark:border-slate-800 rounded-xl">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Nearest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedProviders.length > 0 && (
            <div className="flex items-center justify-between p-4 mb-6 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/60 rounded-xl animate-fade-in shadow-sm">
              <div className="flex items-center gap-3">
                <Badge className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">{selectedProviders.length}</Badge>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selectedProviders.length === 1 ? 'Provider selected' : 'Providers selected'} to join in bulk
                </span>
              </div>
              <Button 
                onClick={() => setIsJoinDialogOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold hover:-translate-y-0.5 transition-all duration-200 rounded-lg cursor-pointer text-xs"
              >
                Join Selected Waitlists
              </Button>
            </div>
          )}

          {/* Search Results Listing */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-sm">
              <div className="max-w-[180px] mx-auto mb-4">
                <NoResultsIllustration />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No providers found nearby</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Try expanding your search area or choosing a different category
              </p>
              <Link href="/seeker/search">
                <Button variant="outline" className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                  <Search className="h-4 w-4" /> New Search
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  distanceLabel={formatDistance(provider.dist_meters)}
                  isSelected={!!selectedProviders.find((p) => p.id === provider.id)}
                  onToggleSelect={() => handleToggleSelect(provider)}
                  onJoin={() => handleJoinWaitlist(provider)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <JoinWaitlistDialog
        providers={selectedProviders}
        category={category}
        urgency={urgency}
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        onRemoveProvider={(id) => setSelectedProviders((prev) => prev.filter((p) => p.id !== id))}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
