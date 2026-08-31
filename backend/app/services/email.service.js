import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Lazily initialize the transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not set in .env. Custom emails will not be sent.');
      return null;
    }
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send an onboarding/verification email to the newly registered user.
 * 
 * @param {string} toEmail - The user's email address
 * @param {string} firstName - The user's first name
 * @param {string} verificationLink - The Supabase generated confirmation link
 */
export const sendWelcomeEmail = async (toEmail, firstName) => {
  const mailTransporter = getTransporter();
  if (!mailTransporter) return false;

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #F4B400;">Welcome to DialectGo! 🎉</h1>
      </div>
      
      <p style="font-size: 16px;">Hi ${firstName},</p>
      
      <p style="font-size: 16px; line-height: 1.5;">
        Congratulations on successfully creating your account! We are thrilled to have you on board.
      </p>

      <p style="font-size: 16px; line-height: 1.5;">
        DialectGo is designed to help you break language barriers effortlessly. You can now log in to the app and start exploring all the features we have to offer.
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="dialectgo://" 
           style="background-color: #FFD54F; color: #421C00; padding: 14px 32px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; font-weight: bold; box-shadow: 0px 4px 6px rgba(0,0,0,0.1);">
          Open DialectGo
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        This email was sent automatically. If you didn't create an account, you can safely ignore this.
      </p>
    </div>
  `;

  try {
    const info = await mailTransporter.sendMail({
      from: `"DialectGo Team" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Welcome to DialectGo! 🎉',
      html: htmlTemplate,
    });
    console.log(`[EmailService] Welcome email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EmailService] Failed to send welcome email to ${toEmail}:`, error);
    return false;
  }
};
