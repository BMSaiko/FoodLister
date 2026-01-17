-- Automatic query to fix creator_name from email to "BMS"
-- Execute this in Supabase SQL Editor

DO $$
DECLARE
    bms_user_id UUID;
    email_name TEXT := '1221514@isep.ipp.pt';
    display_name TEXT := 'BMS';
BEGIN
    -- Find the user
    SELECT id INTO bms_user_id
    FROM auth.users
    WHERE email = email_name;

    -- If user exists, fix creator_name
    IF bms_user_id IS NOT NULL THEN
        -- Update restaurants
        UPDATE restaurants
        SET creator_name = display_name
        WHERE creator_id = bms_user_id AND creator_name = email_name;

        -- Update lists
        UPDATE lists
        SET creator_name = display_name
        WHERE creator_id = bms_user_id AND creator_name = email_name;

        -- Log results
        RAISE NOTICE 'Fixed creator_name for user % (%):', email_name, bms_user_id;
        RAISE NOTICE '  Restaurants updated: %', (SELECT COUNT(*) FROM restaurants WHERE creator_id = bms_user_id AND creator_name = display_name);
        RAISE NOTICE '  Lists updated: %', (SELECT COUNT(*) FROM lists WHERE creator_id = bms_user_id AND creator_name = display_name);

        -- Check for any remaining
        RAISE NOTICE 'Remaining with old name:';
        RAISE NOTICE '  Restaurants: %', (SELECT COUNT(*) FROM restaurants WHERE creator_name = email_name);
        RAISE NOTICE '  Lists: %', (SELECT COUNT(*) FROM lists WHERE creator_name = email_name);

    ELSE
        RAISE NOTICE 'User with email % not found', email_name;
    END IF;
END $$;
