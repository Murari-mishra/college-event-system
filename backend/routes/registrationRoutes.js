const express = require('express');
const router  = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
  getAllRegistrations,
  getRegistrationQR,
  checkInStudent,
  getCheckinStats,
  exportParticipantsCSV,
} = require('../controllers/registrationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/',                              roleMiddleware('student'), registerForEvent);
router.delete('/:id',                         roleMiddleware('student'), cancelRegistration);
router.get('/my',                             roleMiddleware('student'), getMyRegistrations);
router.get('/all',                            roleMiddleware('admin'),   getAllRegistrations);
router.get('/event/:id',                      roleMiddleware('admin'),   getEventParticipants);
router.get('/event/:id/checkin-stats',        roleMiddleware('admin'),   getCheckinStats);
router.get('/event/:id/export',               roleMiddleware('admin'),   exportParticipantsCSV);
router.get('/:id/qr',                                                   getRegistrationQR);
router.put('/:id/checkin',                    roleMiddleware('admin'),   checkInStudent);

module.exports = router;