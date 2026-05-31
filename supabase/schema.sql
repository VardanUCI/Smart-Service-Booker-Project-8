-- Smart Service Booker — Database Schema
-- Last updated: April 29, 2026

-- Enable PostGIS for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- Users table — extends auth.users with profile info
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'business')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================
-- ADDITIONS MADE DIRECTLY IN SUPABASE SQL EDITOR
-- ============================================================

-- Add notified_at column to waitlists
ALTER TABLE public.waitlists
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- Dispatch requests table (Model C)
CREATE TABLE IF NOT EXISTS public.dispatch_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  radius_meters FLOAT DEFAULT 10000,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'claimed', 'cancelled', 'expired')),
  expires_in_minutes INTEGER NOT NULL DEFAULT 30
    CHECK (expires_in_minutes IN (30, 60, 120, 240)),
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_by UUID REFERENCES public.providers(id),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dispatch_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dispatch_customer_read" ON public.dispatch_requests
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "dispatch_customer_insert" ON public.dispatch_requests
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "dispatch_customer_update" ON public.dispatch_requests
  FOR UPDATE USING (auth.uid() = customer_id);

-- Providers can claim an open request that matches their category and location radius
CREATE POLICY "dispatch_provider_claim" ON public.dispatch_requests
  FOR UPDATE
  USING (
    status = 'open'
    AND expires_at > NOW()
    AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = auth.uid()
        AND p.category = dispatch_requests.category
        AND p.is_available = TRUE
    )
  )
  WITH CHECK (
    claimed_by = auth.uid()
    AND status = 'claimed'
  );

CREATE POLICY "dispatch_provider_read" ON public.dispatch_requests
  FOR SELECT USING (
    status = 'open'
    AND EXISTS (
      SELECT 1 FROM public.providers
      WHERE id = auth.uid()
        AND category = dispatch_requests.category
        AND is_available = TRUE
    )
  );

CREATE INDEX IF NOT EXISTS idx_dispatch_status ON public.dispatch_requests(status);
CREATE INDEX IF NOT EXISTS idx_dispatch_category ON public.dispatch_requests(category);
CREATE INDEX IF NOT EXISTS idx_dispatch_location ON public.dispatch_requests USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_dispatch_expires ON public.dispatch_requests(expires_at);

-- RPC: find open dispatch requests near a provider
CREATE OR REPLACE FUNCTION public.get_open_dispatch_requests_for_provider(
  p_provider_id UUID
)
RETURNS TABLE (
  id UUID,
  customer_id UUID,
  category TEXT,
  description TEXT,
  address TEXT,
  radius_meters FLOAT,
  expires_in_minutes INTEGER,
  expires_at TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    d.id, d.customer_id, d.category, d.description, d.address,
    d.radius_meters, d.expires_in_minutes, d.expires_at,
    d.status, d.created_at
  FROM public.dispatch_requests d
  JOIN public.providers p ON p.id = p_provider_id
  WHERE
    d.status = 'open'
    AND d.category = p.category
    AND d.expires_at > NOW()
    AND ST_DWithin(d.location, p.location, d.radius_meters)
  ORDER BY d.created_at ASC;
$$;

-- Trigger: when a booking is cancelled, match next person in waitlist
CREATE OR REPLACE FUNCTION public.handle_booking_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  next_entry RECORD;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT id, user_id INTO next_entry
    FROM public.waitlists
    WHERE provider_id = NEW.provider_id
      AND status = 'waiting'
      AND expires_at > NOW()
    ORDER BY created_at ASC
    LIMIT 1;

    IF next_entry.id IS NOT NULL THEN
      INSERT INTO public.bookings (
        waitlist_id, provider_id, customer_id, slot_id, status, notes
      ) VALUES (
        next_entry.id, NEW.provider_id, next_entry.user_id, NEW.slot_id,
        'pending', 'Auto-matched from waitlist — confirm within 15 minutes'
      );

      UPDATE public.waitlists
      SET status = 'notified', notified_at = NOW()
      WHERE id = next_entry.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_cancelled
  AFTER UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_cancellation();

-- Trigger: when a booking is confirmed, update slot, cancel sibling
--          waitlists, and notify provider
CREATE OR REPLACE FUNCTION public.handle_booking_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE public.availability_slots
    SET booked_count = booked_count + 1
    WHERE id = NEW.slot_id AND booked_count < capacity;

    IF NEW.waitlist_id IS NOT NULL THEN
      UPDATE public.waitlists SET status = 'booked' WHERE id = NEW.waitlist_id;
    END IF;

    UPDATE public.waitlists
    SET status = 'cancelled'
    WHERE user_id = NEW.customer_id
      AND id != COALESCE(NEW.waitlist_id, '00000000-0000-0000-0000-000000000000')
      AND status IN ('waiting', 'notified');

    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (
      NEW.provider_id, 'confirmation', 'Booking confirmed',
      'A customer has confirmed their booking.', '/provider/requests'
    );
  END IF;

  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'completed') THEN
    UPDATE public.availability_slots
    SET booked_count = GREATEST(booked_count - 1, 0)
    WHERE id = NEW.slot_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron: auto-cancel pending bookings older than 15 minutes
SELECT cron.schedule(
  'timeout-pending-bookings',
  '* * * * *',
  $$SELECT public.timeout_pending_bookings();$$
);

-- Cron: auto-expire stale open dispatch requests
SELECT cron.schedule(
  'expire-dispatch-requests',
  '* * * * *',
  $$
    UPDATE public.dispatch_requests
    SET status = 'expired'
    WHERE status = 'open'
      AND expires_at < NOW();
  $$
);
