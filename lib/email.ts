import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
// Set RESEND_FROM_EMAIL to your verified Resend sender (e.g. "noreply@yourdomain.com").
// Falls back to Resend's test address — only works when recipient matches your Resend account email.
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Smart Service Booker <notifications@bizskip.com>';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendSpotAvailableEmail(to: string, businessName: string, service: string) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your spot is confirmed at ${businessName}`,
    html: `<p>Great news! <strong>${esc(businessName)}</strong> has accepted your waitlist request for <strong>${esc(service)}</strong>. Your booking is confirmed — they'll be in touch shortly.</p>`,
  });
  if (error) throw error;
}

export async function sendYoureNextEmail(to: string, businessName: string, service: string) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `You're next at ${businessName}`,
    html: `<p><strong>${esc(businessName)}</strong> has notified you about your waitlist request for <strong>${esc(service)}</strong>. You may be contacted soon to confirm your spot.</p>`,
  });
  if (error) throw error;
}
