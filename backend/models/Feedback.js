const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    rating:  { type: Number, min: 1, max: 5, required: true },
    review:  { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

feedbackSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);