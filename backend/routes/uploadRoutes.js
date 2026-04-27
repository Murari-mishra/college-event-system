const express = require('express');
const router  = express.Router();
const { uploadEventImage, deleteEventImage } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { upload }     = require('../config/cloudinary');

router.post(
  '/event-image',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('image'),
  uploadEventImage
);

router.delete(
  '/event-image/:publicId',
  authMiddleware,
  roleMiddleware('admin'),
  deleteEventImage
);

module.exports = router;