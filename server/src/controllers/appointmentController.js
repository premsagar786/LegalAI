const Appointment = require('../models/Appointment');
const Lawyer = require('../models/Lawyer');
const Document = require('../models/Document');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (User)
exports.createAppointment = async (req, res) => {
    try {
        const { lawyerId, documentId, scheduledDate, timeSlot, type, purpose } = req.body;

        // Verify lawyer exists and is verified
        const lawyer = await Lawyer.findById(lawyerId);
        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: 'Lawyer not found'
            });
        }

        if (!lawyer.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book appointment with unverified lawyer'
            });
        }

        // Verify document if provided
        if (documentId) {
            const document = await Document.findById(documentId);
            if (!document || document.user.toString() !== req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid document'
                });
            }
        }

        // Check for conflicting appointments
        const existingAppointment = await Appointment.findOne({
            lawyer: lawyerId,
            scheduledDate: new Date(scheduledDate),
            'timeSlot.startTime': timeSlot.startTime,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        const appointment = await Appointment.create({
            user: req.user.id,
            lawyer: lawyerId,
            document: documentId,
            scheduledDate: new Date(scheduledDate),
            timeSlot,
            type: type || 'online',
            purpose,
            fee: {
                amount: lawyer.hourlyRate,
                currency: 'INR'
            }
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating appointment'
        });
    }
};

// @desc    Get user's appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
    try {
        const { status, upcoming, page = 1, limit = 10 } = req.query;

        let query = {};

        // Different queries for user vs lawyer
        if (req.user.role === 'lawyer') {
            const lawyer = await Lawyer.findOne({ user: req.user.id });
            if (lawyer) {
                query.lawyer = lawyer._id;
            }
        } else {
            query.user = req.user.id;
        }

        if (status) {
            query.status = status;
        }

        if (upcoming === 'true') {
            query.scheduledDate = { $gte: new Date() };
            query.status = { $in: ['pending', 'confirmed'] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const appointments = await Appointment.find(query)
            .populate('user', 'name email avatar')
            .populate({
                path: 'lawyer',
                populate: { path: 'user', select: 'name email avatar' }
            })
            .populate('document', 'originalName status')
            .sort({ scheduledDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: appointments.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            data: appointments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('user', 'name email avatar phone')
            .populate({
                path: 'lawyer',
                populate: { path: 'user', select: 'name email avatar phone' }
            })
            .populate('document');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const lawyer = await Lawyer.findOne({ user: req.user.id });
        const isLawyer = lawyer && appointment.lawyer._id.toString() === lawyer._id.toString();
        const isUser = appointment.user._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isUser && !isLawyer && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment'
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update appointment status (Lawyer)
// @route   PUT /api/appointments/:id/status
// @access  Private (Lawyer)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status, meetingLink, notes } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Verify lawyer ownership
        const lawyer = await Lawyer.findOne({ user: req.user.id });
        if (!lawyer || appointment.lawyer.toString() !== lawyer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
        }

        if (status) appointment.status = status;
        if (meetingLink) appointment.meetingLink = meetingLink;
        if (notes) appointment.notes.lawyerNotes = notes;

        await appointment.save();

        // Update lawyer consultation count if completed
        if (status === 'completed') {
            lawyer.consultationCount += 1;
            await lawyer.save();
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
    try {
        const { reason } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const lawyer = await Lawyer.findOne({ user: req.user.id });
        const isLawyer = lawyer && appointment.lawyer.toString() === lawyer._id.toString();
        const isUser = appointment.user.toString() === req.user.id;

        if (!isUser && !isLawyer) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this appointment'
            });
        }

        if (['completed', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel this appointment'
            });
        }

        appointment.status = 'cancelled';
        appointment.cancelledBy = req.user.id;
        appointment.cancelReason = reason;

        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
