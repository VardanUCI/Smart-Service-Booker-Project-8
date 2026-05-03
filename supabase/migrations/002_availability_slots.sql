-- Creates the availability_slots table so providers can publish specific date/time slots with capacity for seekers to book.

CREATE TABLE public.availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 1 CHECK (capacity >= 1 AND capacity <= 50),
  booked_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT booked_lte_capacity CHECK (booked_count <= capacity)
);

CREATE INDEX availability_slots_provider_date_idx ON public.availability_slots (provider_id, date);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can read slots (needed for seeker results page to show availability)
CREATE POLICY "slots_public_read" ON public.availability_slots
  FOR SELECT USING (true);

-- Only the owning provider can create/update/delete
CREATE POLICY "slots_owner_write" ON public.availability_slots
  FOR ALL USING (auth.uid() = provider_id);
