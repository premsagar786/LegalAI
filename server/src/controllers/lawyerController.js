const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const Review = require('../models/Review');
const geoapifyMapsService = require('../services/googleMapsService');

// @desc    Get all verified lawyers (with filters)
// @route   GET /api/lawyers
// @access  Public
exports.getLawyers = async (req, res) => {
    try {
        const {
            specialization,
            city,
            minRating,
            maxRate,
            minExperience,
            page = 1,
            limit = 10,
            sortBy = 'rating.average',
            order = 'desc'
        } = req.query;

        // Build query
        const query = { isVerified: true };

        if (specialization) {
            query.specializations = { $in: [specialization] };
        }

        if (city) {
            query['location.city'] = { $regex: city, $options: 'i' };
        }

        if (minRating) {
            query['rating.average'] = { $gte: parseFloat(minRating) };
        }

        if (maxRate) {
            query.hourlyRate = { $lte: parseFloat(maxRate) };
        }

        if (minExperience) {
            query.experience = { $gte: parseInt(minExperience) };
        }

        // Geospatial search - support both coordinates and city name
        let { lat, lng, radius = 50 } = req.query; // radius in km
        let geoapifyResults = [];

        // If city is provided but no coordinates, geocode the city first
        if (city && !lat && !lng) {
            try {
                console.log(`🏙️ City search requested: ${city}`);
                const geocoded = await geoapifyMapsService.geocodeCity(city);
                if (geocoded) {
                    lat = geocoded.lat;
                    lng = geocoded.lng;
                    console.log(`✅ Using geocoded coordinates for ${city}: ${lat}, ${lng}`);
                } else {
                    console.warn(`⚠️ Could not geocode city: ${city}`);
                }
            } catch (err) {
                console.error('Geocoding error:', err);
            }
        }

        if (lat && lng) {
            query['location.coordinates'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(radius) * 1000 // Convert to meters
                }
            };

            // Fetch from Geoapify
            try {
                geoapifyResults = await geoapifyMapsService.findLawyersNearby(lat, lng, parseFloat(radius) * 1000);
                console.log(`📍 Found ${geoapifyResults.length} lawyers from Geoapify near ${city || 'coordinates'}`);
            } catch (err) {
                console.error('Geoapify fetch failed:', err);
            }
        } else if (city) {
            // If we have city but geocoding failed, still try database search by city name
            query['location.city'] = new RegExp(city, 'i');
            console.log(`🔍 Searching database by city name: ${city}`);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        let dbLawyers = [];
        let total = 0;

        // Only query database if MongoDB is connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
            try {
                dbLawyers = await Lawyer.find(query)
                    .populate('user', 'name email avatar')
                    .sort({ [sortBy]: sortOrder })
                    .skip(skip)
                    .limit(parseInt(limit));

                total = await Lawyer.countDocuments(query);
            } catch (dbError) {
                console.error('Database query error:', dbError.message);
                // Continue with empty results from database
            }
        } else {
            console.warn('⚠️  MongoDB not connected, skipping database query');
        }

        // Merge results (DB results first, then Geoapify results)
        // Only add Geoapify results if we're on the first page to avoid duplication/pagination issues logic for now
        let allLawyers = dbLawyers;
        if (parseInt(page) === 1) {
            allLawyers = [...dbLawyers, ...geoapifyResults];
        }

        const combinedTotal = total + geoapifyResults.length;

        res.status(200).json({
            success: true,
            count: allLawyers.length,
            total: combinedTotal,
            totalPages: Math.ceil(combinedTotal / parseInt(limit)),
            currentPage: parseInt(page),
            data: allLawyers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching lawyers'
        });
    }
};

// @desc    Get single lawyer
// @route   GET /api/lawyers/:id
// @access  Public
exports.getLawyer = async (req, res) => {
    try {
        const lawyer = await Lawyer.findById(req.params.id)
            .populate('user', 'name email avatar phone');

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: 'Lawyer not found'
            });
        }

        // Get reviews
        const reviews = await Review.find({ lawyer: lawyer._id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                ...lawyer.toObject(),
                reviews
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

// @desc    Update lawyer profile
// @route   PUT /api/lawyers/profile
// @access  Private (Lawyer only)
exports.updateProfile = async (req, res) => {
    try {
        const lawyer = await Lawyer.findOne({ user: req.user.id });

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: 'Lawyer profile not found'
            });
        }

        const allowedUpdates = [
            'specializations',
            'barNumber',
            'experience',
            'bio',
            'education',
            'hourlyRate',
            'languages',
            'location'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                lawyer[field] = req.body[field];
            }
        });

        await lawyer.save();

        res.status(200).json({
            success: true,
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

// @desc    Update lawyer availability
// @route   PUT /api/lawyers/availability
// @access  Private (Lawyer only)
exports.updateAvailability = async (req, res) => {
    try {
        const lawyer = await Lawyer.findOne({ user: req.user.id });

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: 'Lawyer profile not found'
            });
        }

        lawyer.availability = req.body.availability;
        await lawyer.save();

        res.status(200).json({
            success: true,
            data: lawyer.availability
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get lawyer's own profile
// @route   GET /api/lawyers/me
// @access  Private (Lawyer only)
exports.getMyProfile = async (req, res) => {
    try {
        const lawyer = await Lawyer.findOne({ user: req.user.id })
            .populate('user', 'name email avatar phone');

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: 'Lawyer profile not found'
            });
        }

        res.status(200).json({
            success: true,
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

// @desc    Get specialization options
// @route   GET /api/lawyers/specializations
// @access  Public
exports.getSpecializations = async (req, res) => {
    const specializations = [
        'Corporate Law',
        'Criminal Law',
        'Family Law',
        'Real Estate',
        'Intellectual Property',
        'Tax Law',
        'Employment Law',
        'Immigration Law',
        'Civil Litigation',
        'Contract Law',
        'Banking & Finance',
        'Environmental Law',
        'Other'
    ];

    res.status(200).json({
        success: true,
        data: specializations
    });
};
