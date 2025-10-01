import { fetchAPI } from './authService';

const resultService = {
  submitResult: async (resultData) => {
    return await fetchAPI('/results/submit', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
  },

  submitQuizAttempt: async (attemptData) => {
    return await fetchAPI('/results/submit', {
      method: 'POST',
      body: JSON.stringify(attemptData),
    });
  },

  getResultById: async (resultId) => {
    return await fetchAPI(`/results/${resultId}`, { method: 'GET' });
  },

  getResultsByUser: async (userId, page = 0, size = 10) => {
    return await fetchAPI(`/results/user/${userId}?page=${page}&size=${size}`, { method: 'GET' });
  },

  getResultsByQuiz: async (quizId, page = 0, size = 10) => {
    return await fetchAPI(`/results/quiz/${quizId}?page=${page}&size=${size}`, { method: 'GET' });
  },

  getQuizStatistics: async (quizId) => {
    return await fetchAPI(`/results/quiz/${quizId}/stats`, { method: 'GET' });
  },

  getUserStatistics: async (userId) => {
    return await fetchAPI(`/results/user/${userId}/stats`, { method: 'GET' });
  },
};

export default resultService;