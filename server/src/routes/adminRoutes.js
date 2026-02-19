const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    updateUser,
    getPendingLawyers,
    verifyLawyer,
    getAllLawyers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/lawyers', getAllLawyers);
router.get('/lawyers/pending', getPendingLawyers);
router.put('/lawyers/:id/verify', verifyLawyer);

module.exports = router;
