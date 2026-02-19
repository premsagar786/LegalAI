const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specializations: [{
        type: String,
        enum: [
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
        ]
    }],
    barNumber: {
        type: String,
        required: [true, 'Please add bar registration number']
    },
    experience: {
        type: Number,
        required: [true, 'Please add years of experience'],
        min: 0
    },
    bio: {
        type: String,
        maxlength: [1000, 'Bio cannot be more than 1000 characters']
    },
    education: [{
        degree: String,
        institution: String,
        year: Number
    }],
    hourlyRate: {
        type: Number,
        required: [true, 'Please add hourly consultation rate']
    },
    languages: [{
        type: String
    }],
    location: {
        city: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            },
            formattedAddress: String
        }
    },
    availability: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        slots: [{
            startTime: String,
            endTime: String,
            isBooked: {
                type: Boolean,
                default: false
            }
        }]
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    documents: [{
        type: {
            type: String,
            enum: ['bar_certificate', 'id_proof', 'degree', 'other']
        },
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    consultationCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search
lawyerSchema.index({ 'location.city': 1, specializations: 1, isVerified: 1 });

module.exports = mongoose.model('Lawyer', lawyerSchema);
