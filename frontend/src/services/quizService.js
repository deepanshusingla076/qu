import { fetchAPI } from './authService';

const quizService = {
  getAllQuizzes: async (page = 0, size = 10) => {
    return await fetchAPI(`/quizzes?page=${page}&size=${size}`, { method: 'GET' });
  },

  getQuizById: async (quizId) => {
    return await fetchAPI(`/quizzes/${quizId}`, { method: 'GET' });
  },

  getQuizzesByTopic: async (topic) => {
    return await fetchAPI(`/quizzes/topic/${encodeURIComponent(topic)}`, { method: 'GET' });
  },

  getQuizzesByDifficulty: async (difficulty) => {
    return await fetchAPI(`/quizzes/difficulty/${difficulty}`, { method: 'GET' });
  },

  getQuizzesByUser: async (userId) => {
    return await fetchAPI(`/quizzes/user/${userId}`, { method: 'GET' });
  },

  createQuiz: async (quizData) => {
    return await fetchAPI('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  generateAiQuiz: async (generationRequest) => {
    try {
      console.log('Attempting AI quiz generation:', generationRequest);
      const response = await fetchAPI('/quizzes/generate', {
        method: 'POST',
        body: JSON.stringify(generationRequest),
      });
      console.log('AI quiz generation successful:', response);
      return response;
    } catch (error) {
      console.error('AI quiz generation failed:', error);
      // Provide user-friendly error message
      if (error.message.includes('not configured') || error.message.includes('DISABLED')) {
        throw new Error('AI quiz generation is currently disabled. Please set up Gemini AI API key to use this feature, or try manual quiz creation instead.');
      } else if (error.message.includes('500')) {
        throw new Error('AI quiz generation is currently unavailable. This may be due to API configuration issues. Please try manual quiz creation instead.');
      } else if (error.message.includes('404')) {
        throw new Error('AI quiz generation service not found. Please contact support.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('AI quiz generation access denied. Please check API configuration.');
      } else {
        throw new Error(`AI quiz generation failed: ${error.message}`);
      }
    }
  },

  updateQuiz: async (quizId, quizData) => {
    return await fetchAPI(`/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  },

  deleteQuiz: async (quizId) => {
    return await fetchAPI(`/quizzes/${quizId}`, { method: 'DELETE' });
  },

  getQuizQuestions: async (quizId) => {
    return await fetchAPI(`/quizzes/${quizId}/questions`, { method: 'GET' });
  },

  addQuestionToQuiz: async (quizId, questionData) => {
    return await fetchAPI(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  updateQuestion: async (quizId, questionId, questionData) => {
    return await fetchAPI(`/quizzes/${quizId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  },

  deleteQuestion: async (quizId, questionId) => {
    return await fetchAPI(`/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' });
  },

  searchQuizzes: async (keyword) => {
    return await fetchAPI(`/quizzes/search?keyword=${encodeURIComponent(keyword)}`, { method: 'GET' });
  },

  getQuizStats: async (quizId) => {
    return await fetchAPI(`/quizzes/${quizId}/stats`, { method: 'GET' });
  },
};

export default quizService;
