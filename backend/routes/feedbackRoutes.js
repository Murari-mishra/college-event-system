const express = require('express');
const router = express.Router();
const { submitFeedback, getEventFeedback, getMyFeedback } = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware('student'), submitFeedback);
router.get('/my', roleMiddleware('student'), getMyFeedback);
router.get('/event/:id', getEventFeedback);

module.exports = router;