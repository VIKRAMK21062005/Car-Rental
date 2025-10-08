// controllers/notificationController.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import emailService from '../services/emailService.js';
import smsService from '../services/smsService.js';

// Send notification
// controllers/notificationController.js
export const sendNotification = async (req, res) => {
  try {
    const { userId, type, channel, title, message, metadata } = req.body;

    // Find user if userId provided
    let user;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    // Create notification document
    const notification = new Notification({
      userId: user?._id,
      type,
      channel,
      title,
      message,
      metadata
    });

    await notification.save();

    // ----- Place your type-specific logic here -----
    if (type === 'otp') {
      const otpCode = metadata?.otp || '123456';
      if (channel === 'email' || channel === 'all') {
        await emailService.sendCustomMessage(user, `Your OTP is ${otpCode}`);
        notification.deliveryStatus.email.sent = true;
        notification.deliveryStatus.email.sentAt = new Date();
      }
      if (channel === 'sms' || channel === 'all') {
        await smsService.sendCustomMessage(user, `Your OTP is ${otpCode}`);
        notification.deliveryStatus.sms.sent = true;
        notification.deliveryStatus.sms.sentAt = new Date();
      }
    }

    if (type === 'booking_confirmation') {
      const { bookingId, vehicleName, pickupDate } = metadata;
      const msg = `Hi ${user.name}, your booking #${bookingId} for ${vehicleName} is confirmed. Pickup: ${pickupDate}`;
      
      if (channel === 'email' || channel === 'all') {
        await emailService.sendCustomMessage(user, msg);
        notification.deliveryStatus.email.sent = true;
        notification.deliveryStatus.email.sentAt = new Date();
      }
      if (channel === 'sms' || channel === 'all') {
        await smsService.sendCustomMessage(user, msg);
        notification.deliveryStatus.sms.sent = true;
        notification.deliveryStatus.sms.sentAt = new Date();
      }
    }
    // -----------------------------------------------

    await notification.save(); // Save any delivery updates

    return res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending notification',
      error: error.message
    });
  }
};


// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
