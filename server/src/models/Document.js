const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'image', 'doc'],
        required: true
    },
    fileSize: {
        type: Number
    },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'analyzed', 'failed'],
        default: 'uploaded'
    },
    ocrText: {
        type: String
    },
    analysis: {
        summary: String,
        documentType: String,
        clauses: [{
            type: String,
            content: String,
            riskLevel: {
                type: String,
                enum: ['low', 'medium', 'high']
            },
            explanation: String
        }],
        keyTerms: [{
            term: String,
            definition: String
        }],
        parties: [{
            role: String,
            name: String
        }],
        dates: {
            effective: Date,
            expiry: Date,
            important: [{
                description: String,
                date: Date
            }]
        },
        obligations: [{
            party: String,
            description: String,
            deadline: String
        }],
        penalties: [{
            condition: String,
            consequence: String,
            severity: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical']
            }
        }],
        overallRiskScore: {
            type: Number,
            min: 0,
            max: 100
        },
        recommendations: [String],
        expertSuggestions: {
            negotiationPoints: [String],
            draftingTips: [String],
            legalTraps: [String]
        }
    },
    processingError: {
        type: String
    },
    analyzedAt: Date
}, {
    timestamps: true
});

// Index for user document queries
documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
