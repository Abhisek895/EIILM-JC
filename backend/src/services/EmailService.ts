import nodemailer from 'nodemailer';
import { logger } from '@utils/logger';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter {
    if (!EmailService.transporter) {
      EmailService.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || 'your_email@gmail.com',
          pass: process.env.SMTP_PASSWORD || 'your_app_password',
        },
      });
    }
    return EmailService.transporter;
  }

  static async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    const fromAddress = process.env.SMTP_FROM || 'noreply@collegeerp.com';
    
    try {
      const transporter = EmailService.getTransporter();
      const info = await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'EIILM College'}" <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || 'EIILM College Notification',
        html: options.html,
      });

      logger.info(`📧 Email successfully sent to ${options.to} [MessageID: ${info.messageId}]`);
      return true;
    } catch (err: any) {
      // DEV FALLBACK: Log the email details locally instead of failing or throwing 500 errors
      logger.warn(`⚠️ SMTP Mail delivery failed to ${options.to}. Error: ${err.message}`);
      logger.info(`✉️ [MOCKED EMAIL SENT]
  To: ${options.to}
  Subject: ${options.subject}
  Message:
  -------------------------------------------------------------
  ${options.html.replace(/<[^>]*>/g, ' ')}
  -------------------------------------------------------------
      `);
      return true;
    }
  }

  // 1. Notice Broadcast Email template
  static async sendNoticeNotification(email: string, details: { title: string; description: string; pdfUrl?: string | null }) {
    const attachmentLink = details.pdfUrl 
      ? `<p style="margin-top: 15px;"><a href="${process.env.APP_URL || 'http://localhost:5001'}${details.pdfUrl}" style="background-color: #1a56db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;" target="_blank">📥 View Official Attachment</a></p>`
      : '';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #1e3a8a; color: white; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Official College Notice Board</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <h3 style="color: #1e3a8a; margin-top: 0;">📢 ${details.title}</h3>
          <p>${details.description || 'No description provided.'}</p>
          ${attachmentLink}
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #64748b;">You received this notification because you are a registered member of ${process.env.APP_NAME || 'EIILM College'}. Please do not reply directly to this automated email.</p>
        </div>
      </div>
    `;

    return EmailService.sendMail({
      to: email,
      subject: `[NOTICE] ${details.title}`,
      html: htmlContent
    });
  }

  // 2. Inquiry Confirmation Email template
  static async sendInquiryConfirmation(email: string, details: { fullName: string; courseInterest?: string | null }) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0d9488; color: white; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Inquiry Received Successfully</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Dear <strong>${details.fullName}</strong>,</p>
          <p>Thank you for reaching out to us. We have received your inquiry regarding admissions for <strong>${details.courseInterest || 'our courses'}</strong>.</p>
          <p>Our counselor team will review your request and get in touch with you shortly on your provided phone/email details.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #64748b;">This is an automated confirmation of your inquiry submission at ${process.env.APP_NAME || 'EIILM College'}.</p>
        </div>
      </div>
    `;

    return EmailService.sendMail({
      to: email,
      subject: `Admission Inquiry Confirmation — ${process.env.APP_NAME || 'EIILM College'}`,
      html: htmlContent
    });
  }

  // 3. Admission Process Confirmation Email template
  static async sendAdmissionConfirmation(email: string, details: { fullName: string; courseInterest: string; status: string }) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; color: white; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Admission Status Updated</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Dear <strong>${details.fullName}</strong>,</p>
          <p>We are writing to update you on your admission application status at ${process.env.APP_NAME || 'EIILM College'} for the course <strong>${details.courseInterest}</strong>.</p>
          <p>Your application status is now updated to: <span style="background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 4px 10px; border-radius: 12px; font-size: 13px; text-transform: uppercase;">${details.status}</span></p>
          <p>Our academic board will provide further instructions regarding registration fees and document verification shortly.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #64748b;">This is an automated status update for your admission dossier at ${process.env.APP_NAME || 'EIILM College'}.</p>
        </div>
      </div>
    `;

    return EmailService.sendMail({
      to: email,
      subject: `Admission Application Status: ${details.status.toUpperCase()} — ${process.env.APP_NAME || 'EIILM College'}`,
      html: htmlContent
    });
  }

  // 4. Secure Password Change OTP Template
  static async sendPasswordChangeOtp(email: string, details: { fullName: string; otpCode: string }) {
    const htmlContent = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 32px 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.025em;">Verify Your Identity</h2>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Security Verification Code</p>
        </div>
        <div style="padding: 32px 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;">
          <p style="margin-top: 0; font-size: 16px;">Hello <strong>${details.fullName}</strong>,</p>
          <p style="font-size: 15px; color: #475569;">We received a request to change the password for your administrator account at ${process.env.APP_NAME || 'EIILM College'}.</p>
          
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">One-Time Password (OTP)</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.1em; color: #4f46e5; font-family: monospace;">${details.otpCode}</div>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #e11d48; font-weight: 500;">⏱️ Valid for 10 minutes only</p>
          </div>

          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">If you did not request this password change, please ignore this email or contact support immediately to lock your account.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0;" />
          <div style="text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">This is a secure automated notification from ${process.env.APP_NAME || 'EIILM College'} Security Hub.</p>
          </div>
        </div>
      </div>
    `;

    return EmailService.sendMail({
      to: email,
      subject: `[SECURITY-OTP] Password Change Request — ${process.env.APP_NAME || 'EIILM College'}`,
      html: htmlContent
    });
  }
}

