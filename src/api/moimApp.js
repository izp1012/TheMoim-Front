// src/api/moimApp.js
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

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

// --- 1. USR (앱 사용자/총무) 관련 API ---
// 현재 로그인 기능이 없으므로, Usr 관련 API는 최소화. UsrGroup 생성 시 created_by_usr_id로 임시값 사용 가능

// --- 2. USR_GROUP (모임/단체) 관련 API ---
const createGroup = async (groupData) => {
  try {
    const response = await api.post('/groups', groupData); // /api/groups
    return response.data;
  } catch (error) {
    console.error('그룹 생성 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAllGroups = async (usrId) => { // 특정 총무의 그룹 목록을 가져올 수 있도록 usrId를 인자로 받음 (옵션)
  try {
    const response = await api.get('/groups', { params: { usrId } }); // /api/groups?usrId=...
    return response.data;
  } catch (error) {
    console.error('그룹 목록 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getGroupDetails = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}`); // /api/groups/{groupId}
    return response.data;
  } catch (error) {
    console.error('그룹 상세 정보 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// 특정 사용자의 메인/기본 그룹 정보를 가져오는 API (가정)
// 백엔드에서 사용자별로 '대표 그룹'을 설정하거나, 가장 최근에 활동한 그룹 등을 반환하도록 구현 필요
const getDefaultGroup = async (usrId) => {
    try {
      // 백엔드에서 usrId를 기반으로 기본 그룹을 조회하는 로직 필요
      // 여기서는 일단 모든 그룹 중 첫 번째 그룹을 기본 그룹으로 반환하는 것으로 가정
      const response = await api.get('/groups/default', { params: { usrId } }); // 예시: /api/groups/default?usrId=...
      return response.data;
    } catch (error) {
      // 기본 그룹이 없을 경우 404 Not Found 등의 에러가 발생할 수 있음
      if (error.response && error.response.status === 404) {
        return null; // 그룹이 없는 경우 null 반환
      }
      console.error('기본 그룹 조회 실패:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

// --- 3. MEMBER (실제 사람) 및 USR_GROUP_MEMBER (그룹 내 회원) 관련 API ---
// 회원 추가 (특정 그룹에 회원 추가) - USR_GROUP_MEMBER 생성
const addMemberToGroup = async (groupId, memberData) => { // memberData는 { name, contactInfo, role, defaultFee, etc. }
  try {
    // 백엔드에서 Member를 먼저 생성하거나 조회하고, UsrGroupMember를 연결
    const response = await api.post(`/groups/${groupId}/members`, memberData); // /api/groups/{groupId}/members
    return response.data; // UsrGroupMember 객체 반환 예상
  } catch (error) {
    console.error('그룹 회원 추가 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/members`); // /api/groups/{groupId}/members
    return response.data; // UsrGroupMember 객체 목록 반환 예상
  } catch (error) {
    console.error('그룹 회원 목록 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};


// --- 4. PAYMENT (모임비/결제) 관련 API ---
const addPayment = async (groupId, paymentData) => { // paymentData는 { amount, type, description, payerMemberId, paymentDate }
  try {
    const response = await api.post(`/groups/${groupId}/payments`, paymentData); // /api/groups/{groupId}/payments
    return response.data;
  } catch (error) {
    console.error('결제/모임비 추가 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getGroupPayments = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/payments`); // /api/groups/{groupId}/payments
    return response.data;
  } catch (error) {
    console.error('결제/모임비 목록 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- 5. RECEIPT_PHOTO (영수증) 관련 API ---
const uploadReceiptPhoto = async (paymentId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // 누가 업로드했는지 정보도 추가하려면 formData.append('uploaderId', currentUsrId);
    
    const response = await api.post(`/payments/${paymentId}/receipts`, formData, { // /api/payments/{paymentId}/receipts
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('영수증 사진 업로드 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getReceiptPhotos = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/receipts`); // /api/payments/{paymentId}/receipts
    return response.data;
  } catch (error) {
    console.error('영수증 사진 조회 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
};


// --- 기타 API 함수 (기존 `addUser`, `getAllUsers` 등은 현재 새로운 엔티티에 맞춰 재정의가 필요하나, 이전 코드 유지 차원) ---
// Note: `addUser`, `getAllUsers`는 이제 `UsrGroup`이나 `UsrGroupMember`와 혼동될 수 있으므로,
// 새 엔티티 구조에서는 직접 사용하지 않을 것을 권장합니다.

const addUser = async (userName) => { /* ... */ }; // 이 함수는 제거하거나 Usr (앱 사용자) 관련 API로 변경하는 것이 좋음
const getAllUsers = async () => { /* ... */ }; // 이 함수도 제거하거나 Usr (앱 사용자) 관련 API로 변경하는 것이 좋음

// 기존 Transaction, Photo 함수는 이제 Payment 및 ReceiptPhoto와 겹치므로 제거하거나 Payment 관련 함수로 통합하는 것이 좋음
const addTransaction = async (amount, description) => { /* ... */ }; // addPayment로 대체
const getAllTransactions = async () => { /* ... */ }; // getGroupPayments로 대체
const uploadPhoto = async (file) => { /* ... */ }; // uploadReceiptPhoto로 대체
const getAllPhotos = async () => { /* ... */ }; // getReceiptPhotos로 대체

// 모든 API 함수를 export 하여 다른 컴포넌트에서 import하여 사용
export {
  createGroup,
  getAllGroups,
  getGroupDetails,
  getDefaultGroup,
  addMemberToGroup,
  getGroupMembers,
  addPayment,
  getGroupPayments,
  uploadReceiptPhoto,
  getReceiptPhotos,
  // 기존 함수들은 새 구조에 따라 리팩토링 필요 (일단 유지)
  addUser, // Usr 관련 API로 재정의 필요
  getAllUsers, // Usr 관련 API로 재정의 필요
  addTransaction, // addPayment로 대체
  getAllTransactions, // getGroupPayments로 대체
  uploadPhoto, // uploadReceiptPhoto로 대체
  getAllPhotos // getReceiptPhotos로 대체
};