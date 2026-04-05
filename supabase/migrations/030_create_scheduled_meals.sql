-- Migration: Create scheduled meals and meal participants tables
-- This enables the meal scheduling feature with participant management

-- ============================================
-- SCHEDULED MEALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.scheduled_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    meal_date DATE NOT NULL,
    meal_time TIME NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 120,
    google_calendar_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_organizer ON public.scheduled_meals(organizer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_restaurant ON public.scheduled_meals(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_date ON public.scheduled_meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_date_range ON public.scheduled_meals(meal_date, meal_time);

-- Enable RLS
ALTER TABLE public.scheduled_meals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MEAL PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.meal_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_meal_id UUID NOT NULL REFERENCES public.scheduled_meals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scheduled_meal_id, user_id)
);

-- Add constraint for valid status values
ALTER TABLE public.meal_participants 
    ADD CONSTRAINT chk_participant_status 
    CHECK (status IN ('pending', 'accepted', 'declined'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_participants_meal ON public.meal_participants(scheduled_meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_participants_user ON public.meal_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_participants_status ON public.meal_participants(status);

-- Enable RLS
ALTER TABLE public.meal_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR SCHEDULED_MEALS
-- ============================================

-- Policy: Anyone can view scheduled meals (for viewing purposes)
CREATE POLICY "Anyone can view scheduled meals" 
    ON public.scheduled_meals
    FOR SELECT 
    USING (true);

-- Policy: Users can create scheduled meals (authenticated only)
CREATE POLICY "Users can create scheduled meals" 
    ON public.scheduled_meals
    FOR INSERT 
    WITH CHECK (auth.uid() = organizer_id);

-- Policy: Organizer can update their own scheduled meals
CREATE POLICY "Organizer can update their own meals" 
    ON public.scheduled_meals
    FOR UPDATE 
    USING (auth.uid() = organizer_id);

-- Policy: Organizer can delete their own scheduled meals
CREATE POLICY "Organizer can delete their own meals" 
    ON public.scheduled_meals
    FOR DELETE 
    USING (auth.uid() = organizer_id);

-- ============================================
-- RLS POLICIES FOR MEAL_PARTICIPANTS
-- ============================================

-- Policy: Anyone can view participants of a meal
CREATE POLICY "Anyone can view meal participants" 
    ON public.meal_participants
    FOR SELECT 
    USING (true);

-- Policy: Organizer can add participants to their meal
CREATE POLICY "Organizer can add participants" 
    ON public.meal_participants
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.scheduled_meals 
            WHERE id = scheduled_meal_id 
            AND organizer_id = auth.uid()
        )
    );

-- Policy: Organizer can update participant status
CREATE POLICY "Organizer can update participants" 
    ON public.meal_participants
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.scheduled_meals 
            WHERE id = scheduled_meal_id 
            AND organizer_id = auth.uid()
        )
    );

-- Policy: Organizer can remove participants
CREATE POLICY "Organizer can remove participants" 
    ON public.meal_participants
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.scheduled_meals 
            WHERE id = scheduled_meal_id 
            AND organizer_id = auth.uid()
        )
    );

-- Policy: Users can update their own participation status
CREATE POLICY "Users can update their own status" 
    ON public.meal_participants
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_scheduled_meals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scheduled_meals_updated_at
    BEFORE UPDATE ON public.scheduled_meals
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduled_meals_updated_at();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.scheduled_meals TO authenticated;
GRANT ALL ON public.meal_participants TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;