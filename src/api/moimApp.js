import axios from 'axios';

// API 기본 URL 설정
const MOIM_API_BASE_URL = 'http://localhost:8080/api/v1';

const moimApi = axios.create({
    baseURL: MOIM_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000,
});

moimApi.interceptors.request.use(
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

moimApi.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // 서버에서 반환하는 에러 메시지를 사용자에게 보여줍니다.
        const errorMessage = error.response?.data?.msg || error.response?.data || error.message;
        console.error('API Call Error:', errorMessage);
        
        if (error.response && error.response.status === 401) {
             // 401 Unauthorized 에러 발생 시 로그인 페이지로 리다이렉트
             // window.location.href = '/login';
        }
        return Promise.reject(new Error(errorMessage));
    }
);

// --- 모임(그룹) 관련 API ---

export const createGroup = async (groupData) => {
    try {
        const response = await moimApi.post('/moims', {
            moimname: groupData.moimName,
            moimdesp: groupData.moimDesp,
            createdByUsrId: groupData.createdByUsrId
        });
        
        const newMoim = response.data.data;
        alert(newMoim);
        return {
            id: newMoim.id,
            moimname: newMoim.moimname,
            moimname: newMoim.moimdesp,
            createdAt: newMoim.createdByUsrId
        };
    } catch (error) {
        throw error;
    }
};

export const getGroupsByUserId = async (userId) => {
    try {
        const response = await moimApi.get(`/moims/by-usr/${userId}`);
        
        return response.data.data.map(moim => ({
            id: moim.id,
            groupName: moim.moimname,
            description: moim.moimdesp,
            createdAt: moim.createdAt
        }));
    } catch (error) {
        throw error;
    }
};

export const getGroupDetails = async (groupId) => {
    try {
        const response = await moimApi.get(`/moims/${groupId}`);
        const moim = response.data;
        return {
            id: moim.id,
            groupName: moim.moimname,
            description: moim.moimdesp,
            createdAt: moim.createdAt
        };
    } catch (error) {
        throw error;
    }
};

// --- 회원 관련 API ---

export const getGroupMembers = async (groupId) => {
    try {
        const response = await moimApi.get(`/moims/${groupId}/members`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addMemberToGroup = async (groupId, memberData) => {
    try {
        const response = await moimApi.post(`/moims/${groupId}/members`, memberData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- 결제 관련 API ---

/**
 * 새로운 결제 내역을 추가합니다.
 * 백엔드 PaymentController의 POST /api/v1/payments 엔드포인트와 통신합니다.
 * @param {object} paymentData - 결제 정보 (moimId, amount, description 등)
 * @returns {Promise<object>} 생성된 결제 응답 DTO
 */
export const addPayment = async (paymentData) => {
    try {
        // 백엔드 PaymentController의 @RequestMapping("/api/v1/payments")에 맞춤
        const response = await moimApi.post('/payments', paymentData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * 특정 모임의 모든 결제 내역을 조회합니다.
 * @param {number} groupId - 모임 ID
 * @returns {Promise<Array<object>>} 결제 목록 배열
 */
export const getPaymentsByGroupId = async (groupId) => {
  try {
      // 백엔드 PaymentController의 GET /api/v1/moims/{moimId}/payments에 맞춤
      const response = await moimApi.get(`/moims/${groupId}/payments`);
      return response.data;
  } catch (error) {
      throw error;
  }
};

// --- 영수증 관련 API ---

/**
 * 특정 결제에 대한 영수증 사진을 업로드합니다.
 * 백엔드 ReceiptController의 POST /api/v1/payments/{paymentId}/receipts와 통신합니다.
 * @param {number} paymentId - 결제 ID
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<object>} 업로드된 영수증 정보
 */
export const uploadReceiptPhoto = async (paymentId, file) => {
  try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await moimApi.post(`/payments/${paymentId}/receipts`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });
      return response.data;
  } catch (error) {
      throw error;
  }
};

/**
* 특정 결제에 대한 영수증 사진 목록을 조회합니다.
* 백엔드 ReceiptController의 GET /api/v1/payments/{paymentId}/receipts와 통신합니다.
* @param {number} paymentId - 결제 ID
* @returns {Promise<Array<object>>} 영수증 목록 배열
*/
export const getReceiptPhotos = async (paymentId) => {
  try {
      const response = await moimApi.get(`/payments/${paymentId}/receipts`);
      return response.data;
  } catch (error) {
      throw error;
  }
};
