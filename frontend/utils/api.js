import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fetchDivisions = async () => {
  try {
    const response = await api.get('/divisions');
    return response.data;
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw error;
  }
};

export const fetchVenues = async () => {
  try {
    const response = await api.get('/venues');
    return response.data;
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
};

export const submitFeedback = async (data) => {
  try {
    const response = await api.post('/submit-feedback', data);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export default api;