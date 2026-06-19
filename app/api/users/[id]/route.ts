import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { 
  validateProfileAccess, 
  getUserProfileData, 
  getUserReviewsData, 
  getUserListsData,
  ensureUserProfileExists
} from '@/libs/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;
    
    // Get the authenticated user (optional for public profiles)
    let currentUserId = null;
    try {
      const authResult = await supabase.auth.getUser();
      if (authResult.data?.user) {
        currentUserId = authResult.data.user.id;
      }
    } catch (error) {
      console.warn('Authentication check failed:', error);
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // 1. Validar acesso ao perfil
    const accessValidation = await validateProfileAccess(
      supabase,
      userId,
      currentUserId
    );

    if (!accessValidation.canAccess) {
      // Para não revelar a existência de perfis privados, retornamos 404
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { targetUserId, accessLevel } = accessValidation;

    if (!targetUserId || accessLevel === 'NONE') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 2. Buscar dados do perfil
    const profileData = await getUserProfileData(
      supabase,
      targetUserId,
      accessLevel as 'OWNER' | 'PUBLIC' | 'PRIVATE'
    );

    if (!profileData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Buscar dados adicionais baseados no nível de acesso
    const [reviewsData, listsData] = await Promise.all([
      getUserReviewsData(supabase, targetUserId, accessLevel as 'OWNER' | 'PUBLIC' | 'PRIVATE', 1, 12),
      getUserListsData(supabase, targetUserId, accessLevel as 'OWNER' | 'PUBLIC' | 'PRIVATE', 1, 12)
    ]);

    // 4. Contagem de restaurantes criados (sempre público)
    const { count: restaurantsCount } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', targetUserId);

    // 5. Transformar a resposta para corresponder à interface frontend
    const userProfile = {
      id: profileData.user_id,
      userIdCode: profileData.user_id_code,
      name: profileData.display_name,
      profileImage: profileData.avatar_url,
      location: profileData.location,
      bio: profileData.bio,
      website: profileData.website,
      phoneNumber: profileData.phone_number, // Adicionado phoneNumber
      publicProfile: profileData.public_profile,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
      stats: {
        totalRestaurantsVisited: profileData.total_restaurants_visited || 0,
        totalReviews: profileData.total_reviews || 0,
        totalLists: profileData.total_lists || 0,
        totalRestaurantsAdded: restaurantsCount || 0,
        joinedDate: profileData.created_at
      },
      recentReviews: reviewsData.data,
      recentLists: listsData.data,
      accessLevel,
      isOwnProfile: accessLevel === 'OWNER'
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Error in user profile GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
