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
    try {
      console.log('Creating quiz:', quizData);
      
      // Transform quiz data to match backend DTO expectations
      const backendQuizData = {
        title: quizData.title,
        description: quizData.description || '',
        timeLimit: quizData.timeLimit || 30,
        category: quizData.category || quizData.topic || 'General',
        difficulty: quizData.difficulty.toUpperCase(),
        isActive: quizData.isActive !== undefined ? quizData.isActive : true,
        createdBy: quizData.createdBy,
        questions: quizData.questions ? quizData.questions.map(q => ({
          questionText: q.questionText || q.question,
          type: q.type || 'MULTIPLE_CHOICE',
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          marks: q.marks || q.points || 1,
          difficulty: q.difficulty || quizData.difficulty.toUpperCase(),
          category: q.category || quizData.category || 'General'
        })) : []
      };
      
      const response = await fetchAPI('/quizzes', {
        method: 'POST',
        body: JSON.stringify(backendQuizData),
      });
      
      console.log('Quiz created successfully:', response);
      return response;
    } catch (error) {
      console.error('Quiz creation failed:', error);
      if (error.message.includes('400')) {
        throw new Error('Invalid quiz data. Please check all required fields are filled correctly.');
      } else if (error.message.includes('500')) {
        throw new Error('Server error while creating quiz. Please try again later.');
      }
      throw error;
    }
  },

  generateAiQuiz: async (generationRequest) => {
    try {
      console.log('Attempting AI quiz generation:', generationRequest);
      
      // Transform the request to match backend DTO expectations
      const backendRequest = {
        topic: generationRequest.topic,
        difficulty: generationRequest.difficulty.toUpperCase(), // Ensure uppercase
        questionCount: generationRequest.questionCount,
        questionType: generationRequest.questionType || 'MULTIPLE_CHOICE',
        timeLimit: generationRequest.timeLimit || 30,
        createdBy: generationRequest.createdBy,
        description: generationRequest.description || `AI generated quiz on ${generationRequest.topic}`,
        tags: generationRequest.tags || generationRequest.topic
      };
      
      const response = await fetchAPI('/quizzes/generate', {
        method: 'POST',
        body: JSON.stringify(backendRequest),
      });
      console.log('AI quiz generation successful:', response);
      return response;
    } catch (error) {
      console.error('AI quiz generation failed:', error);
      // Provide user-friendly error message
      if (error.message.includes('400')) {
        throw new Error('Invalid request parameters for AI quiz generation. Please check your topic, difficulty level, and question count settings.');
      } else if (error.message.includes('not configured') || error.message.includes('DISABLED')) {
        throw new Error('AI quiz generation is currently disabled. Please set up Gemini AI API key to use this feature, or try manual quiz creation instead.');
      } else if (error.message.includes('500')) {
        throw new Error('AI quiz generation is currently unavailable. This may be due to API configuration issues. Please try manual quiz creation instead.');
      } else if (error.message.includes('404')) {
        throw new Error('AI quiz generation service not found. Please contact support.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('AI quiz generation access denied. Please check API configuration.');
      } else if (error.message.includes('Cannot connect')) {
        throw new Error('Cannot connect to AI quiz generation service. Please ensure the Question Bank service is running on port 8082.');
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
    try {
      const response = await fetchAPI(`/quizzes/${quizId}`, { method: 'DELETE' });
      return response;
    } catch (error) {
      console.error('Delete quiz error:', error);
      if (error.message.includes('404')) {
        throw new Error('Quiz not found or already deleted');
      } else if (error.message.includes('403')) {
        throw new Error('You do not have permission to delete this quiz');
      } else if (error.message.includes('500')) {
        throw new Error('Server error while deleting quiz. Please try again later.');
      }
      throw error;
    }
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
