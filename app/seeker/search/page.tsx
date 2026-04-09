'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, MapPin, Clock, Home, Filter } from 'lucide-react';
import { categories, urgencyLevels, serviceTypes, CategoryId } from '@/lib/mock-data';

export default function SearchPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | ''>('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('today');
  const [atMyLocation, setAtMyLocation] = useState(false);
  const [service, setService] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (location) params.set('location', location);
    if (urgency) params.set('urgency', urgency);
    if (atMyLocation) params.set('mobile', 'true');
    router.push(`/seeker/results?${params.toString()}`);
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
              <form onSubmit={handleSearch} className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="category">Service Category</Label>
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryId)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                
                {selectedCategory && (
                  <div className="space-y-2">
                    <Label htmlFor="service">Specific Service (optional)</Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Any service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any service</SelectItem>
                        {serviceTypes[selectedCategory]?.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                
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

                
                <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="at-location" className="font-medium">Mobile service at my location</Label>
                      <p className="text-sm text-muted-foreground">For plumbers, electricians, etc.</p>
                    </div>
                  </div>
                  <Switch
                    id="at-location"
                    checked={atMyLocation}
                    onCheckedChange={setAtMyLocation}
                  />
                </div>

                
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    When do you need this?
                  </Label>
                  <RadioGroup value={urgency} onValueChange={setUrgency} className="grid grid-cols-2 gap-3">
                    {urgencyLevels.map((level) => (
                      <label
                        key={level.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          urgency === level.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <RadioGroupItem value={level.id} id={level.id} />
                        <div>
                          <span className="font-medium text-foreground">{level.label}</span>
                          <p className="text-xs text-muted-foreground">{level.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                
                <Button type="submit" size="lg" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search Providers
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
