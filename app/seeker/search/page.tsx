'use client';

import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Search, MapPin, Clock, Home, LocateFixed, Loader2, Check } from 'lucide-react';
import { categories, urgencyLevels, serviceTypes, CategoryId } from '@/lib/constants';

export default function SearchPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | ''>('pet-care');
  const [location, setLocation] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const locatingRef = useRef(false);
  const [urgency, setUrgency] = useState('today');
  const [atMyLocation, setAtMyLocation] = useState(false);
  const [service, setService] = useState('any');

  const effectiveServices = selectedCategory ? (serviceTypes[selectedCategory] ?? []) : [];

  const handleUseMyLocation = () => {
    if (locatingRef.current) return;
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }
    locatingRef.current = true;
    setLocating(true);
    setLocateError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });
          const data = await res.json() as { zipOrCity?: string; error?: string };
          if (data.zipOrCity) {
            setLocation(data.zipOrCity);
            setGpsCoords({ lat: latitude, lng: longitude });
          } else {
            setLocateError('Could not determine your location. Enter it manually.');
          }
        } catch {
          setLocateError('Could not determine your location. Enter it manually.');
        } finally {
          locatingRef.current = false;
          setLocating(false);
        }
      },
      () => {
        locatingRef.current = false;
        setLocateError('Location access denied. Enter your ZIP or city manually.');
        setLocating(false);
      }
    );
  };

  const buildNextPath = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (gpsCoords) {
      params.set('lat', String(gpsCoords.lat));
      params.set('lng', String(gpsCoords.lng));
      if (location) params.set('location', location);
    } else if (location) {
      params.set('location', location);
    }
    if (service && service !== 'any') params.set('service', service);
    if (urgency) params.set('urgency', urgency);
    if (atMyLocation) params.set('mobile', 'true');
    return `/seeker/results?${params.toString()}`;
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextPath = buildNextPath();
    window.location.href = isSignedIn ? nextPath : `/signin?next=${encodeURIComponent(nextPath)}`;
  };

  useEffect(() => {
    let isMounted = true;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload: { user?: unknown }) => {
        if (isMounted) setIsSignedIn(Boolean(payload.user));
      })
      .catch(() => {
        if (isMounted) setIsSignedIn(false);
      })
      .finally(() => {
        if (isMounted) setIsAuthLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Header banner */}
          <div className="max-w-2xl mx-auto text-center mb-6">
            <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-md">
              <Image src="/search-illustration.jpg" alt="" fill className="object-cover object-center" quality={80} />
              <div className="absolute inset-0 bg-indigo-900/55 flex flex-col items-center justify-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow">Find a Service</h1>
                <p className="text-white/85 text-base">Search local providers and join their waitlist</p>
              </div>
            </div>
          </div>

          {/* Service category photo strip */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-4 gap-3">
              {[
                { src: '/cat-pet.jpg', label: 'Pet Care' },
                { src: '/cat-medical.jpg', label: 'Medical' },
                { src: '/cat-food.jpg', label: 'Dining' },
                { src: '/cat-home.jpg', label: 'Home' },
              ].map((cat) => {
                const map: Record<string, string> = { 'Pet Care': 'pet-care', Medical: 'medical', Dining: 'food-dining', Home: 'home-services' };
                const categoryId = map[cat.label] as CategoryId;
                const isSelected = selectedCategory === categoryId;

                return (
                  <div key={cat.label} className={`relative rounded-xl overflow-hidden h-20 shadow-sm cursor-pointer group ${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                    onClick={() => {
                      setSelectedCategory(categoryId);
                    }}>
                    <Image src={cat.src} alt={cat.label} fill className="object-cover transition-transform duration-200 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-indigo-900/45 group-hover:bg-indigo-900/30 transition-colors flex items-end justify-center pb-2">
                      <span className="text-white text-xs font-semibold drop-shadow">{cat.label}</span>
                    </div>
                    {isSelected ? (
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" />
                What are you looking for?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-6"
                onSubmit={handleSearch}
                action="/signin"
                method="get"
              >
                <div className="space-y-2">
                  <Label htmlFor="category">Service Category</Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(event) => {
                      setSelectedCategory(event.target.value as CategoryId | '');
                      setService('any');
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategory ? (
                  <div className="space-y-2">
                    <Label htmlFor="service">Specific Service (optional)</Label>
                    <select
                      id="service"
                      value={service}
                      onChange={(event) => setService(event.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="any">Any service</option>
                      {effectiveServices.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location">Your Location</Label>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={locating}
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
                    >
                      {locating
                        ? <><Loader2 className="h-3 w-3 animate-spin" /> Locating...</>
                        : <><LocateFixed className="h-3 w-3" /> Use my location</>
                      }
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Enter ZIP code or city"
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setGpsCoords(null); if (locateError) setLocateError(''); }}
                      className="pl-10"
                    />
                  </div>
                  {locateError && (
                    <p className="text-xs text-destructive">{locateError}</p>
                  )}
                </div>

                <label className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="block font-medium text-foreground">Mobile service at my location</span>
                      <span className="text-sm text-muted-foreground">For plumbers, electricians, etc.</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={atMyLocation}
                    onChange={(event) => setAtMyLocation(event.target.checked)}
                    className="h-5 w-5 accent-[var(--color-primary)]"
                  />
                </label>

                <fieldset className="space-y-3">
                  <legend className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    When do you need this?
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {urgencyLevels.map((level) => (
                      <label
                        key={level.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                          urgency === level.id
                            ? 'border-primary bg-primary/8 ring-1 ring-primary'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={level.id}
                          checked={urgency === level.id}
                          onChange={(event) => setUrgency(event.target.value)}
                          className="mt-1 accent-[var(--color-primary)]"
                        />
                        <span>
                          <span className="block font-medium text-foreground">{level.label}</span>
                          <span className="text-xs text-muted-foreground">{level.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <input
                  type="hidden"
                  name="next"
                  value="/seeker/results"
                />

                <button
                  type="submit"
                  disabled={!isAuthLoaded}
                  className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {isAuthLoaded ? 'Search Providers' : 'Checking account...'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
