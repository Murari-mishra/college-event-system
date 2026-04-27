const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Student
const submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, review } = req.body;

    if (!eventId || !rating) {
      return res.status(400).json({ success: false, message: 'Event ID and rating are required.' });
    }

    // Must be registered for the event
    const registration = await Registration.findOne({ userId: req.user._id, eventId });
    if (!registration) {
      return res.status(403).json({ success: false, message: 'You must be registered for this event to leave feedback.' });
    }

    const existing = await Feedback.findOne({ userId: req.user._id, eventId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback for this event.' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      eventId,
      rating,
      review,
    });

    res.status(201).json({ success: true, message: 'Feedback submitted successfully!', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get feedback for an event
// @route   GET /api/feedback/event/:id
// @access  Private
const getEventFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ eventId: req.params.id })
      .populate('userId', 'name department')
      .sort({ createdAt: -1 });

    const avgRating = feedbacks.length
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    res.status(200).json({ success: true, feedbacks, avgRating, count: feedbacks.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get my feedback
// @route   GET /api/feedback/my
// @access  Student
const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .populate('eventId', 'title date');
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { submitFeedback, getEventFeedback, getMyFeedback };