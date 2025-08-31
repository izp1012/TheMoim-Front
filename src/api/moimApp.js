import axios from 'axios';

// API 기본 URL 설정
const MOIM_API_BASE_URL = process.env.REACT_APP_MOIM_API_BASE_URL;

const moimApi = axios.create({
    baseURL: MOIM_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 300000,
});

moimApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
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
    async (error) => {
        const originalRequest = error.config;
        const isTokenExpired = error.response?.status === 401 && !originalRequest._retry;
    
        // 만료된 토큰이 감지되면 (401 에러)
        if (isTokenExpired) {
          originalRequest._retry = true; // 재요청 플래그 설정
          
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            try {
              // 1. Refresh Token을 사용해 새로운 Access Token 요청
              const response = await moimApi.post('/api/token/refreshToken', accessToken, {
                headers: {
                  'Authorization': `Bearer ${refreshToken}`
                }
              });
    
              const { accessToken, refreshToken: newRefreshToken } = response.data;
    
              // 2. 새로운 토큰을 로컬 스토리지에 저장
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
    
              // 3. 원래 요청의 헤더를 새 Access Token으로 업데이트
              authApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
    
              console.log('토큰 재발급 및 원래 요청 재시도 성공');
              
              // 4. 원래의 실패한 요청 재시도
              return authApi(originalRequest);
            } catch (refreshError) {
              // Refresh Token마저 만료되었거나 유효하지 않은 경우, 로그아웃 처리
              console.error('Refresh Token이 만료되었거나 유효하지 않습니다. 로그아웃 처리.');
              localStorage.clear();
              router.push('/login');
              return Promise.reject(refreshError);
            }
          } else {
            // Refresh Token이 없으면 로그인 페이지로 리다이렉션
            console.error('Refresh Token이 없습니다. 로그아웃 처리.');
            localStorage.clear();
            router.push('/login');
            return Promise.reject(error);
          }
        }
    
        // 토큰 만료가 아닌 다른 401 에러는 그대로 반환
        return Promise.reject(new Error(errorMessage));
    }
);

moimApi.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const isTokenExpired = error.response?.status === 401 && !originalRequest._retry;
  
      // 만료된 토큰이 감지되면 (401 에러)
      if (isTokenExpired) {
        originalRequest._retry = true; // 재요청 플래그 설정
        
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
            try {
                // 1. DTO 객체를 생성하여 요청 본문에 담아 전송
            const tokenDTO = {
                refreshToken: refreshToken
            };

            // 2. 리프레시 토큰을 이용해 새로운 Access Token 요청
            const response = await axiosInstance.post('/api/token/refreshToken', tokenDTO);

            const { accessToken } = response.data;

            // 3. 새로운 Access Token을 로컬 스토리지에 저장
            localStorage.setItem('accessToken', accessToken);

            // 4. 원래 요청의 Authorization 헤더를 새 Access Token으로 업데이트
            moimApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
    
            console.log('Access Token이 성공적으로 재발급되었습니다. 원래 요청을 다시 시도합니다.');
            
            // 5. 원래의 실패한 요청 재시도
            return moimApi(originalRequest);
          } catch (refreshError) {
            // 리프레시 토큰마저 만료되었거나 유효하지 않은 경우, 로그아웃 처리
            console.error('Refresh Token이 유효하지 않습니다. 로그아웃 처리.');
            localStorage.clear();
            router.push('/login');
            return Promise.reject(refreshError);
          }
        } else {
          // 리프레시 토큰이 없으면 로그인 페이지로 리다이렉트
          console.error('Refresh Token이 없습니다. 로그아웃 처리.');
          localStorage.clear();
          router.push('/login');
          return Promise.reject(error);
        }
      }
  
      // 토큰 만료가 아닌 다른 401 에러는 그대로 반환
      return Promise.reject(error);
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
