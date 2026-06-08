export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { applicationId, applicantEmail, applicantCompany, referenceEmails, emailType, additionalRefLink } = req.body;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  try {
    // Send applicant confirmation email
    if (emailType === 'initial-submission' || !emailType) {
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
                  <p>Our accounts team will contact your provided trade contacts to provide a reference. We will be in touch in the coming days to update you on the status of your application.</p>
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
    } else if (emailType === 'send-back') {
      // Send "additional reference needed" email
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: applicantEmail,
          subject: `Additional Trade Reference Required - ${applicantCompany}`,
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                  <h2 style="color: #1b75bc;">Additional Trade Reference Needed</h2>
                  <p>Dear ${applicantCompany},</p>
                  <p>Thank you for your patience while we review your credit application. To help us complete our assessment, we require one additional trade reference.</p>
                  <p>Please provide details of another company you currently trade with or have traded with recently.</p>
                  <p style="text-align: center; margin: 25px 0;">
                    <a href="${additionalRefLink}" style="background: #b5481d; color: white; padding: 12px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Provide Additional Reference</a>
                  </p>
                  <p>The form takes approximately 2 minutes to complete. Once we receive this reference and follow up with them, we'll be in touch shortly with the outcome of your application.</p>
                  <p>If you have any questions, please contact our accounts department at <strong>Accounts@SpecialistSales.com.au</strong> or call <strong>1800 780 317</strong>.</p>
                  <p>Kind regards,<br><strong>Specialist Sales Pty Ltd</strong><br>PO Box 382, Toowoomba QLD 4350</p>
                </div>
              </body>
            </html>
          `,
        }),
      });
    } else if (emailType === 'additional-reference-request') {
      // Send email to the new reference
      const ref = singleReference;
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
                  <p style="text-align: center; margin: 25px 0;">
                    <a href="${ref.link}" style="background: #1b75bc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Complete Reference Assessment</a>
                  </p>
                  <p>The assessment takes approximately 2 minutes to complete.</p>
                  <p>Thank you for your assistance.</p>
                  <p>Kind regards,<br><strong>Specialist Sales Pty Ltd</strong><br>PO Box 382, Toowoomba QLD 4350<br>1800 780 317</p>
                </div>
              </body>
            </html>
          `,
        }),
      });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send emails', details: error.message });
  }
}
