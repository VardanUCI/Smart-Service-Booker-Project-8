-- Creates the notifications table and a reusable create_notification() helper, with a trigger that automatically notifies customers when a booking is confirmed.

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('spot-available', 'reminder', 'confirmation', 'update', 'request')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System/trigger functions can insert notifications via SECURITY DEFINER functions
CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Helper function to create a notification (called from other triggers/functions)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$;

-- When a booking is created, notify the customer
CREATE OR REPLACE FUNCTION public.handle_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
  provider_name TEXT;
BEGIN
  SELECT business_name INTO provider_name FROM public.providers WHERE id = NEW.provider_id;

  IF NEW.status = 'confirmed' THEN
    PERFORM public.create_notification(
      NEW.customer_id,
      'confirmation',
      'Appointment Confirmed',
      'Your appointment with ' || COALESCE(provider_name, 'the provider') || ' has been confirmed.',
      '/seeker/waitlists'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_notify_customer
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_notification();
