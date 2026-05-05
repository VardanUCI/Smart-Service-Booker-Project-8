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
import { apiFetch } from '@/lib/api';
import type { ProviderResult } from '@/lib/types';
import { formatDistance } from '@/lib/types';

function ResultsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const location = searchParams.get('location') ?? '';
  const urgency = searchParams.get('urgency') ?? 'flexible';

  const [providers, setProviders] = useState<ProviderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedProviders, setSelectedProviders] = useState<ProviderResult[]>([]);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  useEffect(() => {
    void fetchProviders();
  }, [category, location]);

  async function fetchProviders() {
    setLoading(true);
    setError(null);
    try {
      let lat: number, lng: number;

      if (location) {
        const geo = await apiFetch<{ lat: number; lng: number }>('/api/geocode', {
          method: 'POST',
          body: JSON.stringify({ location }),
        });
        lat = geo.lat;
        lng = geo.lng;
      } else {
        // Fall back to browser geolocation
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
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/seeker/search">
              <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Available Providers</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Searching…' : `${sorted.length} provider${sorted.length !== 1 ? 's' : ''} found`}
                {location && ` near "${location}"`}
              </p>
            </div>
          </div>

          {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search providers…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Nearest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedProviders.length > 0 && (
            <div className="flex items-center justify-between p-4 mb-6 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">{selectedProviders.length}</Badge>
                <span className="text-sm font-medium text-foreground">
                  {selectedProviders.length === 1 ? 'provider selected' : 'providers selected'}
                </span>
              </div>
              <Button onClick={() => setIsJoinDialogOpen(true)}>Join Waitlists</Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No providers found</h3>
              <p className="text-muted-foreground">Try adjusting your search or location</p>
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
