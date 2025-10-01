// Direct service connections (bypassing problematic API Gateway)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const AUTH_BASE_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:8081/api'; // User service
const QUIZ_BASE_URL = process.env.REACT_APP_QUIZ_URL || 'http://localhost:8082/api'; // Question Bank service
const RESULT_BASE_URL = process.env.REACT_APP_RESULT_URL || 'http://localhost:8083/api'; // Result service
const ANALYTICS_BASE_URL = process.env.REACT_APP_ANALYTICS_URL || 'http://localhost:8084/api'; // Analytics service

// Smart routing function that directs requests to appropriate microservices
const getServiceBaseUrl = (url) => {
  if (url.startsWith('/auth')) return AUTH_BASE_URL;
  if (url.startsWith('/users')) return AUTH_BASE_URL;
  if (url.startsWith('/quizzes') || url.startsWith('/questions')) return QUIZ_BASE_URL;
  if (url.startsWith('/results')) return RESULT_BASE_URL;
  if (url.startsWith('/analytics') || url.startsWith('/reports')) return ANALYTICS_BASE_URL;
  
  // Default to API Gateway for unknown endpoints
  return API_BASE_URL;
};

const fetchAPI = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
  config.signal = controller.signal;

  const baseUrl = getServiceBaseUrl(url);
  console.log(`[DEBUG] Routing ${url} to ${baseUrl}`);
  
  try {
    const response = await fetch(`${baseUrl}${url}`, config);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      if (response.status === 401) {
        throw new Error('Invalid username or password');
      }
      if (response.status === 403) {
        throw new Error('Access denied');
      }
      if (response.status === 409) {
        throw new Error(errorData.message || 'User already exists with this email or username');
      }
      if (response.status >= 500) {
        throw new Error(`Server error (${response.status}): ${errorData.message || 'Please check if database is running and services are properly configured'}`);
      }
      if (response.status === 404) {
        throw new Error('Service endpoint not found. Please check if all microservices are running and registered with Eureka.');
      }
      
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Fetch error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 2 minutes. Services may still be starting up. Please wait a bit longer and try again. Check if all services are running at:\n- Eureka Server: http://localhost:8761\n- API Gateway: http://localhost:8080\n- User Service: http://localhost:8081\n- Quiz Service: http://localhost:8082\n- Result Service: http://localhost:8083\n- Analytics Service: http://localhost:8084');
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('ECONNREFUSED')) {
      throw new Error(`Cannot connect to service at ${baseUrl}. Please ensure all backend services are running:\n\n1. User Service: localhost:8081\n2. Quiz Service: localhost:8082\n3. Result Service: localhost:8083\n4. Analytics Service: localhost:8084\n5. Check MySQL is running\n\nIf services just started, please wait a few minutes for complete startup.`);
    }
    
    if (error.message.includes('TypeError: Failed to fetch')) {
      throw new Error('Network error: Cannot reach the backend services. Please check if:\n1. All services are running\n2. No firewall is blocking the connections\n3. CORS is properly configured');
    }
    
    throw error;
  }
};



const authService = {
  setAuthToken: (token) => {
    try {
      if (token) {
        localStorage.setItem('token', token);
      }
    } catch (e) {
      console.error('setAuthToken failed:', e);
    }
  },

  removeAuthToken: () => {
    try {
      localStorage.removeItem('token');
    } catch (e) {
      console.error('removeAuthToken failed:', e);
    }
  },

  // Register user - use direct user service connection
  register: async (userData) => {
    const response = await fetch(`${AUTH_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.message || `Registration failed with status ${response.status}`);
    }
    
    return await response.json();
  },

  // Login user - use direct user service connection
  login: async (credentials) => {
    const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      if (response.status === 401) {
        throw new Error('Invalid username or password');
      }
      throw new Error(errorData.message || `Login failed with status ${response.status}`);
    }
    
    return await response.json();
  },

  // Refresh token - use direct user service connection
  refreshToken: async (refreshToken) => {
    const response = await fetch(`${AUTH_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    return await response.json();
  },

  // Logout user - use direct user service connection
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${AUTH_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Validate token
  validateToken: async () => {
    return await fetchAPI('/users/validate', {
      method: 'POST',
    });
  },
};

export default authService;
export { fetchAPI };