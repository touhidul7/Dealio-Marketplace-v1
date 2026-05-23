'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createGHLContact } from '@/lib/ghl';

export async function submitScorecardLead(formData) {
  const supabase = createAdminClient();
  
  // attempt to insert into valuation_leads (might fail if table doesn't exist yet)
  const { error } = await supabase
    .from('valuation_leads')
    .insert([{
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.companyName,
      source: 'exit_readiness_scorecard',
      lead_type: 'seller_exit_readiness',
      page_url: '/exit-readiness-scorecard'
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
      source: 'Exit Readiness Scorecard',
      tags: ['exit-readiness-scorecard', 'seller-lead'],
      customData: {
        'Company': formData.companyName || 'N/A',
        'Exit Readiness Score': formData.score || 'N/A',
        'Exit Readiness Rating': formData.rating || 'N/A',
        'Score Percentage': formData.scorePercentage || 'N/A'
      }
    });
  } catch (ghlError) {
    console.error('GHL Sync Error:', ghlError);
  }

  return { success: true };
}
