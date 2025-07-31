// src/config/kftc.js
export const KFTC_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_KFTC_CLIENT_ID || '9a92d41c-5c0b-40eb-8099-414c81c5631d',
  REDIRECT_URI: process.env.REACT_APP_KFTC_REDIRECT_URI || 'http://localhost:3000/auth/kftc/callback',
  AUTH_URL: 'https://testapi.openbanking.or.kr/oauth/2.0/authorize',
  TOKEN_URL: 'https://testapi.openbanking.or.kr/oauth/2.0/token',
  API_BASE_URL: 'https://testapi.openbanking.or.kr',
};

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KFTC_CONFIG.CLIENT_ID,
    redirect_uri: KFTC_CONFIG.REDIRECT_URI,
    scope: 'login inquiry transfer',
    state: '1234567890',
    auth_type: '0'
  });
  
  return `${KFTC_CONFIG.AUTH_URL}?${params.toString()}`;
}; 