import { fetchAPI } from './authService';

const userService = {
  getUserProfile: async (userId) => {
    return await fetchAPI(`/users/profile/${userId}`, { method: 'GET' });
  },

  getUserByUsername: async (username) => {
    return await fetchAPI(`/users/username/${username}`, { method: 'GET' });
  },

  getAllUsers: async (role = null, active = null) => {
    let url = '/users';
    const params = new URLSearchParams();
    
    if (role) params.append('role', role);
    if (active !== null) params.append('active', active);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return await fetchAPI(url, { method: 'GET' });
  },

  getUsersByRole: async (role) => {
    return await fetchAPI(`/users/role/${role}`, { method: 'GET' });
  },

  searchUsers: async (query) => {
    return await fetchAPI(`/users/search?query=${encodeURIComponent(query)}`, { method: 'GET' });
  },

  updateUserProfile: async (userId, userData) => {
    return await fetchAPI(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  activateUser: async (userId) => {
    return await fetchAPI(`/users/${userId}/activate`, { method: 'PUT' });
  },

  deactivateUser: async (userId) => {
    return await fetchAPI(`/users/${userId}/deactivate`, { method: 'PUT' });
  },

  deleteUser: async (userId) => {
    return await fetchAPI(`/users/${userId}`, { method: 'DELETE' });
  },

  validateToken: async (token) => {
    return await fetchAPI('/users/validate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

export default userService;