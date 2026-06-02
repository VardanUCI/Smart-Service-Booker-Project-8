'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, MessageSquare, Mail, CheckCircle, Loader2 } from 'lucide-react';
import type { ProviderResult } from '@/lib/types';
import { apiFetch } from '@/lib/api';

interface JoinWaitlistDialogProps {
  providers: ProviderResult[];
  category: string;
  urgency: string;
  isOpen: boolean;
  onClose: () => void;
  onRemoveProvider: (id: string) => void;
}

export function JoinWaitlistDialog({
  providers, category, urgency, isOpen, onClose, onRemoveProvider,
}: JoinWaitlistDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<'review' | 'contact' | 'success'>('review');
  const [contactMethod, setContactMethod] = useState<'sms' | 'email'>('email');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const contactValue = contactMethod === 'sms' ? phone : email;
    if (!contactValue.trim()) {
      setSubmitError('Please enter your contact details.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await Promise.all(
        providers.map((p) =>
          apiFetch('/api/waitlist', {
            method: 'POST',
            body: JSON.stringify({
              provider_id: p.id,
              category: category || 'general',
              urgency: urgency || 'flexible',
              contact_method: contactMethod,
              contact_value: contactValue,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              business_name: p.business_name,
              address: p.address,
              phone: p.phone,
              latitude: p.latitude,
              longitude: p.longitude,
            }),
          })
        )
      );
      setStep('success');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to join waitlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('review');
    setSubmitError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle>Join Waitlists</DialogTitle>
              <DialogDescription>Review the providers you want to join.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {providers.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No providers selected.</p>
              ) : providers.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">{p.business_name}</p>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveProvider(p.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => setStep('contact')} disabled={providers.length === 0}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 'contact' && (
          <>
            <DialogHeader>
              <DialogTitle>Contact Preferences</DialogTitle>
              <DialogDescription>How would you like to be notified when a spot opens?</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <RadioGroup value={contactMethod} onValueChange={(v) => setContactMethod(v as 'sms' | 'email')}>
                {([
                  { value: 'sms', icon: MessageSquare, label: 'SMS (Recommended)', desc: 'Get instant text alerts' },
                  { value: 'email', icon: Mail, label: 'Email', desc: 'Get email notifications' },
                ] as const).map(({ value, icon: Icon, label, desc }) => (
                  <label key={value} className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${contactMethod === value ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value={value} id={value} />
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-foreground">{label}</span>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {contactMethod === 'sms' && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              )}
              {contactMethod === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email Address</Label>
                  <Input id="contact-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              )}
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('review')}>Back</Button>
              <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Joining…</> : `Join ${providers.length} Waitlist${providers.length > 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="mb-2">You&apos;re on the list!</DialogTitle>
              <DialogDescription className="mb-6">
                You&apos;ve joined {providers.length} waitlist{providers.length > 1 ? 's' : ''}. We&apos;ll notify you when a spot opens.
              </DialogDescription>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {providers.map((p) => <Badge key={p.id} variant="secondary">{p.business_name}</Badge>)}
              </div>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button variant="outline" onClick={handleClose}>Keep Browsing</Button>
              <Button onClick={() => { handleClose(); router.push('/seeker/waitlists'); }}>View My Waitlists</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
