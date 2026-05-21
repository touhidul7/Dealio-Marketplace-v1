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
    const expectedAuth = `Bearer ${process.env.WEBHOOK_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      console.error(`[Webhook Unauthorized] Received header: "${authHeader || 'none'}" - Expected secret matches configured WEBHOOK_SECRET: ${process.env.WEBHOOK_SECRET ? 'YES' : 'NO'}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, table, record, old_record } = body;
    console.log(`[Webhook Triggered] Table: "${table}", Type: "${type}", Record ID: "${record?.id || 'unknown'}"`);

    // 1. New Inquiry (INSERT)
    if (table === 'inquiries' && type === 'INSERT') {
      const listingId = record.listing_id;
      console.log(`[New Inquiry Webhook] Processing listing_id: ${listingId}`);

      // Get listing details and owner email
      const { data: listing, error: dbErr } = await supabase
        .from('listings')
        .select('title, owner_user_id, lead_owner_type, users!owner_user_id(email, full_name)')
        .eq('id', listingId)
        .single();

      if (dbErr) {
        console.error('[New Inquiry Webhook] Database fetch error:', dbErr);
      }

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
          console.log(`[New Inquiry Webhook] Sending Resend email to: ${targetEmail} for listing: "${listing.title}"`);
          const { error: resendErr } = await resend.emails.send({
            from: 'Dealio Marketplace <notifications@dealiomarketplace.com>',
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
            console.error('[New Inquiry Webhook] Resend Error:', resendErr);
          } else {
            console.log('[New Inquiry Webhook] Email sent successfully.');
          }
        } else {
          console.warn('[New Inquiry Webhook] No target email found for listing owner.');
        }
      } else {
        console.warn(`[New Inquiry Webhook] Listing details or Resend key missing. Listing exists: ${!!listing}, Resend key exists: ${!!resendKey}`);
      }
    }

    // 1.5. Inquiry Status Update (Notifies the Buyer)
    if (table === 'inquiries' && type === 'UPDATE') {
      const oldStatus = old_record?.inquiry_status;
      const newStatus = record?.inquiry_status;
      console.log(`[Inquiry Update Webhook] Old Status: "${oldStatus || 'none'}", New Status: "${newStatus || 'none'}"`);

      if (newStatus && (!old_record || oldStatus !== newStatus)) {
        let buyerEmail = record.anonymous_email;
        let buyerName = record.anonymous_name || 'there';

        // If they are a registered user, fetch their real email
        if (record.buyer_user_id) {
          const { data: buyerUser, error: uErr } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', record.buyer_user_id)
            .single();
            
          if (uErr) {
            console.error('[Inquiry Update Webhook] Error fetching buyer details:', uErr);
          }

          if (buyerUser && buyerUser.email) {
            buyerEmail = buyerUser.email;
            buyerName = buyerUser.full_name || buyerName;
          }
        }

        const { data: listing, error: lErr } = await supabase
          .from('listings')
          .select('title')
          .eq('id', record.listing_id)
          .single();

        if (lErr) {
          console.error('[Inquiry Update Webhook] Error fetching listing details:', lErr);
        }

        if (buyerEmail && resendKey) {
          console.log(`[Inquiry Update Webhook] Sending Resend email to buyer: ${buyerEmail} (${buyerName}) for status: "${newStatus}"`);
          const { error: resendErr } = await resend.emails.send({
            from: 'Dealio Marketplace <notifications@dealiomarketplace.com>',
            to: buyerEmail,
            subject: `Update on your inquiry: ${listing?.title || 'Listing'}`,
            html: `
              <h2>Inquiry Status Update</h2>
              <p>Hi ${buyerName},</p>
              <p>The seller has updated the status of your inquiry for <strong>${listing?.title || 'the listing'}</strong>.</p>
              <p>New Status: <strong style="color: #0F52BA; text-transform: capitalize;">${newStatus}</strong></p>
              <p>If the seller needs more information, they will reach out to you directly.</p>
            `,
          });

          if (resendErr) {
            console.error('[Inquiry Update Webhook] Resend Error:', resendErr);
          } else {
            console.log('[Inquiry Update Webhook] Email sent successfully.');
          }
        } else {
          console.warn(`[Inquiry Update Webhook] Buyer email or Resend key missing. Email: "${buyerEmail || 'none'}", Resend key: ${!!resendKey}`);
        }
      } else {
        console.log('[Inquiry Update Webhook] Status did not change. Skipping email notification.');
      }
    }

    // 2. Service Request Status Update
    if (table === 'service_requests' && type === 'UPDATE') {
      const oldStatus = old_record?.status;
      const newStatus = record?.status;
      console.log(`[Service Request Webhook] Old Status: "${oldStatus || 'none'}", New Status: "${newStatus || 'none'}"`);

      // Only email if status actually changed
      if (newStatus && (!old_record || oldStatus !== newStatus)) {
        const userId = record.user_id;

        const { data: user, error: uErr } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', userId)
          .single();

        if (uErr) {
          console.error('[Service Request Webhook] Error fetching user details:', uErr);
        }

        if (user && user.email && resendKey) {
          const statusLabels = {
            assigned: 'Assigned to an Advisor',
            in_progress: 'In Progress',
            complete: 'Completed',
            canceled: 'Canceled'
          };
          const prettyStatus = statusLabels[newStatus] || newStatus;
          
          console.log(`[Service Request Webhook] Sending Resend email to user: ${user.email} for status: "${prettyStatus}"`);
          const { error: resendErr } = await resend.emails.send({
            from: 'Dealio Advisory <advisory@dealiomarketplace.com>',
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
            console.error('[Service Request Webhook] Resend Error:', resendErr);
          } else {
            console.log('[Service Request Webhook] Email sent successfully.');
          }
        } else {
          console.warn(`[Service Request Webhook] User details or Resend key missing. User exists: ${!!user}, Resend key: ${!!resendKey}`);
        }
      } else {
        console.log('[Service Request Webhook] Status did not change. Skipping email.');
      }
    }

    // 3. Listing Approval (Status Update to 'active')
    if (table === 'listings' && type === 'UPDATE') {
      const oldStatus = old_record?.status;
      const newStatus = record?.status;
      console.log(`[Listing Update Webhook] Old Status: "${oldStatus || 'none'}", New Status: "${newStatus || 'none'}"`);

      if (newStatus === 'active' && (!old_record || oldStatus !== 'active')) {
        const userId = record.owner_user_id;

        const { data: user, error: uErr } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', userId)
          .single();

        if (uErr) {
          console.error('[Listing Update Webhook] Error fetching user details:', uErr);
        }

        if (user && user.email && resendKey) {
          console.log(`[Listing Update Webhook] Sending approval email to owner: ${user.email} for listing: "${record.title}"`);
          const { error: resendErr } = await resend.emails.send({
            from: 'Dealio Marketplace <notifications@dealiomarketplace.com>',
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
            console.error('[Listing Update Webhook] Resend Error:', resendErr);
          } else {
            console.log('[Listing Update Webhook] Email sent successfully.');
          }
        } else {
          console.warn(`[Listing Update Webhook] Owner details or Resend key missing. User exists: ${!!user}, Resend key: ${!!resendKey}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Webhook System Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
