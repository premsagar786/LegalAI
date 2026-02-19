const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: true
    },
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Please select a date for consultation']
    },
    timeSlot: {
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    },
    type: {
        type: String,
        enum: ['online', 'in-person', 'phone'],
        default: 'online'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    purpose: {
        type: String,
        maxlength: [500, 'Purpose cannot be more than 500 characters']
    },
    notes: {
        userNotes: String,
        lawyerNotes: String
    },
    meetingLink: {
        type: String
    },
    fee: {
        amount: Number,
        currency: {
            type: String,
            default: 'INR'
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paidAt: Date
    },
    rating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String,
        ratedAt: Date
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelReason: String,
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for querying
appointmentSchema.index({ user: 1, scheduledDate: -1 });
appointmentSchema.index({ lawyer: 1, scheduledDate: -1 });
appointmentSchema.index({ status: 1, scheduledDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
