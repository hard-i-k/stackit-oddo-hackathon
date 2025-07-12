const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const {
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  getUserAnswers
} = require('../controllers/answerController');

const router = express.Router();

// Validation rules
const createAnswerValidation = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Answer content must be between 10 and 10000 characters')
];

const updateAnswerValidation = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Answer content must be between 10 and 10000 characters')
];

const voteValidation = [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be either "upvote" or "downvote"')
];

// Public routes
router.get('/question/:questionId', optionalAuthMiddleware, getAnswers);
router.get('/user/:userId', optionalAuthMiddleware, getUserAnswers);

// Protected routes
router.post('/question/:questionId', authMiddleware, createAnswerValidation, createAnswer);
router.put('/:id', authMiddleware, updateAnswerValidation, updateAnswer);
router.delete('/:id', authMiddleware, deleteAnswer);
router.post('/:id/vote', authMiddleware, voteValidation, voteAnswer);

module.exports = router; 