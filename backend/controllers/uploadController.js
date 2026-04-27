const { cloudinary } = require('../config/cloudinary');

// @desc    Upload event image
// @route   POST /api/upload/event-image
// @access  Admin
const uploadEventImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    res.status(200).json({
      success:     true,
      message:     'Image uploaded successfully.',
      imageUrl:    req.file.path,
      publicId:    req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Image upload failed.' });
  }
};

// @desc    Delete event image
// @route   DELETE /api/upload/event-image/:publicId
// @access  Admin
const deleteEventImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ success: true, message: 'Image deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

module.exports = { uploadEventImage, deleteEventImage };