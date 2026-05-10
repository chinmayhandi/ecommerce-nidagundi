import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Automatically delete Content-Type for FormData so browser sets the boundary correctly
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Supabase v2 uses sb-<project-ref>-auth-token
    const projectId = import.meta.env.VITE_SUPABASE_URL; // Using the project ref from env
    const token = localStorage.getItem(`sb-${projectId}-auth-token`);
    
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken?.access_token) {
           config.headers['Authorization'] = `Bearer ${parsedToken.access_token}`;
        }
      } catch (e) {
        // Ignore error
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
