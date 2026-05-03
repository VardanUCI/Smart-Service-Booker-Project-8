-- Creates the bookings table to record confirmed appointments between a provider and a seeker, with triggers to update slot capacity and waitlist status automatically.

CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  waitlist_id UUID REFERENCES public.waitlists(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users NOT NULL,
  customer_id UUID REFERENCES auth.users NOT NULL,
  slot_id UUID REFERENCES public.availability_slots(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX bookings_provider_idx ON public.bookings (provider_id);
CREATE INDEX bookings_customer_idx ON public.bookings (customer_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_customer_read" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "bookings_provider_all" ON public.bookings
  FOR ALL USING (auth.uid() = provider_id);

-- When a booking is confirmed, increment the slot's booked_count
CREATE OR REPLACE FUNCTION public.handle_booking_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE public.availability_slots
    SET booked_count = booked_count + 1
    WHERE id = NEW.slot_id AND booked_count < capacity;
  END IF;

  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'completed') THEN
    UPDATE public.availability_slots
    SET booked_count = GREATEST(booked_count - 1, 0)
    WHERE id = NEW.slot_id;
  END IF;

  -- Mark the waitlist entry as completed when booking is confirmed
  IF NEW.status = 'confirmed' THEN
    UPDATE public.waitlists SET status = 'booked' WHERE id = NEW.waitlist_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_status_change
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_confirmed();
