const { chatWithDocument } = require('../services/chatgptService');

/**
 * Chat with document
 * POST /api/documents/chat
 */
const chatWithDoc = async (req, res) => {
    try {
        const { documentAnalysis, message, conversationHistory } = req.body;

        // Validation
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        if (!documentAnalysis) {
            return res.status(400).json({
                success: false,
                message: 'Document analysis data is required'
            });
        }

        // Get AI response
        const aiResponse = await chatWithDocument({
            documentAnalysis,
            userMessage: message,
            conversationHistory: conversationHistory || []
        });

        res.json({
            success: true,
            data: {
                message: aiResponse,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Chat Error:', error);

        // Return specific error messages
        if (error.message.includes('quota') || error.message.includes('API')) {
            return res.status(503).json({
                success: false,
                message: error.message,
                useMockMode: true
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to get AI response',
            error: error.message
        });
    }
};

module.exports = {
    chatWithDoc
};
