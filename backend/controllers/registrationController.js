const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const QRCode = require('qrcode');
const { sendRegistrationEmail } = require('../utils/sendEmail');
const { notifyRegistration } = require('./notificationController');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Student only
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const existingReg = await Registration.findOne({ userId: req.user._id, eventId });
    if (existingReg) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
    }

    // Check capacity
    const currentCount = await Registration.countDocuments({
      eventId,
      status: { $ne: 'cancelled' },
    });
    if (currentCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'This event has reached maximum capacity.' });
    }

    const registration = await Registration.create({
      userId:   req.user._id,
      eventId,
      status:   'confirmed',
      attendance: 'absent',
    });

    await registration.populate([
      { path: 'userId',  select: 'name email department rollNo' },
      { path: 'eventId', select: 'title date venue time category' },
    ]);

    // Send confirmation email with PDF ticket (non-blocking)
    const user = await User.findById(req.user._id);
    sendRegistrationEmail(user, event, registration);

    // Send notification (non-blocking)
    notifyRegistration(req.user._id, event, registration._id);

    res.status(201).json({
      success: true,
      message: 'Successfully registered! A confirmation email with your ticket has been sent.',
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
    }
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Student only
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    if (registration.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this registration.' });
    }

    await Registration.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
// @access  Student only
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id })
      .populate('eventId', 'title description date time venue category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching registrations.' });
  }
};

// @desc    Get participants for an event
// @route   GET /api/registrations/event/:id
// @access  Admin only
const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registrations = await Registration.find({ eventId: req.params.id })
      .populate('userId', 'name email department rollNo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      event:   { title: event.title, date: event.date, venue: event.venue },
      count:   registrations.length,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching participants.' });
  }
};

// @desc    Get all registrations (admin stats)
// @route   GET /api/registrations/all
// @access  Admin only
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('userId',  'name email')
      .populate('eventId', 'title date')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get QR code for registration
// @route   GET /api/registrations/:id/qr
// @access  Student
const getRegistrationQR = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('eventId', 'title date venue time')
      .populate('userId',  'name email rollNo');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    if (registration.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const qrData = JSON.stringify({
      registrationId: registration._id,
      studentName:    registration.userId.name,
      studentEmail:   registration.userId.email,
      rollNo:         registration.userId.rollNo,
      eventTitle:     registration.eventId.title,
      eventDate:      registration.eventId.date,
      eventVenue:     registration.eventId.venue,
      status:         registration.status,
      attendance:     registration.attendance,
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width:  300,
      margin: 2,
      color:  { dark: '#0f172a', light: '#ffffff' },
    });

    res.status(200).json({ success: true, qrCode: qrCodeDataURL, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Check in student via QR scan
// @route   PUT /api/registrations/:id/checkin
// @access  Admin only
const checkInStudent = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('userId',  'name email department rollNo')
      .populate('eventId', 'title date venue time');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    if (registration.attendance === 'present') {
      return res.status(400).json({
        success:      false,
        alreadyCheckedIn: true,
        message:      'Student is already checked in.',
        registration,
      });
    }

    registration.attendance  = 'present';
    registration.checkedInAt = new Date();
    await registration.save();

    res.status(200).json({
      success:      true,
      message:      'Student checked in successfully!',
      registration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during check-in.' });
  }
};

// @desc    Get check-in stats for an event
// @route   GET /api/registrations/event/:id/checkin-stats
// @access  Admin only
const getCheckinStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const total   = await Registration.countDocuments({ eventId: req.params.id, status: 'confirmed' });
    const present = await Registration.countDocuments({ eventId: req.params.id, attendance: 'present' });
    const absent  = total - present;

    const recentCheckins = await Registration.find({
      eventId:    req.params.id,
      attendance: 'present',
    })
      .populate('userId', 'name email rollNo department')
      .sort({ checkedInAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      event:   { title: event.title, date: event.date, venue: event.venue },
      stats:   { total, present, absent },
      recentCheckins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Export participants as CSV
// @route   GET /api/registrations/event/:id/export
// @access  Admin only
const exportParticipantsCSV = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registrations = await Registration.find({ eventId: req.params.id })
      .populate('userId', 'name email department rollNo')
      .sort({ createdAt: -1 });

    const headers = ['#', 'Name', 'Email', 'Department', 'Roll No', 'Status', 'Attendance', 'Checked In At', 'Registered On'];
    const rows = registrations.map((r, i) => [
      i + 1,
      r.userId?.name        || '',
      r.userId?.email       || '',
      r.userId?.department  || '',
      r.userId?.rollNo      || '',
      r.status,
      r.attendance,
      r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('en-IN') : 'Not checked in',
      new Date(r.createdAt).toLocaleDateString('en-IN'),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename="participants-${event.title.replace(/\s+/g, '-')}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
  getAllRegistrations,
  getRegistrationQR,
  checkInStudent,
  getCheckinStats,
  exportParticipantsCSV,
};