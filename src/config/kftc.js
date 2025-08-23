// src/config/kftc.js
export const KFTC_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_KFTC_CLIENT_ID,
  REDIRECT_URI: process.env.REACT_APP_KFTC_REDIRECT_URI,
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
    state: generateState(),
    auth_type: '0'
  });
  
  return `${KFTC_CONFIG.AUTH_URL}?${params.toString()}`;
};

const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
export const BANK_CODES = {
  '004': '국민은행',
  '011': '농협은행',
  '020': '우리은행',
  '088': '신한은행',
  '081': '하나은행',
  '002': '한국산업은행',
  // 추가 은행 코드...
};