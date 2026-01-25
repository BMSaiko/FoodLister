-- Migration: Create user_stats view for profile statistics
-- This view aggregates user statistics for efficient querying in the profile page

-- Create a function to aggregate user statistics for efficient querying
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS TABLE (
    user_id uuid,
    restaurant_count bigint,
    review_count bigint,
    visited_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        COUNT(DISTINCT r.id) as restaurant_count,
        COUNT(DISTINCT rev.id) as review_count,
        COUNT(DISTINCT v.restaurant_id) FILTER (WHERE v.visited = true) as visited_count
    FROM profiles p
    LEFT JOIN restaurants r ON p.user_id = r.creator_id
    LEFT JOIN reviews rev ON p.user_id = rev.user_id
    LEFT JOIN user_restaurant_visits v ON p.user_id = v.user_id
    WHERE p.user_id = user_uuid
    GROUP BY p.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view that uses the function for easier querying
CREATE OR REPLACE VIEW user_stats AS
SELECT * FROM get_user_stats(auth.uid());

-- Grant permissions
GRANT ALL ON FUNCTION get_user_stats(uuid) TO authenticated;
GRANT ALL ON user_stats TO authenticated;

-- Test the view (optional)
-- SELECT * FROM user_stats WHERE user_id = 'your-user-id-here';