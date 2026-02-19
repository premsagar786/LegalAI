const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password, role, phone } = req.body;

        // Check if MongoDB is connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            console.warn('⚠️  MongoDB not connected, using mock registration');

            // Mock registration for testing without database
            const mockUser = {
                _id: 'mock_' + Date.now(),
                name,
                email,
                role: role || 'user',
                phone
            };

            const token = generateToken(mockUser._id);

            return res.status(201).json({
                success: true,
                token,
                user: {
                    id: mockUser._id,
                    name: mockUser.name,
                    email: mockUser.email,
                    role: mockUser.role
                },
                message: 'Mock registration successful (database not connected)'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            phone
        });

        // If registering as lawyer, create lawyer profile
        if (role === 'lawyer') {
            try {
                await Lawyer.create({
                    user: user._id,
                    specializations: [],
                    barNumber: 'PENDING',
                    experience: 0,
                    hourlyRate: 0,
                    location: {
                        city: '',
                        state: '',
                        address: '',
                        coordinates: {
                            type: 'Point',
                            coordinates: [0, 0]
                        }
                    }
                });
            } catch (lawyerError) {
                console.error('Error creating lawyer profile:', lawyerError);
                // Continue even if lawyer profile creation fails
            }
        }

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

        // Provide specific error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        const token = generateToken(user._id);

        // Get lawyer profile if user is a lawyer
        let lawyerProfile = null;
        if (user.role === 'lawyer') {
            lawyerProfile = await Lawyer.findOne({ user: user._id });
        }

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lawyerProfile: lawyerProfile ? {
                    id: lawyerProfile._id,
                    isVerified: lawyerProfile.isVerified
                } : null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        let lawyerProfile = null;
        if (user.role === 'lawyer') {
            lawyerProfile = await Lawyer.findOne({ user: user._id });
        }

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                lawyerProfile
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

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            phone: req.body.phone
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(
            key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

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

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
