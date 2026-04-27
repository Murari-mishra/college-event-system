const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { notifyAllStudents } = require('./notificationController');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    // Student — attach registration status
    if (req.user.role === 'student') {
      const registrations = await Registration.find({ userId: req.user._id });
      const registeredEventIds = registrations.map((r) => r.eventId.toString());

      const eventsWithStatus = events.map((event) => ({
        ...event.toObject(),
        isRegistered: registeredEventIds.includes(event._id.toString()),
        registrationStatus: registrations.find(
          (r) => r.eventId.toString() === event._id.toString()
        )?.status,
      }));

      return res.status(200).json({
        success: true,
        count: eventsWithStatus.length,
        events: eventsWithStatus,
      });
    }

    // Admin — attach participant counts
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const count = await Registration.countDocuments({
          eventId: event._id,
          status: { $ne: 'cancelled' },
        });
        return { ...event.toObject(), participantCount: count };
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithCounts.length,
      events: eventsWithCounts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching events.' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Admin only
const createEvent = async (req, res) => {
  try {
    const {
      title, description, date, time,
      venue, category, maxParticipants,
      imageUrl, imagePublicId,
    } = req.body;

    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided.',
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      venue,
      category,
      maxParticipants,
      imageUrl:      imageUrl      || null,
      imagePublicId: imagePublicId || null,
      createdBy:     req.user._id,
    });

    await event.populate('createdBy', 'name email');

    // Notify all students about new event
    notifyAllStudents(event);

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error creating event.' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin only
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event: updatedEvent,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error updating event.' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin only
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Delete image from Cloudinary if exists
    if (event.imagePublicId) {
      try {
        const { cloudinary } = require('../config/cloudinary');
        await cloudinary.uploader.destroy(event.imagePublicId);
      } catch (cloudErr) {
        console.error('Cloudinary delete error:', cloudErr.message);
        // Don't block event deletion if image delete fails
      }
    }

    // Delete all registrations for this event
    await Registration.deleteMany({ eventId: req.params.id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event and all registrations deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting event.' });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };