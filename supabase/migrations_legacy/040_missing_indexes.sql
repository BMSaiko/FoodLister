-- Migration 045: Add missing indexes for newer tables and common query patterns

-- ============================================================
-- LIST_ACTIVITIES (from migration 037)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_list_activities_list_id_created
  ON list_activities(list_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_list_activities_user_id
  ON list_activities(user_id);

-- ============================================================
-- LIST_COLLABORATORS (from migration 026)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_list_collaborators_list_id
  ON list_collaborators(list_id);

CREATE INDEX IF NOT EXISTS idx_list_collaborators_user_id
  ON list_collaborators(user_id);

-- ============================================================
-- MEAL_PARTICIPANTS (from migration 030)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_meal_participants_meal_id
  ON meal_participants(scheduled_meal_id);

CREATE INDEX IF NOT EXISTS idx_meal_participants_user_id
  ON meal_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_meal_participants_status
  ON meal_participants(status);

-- ============================================================
-- SCHEDULED_MEALS (from migration 030)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_organizer_id
  ON scheduled_meals(organizer_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_meals_date
  ON scheduled_meals(meal_date, meal_time);

CREATE INDEX IF NOT EXISTS idx_scheduled_meals_restaurant_id
  ON scheduled_meals(restaurant_id);

-- ============================================================
-- USER_RESTAURANT_VISITS (from migration 010)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_restaurant_visits_user_id
  ON user_restaurant_visits(user_id);

CREATE INDEX IF NOT EXISTS idx_user_restaurant_visits_restaurant_id
  ON user_restaurant_visits(restaurant_id);

-- ============================================================
-- USER_SUBSCRIPTIONS (from migration 043)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
  ON user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id
  ON user_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status_period
  ON user_subscriptions(status, current_period_end)
  WHERE status = 'active';
