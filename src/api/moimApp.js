// src/api/moimApp.js
import axios from 'axios';

// Spring Boot 백엔드 서버의 기본 URL (개발 환경 기준)
// React 환경 변수를 사용하여 환경별로 다르게 설정할 수 있습니다.
// Create React App 기준: REACT_APP_ 접두사 사용
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1/meeting-account';

// axios 인스턴스 생성
// 매번 baseURL을 지정할 필요 없이, 공통 설정 및 인터셉터 적용 가능
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${localStorage.getItem('token')}` // 인증 토큰이 있다면 추가
  },
  timeout: 5000, // 5초 타임아웃
});

// Axios 인터셉터 예시 (선택 사항)
// 요청 전에 로딩 스피너 활성화, 토큰 추가 등
api.interceptors.request.use(
  config => {
    // console.log('Request Interceptor:', config);
    // 예: 토큰이 있다면 모든 요청 헤더에 추가
    // const token = localStorage.getItem('accessToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 후에 로딩 스피너 비활성화, 에러 처리 등
api.interceptors.response.use(
  response => {
    // console.log('Response Interceptor:', response);
    return response;
  },
  error => {
    // console.error('API Call Error:', error.response ? error.response.data : error.message);
    // 예: 401 Unauthorized 에러 발생 시 로그인 페이지로 리다이렉트
    // if (error.response && error.response.status === 401) {
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);


// --- 사용자 관련 API 호출 (기존 `addUser`, `getAllUsers`) ---
// Note: 현재 프로젝트 구조에서는 User 엔티티가 직접 사용되지 않고, Member 엔티티가 사용자 역할을 대체합니다.
// 하지만 이전 코드에 있었으므로 일단 포함합니다. 필요 없으면 제거 가능.

const addUser = async (userName) => {
  try {
    const response = await api.post('/users', { name: userName });
    return response.data;
  } catch (error) {
    console.error('사용자 추가 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- 금액/거래 관련 API 호출 (기존 `addTransaction`, `getAllTransactions`) ---

const addTransaction = async (amount, description) => {
  try {
    const response = await api.post('/transactions', { amount, description });
    return response.data;
  } catch (error) {
    console.error('금액 추가 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAllTransactions = async () => {
  try {
    const response = await api.get('/transactions');
    return response.data;
  } catch (error) {
    console.error('거래 목록 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- 사진 관련 API 호출 (기존 `uploadPhoto`, `getAllPhotos`) ---

const uploadPhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file); // 'file'은 Spring Boot 컨트롤러에서 @RequestParam("file")로 받을 이름

    const response = await api.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('사진 업로드 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAllPhotos = async () => {
  try {
    const response = await api.get('/photos');
    return response.data;
  } catch (error) {
    console.error('사진 목록 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- 회원 관련 API 호출 (최근 추가된 `addMember`, `getAllMembers`) ---

const addMember = async (memberData) => {
  try {
    const response = await api.post('/members', memberData);
    return response.data;
  } catch (error) {
    console.error('회원 추가 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAllMembers = async () => {
  try {
    const response = await api.get('/members');
    return response.data;
  } catch (error) {
    console.error('회원 목록 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};


// 모든 API 함수를 export 하여 다른 컴포넌트에서 import하여 사용
export {
  addUser,
  getAllUsers,
  addTransaction,
  getAllTransactions,
  uploadPhoto,
  getAllPhotos,
  addMember,
  getAllMembers
};