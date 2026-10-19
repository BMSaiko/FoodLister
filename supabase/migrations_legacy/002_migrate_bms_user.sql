-- Migration: Associate existing restaurants and lists created by "BMS" to user "1221514@isep.ipp.pt"
-- This migration associates existing data created by user "BMS" to the authenticated user

DO $$
DECLARE
    bms_user_id UUID;
    display_name TEXT := 'BMS';
BEGIN
    -- Find the user with email "1221514@isep.ipp.pt"
    SELECT id INTO bms_user_id
    FROM auth.users
    WHERE email = '1221514@isep.ipp.pt';

    -- If user exists, update their display name and associate data
    IF bms_user_id IS NOT NULL THEN
        -- Update user metadata to set display name as "BMS"
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{name}',
            to_jsonb(display_name)
        )
        WHERE id = bms_user_id;

        -- Update restaurants created by "BMS"
        UPDATE restaurants
        SET
            creator_id = bms_user_id,
            creator_name = display_name
        WHERE creator = 'BMS' AND (creator_id IS NULL OR creator_id != bms_user_id);

        -- Update lists created by "BMS"
        UPDATE lists
        SET
            creator_id = bms_user_id,
            creator_name = display_name
        WHERE creator = 'BMS' AND (creator_id IS NULL OR creator_id != bms_user_id);

        -- Log the migration
        RAISE NOTICE 'Successfully associated % restaurants and % lists to user %',
            (SELECT COUNT(*) FROM restaurants WHERE creator_id = bms_user_id),
            (SELECT COUNT(*) FROM lists WHERE creator_id = bms_user_id),
            bms_user_id;
        RAISE NOTICE 'User display name updated to: %', display_name;

    ELSE
        RAISE NOTICE 'User with email 1221514@isep.ipp.pt not found. Please ensure the user exists before running this migration.';
    END IF;
END $$;
