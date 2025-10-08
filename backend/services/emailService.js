import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    this.templates = {};
    this.loadTemplates();
  }

  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      const templateFiles = [
        'booking_confirmation.hbs',
        'payment_success.hbs',
        'payment_failure.hbs',
        'booking_reminder.hbs',
        'vehicle_ready.hbs',
        'welcome.hbs',
        'password_reset.hbs',
        'promotional.hbs',
        'system_message.hbs'
      ];

      for (const file of templateFiles) {
        const templatePath = path.join(templatesDir, file);
        try {
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const templateName = file.replace('.hbs', '');
          this.templates[templateName] = handlebars.compile(templateContent);
        } catch (error) {
          console.warn(`Template ${file} not found, using default`);
          this.templates[file.replace('.hbs', '')] = this.getDefaultTemplate();
        }
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  }

  getDefaultTemplate() {
    return handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>{{title}}</h1>
          </div>
          <div class="content">
            <p>{{message}}</p>
            {{#if actionUrl}}
            <a href="{{actionUrl}}" class="button">View Details</a>
            {{/if}}
          </div>
          <div class="footer">
            <p>© 2025 Car Rental System. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  async sendEmail({ to, subject, type, data }) {
    try {
      const template = this.templates[type] || this.getDefaultTemplate();
      const html = template(data);

      const mailOptions = {
        from: `"Car Rental System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: data.message
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        sentAt: new Date()
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBookingConfirmation(user, bookingData) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Booking Confirmation - Car Rental',
      type: 'booking_confirmation',
      data: {
        userName: user.name,
        bookingId: bookingData.bookingId,
        vehicleName: bookingData.vehicleName,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        totalAmount: bookingData.totalAmount,
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
        userName: user.name,
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        bookingId: paymentData.bookingId,
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
        userName: user.name,
        amount: paymentData.amount,
        reason: paymentData.reason,
        bookingId: paymentData.bookingId,
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
        userName: user.name,
        actionUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    });
  }

  async sendPasswordReset(user, resetToken) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      type: 'password_reset',
      data: {
        userName: user.name,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
        expiresIn: '1 hour'
      }
    });
  }

  async sendBookingReminder(user, bookingData) {
    return await this.sendEmail({
      to: user.email,
      subject: 'Booking Reminder - Car Rental',
      type: 'booking_reminder',
      data: {
        userName: user.name,
        vehicleName: bookingData.vehicleName,
        pickupDate: bookingData.pickupDate,
        pickupLocation: bookingData.pickupLocation,
        actionUrl: `${process.env.FRONTEND_URL}/bookings/${bookingData.bookingId}`
      }
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send messages');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
