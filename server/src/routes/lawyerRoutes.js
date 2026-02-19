const express = require('express');
const router = express.Router();
const {
    getLawyers,
    getLawyer,
    updateProfile,
    updateAvailability,
    getMyProfile,
    getSpecializations
} = require('../controllers/lawyerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getLawyers);
router.get('/specializations', getSpecializations);
router.get('/:id', getLawyer);

// Protected lawyer routes
router.get('/profile/me', protect, authorize('lawyer'), getMyProfile);
router.put('/profile', protect, authorize('lawyer'), updateProfile);
router.put('/availability', protect, authorize('lawyer'), updateAvailability);

module.exports = router;
