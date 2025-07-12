const { validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');
const geminiClient = require('../utils/geminiClient');
const Question = require('../models/Question');
const User = require('../models/User');
const Answer = require('../models/Answer');

// Get all questions with pagination and filters
const getQuestions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('author', 'id username')
        .skip(skip)
        .limit(take)
        .sort(sort),
      Question.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      data: {
        questions,
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

// Get single question by ID
const getQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id)
      .populate('author', 'id username')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'id username' },
        options: { sort: { isAccepted: -1, upvotes: -1, createdAt: 1 } }
      });
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }
    res.json({
      success: true,
      data: { question }
    });
  } catch (error) {
    next(error);
  }
};

// Create new question
const createQuestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    const { title, description, tags = [] } = req.body;
    // Use AI to enhance the question if enabled
    let enhancedData = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        enhancedData = await geminiClient.enhanceQuestion(title, description);
      } catch (error) {
        console.error('AI enhancement failed:', error);
      }
    }
    const question = await Question.create({
      title: enhancedData?.enhancedTitle || title,
      description: enhancedData?.enhancedDescription || description,
      tags: enhancedData?.suggestedTags || tags,
      author: req.user.id
    });
    await question.populate('author', 'id username');
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        question,
        aiEnhancement: enhancedData ? {
          originalTitle: title,
          originalDescription: description,
          suggestedTags: enhancedData.suggestedTags
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update question
const updateQuestion = async (req, res, next) => {
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
    const { title, description, tags } = req.body;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own questions.' });
    }
    if (title) question.title = title;
    if (description) question.description = description;
    if (tags) question.tags = tags;
    await question.save();
    await question.populate('author', 'id username');
    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question }
    });
  } catch (error) {
    next(error);
  }
};

// Delete question
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own questions.' });
    }
    await Answer.deleteMany({ question: id });
    await question.deleteOne();
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Accept answer
const acceptAnswer = async (req, res, next) => {
  try {
    const { questionId, answerId } = req.params;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only accept answers for your own questions.' });
    }
    const answer = await Answer.findOne({ _id: answerId, question: questionId });
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found.' });
    }
    question.acceptedAnswerId = answerId;
    await question.save();
    answer.isAccepted = true;
    await answer.save();
    res.json({ success: true, message: 'Answer accepted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get questions by user
const getUserQuestions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const [questions, total] = await Promise.all([
      Question.find({ author: userId })
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 }),
      Question.countDocuments({ author: userId })
    ]);
    const totalPages = Math.ceil(total / take);
    res.json({
      success: true,
      data: {
        questions,
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
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  acceptAnswer,
  getUserQuestions
}; 