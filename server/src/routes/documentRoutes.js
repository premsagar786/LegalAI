const express = require('express');
const router = express.Router();
const {
    uploadDocument,
    analyzeDocument,
    getDocuments,
    getDocument,
    deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect); // All routes require authentication

router.post('/upload', upload.single('document'), uploadDocument);
router.post('/:id/analyze', analyzeDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
