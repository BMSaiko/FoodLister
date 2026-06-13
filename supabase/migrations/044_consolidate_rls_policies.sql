-- ============================================================
-- RLS Policy Consolidation
-- This migration consolidates all RLS policies for clarity.
-- Existing policies are dropped and recreated in one place.
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.user_id() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (public_profile = true);

-- ============================================================
-- RESTAURANTS
-- ============================================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON public.restaurants;
DROP POLICY IF EXISTS "Authenticated users can create restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can update own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can delete own restaurants" ON public.restaurants;

CREATE POLICY "Restaurants are viewable by everyone"
  ON public.restaurants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own restaurants"
  ON public.restaurants FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own restaurants"
  ON public.restaurants FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================================
-- LISTS
-- ============================================================
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can view public lists" ON public.lists;
DROP POLICY IF EXISTS "Users can create lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON public.lists;

CREATE POLICY "Public lists are viewable by everyone"
  ON public.lists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own lists"
  ON public.lists FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can view shared lists"
  ON public.lists FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.list_collaborators WHERE list_id = lists.id
    )
  );

CREATE POLICY "Authenticated users can create lists"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own lists"
  ON public.lists FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own lists"
  ON public.lists FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================================
-- REVIEWS
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- SUBSCRIPTION PLANS (public read)
-- ============================================================
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- ============================================================
-- USER SUBSCRIPTIONS
-- ============================================================
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- ADMIN ROLES
-- ============================================================
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Admins can manage admin roles" ON public.admin_roles;

CREATE POLICY "Admins can view admin roles"
  ON public.admin_roles FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

CREATE POLICY "Admins can manage admin roles"
  ON public.admin_roles FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );
