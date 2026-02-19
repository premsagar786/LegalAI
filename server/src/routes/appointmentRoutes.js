const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointment,
    updateAppointmentStatus,
    cancelAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.put('/:id/status', authorize('lawyer'), updateAppointmentStatus);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
