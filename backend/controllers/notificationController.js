const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('eventId', 'title date venue')
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    res.status(200).json({ success: true, message: 'All marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Helper — send notification to all students when new event created
const notifyAllStudents = async (event) => {
  try {
    const students = await User.find({ role: 'student' });
    const notifications = students.map((s) => ({
      userId: s._id,
      title: '🎉 New Event Posted!',
      message: `"${event.title}" has been added. Date: ${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${event.venue}.`,
      type: 'new_event',
      eventId: event._id,
    }));
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

// Helper — notify student on registration
const notifyRegistration = async (userId, event, registrationId) => {
  try {
    await Notification.create({
      userId,
      title: '✅ Registration Confirmed',
      message: `You are registered for "${event.title}" on ${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${event.venue}.`,
      type: 'registration',
      eventId: event._id,
    });
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyAllStudents,
  notifyRegistration,
};