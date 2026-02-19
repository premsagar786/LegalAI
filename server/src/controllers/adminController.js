const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Document = require('../models/Document');
const Appointment = require('../models/Appointment');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalLawyers,
            verifiedLawyers,
            pendingVerification,
            totalDocuments,
            analyzedDocuments,
            totalAppointments,
            completedAppointments
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Lawyer.countDocuments(),
            Lawyer.countDocuments({ isVerified: true }),
            Lawyer.countDocuments({ isVerified: false }),
            Document.countDocuments(),
            Document.countDocuments({ status: 'analyzed' }),
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: 'completed' })
        ]);

        // Recent activity
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt');

        const recentAppointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name')
            .populate({
                path: 'lawyer',
                populate: { path: 'user', select: 'name' }
            });

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    lawyers: totalLawyers,
                    verifiedLawyers,
                    pendingVerification
                },
                documents: {
                    total: totalDocuments,
                    analyzed: analyzedDocuments
                },
                appointments: {
                    total: totalAppointments,
                    completed: completedAppointments
                },
                recent: {
                    users: recentUsers,
                    appointments: recentAppointments
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const { role, isActive, page = 1, limit = 20 } = req.query;

        const query = {};
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const { isActive, role } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (isActive !== undefined) user.isActive = isActive;
        if (role) user.role = role;

        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get pending lawyer verifications
// @route   GET /api/admin/lawyers/pending
// @access  Private (Admin)
exports.getPendingLawyers = async (req, res) => {
    try {
        const lawyers = await Lawyer.find({ isVerified: false })
            .populate('user', 'name email phone createdAt')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: lawyers.length,
            data: lawyers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Verify/Reject lawyer
// @route   PUT /api/admin/lawyers/:id/verify
// @access  Private (Admin)
exports.verifyLawyer = async (req, res) => {
    try {
        const { approved, rejectionReason } = req.body;

        const lawyer = await Lawyer.findById(req.params.id);

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: 'Lawyer not found'
            });
        }

        if (approved) {
            lawyer.isVerified = true;
            lawyer.verifiedAt = new Date();
            lawyer.verifiedBy = req.user.id;
        } else {
            // Could also delete or mark as rejected
            lawyer.isVerified = false;
        }

        await lawyer.save();

        res.status(200).json({
            success: true,
            message: approved ? 'Lawyer verified successfully' : 'Lawyer verification rejected',
            data: lawyer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all lawyers (admin view)
// @route   GET /api/admin/lawyers
// @access  Private (Admin)
exports.getAllLawyers = async (req, res) => {
    try {
        const { isVerified, page = 1, limit = 20 } = req.query;

        const query = {};
        if (isVerified !== undefined) query.isVerified = isVerified === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const lawyers = await Lawyer.find(query)
            .populate('user', 'name email phone isActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Lawyer.countDocuments(query);

        res.status(200).json({
            success: true,
            count: lawyers.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            data: lawyers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
