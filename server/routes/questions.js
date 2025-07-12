const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  acceptAnswer,
  getUserQuestions
} = require('../controllers/questionController');

const router = express.Router();

// Validation rules
const createQuestionValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
];

const updateQuestionValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
];

// Public routes
router.get('/', optionalAuthMiddleware, getQuestions);
router.get('/:id', optionalAuthMiddleware, getQuestion);
router.get('/user/:userId', optionalAuthMiddleware, getUserQuestions);

// Protected routes
router.post('/', authMiddleware, createQuestionValidation, createQuestion);
router.put('/:id', authMiddleware, updateQuestionValidation, updateQuestion);
router.delete('/:id', authMiddleware, deleteQuestion);
router.put('/:questionId/accept/:answerId', authMiddleware, acceptAnswer);

module.exports = router; 