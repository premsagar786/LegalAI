const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5
    },
    title: {
        type: String,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    review: {
        type: String,
        required: [true, 'Please provide a review'],
        maxlength: [1000, 'Review cannot be more than 1000 characters']
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    response: {
        text: String,
        respondedAt: Date
    }
}, {
    timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ user: 1, appointment: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (lawyerId) {
    const stats = await this.aggregate([
        { $match: { lawyer: lawyerId } },
        {
            $group: {
                _id: '$lawyer',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await this.model('Lawyer').findByIdAndUpdate(lawyerId, {
            'rating.average': Math.round(stats[0].averageRating * 10) / 10,
            'rating.count': stats[0].count
        });
    }
};

// Update rating after save
reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.lawyer);
});

module.exports = mongoose.model('Review', reviewSchema);
