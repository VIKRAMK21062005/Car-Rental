import twilio from 'twilio';

class SMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    } else {
      console.warn('Twilio credentials not found. SMS service will not work.');
    }
  }

  async sendSMS(to, message) {
    if (!this.client) {
      return {
        success: false,
        error: 'Twilio client not initialized'
      };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to
      });

      return {
        success: true,
        messageId: result.sid,
        sentAt: new Date(),
        status: result.status
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    return '+' + cleaned;
  }

  generateMessage(type, data) {
    const messages = {
      booking_confirmation: `Hi ${data.userName}! Your booking #${data.bookingId} for ${data.vehicleName} is confirmed. Pickup: ${data.pickupDate}. View details: ${data.actionUrl}`,
      payment_success: `Payment successful! ₹${data.amount} received for booking #${data.bookingId}. Transaction ID: ${data.transactionId}`,
      payment_failure: `Payment failed for booking #${data.bookingId}. Please retry: ${data.actionUrl}`,
      booking_reminder: `Reminder: Your ${data.vehicleName} pickup is scheduled for ${data.pickupDate} at ${data.pickupLocation}. See you soon!`,
      vehicle_ready: `Good news! Your ${data.vehicleName} is ready for pickup at ${data.location}. Booking #${data.bookingId}`,
      password_reset: `Password reset requested for your Car Rental account. Use this link: ${data.resetUrl} (valid for 1 hour)`,
      welcome: `Welcome to Car Rental System, ${data.userName}! Start browsing our vehicles: ${data.actionUrl}`,
      promotional: `${data.message} ${data.actionUrl || ''}`,
      system_message: data.message
    };

    return messages[type] || data.message;
  }

  async sendBookingConfirmation(user, bookingData) {
    const message = this.generateMessage('booking_confirmation', {
      userName: user.name,
      bookingId: bookingData.bookingId,
      vehicleName: bookingData.vehicleName,
      pickupDate: new Date(bookingData.pickupDate).toLocaleDateString(),
      actionUrl: `${process.env.FRONTEND_URL}/bookings/${bookingData.bookingId}`
    });
    return await this.sendSMS(this.formatPhoneNumber(user.phone), message);
  }

  async sendPaymentSuccess(user, paymentData) {
    const message = this.generateMessage('payment_success', {
      userName: user.name,
      amount: paymentData.amount,
      transactionId: paymentData.transactionId,
      bookingId: paymentData.bookingId
    });
    return await this.sendSMS(this.formatPhoneNumber(user.phone), message);
  }

  async sendPaymentFailure(user, paymentData) {
    const message = this.generateMessage('payment_failure', {
      bookingId: paymentData.bookingId,
      actionUrl: `${process.env.FRONTEND_URL}/bookings/${paymentData.bookingId}/retry`
    });
    return await this.sendSMS(this.formatPhoneNumber(user.phone), message);
  }

  async sendBookingReminder(user, bookingData) {
    const message = this.generateMessage('booking_reminder', {
      userName: user.name,
      vehicleName: bookingData.vehicleName,
      pickupDate: new Date(bookingData.pickupDate).toLocaleString(),
      pickupLocation: bookingData.pickupLocation
    });
    return await this.sendSMS(this.formatPhoneNumber(user.phone), message);
  }

  async sendVehicleReady(user, bookingData) {
    const message = this.generateMessage('vehicle_ready', {
      vehicleName: bookingData.vehicleName,
      location: bookingData.pickupLocation,
      bookingId: bookingData.bookingId
    });
    return await this.sendSMS(this.formatPhoneNumber(user.phone), message);
  }

  async sendWelcome(user) {
    const message = this.generateMessage('welcome', {
      userName: user.name,
      actionUrl: process.env.FRONTEND_URL
    });
    return await this.sendSMS(this.formatPhoneNumber(user.phone), message);
  }

  async sendPasswordReset(user, resetToken) {
    const message = this.generateMessage('password_reset', {
      resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    });
    return await this.sendSMS(this.formatPhoneNumber(user.phone), message);
  }

  async sendCustomMessage(user, customMessage) {
    return await this.sendSMS(this.formatPhoneNumber(user.phone), customMessage);
  }

  async verifyConnection() {
    if (!this.client) {
      console.error('Twilio client not initialized');
      return false;
    }

    try {
      const account = await this.client.api.accounts(this.accountSid).fetch();
      console.log('SMS service is ready. Account status:', account.status);
      return true;
    } catch (error) {
      console.error('SMS service connection failed:', error);
      return false;
    }
  }
}

export default new SMSService();
