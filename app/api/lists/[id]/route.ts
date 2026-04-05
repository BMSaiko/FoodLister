// app/api/lists/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/libs/supabase/client';
import { getServerClient } from '@/libs/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    // Step 1: Fetch the list details
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();

    if (listError) {
      console.error('Error fetching list:', listError);
      if (listError.code === 'PGRST116') {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch list details', details: listError.message }, { status: 500 });
    }

    if (!listData) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Step 2: Fetch restaurant IDs from list_restaurants (ordered by position)
    const { data: listRestaurants, error: listRestaurantsError } = await supabase
      .from('list_restaurants')
      .select('restaurant_id, position')
      .eq('list_id', id)
      .order('position', { ascending: true }) as { data: { restaurant_id: string; position: number }[] | null; error: any };

    if (listRestaurantsError) {
      console.error('Error fetching list restaurants:', listRestaurantsError);
      // Continue with empty restaurants array instead of failing
      const response = NextResponse.json({ 
        list: { 
          ...(listData as any), 
          restaurants: [] 
        } 
      });
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return response;
    }

    // Step 3: Fetch restaurant details with relationships
    let restaurants: any[] = [];
    if (listRestaurants && listRestaurants.length > 0) {
      const restaurantIds = listRestaurants.map((lr: { restaurant_id: string }) => lr.restaurant_id);
      
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_restaurant_features(
            restaurant_features(*)
          ),
          restaurant_dietary_options_junction(
            restaurant_dietary_options(*)
          ),
          restaurant_cuisine_types(
            cuisine_types(*)
          )
        `)
        .in('id', restaurantIds);

      if (restaurantError) {
        console.error('Error fetching restaurants:', restaurantError);
        // Continue with empty restaurants array instead of failing
      } else if (restaurantData) {
        restaurants = restaurantData;
      }
    }

    // Build response
    const responseData = {
      ...(listData as any),
      restaurants
    };

    // Add caching headers for better performance
    const response = NextResponse.json({ list: responseData });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the list to check ownership
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (listError) {
      console.error('Error fetching list for deletion:', listError);
      if (listError.code === 'PGRST116') {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch list', details: listError.message }, { status: 500 });
    }

    // Check if user is the creator
    if (listData.creator_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own lists' }, { status: 403 });
    }

    // Delete the list (cascade will handle list_restaurants)
    const { error: deleteError } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting list:', deleteError);
      return NextResponse.json({ error: 'Failed to delete list', details: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'List deleted successfully' 
    });
  } catch (_error: unknown) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the list to check ownership
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (listError || !listData) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    if (listData.creator_id !== user.id) {
      return NextResponse.json({ error: 'You can only update your own lists' }, { status: 403 });
    }

    const body = await request.json();
    const { restaurantOrder, ...listUpdates } = body;

    // Update list fields if provided
    if (Object.keys(listUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('lists')
        .update({ ...listUpdates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating list:', updateError);
        return NextResponse.json({ error: 'Failed to update list', details: updateError.message }, { status: 500 });
      }
    }

    // Update restaurant order if provided
    if (restaurantOrder && Array.isArray(restaurantOrder)) {
      for (let i = 0; i < restaurantOrder.length; i++) {
        const { error: orderError } = await supabase
          .from('list_restaurants')
          .update({ position: i })
          .eq('list_id', id)
          .eq('restaurant_id', restaurantOrder[i]);

        if (orderError) {
          console.error('Error updating restaurant order:', orderError);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'List updated successfully' 
    });
  } catch (_error: unknown) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the original list
    const { data: originalList, error: listError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();

    if (listError || !originalList) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name } = body;

    // Create new list (duplicate)
    const { data: newList, error: createError } = await supabase
      .from('lists')
      .insert({
        name: name || `${originalList.name} (Cópia)`,
        description: originalList.description,
        creator_id: user.id,
        creator_name: originalList.creator_name,
        is_public: originalList.is_public,
        filters: originalList.filters,
      })
      .select()
      .single();

    if (createError || !newList) {
      console.error('Error duplicating list:', createError);
      return NextResponse.json({ error: 'Failed to duplicate list', details: createError?.message }, { status: 500 });
    }

    // Copy restaurants from original list
    const { data: originalRestaurants, error: fetchError } = await supabase
      .from('list_restaurants')
      .select('restaurant_id, position')
      .eq('list_id', id)
      .order('position', { ascending: true });

    if (!fetchError && originalRestaurants && originalRestaurants.length > 0) {
      const inserts = originalRestaurants.map((lr) => ({
        list_id: newList.id,
        restaurant_id: lr.restaurant_id,
        position: lr.position,
      }));

      const { error: insertError } = await supabase
        .from('list_restaurants')
        .insert(inserts);

      if (insertError) {
        console.error('Error copying restaurants:', insertError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      list: newList,
      message: 'List duplicated successfully' 
    });
  } catch (_error: unknown) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: 'Unknown error' 
    }, { status: 500 });
  }
}
