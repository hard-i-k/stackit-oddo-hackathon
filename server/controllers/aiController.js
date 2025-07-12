const { validationResult } = require('express-validator');
const geminiClient = require('../utils/geminiClient');

// Enhance question with AI
const enhanceQuestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { title, description } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'AI enhancement is not available.'
      });
    }

    const enhancedData = await geminiClient.enhanceQuestion(title, description);

    res.json({
      success: true,
      data: {
        original: { title, description },
        enhanced: enhancedData
      }
    });
  } catch (error) {
    next(error);
  }
};

// Enhance answer with AI
const enhanceAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { content } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'AI enhancement is not available.'
      });
    }

    const enhancedContent = await geminiClient.enhanceAnswer(content);

    res.json({
      success: true,
      data: {
        original: content,
        enhanced: enhancedContent
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate answer suggestion
const generateAnswerSuggestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { questionTitle, questionDescription } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'AI suggestions are not available.'
      });
    }

    const suggestion = await geminiClient.generateAnswerSuggestion(
      questionTitle, 
      questionDescription
    );

    if (!suggestion) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate answer suggestion.'
      });
    }

    res.json({
      success: true,
      data: {
        suggestion
      }
    });
  } catch (error) {
    next(error);
  }
};

// Analyze code
const analyzeCode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { code, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'AI code analysis is not available.'
      });
    }

    const analysis = await geminiClient.analyzeCode(code, language);

    res.json({
      success: true,
      data: {
        code,
        language,
        analysis
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get AI status
const getAiStatus = async (req, res, next) => {
  try {
    const isAvailable = !!process.env.GEMINI_API_KEY;

    res.json({
      success: true,
      data: {
        available: isAvailable,
        features: {
          questionEnhancement: isAvailable,
          answerEnhancement: isAvailable,
          answerSuggestions: isAvailable,
          codeAnalysis: isAvailable
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enhanceQuestion,
  enhanceAnswer,
  generateAnswerSuggestion,
  analyzeCode,
  getAiStatus
}; 