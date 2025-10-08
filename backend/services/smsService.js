// services/smsService.js
import twilio from 'twilio';

class SMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.client = null;
    this.isConfigured = false;
    
    this.initialize();
  }

  initialize() {
    if (!this.accountSid || !this.authToken || !this.phoneNumber) {
      console.warn('⚠️ Twilio credentials not found. SMS service will be disabled.');
      console.warn('Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
      return;
    }

    try {
      this.client = twilio(this.accountSid, this.authToken);
      this.isConfigured = true;
      console.log('✅ SMS service initialized');
    } catch (error) {
      console.error('❌ SMS service initialization failed:', error.message);
      this.isConfigured = false;
    }
  }

  async sendSMS(to, message) {
    if (!this.isConfigured || !this.client) {
      console.warn(`⚠️ SMS not sent to ${to}: Service not configured`);
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      // Validate phone number
      const formattedPhone = this.formatPhoneNumber(to);
      if (!formattedPhone) {
        return {
          success: false,
          error: 'Invalid phone number format'
        };
      }

      // Truncate message if too long (160 chars for single SMS)
      const truncatedMessage = message.length > 160 
        ? message.substring(0, 157) + '...' 
        : message;

      const result = await this.client.messages.create({
        body: truncatedMessage,
        from: this.phoneNumber,
        to: formattedPhone
      });

      console.log(`✅ SMS sent to ${formattedPhone}: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        sentAt: new Date(),
        status: result.status
      };
    } catch (error) {
      console.error('❌ SMS sending error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle Indian phone numbers
    if (cleaned.length === 10) {
      // Assume Indian number, add country code
      cleaned = '91' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      // Remove leading 0 and add 91
      cleaned = '91' + cleaned.substring(1);
    }

    // Add + prefix if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('+')) {
      // Already has +
      return cleaned;
    }

    // Validate length (Indian numbers should be +91 followed by 10 digits)
    if (cleaned.length < 12 || cleaned.length > 15) {
      console.warn(`⚠️ Invalid phone number length: ${cleaned}`);
      return null;
    }

    return cleaned;
  }

  generateMessage(type, data) {
    const messages = {
      otp: `Your OTP for Car Rental is ${data.otp}. Valid for 10 minutes. Do not share.`,
      
      booking_confirmation: `Hi ${data.userName}! Booking #${data.bookingId} confirmed for ${data.vehicleName}. Pickup: ${data.pickupDate}`,
      
      payment_success: `Payment successful! ₹${data.amount} received for booking #${data.bookingId}. Transaction: ${data.transactionId}`,
      
      payment_failure: `Payment failed for booking #${data.bookingId}. Please retry or contact support.`,
      
      booking_reminder: `Reminder: ${data.vehicleName} pickup on ${data.pickupDate} at ${data.pickupLocation}. See you soon!`,
      
      vehicle_ready: `Good news! Your ${data.vehicleName} is ready for pickup at ${data.location}. Booking #${data.bookingId}`,
      
      password_reset: `Password reset requested for your Car Rental account. Use link sent to your email (valid 1 hour).`,
      
      welcome: `Welcome to Car Rental, ${data.userName}! Start browsing vehicles and book your ride today.`,
      
      promotional: `${data.message}`,
      
      system_message: data.message,

      booking_cancelled: `Your booking #${data.bookingId} has been cancelled. Refund will be processed in 5-7 business days.`,

      refund_processed: `Refund of ₹${data.amount} processed for booking #${data.bookingId}. Will reflect in 3-5 days.`
    };

    return messages[type] || data.message || 'Message from Car Rental System';
  }

  async sendOTP(user, otpCode) {
    const message = this.generateMessage('otp', {
      userName: user.name,
      otp: otpCode
    });
    return await this.sendSMS(user.phone, message);
  }

  async sendBookingConfirmation(user, bookingData) {
    const message = this.generateMessage('booking_confirmation', {
      userName: user.name,
      bookingId: bookingData.bookingId,
      vehicleName: bookingData.vehicleName,
      pickupDate: new Date(bookingData.pickupDate).toLocaleDateString('en-IN')
    });
    return await this.sendSMS(user.phone, message);
  }

  async sendPaymentSuccess(user, paymentData) {
    const message = this.generateMessage('payment_success', {
      userName: user.name,
      amount: paymentData.amount,
      transactionId: paymentData.transactionId,
      bookingId: paymentData.bookingId
    });
    return await this.sendSMS(user.phone, message);
  }

  async sendPaymentFailure(user, paymentData) {
    const message = this.generateMessage('payment_failure', {
      bookingId: paymentData.bookingId
    });
    return await this.sendSMS(user.phone, message);
  }

  async sendBookingReminder(user, bookingData) {
    const message = this.generateMessage('booking_reminder', {
      userName: user.name,
      vehicleName: bookingData.vehicleName,
      pickupDate: new Date(bookingData.pickupDate).toLocaleString('en-IN'),
      pickupLocation: bookingData.pickupLocation
    });
    return await this.sendSMS(user.phone, message);
  }

  async sendVehicleReady(user, bookingData) {
    const message = this.generateMessage('vehicle_ready', {
      vehicleName: bookingData.vehicleName,
      location: bookingData.pickupLocation,
      bookingId: bookingData.bookingId
    });
    return await this.sendSMS(user.phone, message);
  }

  async sendWelcome(user) {
    const message = this.generateMessage('welcome', {
      userName: user.name
    });
    return await this.sendSMS(user.phone, message);
  }

  async sendPasswordReset(user) {
    const message = this.generateMessage('password_reset', {
      userName: user.name
    });
    return await this.sendSMS(user.phone, message);
  }

  async sendCustomMessage(user, customMessage) {
    return await this.sendSMS(user.phone, customMessage);
  }

  async verifyConnection() {
    if (!this.isConfigured || !this.client) {
      console.error('❌ SMS service not configured');
      return false;
    }

    try {
      const account = await this.client.api.accounts(this.accountSid).fetch();
      console.log(`✅ SMS service is ready. Account status: ${account.status}`);
      return true;
    } catch (error) {
      console.error('❌ SMS service connection failed:', error.message);
      console.error('Please check your Twilio credentials in .env file');
      return false;
    }
  }
}

export default new SMSService();