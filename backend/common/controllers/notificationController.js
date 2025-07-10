const Notification = require('../models/Notification');

// Create a new notification
const createNotification = async (userId, title, message, type = 'info', data = {}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      data
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      notifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(await Notification.countDocuments(query) / limit)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted', deletedId: id });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Helper function to create appointment notifications
const createAppointmentNotification = async (doctorId, patientName, appointmentDate, appointmentTime, type = 'new') => {
  let title, message;
  
  switch (type) {
    case 'new':
      title = 'New Appointment Request';
      message = `${patientName} has requested an appointment for ${appointmentDate} at ${appointmentTime}`;
      break;
    case 'confirmed':
      title = 'Appointment Confirmed';
      message = `Your appointment with ${patientName} for ${appointmentDate} at ${appointmentTime} has been confirmed`;
      break;
    case 'cancelled':
      title = 'Appointment Cancelled';
      message = `${patientName} has cancelled their appointment for ${appointmentDate} at ${appointmentTime}`;
      break;
    default:
      title = 'Appointment Update';
      message = `Appointment update for ${patientName} on ${appointmentDate} at ${appointmentTime}`;
  }
  
  return await createNotification(doctorId, title, message, 'appointment', {
    patientName,
    appointmentDate,
    appointmentTime,
    type
  });
};

// Helper function to create prescription notifications
const createPrescriptionNotification = async (patientId, doctorName, prescriptionDetails) => {
  const title = 'New Prescription';
  const message = `Dr. ${doctorName} has issued you a new prescription`;
  
  return await createNotification(patientId, title, message, 'prescription', {
    doctorName,
    prescriptionDetails
  });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createAppointmentNotification,
  createPrescriptionNotification
};
