const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  enhanceQuestion,
  enhanceAnswer,
  generateAnswerSuggestion,
  analyzeCode,
  getAiStatus
} = require('../controllers/aiController');

const router = express.Router();

// Validation rules
const enhanceQuestionValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
];

const enhanceAnswerValidation = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters')
];

const generateSuggestionValidation = [
  body('questionTitle')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Question title must be between 5 and 200 characters'),
  body('questionDescription')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Question description must be between 10 and 2000 characters')
];

const analyzeCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required'),
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Programming language is required')
];

// Public routes
router.get('/status', getAiStatus);

// Protected routes
router.post('/enhance-question', authMiddleware, enhanceQuestionValidation, enhanceQuestion);
router.post('/enhance-answer', authMiddleware, enhanceAnswerValidation, enhanceAnswer);
router.post('/generate-suggestion', authMiddleware, generateSuggestionValidation, generateAnswerSuggestion);
router.post('/analyze-code', authMiddleware, analyzeCodeValidation, analyzeCode);

module.exports = router; 