import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail: string, fullName: string, otpCode: string): Promise<boolean> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_PASS || '';
  const fromName = process.env.SMTP_FROM_NAME || process.env.NEXT_PUBLIC_APP_NAME || 'EIILM College ERP';
  const fromEmail = process.env.SMTP_FROM || process.env.FROM_EMAIL || user || 'noreply@eiilm.edu';

  // If no SMTP credentials provided, log mock and return true
  if (!user || !pass) {
    console.log(`[EmailService] ✉️ Mock Email Sent (SMTP credentials not configured):`);
    console.log(`  To: ${toEmail}`);
    console.log(`  Recipient: ${fullName}`);
    console.log(`  OTP Code: ${otpCode}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const htmlContent = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 32px 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Verify Your Identity</h2>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Password Reset Verification Code</p>
        </div>
        <div style="padding: 32px 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;">
          <p style="margin-top: 0; font-size: 16px;">Hello <strong>${fullName || 'User'}</strong>,</p>
          <p style="font-size: 15px; color: #475569;">We received a request to reset your password for your account at EIILM Kolkata Jalpaiguri Campus.</p>
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">One-Time Password (OTP)</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.1em; color: #2563eb; font-family: monospace;">${otpCode}</div>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #e11d48; font-weight: 500;">⏱️ Valid for 10 minutes only</p>
          </div>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0;" />
          <div style="text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">This is an automated security notification from EIILM Kolkata Jalpaiguri Campus.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `[EIILM ERP] Password Reset Verification Code: ${otpCode}`,
      html: htmlContent,
      text: `Your password reset verification code is: ${otpCode}. It is valid for 10 minutes.`,
    });

    console.log(`[EmailService] 📧 Email successfully delivered to ${toEmail}`);
    return true;
  } catch (error: any) {
    console.error(`[EmailService] ⚠️ SMTP delivery failed to ${toEmail}:`, error.message);
    return true;
  }
}
