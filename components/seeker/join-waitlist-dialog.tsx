'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, MessageSquare, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Provider } from '@/lib/mock-data';

interface JoinWaitlistDialogProps {
  providers: Provider[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProvider: (id: string) => void;
}

export function JoinWaitlistDialog({
  providers,
  isOpen,
  onClose,
  onRemoveProvider,
}: JoinWaitlistDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<'review' | 'contact' | 'success'>('review');
  const [contactMethod, setContactMethod] = useState('sms');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep('success');
  };

  const handleClose = () => {
    setStep('review');
    onClose();
  };

  const handleViewWaitlists = () => {
    handleClose();
    router.push('/seeker/waitlists');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle>Join Waitlists</DialogTitle>
              <DialogDescription>
                Review the providers you want to join. You&apos;ll be notified when a spot opens.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {providers.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  No providers selected. Go back and select providers to join their waitlists.
                </p>
              ) : (
                providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">{provider.nextAvailable}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveProvider(provider.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('contact')} disabled={providers.length === 0}>
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'contact' && (
          <>
            <DialogHeader>
              <DialogTitle>Contact Preferences</DialogTitle>
              <DialogDescription>
                How would you like to be notified when a spot opens?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <RadioGroup value={contactMethod} onValueChange={setContactMethod}>
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    contactMethod === 'sms' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="sms" id="sms" />
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-foreground">SMS (Recommended)</span>
                      <p className="text-xs text-muted-foreground">Get instant text alerts</p>
                    </div>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    contactMethod === 'email' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="email" id="email" />
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-foreground">Email</span>
                      <p className="text-xs text-muted-foreground">Get email notifications</p>
                    </div>
                  </div>
                </label>
              </RadioGroup>

              {contactMethod === 'sms' && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}

              {contactMethod === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  `Join ${providers.length} Waitlist${providers.length > 1 ? 's' : ''}`
                )}
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
                You&apos;ve joined {providers.length} waitlist{providers.length > 1 ? 's' : ''}. 
                We&apos;ll notify you as soon as a spot opens up.
              </DialogDescription>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {providers.map((p) => (
                  <Badge key={p.id} variant="secondary">
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter className="sm:justify-center">
              <Button variant="outline" onClick={handleClose}>
                Keep Browsing
              </Button>
              <Button onClick={handleViewWaitlists}>View My Waitlists</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
