export const prerender = false;

export async function POST({ request, locals }) {
  try {
    /**
     * ENVIRONMENT VARIABLE RESOLUTION
     * 1. locals?.runtime?.env -> Cloudflare Pages (Live)
     * 2. import.meta.env      -> Astro standard (Local)
     * 3. process.env          -> Node standard (Fallback)
     */
    const PLUNK_API_KEY = 
      locals?.runtime?.env?.PLUNK_API_KEY || 
      import.meta.env.PLUNK_API_KEY || 
      process.env.PLUNK_API_KEY;

    if (!PLUNK_API_KEY) {
      console.error('Configuration Error: PLUNK_API_KEY not found.');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error',
        details: 'API Key is missing from the server environment.' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Parse Data (including the 'middle_name' honeypot)
    const data = await request.json();
    const { email, name, message, gdprConsent, middle_name } = data;

    // 2. HONEYPOT TRAP (Anti-Spam)
    // If a bot fills this hidden field, we stop here and never call Plunk.
    if (middle_name && middle_name.length > 0) {
      console.warn('Bot detected via honeypot field. Terminating request.');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Thank you! A confirmation email has been sent.' 
        }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validation
    if (!email || !gdprConsent) {
      return new Response(JSON.stringify({ error: 'Email and GDPR consent are required' }), { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400 });
    }

    // 4. Data Preparation
    const submittedAt = new Date().toLocaleString('en-GB', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });

    const displayName = name || 'there';
    const submissionDetails = `
Email:     ${email}
Name:      ${name || 'Not provided'}
Message:   ${message || 'No message provided'}
Submitted: ${submittedAt}
`.trim();

    // 5. User Email Body (The "Friendly" version)
    const userEmailBody = `Hi ${displayName},

Thank you for registering your interest in the Zin App.
We will contact you soon to let you know when the Zin App is open.

<code style="font-family: monospace; padding: 12px; display: block; background-color: #f9f9f9; border-left: 3px solid #ccc;">
YOUR SUBMISSION DETAILS:
------------------------
${submissionDetails}
-------------------------
</code>

If you have any questions in the meantime, feel free to reply to this email.

Best regards,
The Zin App Team

---
This email was sent to ${email} because you registered your interest at zincontent.com`.replace(/\n/g, '<br />');

    // 6. Admin Email Body (The "Lead" version with fail-safe Reply Button)
    const adminEmailBody = `
<div style="font-family: sans-serif; line-height: 1.5; color: #111;">
  <h3 style="color: #007bff;">🚀 New Registration Lead</h3>
  <p>A new user has registered interest via the website.</p>
  
  <code style="display: block; background: #f4f4f4; padding: 15px; border: 1px solid #ddd; font-family: monospace;">
    ${submissionDetails.replace(/\n/g, '<br />')}
  </code>

  <div style="margin-top: 20px;">
    <a href="mailto:${email}?subject=Regarding your Zin App interest" 
       style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
       Click to Reply Directly
    </a>
  </div>
  <p style="font-size: 12px; color: #666; margin-top: 10px;">
    <em>Note: If the button above doesn't work, reply to this email manually or copy the email from the code block.</em>
  </p>
</div>
`;

    // 7. Fire both emails simultaneously using Promise.all
    const [userResponse, adminResponse] = await Promise.all([
      // Send to User
      fetch('https://next-api.useplunk.com/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PLUNK_API_KEY}`
        },
        body: JSON.stringify({
          to: email,
          subject: 'Thank you for registering your interest in the Zin App',
          body: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">${userEmailBody}</div>`,
          from: 'info@zincontent.com',
          name: 'Zin App'
        })
      }),

      // Send to Admin
      fetch('https://next-api.useplunk.com/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PLUNK_API_KEY}`
        },
        body: JSON.stringify({
          to: 'info@zincontent.com',
          subject: `New Lead: ${name || email}`,
          body: adminEmailBody,
          from: 'info@zincontent.com',
          name: 'Zin App System'
        })
      })
    ]);

    // 8. Error Handling
    if (!userResponse.ok || !adminResponse.ok) {
      const uErr = await userResponse.text();
      const aErr = await adminResponse.text();
      console.error('Plunk API Error Details:', { user: uErr, admin: aErr });
      throw new Error('Failed to send emails');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Thank you! A confirmation email has been sent.' }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Critical endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process your request.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}