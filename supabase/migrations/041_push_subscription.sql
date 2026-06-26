-- Add push_subscription column to notification_preferences
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- Add vapid_public_key to .env.example for push notifications
-- NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
-- VAPID_PRIVATE_KEY=your_vapid_private_key

COMMENT ON COLUMN public.notification_preferences.push_subscription IS 'Web Push subscription object from PushManager.subscribe()';
