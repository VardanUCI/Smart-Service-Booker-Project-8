'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Building2, MapPin, Clock, Upload, CheckCircle, Loader2, Navigation } from 'lucide-react';
import { categories, serviceTypes, CategoryId } from '@/lib/constants';
import { apiFetch } from '@/lib/api';

const steps = [
  { id: 1, title: 'Business Info' },
  { id: 2, title: 'Services' },
  { id: 3, title: 'Location' },
  { id: 4, title: 'Hours & Contact' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '' as CategoryId | '',
    services: [] as string[],
    address: '',
    city: '',
    zipCode: '',
    isMobile: false,
    serviceRadius: '10',
    phone: '',
    email: '',
    hours: '',
    acceptsSms: true,
    acceptsEmail: true,
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const progress = (currentStep / steps.length) * 100;

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoStatus('Detecting your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setGeoStatus(`Location detected (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setGeoLoading(false);
      },
      () => {
        setGeoStatus('Could not detect location. Please enter coordinates manually.');
        setGeoLoading(false);
      }
    );
  };

  const handleNext = async () => {
    setError('');

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setIsSaving(true);

    try {
      const fullAddress = formData.isMobile
        ? formData.city || formData.zipCode || 'Mobile service'
        : [formData.address, formData.city, formData.zipCode].filter(Boolean).join(', ');

      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: formData.businessName,
          category: formData.category,
          address: fullAddress,
          phone: formData.phone,
          latitude: 0,
          longitude: 0,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok && response.status !== 409) {
        setError(payload.error ?? 'Unable to complete onboarding. Please check your details.');
        return;
      }

      router.push('/provider/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 mb-4">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">List Your Business</h1>
            <p className="text-muted-foreground">Set up your profile and start receiving customers</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <div key={step.id} className={`text-sm font-medium ${step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.title}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Tell us about your business'}
                {currentStep === 2 && 'What services do you offer?'}
                {currentStep === 3 && 'Where are you located?'}
                {currentStep === 4 && 'Set your hours and contact preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" placeholder="e.g., Happy Paws Veterinary Clinic"
                      value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Business Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as CategoryId, services: [] })}>
                      <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea id="description" placeholder="Describe your business and what makes it special..."
                      value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Logo (optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  {formData.category ? (
                    <div className="space-y-4">
                      <Label>Select the services you offer</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(serviceTypes as Record<string, string[]>)[formData.category]?.map((service) => (
                          <label key={service} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${formData.services.includes(service) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                            <Checkbox checked={formData.services.includes(service)} onCheckedChange={() => handleServiceToggle(service)} />
                            <span className="text-sm font-medium">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">Please select a category first</div>
                  )}
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="mobile-service" className="font-medium">Mobile Service Provider</Label>
                        <p className="text-sm text-muted-foreground">I travel to customers</p>
                      </div>
                    </div>
                    <Switch id="mobile-service" checked={formData.isMobile}
                      onCheckedChange={(checked) => setFormData({ ...formData, isMobile: checked })} />
                  </div>

                  {!formData.isMobile && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input id="address" placeholder="123 Main Street, Suite 100"
                          value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" placeholder="San Francisco" value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input id="zipCode" placeholder="94105" value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.isMobile && (
                    <div className="space-y-2">
                      <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                      <Select value={formData.serviceRadius} onValueChange={(v) => setFormData({ ...formData, serviceRadius: v })}>
                        <SelectTrigger id="serviceRadius"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['5', '10', '15', '25', '50'].map((v) => <SelectItem key={v} value={v}>{v} miles</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button type="button" variant="outline" className="gap-2 w-full" onClick={detectLocation} disabled={geoLoading}>
                      {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                      Detect My Location
                    </Button>
                    {geoStatus && <p className={`text-xs mt-2 ${formData.latitude ? 'text-green-600' : 'text-muted-foreground'}`}>{geoStatus}</p>}
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Business Phone</Label>
                    <Input id="phone" type="tel" placeholder="(555) 123-4567"
                      value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input id="email" type="email" placeholder="contact@yourbusiness.com"
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours" className="flex items-center gap-2"><Clock className="h-4 w-4" /> Business Hours</Label>
                    <Input id="hours" placeholder="e.g., Mon-Fri 9am-5pm, Sat 10am-3pm"
                      value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <Label>Notification Preferences</Label>
                    <div className="space-y-3">
                      {[
                        { key: 'acceptsSms', label: 'SMS Notifications', desc: 'Get text alerts for new requests' },
                        { key: 'acceptsEmail', label: 'Email Notifications', desc: 'Get email alerts and summaries' },
                      ].map(({ key, label, desc }) => (
                        <label key={key} className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer">
                          <Checkbox checked={formData[key as 'acceptsSms' | 'acceptsEmail']}
                            onCheckedChange={(v) => setFormData({ ...formData, [key]: v as boolean })} />
                          <div><span className="font-medium">{label}</span><p className="text-sm text-muted-foreground">{desc}</p></div>
                        </label>
                      ))}
                    </div>
                  </div>
                  {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                </>
              )}

              <div className="flex justify-between pt-6 border-t">
                <Button variant="ghost" onClick={() => setCurrentStep((p) => p - 1)} disabled={currentStep === 1 || isSaving} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex flex-col items-end gap-2">
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  <Button onClick={handleNext} className="gap-2" disabled={isSaving}>
                  {currentStep === steps.length ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Complete Setup'}
                    </>
                  ) : (
                    <>Continue <ArrowRight className="h-4 w-4" /></>
                  )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/provider/dashboard" className="text-primary hover:underline">Sign in to your dashboard</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
