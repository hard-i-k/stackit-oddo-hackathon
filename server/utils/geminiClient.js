const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiClient {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async enhanceQuestion(title, description) {
    try {
      const prompt = `Please enhance this programming question to make it more clear and detailed. 
      Original title: ${title}
      Original description: ${description}
      
      Provide an improved title and description that:
      1. Is more specific and clear
      2. Includes relevant context
      3. Mentions specific technologies or frameworks if applicable
      4. Is well-structured and easy to understand
      
      Return the response in JSON format:
      {
        "enhancedTitle": "improved title",
        "enhancedDescription": "improved description",
        "suggestedTags": ["tag1", "tag2", "tag3"]
      }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // If JSON parsing fails, return a structured response
        return {
          enhancedTitle: title,
          enhancedDescription: description,
          suggestedTags: [],
          aiSuggestion: text
        };
      }
    } catch (error) {
      console.error('Error enhancing question with Gemini:', error);
      return {
        enhancedTitle: title,
        enhancedDescription: description,
        suggestedTags: [],
        error: 'Failed to enhance with AI'
      };
    }
  }

  async enhanceAnswer(content) {
    try {
      const prompt = `Please enhance this programming answer to make it more helpful and comprehensive. 
      Original answer: ${content}
      
      Provide an improved answer that:
      1. Is more detailed and explanatory
      2. Includes code examples where appropriate
      3. Follows best practices
      4. Is well-structured and easy to follow
      
      Return the enhanced answer as plain text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error enhancing answer with Gemini:', error);
      return content; // Return original content if enhancement fails
    }
  }

  async generateAnswerSuggestion(questionTitle, questionDescription) {
    try {
      const prompt = `Based on this programming question, provide a helpful answer suggestion.
      Question title: ${questionTitle}
      Question description: ${questionDescription}
      
      Provide a comprehensive answer that:
      1. Addresses the main points of the question
      2. Includes relevant code examples
      3. Explains the reasoning behind the solution
      4. Follows best practices
      
      Return the answer as plain text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating answer suggestion with Gemini:', error);
      return null;
    }
  }

  async analyzeCode(code, language) {
    try {
      const prompt = `Please analyze this ${language} code and provide feedback:
      Code: ${code}
      
      Provide analysis including:
      1. Code quality assessment
      2. Potential improvements
      3. Best practices suggestions
      4. Security considerations (if applicable)
      
      Return the analysis as plain text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing code with Gemini:', error);
      return 'Unable to analyze code at this time.';
    }
  }
}

module.exports = new GeminiClient(); 