'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createGHLContact } from '@/lib/ghl';

export async function submitBuyerProfile(formData) {
  const supabase = createAdminClient();
  
  // attempt to insert into valuation_leads (might fail if table doesn't exist yet)
  const { error } = await supabase
    .from('valuation_leads')
    .insert([{
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.buyerType,
      province: formData.locations?.join(', ') || '',
      industry: formData.industries?.join(', ') || '',
      annual_revenue: formData.budgetMax || null,
      annual_earnings: formData.ebitdaMax || null,
      source: 'buyer_profile_builder',
      lead_type: 'buyer_profile',
      page_url: '/buyer-profile-builder'
    }]);

  if (error) {
    console.error('Failed to insert into valuation_leads (table might not exist):', error);
  }

  // Always attempt to sync to GHL
  try {
    await createGHLContact({
      firstName: formData.name?.split(' ')[0] || '',
      lastName: formData.name?.split(' ').slice(1).join(' ') || '',
      email: formData.email,
      phone: formData.phone,
      source: 'Buyer Profile Builder',
      tags: ['buyer-profile-builder', 'buyer-lead'],
      customData: {
        'Buyer Type': formData.buyerType || 'N/A',
        'Industries of Interest': formData.industries?.join(', ') || 'N/A',
        'Budget Range': formData.budgetRange || 'N/A',
        'Revenue Range': formData.revenueRange || 'N/A',
        'EBITDA Range': formData.ebitdaRange || 'N/A',
        'Preferred Locations': formData.locations?.join(', ') || 'N/A',
        'Acquisition Timeline': formData.timeline || 'N/A',
        'Source of Funds': formData.fundsSource || 'N/A'
      }
    });
  } catch (ghlError) {
    console.error('GHL Sync Error:', ghlError);
  }

  return { success: true };
}
