import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Simple scoring function
const calculateMatchScore = (listing, buyer) => {
  let score = 0;
  let maxScore = 0;

  // Industry Match (40 pts)
  maxScore += 40;
  if (buyer.industry_focus && buyer.industry_focus.includes(listing.industry)) {
    score += 40;
  }

  // Geographic Match (20 pts)
  maxScore += 20;
  if (buyer.geographic_focus && (buyer.geographic_focus.includes(listing.province_state) || buyer.geographic_focus.includes('All'))) {
    score += 20;
  }

  // Deal Size Match (20 pts)
  if (listing.asking_price) {
    maxScore += 20;
    const min = buyer.deal_size_min || 0;
    const max = buyer.deal_size_max || Infinity;
    if (listing.asking_price >= min && listing.asking_price <= max) {
      score += 20;
    } else if (listing.asking_price >= min * 0.8 && listing.asking_price <= max * 1.2) {
      score += 10; // Partial match if within 20%
    }
  }

  // EBITDA Match (20 pts)
  if (listing.ebitda) {
    maxScore += 20;
    const min = buyer.ebitda_min || 0;
    const max = buyer.ebitda_max || Infinity;
    if (listing.ebitda >= min && listing.ebitda <= max) {
      score += 20;
    } else if (listing.ebitda >= min * 0.8 && listing.ebitda <= max * 1.2) {
      score += 10;
    }
  }

  // Normalize to 100
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, buyerProfileId, listingId } = body;
    const supabase = createAdminClient();

    if (action === 'evaluate_buyer' && buyerProfileId) {
      // Re-evaluate all active listings for this buyer
      const { data: buyer } = await supabase.from('buyer_profiles').select('*').eq('id', buyerProfileId).single();
      const { data: listings } = await supabase.from('listings').select('*').eq('status', 'active');
      
      if (!buyer || !listings) return NextResponse.json({ success: false });

      const matchesToInsert = [];
      for (const listing of listings) {
        const score = calculateMatchScore(listing, buyer);
        if (score >= 50) { // Only save matches 50%+
          matchesToInsert.push({
            buyer_profile_id: buyer.id,
            listing_id: listing.id,
            total_score: score,
            match_reasons: { industry: buyer.industry_focus?.includes(listing.industry) }
          });
        }
      }

      // Upsert matches (would need a unique constraint on buyer_profile_id, listing_id)
      // Since we don't have a specific upsert endpoint ready, we will delete old ones first
      await supabase.from('matches').delete().eq('buyer_profile_id', buyer.id);
      
      if (matchesToInsert.length > 0) {
        await supabase.from('matches').insert(matchesToInsert);
      }

      return NextResponse.json({ success: true, count: matchesToInsert.length });

    } else if (action === 'evaluate_listing' && listingId) {
      // Re-evaluate all buyers for this listing
      const { data: listing } = await supabase.from('listings').select('*').eq('id', listingId).single();
      const { data: buyers } = await supabase.from('buyer_profiles').select('*');

      if (!listing || !buyers) return NextResponse.json({ success: false });

      const matchesToInsert = [];
      for (const buyer of buyers) {
        const score = calculateMatchScore(listing, buyer);
        if (score >= 50) {
          matchesToInsert.push({
            buyer_profile_id: buyer.id,
            listing_id: listing.id,
            total_score: score,
            match_reasons: { industry: buyer.industry_focus?.includes(listing.industry) }
          });
        }
      }

      await supabase.from('matches').delete().eq('listing_id', listing.id);
      
      if (matchesToInsert.length > 0) {
        await supabase.from('matches').insert(matchesToInsert);
      }

      return NextResponse.json({ success: true, count: matchesToInsert.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (err) {
    console.error('Matching Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
