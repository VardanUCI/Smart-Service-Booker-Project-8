-- Defines three RPC functions: get_user_waitlists, get_provider_dashboard_stats, and get_requests_for_provider, used by the seeker and provider API routes.

-- Returns a user's waitlist entries with provider info and queue position
CREATE OR REPLACE FUNCTION public.get_user_waitlists(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  provider_id UUID,
  business_name TEXT,
  category TEXT,
  service TEXT,
  urgency TEXT,
  status TEXT,
  joined_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  position BIGINT,
  contact_method TEXT,
  contact_value TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    w.id,
    w.provider_id,
    p.business_name,
    w.category,
    w.service,
    w.urgency,
    w.status,
    w.created_at AS joined_at,
    w.expires_at,
    ROW_NUMBER() OVER (
      PARTITION BY w.provider_id
      ORDER BY w.created_at ASC
    ) AS position,
    w.contact_method,
    w.contact_value
  FROM public.waitlists w
  LEFT JOIN public.providers p ON p.id = w.provider_id
  WHERE w.user_id = p_user_id
  ORDER BY w.created_at DESC;
$$;

-- Returns aggregated stats for a provider's dashboard
CREATE OR REPLACE FUNCTION public.get_provider_dashboard_stats(p_provider_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'openSlots', (
      SELECT COUNT(*) FROM public.availability_slots
      WHERE provider_id = p_provider_id
        AND date >= CURRENT_DATE
        AND booked_count < capacity
    ),
    'pendingRequests', (
      SELECT COUNT(*) FROM public.waitlists
      WHERE provider_id = p_provider_id
        AND status = 'waiting'
        AND expires_at > NOW()
    ),
    'activeWaitlists', (
      SELECT COUNT(*) FROM public.waitlists
      WHERE provider_id = p_provider_id
        AND status IN ('waiting', 'notified')
    ),
    'fillRate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed'))::NUMERIC / COUNT(*) * 100)
      END
      FROM public.bookings WHERE provider_id = p_provider_id
    ),
    'todayAppointments', (
      SELECT COUNT(*) FROM public.bookings b
      JOIN public.availability_slots s ON b.slot_id = s.id
      WHERE b.provider_id = p_provider_id
        AND s.date = CURRENT_DATE
        AND b.status IN ('confirmed', 'completed')
    ),
    'weeklyBookings', (
      SELECT COUNT(*) FROM public.bookings b
      JOIN public.availability_slots s ON b.slot_id = s.id
      WHERE b.provider_id = p_provider_id
        AND s.date >= date_trunc('week', CURRENT_DATE)::DATE
        AND b.status IN ('confirmed', 'completed')
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Returns active waitlist entries targeting a provider (the "requests" feed)
CREATE OR REPLACE FUNCTION public.get_requests_for_provider(p_provider_id UUID)
RETURNS TABLE (
  id UUID,
  customer_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  service TEXT,
  category TEXT,
  urgency TEXT,
  contact_method TEXT,
  contact_value TEXT,
  status TEXT,
  requested_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    w.id,
    w.user_id AS customer_id,
    u.name AS customer_name,
    u.email AS customer_email,
    w.service,
    w.category,
    w.urgency,
    w.contact_method,
    w.contact_value,
    w.status,
    w.created_at AS requested_at,
    w.expires_at
  FROM public.waitlists w
  JOIN public.users u ON u.id = w.user_id
  WHERE w.provider_id = p_provider_id
    AND w.status IN ('waiting', 'notified')
    AND w.expires_at > NOW()
  ORDER BY
    CASE w.urgency
      WHEN 'now'       THEN 1
      WHEN 'today'     THEN 2
      WHEN 'this-week' THEN 3
      ELSE                  4
    END,
    w.created_at ASC;
$$;
