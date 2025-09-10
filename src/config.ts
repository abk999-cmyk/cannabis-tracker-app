// API Configuration
const API_CONFIG = {
  development: 'http://localhost:8000/api/v1',
  production: process.env.REACT_APP_API_URL || 'https://cannabis-tracker-backend.up.railway.app/api/v1'
};

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? API_CONFIG.production 
  : API_CONFIG.development;

console.log('API Base URL:', API_BASE_URL);
