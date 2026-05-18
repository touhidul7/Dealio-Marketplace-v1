'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createGHLContact } from '@/lib/ghl';

export async function submitValuationLead(formData) {
  const supabase = createAdminClient();
  
  // attempt to insert into valuation_leads (might fail if table doesn't exist yet)
  const { error } = await supabase
    .from('valuation_leads')
    .insert([{
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.companyName,
      province: formData.province,
      industry: formData.industry,
      annual_revenue: formData.annualRevenue,
      annual_earnings: formData.annualEarnings,
      valuation_low: formData.valuationLow,
      valuation_high: formData.valuationHigh,
      source: 'business_valuation_calculator',
      lead_type: 'seller_valuation',
      page_url: '/business-valuation-calculator'
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
      source: 'Business Valuation Calculator',
      tags: ['business-valuation-calculator', 'seller-lead'],
      customData: {
        'Company': formData.companyName || 'N/A',
        'Business Industry': formData.industry || 'N/A',
        'Province': formData.province || 'N/A',
        'Annual Revenue': formData.annualRevenue || 'N/A',
        'Annual Earnings (SDE/EBITDA)': formData.annualEarnings || 'N/A',
        'Valuation Low': formData.valuationLow || 'N/A',
        'Valuation High': formData.valuationHigh || 'N/A'
      }
    });
  } catch (ghlError) {
    console.error('GHL Sync Error:', ghlError);
  }

  return { success: true };
}
