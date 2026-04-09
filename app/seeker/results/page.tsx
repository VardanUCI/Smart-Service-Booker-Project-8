'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProviderCard } from '@/components/seeker/provider-card';
import { ProviderDetailSheet } from '@/components/seeker/provider-detail-sheet';
import { JoinWaitlistDialog } from '@/components/seeker/join-waitlist-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { mockProviders, Provider } from '@/lib/mock-data';

export default function ResultsPage() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
  const [sortBy, setSortBy] = useState('distance');
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDetailOpen(true);
  };

  const handleToggleSelect = (provider: Provider) => {
    setSelectedProviders((prev) =>
      prev.find((p) => p.id === provider.id)
        ? prev.filter((p) => p.id !== provider.id)
        : [...prev, provider]
    );
  };

  const handleJoinWaitlist = (provider: Provider) => {
    if (!selectedProviders.find((p) => p.id === provider.id)) {
      setSelectedProviders([...selectedProviders, provider]);
    }
    setIsJoinDialogOpen(true);
    setIsDetailOpen(false);
  };

  const filteredProviders = mockProviders.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-6 md:py-8">
        <div className="container mx-auto px-4">
          
          <div className="flex items-center gap-4 mb-6">
            <Link href="/seeker/search">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Available Providers</h1>
              <p className="text-sm text-muted-foreground">{sortedProviders.length} providers found</p>
            </div>
          </div>

          
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="availability">Soonest Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          
          {selectedProviders.length > 0 && (
            <div className="flex items-center justify-between p-4 mb-6 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  {selectedProviders.length}
                </Badge>
                <span className="text-sm font-medium text-foreground">
                  {selectedProviders.length === 1 ? 'provider selected' : 'providers selected'}
                </span>
              </div>
              <Button onClick={() => setIsJoinDialogOpen(true)}>
                Join Waitlists
              </Button>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-4">
              {sortedProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isSelected={!!selectedProviders.find((p) => p.id === provider.id)}
                  onView={() => handleViewProvider(provider)}
                  onToggleSelect={() => handleToggleSelect(provider)}
                  onJoin={() => handleJoinWaitlist(provider)}
                />
              ))}

              {sortedProviders.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No providers found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            
            <div className="hidden lg:block">
              <div className="sticky top-24 h-[500px] bg-muted rounded-xl border border-border flex items-center justify-center">
                <div className="text-center p-6">
                  <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Map view coming soon
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Google Maps integration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      
      <ProviderDetailSheet
        provider={selectedProvider}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onJoinWaitlist={handleJoinWaitlist}
      />

      
      <JoinWaitlistDialog
        providers={selectedProviders}
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        onRemoveProvider={(id) => setSelectedProviders((prev) => prev.filter((p) => p.id !== id))}
      />
    </div>
  );
}
