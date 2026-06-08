import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;
    if (!supabase) return NextResponse.json({ error: getErrorMessage('AUTHENTICATION_ERROR'), code: 'AUTHENTICATION_ERROR' }, { status: 401 });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: getErrorMessage('AUTHENTICATION_ERROR'), code: 'AUTHENTICATION_ERROR' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const weekStart = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const [usersCount,adminsCount,newUsersMonth,newUsersWeek,restaurantsCount,newRestMonth,restRatings,reviewsCount,newReviewsMonth,revRatings,listsCount,publicLists,privateLists,collabLists,listItems,mealsCount,upcomingMeals,mealsMonth,usersGrowth,restGrowth,revGrowth,cuisineData] = await Promise.all([
      supabase.from('profiles').select('id',{count:'exact',head:true}),
      supabase.from('profiles').select('id',{count:'exact',head:true}).eq('is_admin',true),
      supabase.from('profiles').select('id',{count:'exact',head:true}).gte('created_at',monthStart),
      supabase.from('profiles').select('id',{count:'exact',head:true}).gte('created_at',weekStart),
      supabase.from('restaurants').select('id',{count:'exact',head:true}),
      supabase.from('restaurants').select('id',{count:'exact',head:true}).gte('created_at',monthStart),
      supabase.from('restaurants').select('rating').not('rating','is',null),
      supabase.from('reviews').select('id',{count:'exact',head:true}),
      supabase.from('reviews').select('id',{count:'exact',head:true}).gte('created_at',monthStart),
      supabase.from('reviews').select('rating'),
      supabase.from('lists').select('id',{count:'exact',head:true}),
      supabase.from('lists').select('id',{count:'exact',head:true}).eq('is_public',true),
      supabase.from('lists').select('id',{count:'exact',head:true}).eq('is_public',false),
      supabase.from('list_collaborators').select('id',{count:'exact',head:true}),
      supabase.from('list_restaurants').select('list_id',{count:'exact',head:true}),
      supabase.from('scheduled_meals').select('id',{count:'exact',head:true}),
      supabase.from('scheduled_meals').select('id',{count:'exact',head:true}).gte('meal_date',now.toISOString().split('T')[0]),
      supabase.from('scheduled_meals').select('id',{count:'exact',head:true}).gte('created_at',monthStart),
      supabase.from('profiles').select('created_at').order('created_at',{ascending:false}).limit(1000),
      supabase.from('restaurants').select('created_at').order('created_at',{ascending:false}).limit(1000),
      supabase.from('reviews').select('created_at').order('created_at',{ascending:false}).limit(1000),
      supabase.from('cuisine_types').select('name,restaurant_cuisine_types(count)'),
    ]);
    const avgRev=revRatings.data?.length?revRatings.data.reduce((s:number,r:any)=>s+(r.rating||0),0)/revRatings.data.length:0;
    const avgRest=restRatings.data?.length?restRatings.data.reduce((s:number,r:any)=>s+(r.rating||0),0)/restRatings.data.length:0;
    const rd:Record<number,number>={1:0,2:0,3:0,4:0,5:0};
    revRatings.data?.forEach((r:any)=>{if(r.rating>=1&&r.rating<=5)rd[Math.round(r.rating)]++;});
    const months:string[]=[];for(let i=11;i>=0;i--)months.push(new Date(now.getFullYear(),now.getMonth()-i,1).toISOString().slice(0,7));
    const cbm=(d:any[])=>{const m:Record<string,number>={};d?.forEach((i:any)=>{const k=i.created_at?.slice(0,7);if(k)m[k]=(m[k]||0)+1;});let c=0;return months.map(mo=>{c+=m[mo]||0;return{month:mo,count:c};});};
    const stats={users:{total:usersCount.count||0,active:0,newThisMonth:newUsersMonth.count||0,newThisWeek:newUsersWeek.count||0,admins:adminsCount.count||0,growthRate:0},restaurants:{total:restaurantsCount.count||0,averageRating:Math.round(avgRest*10)/10,newThisMonth:newRestMonth.count||0,byCuisine:cuisineData.data?.map((c:any)=>({cuisine:c.name,count:c.restaurant_cuisine_types?.[0]?.count||0}))||[]},reviews:{total:reviewsCount.count||0,averageRating:Math.round(avgRev*10)/10,byRating:Object.entries(rd).map(([r,c])=>({rating:Number(r),count:c as number})),newThisMonth:newReviewsMonth.count||0},lists:{total:listsCount.count||0,public:publicLists.count||0,private:privateLists.count||0,collaborative:collabLists.count||0,totalItems:listItems.count||0},meals:{total:mealsCount.count||0,upcoming:upcomingMeals.count||0,thisMonth:mealsMonth.count||0},growth:{users:cbm(usersGrowth.data),restaurants:cbm(restGrowth.data),reviews:cbm(revGrowth.data)}};
    return NextResponse.json({data:stats});
  } catch(error:any){
    console.error('Admin stats error:',error?.message || error?.code || error);
    return NextResponse.json({error:error.message||'Internal server error',code:'INTERNAL_ERROR'},{status:500});
  }
}
