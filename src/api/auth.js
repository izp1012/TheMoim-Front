// src/api/auth.js
import axios from 'axios';

// 백엔드 인증 관련 API의 기본 URL 설정
const AUTH_API_BASE_URL = process.env.REACT_APP_AUTH_API_BASE_URL || 'http://localhost:8080/api/';

const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 일반 로그인 API
const login = async (usrname, password) => {
  try {
    const response = await authApi.post('/login', { usrname, password });
    // 서버에서 반환하는 토큰이나 사용자 정보를 저장
    // 예: localStorage.setItem('usrId', response.data.usrId);
    return response.data; // 로그인 성공 시 사용자 정보 등 반환
  } catch (error) {
    console.error('로그인 실패:', error.response ? error.response.data : error.msg);
    throw new Error(error.response?.data?.msg || '로그인에 실패했습니다.');
  }
};

// 일반 회원가입 API
const signup = async (usrname, email, password) => {
  try {
    const response = await authApi.post('/signup', {usrname, email, password });
    return response.data; // 회원가입 성공 시 정보 반환
  } catch (error) {
    // console.error('회원가입 실패:', error.response ? error.response.data : error.msg);
    console.error('회원가입 실패:', error.response?.data?.msg);
    throw new Error(error.response?.data?.msg || '회원가입에 실패했습니다.');
  }
};

// --- 소셜 로그인 관련 (프론트엔드에서 실제 인증 흐름 구현 필요) ---
// 이 함수들은 실제 소셜 로그인 SDK 초기화 및 인증 팝업/리다이렉션 로직이 들어갈 자리입니다.
// 백엔드에서는 소셜 로그인 후 전달되는 '인가 코드'나 '토큰'을 받아 자체적으로 회원가입/로그인 처리합니다.

const kakaoLogin = async () => {
  console.log('카카오 소셜 로그인 버튼 클릭됨');
  alert('카카오 소셜 로그인 기능 구현 예정 (실제 SDK 연동 필요)');
  // 실제 카카오 로그인 SDK를 사용하여 인증 흐름 시작
  // 예: window.Kakao.Auth.authorize({ redirectUri: 'YOUR_REDIRECT_URI' });
  // 이후 백엔드로 인가 코드를 보내 로그인 처리
};

const googleLogin = async () => {
  console.log('Google 소셜 로그인 버튼 클릭됨');
  // alert('Google 소셜 로그인 기능 구현 예정 (실제 SDK 연동 필요)');
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  // 실제 Google 로그인 SDK를 사용하여 인증 흐름 시작
  // 예: google.accounts.id.prompt();
  // 이후 백엔드로 인증 토큰을 보내 로그인 처리
};

export {
  login,
  signup,
  kakaoLogin,
  googleLogin,
};