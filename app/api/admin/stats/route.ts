import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/libs/supabase/server';
import { cacheOrSet } from '@/libs/cache';
import type {  } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, new NextResponse());
    if (!auth.ok) return auth.response;
    const { supabase } = auth;

    const stats = await cacheOrSet('admin:stats', async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const weekStart = new Date(Date.now() - 7*24*60*60*1000).toISOString();
      const [usersCount,adminsCount,newUsersMonth,newUsersWeek,restaurantsCount,newRestMonth,restRatings,reviewsCount,newReviewsMonth,revRatings,listsCount,publicLists,privateLists,collabLists,listItems,mealsCount,upcomingMeals,mealsMonth,usersGrowth,restGrowth,revGrowth,cuisineData,topRestaurants,topLists,userEvents,userEventsCount] = await Promise.all([
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
        supabase.from('restaurants').select('id,name,rating,review_count,price_per_person').order('review_count',{ascending:false}).limit(10),
        supabase.from('list_likes').select('list_id,lists(id,name)'),
        supabase.from('user_events').select('event,metadata,created_at').gte('created_at', monthStart),
        supabase.from('user_events').select('event',{count:'exact',head:true}).gte('created_at', monthStart),
      ]);
      const avgRev=revRatings.data?.length?revRatings.data.reduce((s:number,r:any)=>s+(r.rating||0),0)/revRatings.data.length:0;
      const avgRest=restRatings.data?.length?restRatings.data.reduce((s:number,r:any)=>s+(r.rating||0),0)/restRatings.data.length:0;
      const rd:Record<number,number>={1:0,2:0,3:0,4:0,5:0};
      revRatings.data?.forEach((r:any)=>{if(r.rating>=1&&r.rating<=5)rd[Math.round(r.rating)]++;});
      const months:string[]=[];for(let i=11;i>=0;i--)months.push(new Date(now.getFullYear(),now.getMonth()-i,1).toISOString().slice(0,7));
      const cbm=(d:any[]|null)=>{const m:Record<string,number>={};d?.forEach((i:any)=>{const k=i.created_at?.slice(0,7);if(k)m[k]=(m[k]||0)+1;});let c=0;return months.map(mo=>{c+=m[mo]||0;return{month:mo,count:c};});};
      // ponytail: leaderboard = top 5 by review_count; list popularity = per-list restaurant count
      const listPop:Record<string,number>={};
      const listName:Record<string,string>={};
      topLists.data?.forEach((lr:any)=>{if(lr.list_id){listPop[lr.list_id]=(listPop[lr.list_id]||0)+1;listName[lr.list_id]=lr.lists?.name||'Lista';}});
      const popularLists = Object.keys(listPop)
        .map((id)=>({ id, name:listName[id], count:listPop[id] }))
        .sort((a:any,b:any)=>b.count-a.count).slice(0,5);
      // ponytail: composite 0-5 score, rating 60 / review-volume 30 / price 10
      const scoreRestaurant=(r:any)=>{
        const rating=Math.min(Math.max(r.rating||0,0),5);
        const reviewScore=Math.min(Math.log10((r.review_count||0)+1)/Math.log10(51),1)*5;
        const p=r.price_per_person||0;
        const priceScore=p>=60?0:Math.max(0,Math.min((60-p)/60*5,5));
        return Math.round((0.6*rating+0.3*reviewScore+0.1*priceScore)*10)/10;
      };
      const topSorted=[...(topRestaurants.data||[])].sort((a:any,b:any)=>scoreRestaurant(b)-scoreRestaurant(a)).slice(0,5);

      // ponytail: client-side agg of user_events (jsonb metadata) - fine at this scale, SQL later
      const qc:Record<string,number>={};
      const fc:Record<string,number>={};
      userEvents.data?.forEach((e:any)=>{
        if(e.event==='search_performed'){ const q=e.metadata?.query; if(q) qc[q]=(qc[q]||0)+1; }
        else if(e.event==='filter_applied'){ Object.entries(e.metadata||{}).forEach(([k,v]:[string,any])=>{ if(v) fc[k]=(fc[k]||0)+1; }); }
      });
      const behavior={ events30d:userEventsCount.count||0, topSearches:Object.entries(qc).map(([q,c])=>({query:q,count:c})).sort((a:any,b:any)=>b.count-a.count).slice(0,10), filters:Object.entries(fc).map(([f,c])=>({filter:f,count:c})).sort((a:any,b:any)=>b.count-a.count) };
      return {behavior,topRestaurants:topSorted.map((r:any)=>({id:r.id,name:r.name,rating:r.rating||0,review_count:r.review_count||0,price_per_person:r.price_per_person||0,score:scoreRestaurant(r)})),topLists:popularLists,users:{total:usersCount.count||0,active:0,newThisMonth:newUsersMonth.count||0,newThisWeek:newUsersWeek.count||0,admins:adminsCount.count||0,growthRate:0},restaurants:{total:restaurantsCount.count||0,averageRating:Math.round(avgRest*10)/10,newThisMonth:newRestMonth.count||0,byCuisine:cuisineData.data?.map((c:any)=>({cuisine:c.name,count:c.restaurant_cuisine_types?.[0]?.count||0}))||[]},reviews:{total:reviewsCount.count||0,averageRating:Math.round(avgRev*10)/10,byRating:Object.entries(rd).map(([r,c])=>({rating:Number(r),count:c as number})),newThisMonth:newReviewsMonth.count||0},lists:{total:listsCount.count||0,public:publicLists.count||0,private:privateLists.count||0,collaborative:collabLists.count||0,totalItems:listItems.count||0},meals:{total:mealsCount.count||0,upcoming:upcomingMeals.count||0,thisMonth:mealsMonth.count||0},growth:{users:cbm(usersGrowth.data),restaurants:cbm(restGrowth.data),reviews:cbm(revGrowth.data)}};
    }, 60);

    return NextResponse.json({data:stats});
  } catch(error:any){
    console.error('Admin stats error:',error?.message || error?.code || error);
    return NextResponse.json({error:error.message||'Internal server error',code:'INTERNAL_ERROR'},{status:500});
  }
}
