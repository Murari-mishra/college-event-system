const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', roleMiddleware('admin'), createEvent);
router.put('/:id', roleMiddleware('admin'), updateEvent);
router.delete('/:id', roleMiddleware('admin'), deleteEvent);

module.exports = router;
