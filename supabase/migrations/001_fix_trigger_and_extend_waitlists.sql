-- Extends the waitlists table with provider, service, urgency, and contact fields, makes search_location nullable, and adds missing RLS policies.

-- Extend waitlists to support provider-specific entries and contact preferences
ALTER TABLE public.waitlists
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS service TEXT,
  ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('now', 'today', 'this-week', 'flexible')) DEFAULT 'flexible',
  ADD COLUMN IF NOT EXISTS contact_method TEXT CHECK (contact_method IN ('sms', 'email')),
  ADD COLUMN IF NOT EXISTS contact_value TEXT;

-- search_location is nullable when provider_id is set (we already have the provider's location)
ALTER TABLE public.waitlists
  ALTER COLUMN search_location DROP NOT NULL;

-- RLS for waitlists (was missing entirely)
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlists_insert_own" ON public.waitlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "waitlists_read_own" ON public.waitlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "waitlists_update_own" ON public.waitlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "waitlists_delete_own" ON public.waitlists
  FOR DELETE USING (auth.uid() = user_id);

-- Providers can read waitlist entries that target them
CREATE POLICY "waitlists_provider_read" ON public.waitlists
  FOR SELECT USING (provider_id = auth.uid());
