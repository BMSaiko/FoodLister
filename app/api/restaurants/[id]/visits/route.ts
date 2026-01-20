import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/libs/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getAuthenticatedClient(request);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: restaurantId } = await params;

    // Get the visit record for this user and restaurant
    // Add explicit user_id filter for reliability
    const { data: visitData, error: visitError } = await supabase
      .from('user_restaurant_visits')
      .select('*')
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurantId)
      .single();

    if (visitError && visitError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching visit data:', visitError);
      return NextResponse.json({ error: 'Failed to fetch visit data' }, { status: 500 });
    }

    return NextResponse.json({
      visited: visitData ? (visitData as any).visited : false,
      visitCount: visitData ? (visitData as any).visit_count : 0
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getAuthenticatedClient(request);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: restaurantId } = await params;

    // Check if visit record already exists
    const { data: existingVisit, error: checkError } = await supabase
      .from('user_restaurant_visits')
      .select('*')
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurantId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing visit:', checkError);
      return NextResponse.json({ error: 'Failed to check existing visit' }, { status: 500 });
    }

    if (existingVisit) {
      // Update existing record
      const { data: updatedVisit, error: updateError } = await (supabase as any)
        .from('user_restaurant_visits')
        .update({
          visited: true,
          visit_count: (existingVisit as any).visit_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating visit:', updateError);
        return NextResponse.json({ error: 'Failed to update visit' }, { status: 500 });
      }

      return NextResponse.json({
        visited: true,
        visitCount: (updatedVisit as any).visit_count
      });
    } else {
      // Create new record with explicit user_id
      const { data: newVisit, error: insertError } = await (supabase as any)
        .from('user_restaurant_visits')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          visited: true,
          visit_count: 1
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating visit:', insertError);
        return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
      }

      return NextResponse.json({
        visited: true,
        visitCount: 1
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getAuthenticatedClient(request);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: restaurantId } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'toggle_visited') {
      // Check if visit record exists
      const { data: existingVisit, error: checkError } = await supabase
        .from('user_restaurant_visits')
        .select('*')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking existing visit:', checkError);
        return NextResponse.json({ error: 'Failed to check existing visit' }, { status: 500 });
      }

      if (existingVisit) {
        // Update existing record - toggle visited status
        const currentVisited = (existingVisit as any).visited;
        const currentVisitCount = (existingVisit as any).visit_count;
        const newVisitedStatus = !currentVisited;

        // Prepare update data
        const updateData: any = {
          visited: newVisitedStatus,
          updated_at: new Date().toISOString()
        };

        // If marking as visited and visit_count is 0, set it to 1
        if (newVisitedStatus && currentVisitCount === 0) {
          updateData.visit_count = 1;
        }

        const { data: updatedVisit, error: updateError } = await (supabase as any)
          .from('user_restaurant_visits')
          .update(updateData)
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating visit status:', updateError);
          return NextResponse.json({ error: 'Failed to update visit status' }, { status: 500 });
        }

        return NextResponse.json({
          visited: newVisitedStatus,
          visitCount: (updatedVisit as any).visit_count
        });
      } else {
        // Create new record with visited = true and explicit user_id
        const { data: newVisit, error: insertError } = await (supabase as any)
          .from('user_restaurant_visits')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
            visited: true,
            visit_count: 1
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating visit:', insertError);
          return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
        }

        return NextResponse.json({
          visited: true,
          visitCount: 1
        });
      }
    }

    if (action === 'remove_visit') {
      // Check if visit record exists
      const { data: existingVisit, error: checkError } = await supabase
        .from('user_restaurant_visits')
        .select('*')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking existing visit:', checkError);
        return NextResponse.json({ error: 'Failed to check existing visit' }, { status: 500 });
      }

      if (existingVisit) {
        const currentVisitCount = (existingVisit as any).visit_count;

        // Only allow removing visit if count is greater than 0
        if (currentVisitCount > 0) {
          const newVisitCount = currentVisitCount - 1;
          const shouldMarkUnvisited = newVisitCount === 0;

          const { data: updatedVisit, error: updateError } = await (supabase as any)
            .from('user_restaurant_visits')
            .update({
              visit_count: newVisitCount,
              visited: shouldMarkUnvisited ? false : (existingVisit as any).visited,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

          if (updateError) {
            console.error('Error removing visit:', updateError);
            return NextResponse.json({ error: 'Failed to remove visit' }, { status: 500 });
          }

          return NextResponse.json({
            visited: shouldMarkUnvisited ? false : (existingVisit as any).visited,
            visitCount: newVisitCount
          });
        } else {
          return NextResponse.json({ error: 'Cannot remove visit: visit count is already 0' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'No visit record found to remove' }, { status: 404 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
