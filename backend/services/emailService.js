// services/emailService.js
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.isConfigured = false;
    this.initializeTransporter();
    this.loadTemplates();
  }

  initializeTransporter() {
    try {
      // Check if email credentials are provided
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️ Email credentials not found. Email service will be disabled.');
        return;
      }

      const config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      };

      this.transporter = nodemailer.createTransport(config);
      this.isConfigured = true;

      console.log('✅ Email transporter initialized');

    } catch (error) {
      console.error('❌ Email transporter initialization failed:', error.message);
      this.isConfigured = false;
    }
  }

  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      
      // Check if templates directory exists
      try {
        await fs.access(templatesDir);
      } catch {
        console.warn('⚠️ Email templates directory not found. Using default templates.');
        return;
      }

      const templateFiles = [
        'booking_confirmation.hbs',
        'payment_success.hbs',
        'payment_failure.hbs',
        'booking_reminder.hbs',
        'vehicle_ready.hbs',
        'welcome.hbs',
        'password_reset.hbs',
        'promotional.hbs',
        'system_message.hbs',
        'otp.hbs'
      ];

      for (const file of templateFiles) {
        const templatePath = path.join(templatesDir, file);
        try {
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const templateName = file.replace('.hbs', '');
          this.templates[templateName] = handlebars.compile(templateContent);
        } catch (error) {
          // Template not found, will use default
          const templateName = file.replace('.hbs', '');
          this.templates[templateName] = this.getDefaultTemplate();
        }
      }

      console.log(`✅ Loaded ${Object.keys(this.templates).length} email templates`);

    } catch (error) {
      console.error('❌ Error loading email templates:', error.message);
    }
  }

  getDefaultTemplate() {
    return handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content { 
            padding: 30px 20px; 
            background: white; 
          }
          .content p {
            margin: 15px 0;
            font-size: 16px;
          }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            opacity: 0.9;
          }
          .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f8f9fa;
            color: #666; 
            font-size: 14px; 
            border-top: 1px solid #e0e0e0;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>{{title}}</h1>
          </div>
          <div class="content">
            <p>{{message}}</p>
            {{#if additionalInfo}}
            <div class="info-box">
              {{additionalInfo}}
            </div>
            {{/if}}
            {{#if actionUrl}}
            <center>
              <a href="{{actionUrl}}" class="button">View Details</a>
            </center>
            {{/if}}
          </div>
          <div class="footer">
            <p><strong>Car Rental System</strong></p>
            <p>© 2025 Car Rental System. All rights reserved.</p>
            <p>Need help? Contact us at <a href="mailto:support@carrental.com">support@carrental.com</a></p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  async sendEmail({ to, subject, type, data }) {
    try {
      if (!this.isConfigured || !this.transporter) {
        console.warn(`⚠️ Email not sent to ${to}: Service not configured`);
        return {
          success: false,
          error: 'Email service not configured'
        };
      }

      // Validate email address
      if (!to || !this.isValidEmail(to)) {
        return {
          success: false,
          error: 'Invalid email address'
        };
      }

      const template = this.templates[type] || this.getDefaultTemplate();
      const html = template(data);

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Car Rental System',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html,
        text: data.message || this.stripHtml(html)
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent to ${to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        sentAt: new Date()
      };

    } catch (error) {
      console.error('❌ Email sending error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async sendOTP(user, otpCode) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Your OTP Code - Car Rental',
      type: 'otp',
      data: {
        title: 'OTP Verification',
        message: `Your One-Time Password (OTP) is: ${otpCode}`,
        additionalInfo: `This OTP is valid for 10 minutes. Please do not share this code with anyone.`,
        userName: user.name,
        otp: otpCode
      }
    });
  }

  async sendBookingConfirmation(user, bookingData) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Booking Confirmation - Car Rental',
      type: 'booking_confirmation',
      data: {
        title: 'Booking Confirmed!',
        message: `Hi ${user.name}, your booking has been confirmed successfully.`,
        userName: user.name,
        bookingId: bookingData.bookingId,
        vehicleName: bookingData.vehicleName,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        totalAmount: bookingData.totalAmount,
        additionalInfo: `Vehicle: ${bookingData.vehicleName}<br>Booking ID: #${bookingData.bookingId}<br>Pickup: ${bookingData.pickupDate}<br>Return: ${bookingData.returnDate}<br>Total: ₹${bookingData.totalAmount}`,
        actionUrl: `${process.env.FRONTEND_URL}/bookings/${bookingData.bookingId}`
      }
    });
  }

  async sendPaymentSuccess(user, paymentData) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Payment Successful - Car Rental',
      type: 'payment_success',
      data: {
        title: 'Payment Successful',
        message: `Hi ${user.name}, your payment has been processed successfully.`,
        userName: user.name,
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        bookingId: paymentData.bookingId,
        additionalInfo: `Amount: ₹${paymentData.amount}<br>Transaction ID: ${paymentData.transactionId}<br>Booking ID: #${paymentData.bookingId}`,
        actionUrl: `${process.env.FRONTEND_URL}/payments/${paymentData.transactionId}`
      }
    });
  }

  async sendPaymentFailure(user, paymentData) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Payment Failed - Car Rental',
      type: 'payment_failure',
      data: {
        title: 'Payment Failed',
        message: `Hi ${user.name}, we encountered an issue processing your payment.`,
        userName: user.name,
        amount: paymentData.amount,
        reason: paymentData.reason || 'Payment processing failed',
        bookingId: paymentData.bookingId,
        additionalInfo: `Reason: ${paymentData.reason || 'Unknown error'}<br>Amount: ₹${paymentData.amount}<br>Booking ID: #${paymentData.bookingId}`,
        actionUrl: `${process.env.FRONTEND_URL}/bookings/${paymentData.bookingId}/retry-payment`
      }
    });
  }

  async sendWelcome(user) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Car Rental System',
      type: 'welcome',
      data: {
        title: 'Welcome Aboard!',
        message: `Hi ${user.name}, welcome to Car Rental System! We're excited to have you.`,
        userName: user.name,
        additionalInfo: 'Start exploring our wide range of vehicles and book your perfect ride today!',
        actionUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    });
  }

  async sendPasswordReset(user, resetToken) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Car Rental',
      type: 'password_reset',
      data: {
        title: 'Password Reset',
        message: `Hi ${user.name}, we received a request to reset your password.`,
        userName: user.name,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
        expiresIn: '1 hour',
        additionalInfo: 'This link will expire in 1 hour. If you didn\'t request this, please ignore this email.',
        actionUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      }
    });
  }

  async sendBookingReminder(user, bookingData) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Booking Reminder - Car Rental',
      type: 'booking_reminder',
      data: {
        title: 'Booking Reminder',
        message: `Hi ${user.name}, this is a reminder about your upcoming booking.`,
        userName: user.name,
        vehicleName: bookingData.vehicleName,
        pickupDate: bookingData.pickupDate,
        pickupLocation: bookingData.pickupLocation,
        additionalInfo: `Vehicle: ${bookingData.vehicleName}<br>Pickup: ${bookingData.pickupDate}<br>Location: ${bookingData.pickupLocation}`,
        actionUrl: `${process.env.FRONTEND_URL}/bookings/${bookingData.bookingId}`
      }
    });
  }

  async sendCustomMessage(user, customMessage) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Message from Car Rental System',
      type: 'system_message',
      data: {
        title: 'Message',
        message: customMessage,
        userName: user.name
      }
    });
  }

  async verifyConnection() {
    if (!this.isConfigured || !this.transporter) {
      console.error('❌ Email service not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send messages');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      console.error('Please check your email credentials in .env file');
      return false;
    }
  }
}

export default new EmailService();