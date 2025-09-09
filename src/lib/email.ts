import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@functionprovider.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - Function Provider</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #1D1D1F;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: #4A5FBF;
              margin-bottom: 8px;
            }
            .tagline {
              font-size: 14px;
              color: #8E8E93;
            }
            .content {
              background: #FFFFFF;
              border: 1px solid #F5F5F7;
              border-radius: 12px;
              padding: 40px;
              margin: 20px 0;
            }
            .title {
              font-size: 28px;
              font-weight: 600;
              color: #1D1D1F;
              margin-bottom: 20px;
              text-align: center;
            }
            .description {
              font-size: 16px;
              color: #8E8E93;
              margin-bottom: 30px;
              text-align: center;
            }
            .button {
              display: inline-block;
              background: #4A5FBF;
              color: #FFFFFF;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 500;
              margin: 20px auto;
              text-align: center;
              display: block;
              width: fit-content;
            }
            .code-section {
              background: #F5F5F7;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .verification-code {
              font-size: 24px;
              font-weight: 600;
              letter-spacing: 8px;
              color: #4A5FBF;
              font-family: 'Courier New', monospace;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              color: #8E8E93;
              margin-top: 40px;
            }
            .security-note {
              background: #E8E5F3;
              padding: 16px;
              border-radius: 8px;
              margin: 20px 0;
              font-size: 14px;
              color: #4A5FBF;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Function Provider</div>
            <div class="tagline">Function Solves Problem</div>
          </div>

          <div class="content">
            <h1 class="title">Verify Your Email Address</h1>
            <p class="description">
              Please click the button below to verify your email address and activate your account.
            </p>

            <a href="${verificationUrl}" class="button">Verify Email Address</a>

            <div class="security-note">
              <strong>Security Notice:</strong> If you didn't create an account with Function Provider, please ignore this email.
            </div>
          </div>

          <div class="footer">
            <p>This verification link will expire in 24 hours.</p>
            <p>© 2024 Function Provider. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Function Provider',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - Function Provider</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #1D1D1F;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: #4A5FBF;
              margin-bottom: 8px;
            }
            .tagline {
              font-size: 14px;
              color: #8E8E93;
            }
            .content {
              background: #FFFFFF;
              border: 1px solid #F5F5F7;
              border-radius: 12px;
              padding: 40px;
              margin: 20px 0;
            }
            .title {
              font-size: 28px;
              font-weight: 600;
              color: #1D1D1F;
              margin-bottom: 20px;
              text-align: center;
            }
            .description {
              font-size: 16px;
              color: #8E8E93;
              margin-bottom: 30px;
              text-align: center;
            }
            .button {
              display: inline-block;
              background: #4A5FBF;
              color: #FFFFFF;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 500;
              margin: 20px auto;
              text-align: center;
              display: block;
              width: fit-content;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              color: #8E8E93;
              margin-top: 40px;
            }
            .security-note {
              background: #E8E5F3;
              padding: 16px;
              border-radius: 8px;
              margin: 20px 0;
              font-size: 14px;
              color: #4A5FBF;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Function Provider</div>
            <div class="tagline">Function Solves Problem</div>
          </div>

          <div class="content">
            <h1 class="title">Reset Your Password</h1>
            <p class="description">
              We received a request to reset your password. Click the button below to create a new password.
            </p>

            <a href="${resetUrl}" class="button">Reset Password</a>

            <div class="security-note">
              <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </div>
          </div>

          <div class="footer">
            <p>This password reset link will expire in 24 hours.</p>
            <p>© 2024 Function Provider. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Function Provider',
      html,
    });
  }
}

export default new EmailService();


