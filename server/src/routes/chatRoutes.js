const express = require('express');
const router = express.Router();
const { chatWithDoc } = require('../controllers/chatController');

/**
 * @route   POST /api/chat/document
 * @desc    Chat with document using AI
 * @access  Public (can add auth later)
 */
router.post('/document', chatWithDoc);

module.exports = router;
