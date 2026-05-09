import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// We need a service role client to fetch emails of users, because ordinary RLS might block it
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendKey);

export async function POST(req) {
  try {
    // Basic auth check (you should configure this secret in Supabase Webhook headers)
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, table, record, old_record } = body;

    // 1. New Inquiry
    if (table === 'inquiries' && type === 'INSERT') {
      const listingId = record.listing_id;

      // Get listing details and owner email
      const { data: listing } = await supabase
        .from('listings')
        .select('title, owner_user_id, lead_owner_type, users!owner_user_id(email, full_name)')
        .eq('id', listingId)
        .single();

      if (listing && resendKey) {
        const isDealioManaged = listing.lead_owner_type === 'dealio';
        let targetEmail = listing.users?.email;

        if (isDealioManaged) {
          const { data: admins } = await supabase.from('users').select('email').eq('role', 'admin');
          const adminEmails = admins?.map(a => a.email).filter(Boolean) || [];
          if (adminEmails.length > 0) {
            targetEmail = adminEmails;
          }
        }

        if (targetEmail && (typeof targetEmail === 'string' || targetEmail.length > 0)) {
          const { error: resendErr } = await resend.emails.send({
            from: 'Dealio Marketplace <notifications@brittosoft.site>',
            to: targetEmail,
            subject: `New Inquiry for: ${listing.title}`,
            html: `
              <h2>You have a new inquiry!</h2>
              <p>Someone is interested in ${isDealioManaged ? 'the Dealio-managed listing' : 'your listing'}: <strong>${listing.title}</strong></p>
              <p><strong>Name:</strong> ${record.anonymous_name || 'Anonymous'}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="border-left: 4px solid #eee; padding-left: 10px; margin-left: 0;">
                ${record.message || 'No message provided.'}
              </blockquote>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/${isDealioManaged ? 'admin' : 'seller/inquiries'}" style="padding: 10px 16px; background: #0F52BA; color: white; text-decoration: none; border-radius: 6px;">View Inquiry in Dashboard</a></p>
            `,
          });

          if (resendErr) {
            console.error('Resend Error (Inquiry):', resendErr);
          }
        }
      }
    }

    // 1.5. Inquiry Status Update (Notifies the Buyer)
    if (table === 'inquiries' && type === 'UPDATE') {
      if (old_record && old_record.inquiry_status !== record.inquiry_status) {
        let buyerEmail = record.anonymous_email;
        let buyerName = record.anonymous_name || 'there';

        // If they are a registered user, fetch their real email
        if (record.buyer_user_id) {
          const { data: buyerUser } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', record.buyer_user_id)
            .single();
            
          if (buyerUser && buyerUser.email) {
            buyerEmail = buyerUser.email;
            buyerName = buyerUser.full_name || buyerName;
          }
        }

        const { data: listing } = await supabase
          .from('listings')
          .select('title')
          .eq('id', record.listing_id)
          .single();

        if (buyerEmail && resendKey) {
          const { error: resendErr } = await resend.emails.send({
            from: 'Dealio Marketplace <notifications@brittosoft.site>',
            to: buyerEmail,
            subject: `Update on your inquiry: ${listing?.title || 'Listing'}`,
            html: `
              <h2>Inquiry Status Update</h2>
              <p>Hi ${buyerName},</p>
              <p>The seller has updated the status of your inquiry for <strong>${listing?.title || 'the listing'}</strong>.</p>
              <p>New Status: <strong style="color: #0F52BA; text-transform: capitalize;">${record.inquiry_status}</strong></p>
              <p>If the seller needs more information, they will reach out to you directly.</p>
            `,
          });

          if (resendErr) {
            console.error('Resend Error (Inquiry Update):', resendErr);
          }
        }
      }
    }

    // 2. Service Request Status Update
    if (table === 'service_requests' && type === 'UPDATE') {
      // Only email if status actually changed
      if (old_record && old_record.status !== record.status) {
        const userId = record.user_id;

        const { data: user } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', userId)
          .single();

        if (user && user.email && resendKey) {
          const statusLabels = {
            assigned: 'Assigned to an Advisor',
            in_progress: 'In Progress',
            complete: 'Completed',
            canceled: 'Canceled'
          };
          const prettyStatus = statusLabels[record.status] || record.status;
          
          const { error: resendErr } = await resend.emails.send({
            from: 'Dealio Advisory <advisory@brittosoft.site>',
            to: user.email,
            subject: `Service Request Update: ${prettyStatus}`,
            html: `
              <h2>Update on your Service Request</h2>
              <p>Hi ${user.full_name || 'there'},</p>
              <p>Your request for <strong>${record.request_type.replace(/_/g, ' ')}</strong> has been updated to: <strong style="color: #0F52BA;">${prettyStatus}</strong>.</p>
              <p>If you have any questions, reply to this email or check your seller dashboard.</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/seller/services" style="padding: 10px 16px; background: #0F52BA; color: white; text-decoration: none; border-radius: 6px;">View Request Status</a></p>
            `,
          });

          if (resendErr) {
            console.error('Resend Error (Service):', resendErr);
          }
        }
      }
    }

    // 3. Listing Approval (Status Update to 'active')
    if (table === 'listings' && type === 'UPDATE') {
      if (old_record && old_record.status !== 'active' && record.status === 'active') {
        const userId = record.owner_user_id;

        const { data: user } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', userId)
          .single();

        if (user && user.email && resendKey) {
          const { error: resendErr } = await resend.emails.send({
            from: 'Dealio Marketplace <notifications@brittosoft.site>',
            to: user.email,
            subject: 'Your Dealio Listing is Now Live! 🎉',
            html: `
              <h2>Your listing has been approved!</h2>
              <p>Hi ${user.full_name || 'there'},</p>
              <p>Great news! Your listing for <strong>${record.title}</strong> has been reviewed and approved by our team.</p>
              <p>It is now live on the Dealio Marketplace and visible to potential buyers.</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/listings/${record.id}" style="padding: 10px 16px; background: #0F52BA; color: white; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 12px;">View Your Live Listing</a></p>
            `,
          });

          if (resendErr) {
            console.error('Resend Error (Listing Approval):', resendErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
