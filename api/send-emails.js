export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { applicantEmail, applicantCompany, applicationId, referenceEmails } = req.body;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  try {
    // Send applicant confirmation email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: applicantEmail,
        subject: 'Credit Application Confirmation - Specialist Sales',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                <h2 style="color: #1b75bc;">Credit Application Received</h2>
                <p>Dear ${applicantCompany},</p>
                <p>Thank you for submitting your credit application to Specialist Sales Pty Ltd.</p>
                <p><strong>Application ID:</strong> ${applicationId}</p>
                <p>Our accounts team will contact your provided trade references to verify your creditworthiness. We will be in touch within 3-5 business days to update you on the status of your application.</p>
                <p>If you have any questions, please contact our accounts department at <strong>Accounts@SpecialistSales.com.au</strong> or call <strong>1800 780 317</strong>.</p>
                <p>Kind regards,<br><strong>Specialist Sales Pty Ltd</strong><br>PO Box 382, Toowoomba QLD 4350</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    // Send reference request emails
    for (const ref of referenceEmails) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: ref.email,
          subject: `Trade Reference Request - ${ref.applicantCompany}`,
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                  <h2 style="color: #1b75bc;">Trade Reference Request</h2>
                  <p>Hi ${ref.contactName},</p>
                  <p><strong>${ref.applicantCompany}</strong> has listed ${ref.company} as a trade reference in their credit application to Specialist Sales Pty Ltd.</p>
                  <p>We would appreciate your feedback on their trading history and credit reliability.</p>
                  <p><strong><a href="${ref.link}" style="background: #1b75bc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Reference Assessment</a></strong></p>
                  <p>The assessment takes approximately 2 minutes to complete.</p>
                  <p>Thank you for your assistance.</p>
                  <p>Kind regards,<br><strong>Specialist Sales Pty Ltd</strong><br>PO Box 382, Toowoomba QLD 4350<br>1800 780 317</p>
                </div>
              </body>
            </html>
          `,
        }),
      });
    }

    return res.status(200).json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send emails', details: error.message });
  }
}
