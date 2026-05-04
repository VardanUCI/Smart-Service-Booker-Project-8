'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Clock, Home, Filter } from 'lucide-react';
import { categories, urgencyLevels, serviceTypes, CategoryId } from '@/lib/mock-data';

const fallbackUrgencyLevels = [
  { id: 'now', label: 'Right now', description: 'Join the first available opening' },
  { id: 'today', label: 'Today', description: 'Looking for something later today' },
  { id: 'this-week', label: 'This week', description: 'Flexible within the next few days' },
  { id: 'flexible', label: 'Flexible', description: 'Just let me know when something opens' },
];

const fallbackServiceTypes: Record<string, string[]> = {
  'pet-care': ['Veterinary visit', 'Grooming', 'Pet boarding', 'Pet sitting'],
  medical: ['Primary care', 'Urgent care', 'Dental visit', 'Physical therapy'],
  'home-services': ['Plumbing', 'Electrical', 'Cleaning', 'Handyman'],
  education: ['Tutoring', 'Coaching', 'Music lesson', 'Test prep'],
};

export default function SearchPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | ''>('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('today');
  const [atMyLocation, setAtMyLocation] = useState(false);
  const [service, setService] = useState('any');

  const effectiveUrgencyLevels = urgencyLevels.length > 0 ? urgencyLevels : fallbackUrgencyLevels;
  const effectiveServices =
    selectedCategory && Array.isArray((serviceTypes as Record<string, string[]>)[selectedCategory])
      ? (serviceTypes as Record<string, string[]>)[selectedCategory]
      : selectedCategory
        ? fallbackServiceTypes[selectedCategory] ?? []
        : [];

  const buildNextPath = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (location) params.set('location', location);
    if (service && service !== 'any') params.set('service', service);
    if (urgency) params.set('urgency', urgency);
    if (atMyLocation) params.set('mobile', 'true');
    return `/seeker/results?${params.toString()}`;
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextPath = buildNextPath();
    window.location.href = `/signin?next=${encodeURIComponent(nextPath)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Find a Service
            </h1>
            <p className="text-muted-foreground">
              Search for local providers and join their waitlist
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5 text-primary" />
                Search Filters
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
                  <Label htmlFor="location">Your Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Enter ZIP code or city"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
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
                    {effectiveUrgencyLevels.map((level) => (
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
                  className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search Providers
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
