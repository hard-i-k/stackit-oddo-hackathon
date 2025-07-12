const { validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');
const geminiClient = require('../utils/geminiClient');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get answers for a question
const getAnswers = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { page = 1, limit = 10, sortBy = 'isAccepted' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    let sort = {};
    if (sortBy === 'votes') {
      sort = { upvotes: -1, downvotes: 1, createdAt: 1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else {
      sort = { isAccepted: -1, upvotes: -1, createdAt: 1 };
    }
    const [answers, total] = await Promise.all([
      Answer.find({ question: questionId })
        .populate('author', 'id username')
        .skip(skip)
        .limit(take)
        .sort(sort),
      Answer.countDocuments({ question: questionId })
    ]);
    const totalPages = Math.ceil(total / take);
    res.json({
      success: true,
      data: {
        answers,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new answer
const createAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    const { questionId } = req.params;
    const { content } = req.body;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    let enhancedContent = content;
    if (process.env.GEMINI_API_KEY) {
      try {
        enhancedContent = await geminiClient.enhanceAnswer(content);
      } catch (error) {
        console.error('AI enhancement failed:', error);
      }
    }
    const answer = await Answer.create({
      content: enhancedContent,
      author: req.user.id,
      question: questionId
    });
    // Add answer to question's answers array
    question.answers.push(answer._id);
    await question.save();
    await answer.populate('author', 'id username');
    // Create notification for question author
    if (question.author.toString() !== req.user.id) {
      await Notification.create({
        message: `Your question "${question.title}" received a new answer!`,
        user: question.author
      });
    }
    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      data: {
        answer,
        aiEnhanced: enhancedContent !== content
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update answer
const updateAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    const { id } = req.params;
    const { content } = req.body;
    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found.' });
    }
    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own answers.' });
    }
    answer.content = content;
    await answer.save();
    await answer.populate('author', 'id username');
    res.json({
      success: true,
      message: 'Answer updated successfully',
      data: { answer }
    });
  } catch (error) {
    next(error);
  }
};

// Delete answer
const deleteAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found.' });
    }
    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own answers.' });
    }
    // Remove answer from question's answers array
    await Question.findByIdAndUpdate(answer.question, { $pull: { answers: answer._id } });
    await answer.deleteOne();
    res.json({ success: true, message: 'Answer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Vote on answer
const voteAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ success: false, message: 'Invalid vote type. Must be "upvote" or "downvote".' });
    }
    const answer = await Answer.findById(id).populate('author', 'id username');
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found.' });
    }
    if (answer.author._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot vote on your own answer.' });
    }
    if (voteType === 'upvote') {
      answer.upvotes += 1;
    } else {
      answer.downvotes += 1;
    }
    await answer.save();
    res.json({
      success: true,
      message: `${voteType} recorded successfully`,
      data: { answer }
    });
  } catch (error) {
    next(error);
  }
};

// Get answers by user
const getUserAnswers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const [answers, total] = await Promise.all([
      Answer.find({ author: userId })
        .populate('question', 'id title')
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 }),
      Answer.countDocuments({ author: userId })
    ]);
    const totalPages = Math.ceil(total / take);
    res.json({
      success: true,
      data: {
        answers,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  getUserAnswers
}; 