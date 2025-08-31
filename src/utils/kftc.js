import { KFTC_CONFIG } from '../config/kftc';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * API 요청을 위한 기본 헤더 생성
 */
const getApiHeaders = (accessToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // JWT 토큰이 있으면 Authorization 헤더 추가
  const jwtToken = localStorage.getItem('jwtToken');
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }
  
  return headers;
};

/**
 * API 응답 처리 유틸리티
 */
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

/**
 * 백엔드를 통한 KFTC 토큰 교환
 * @param {Object} params - { code, redirect_uri }
 * @returns {Promise<Object>} 토큰 응답
 */
export const fetchKftcToken = async (params) => {
  try {
    console.log('백엔드 토큰 교환 요청:', params);
    
    const response = await fetch(`${API_BASE_URL}/api/kftc/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // JWT 토큰이 있다면 추가
        ...(localStorage.getItem('accessToken') && {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        })
      },
      body: JSON.stringify(params)
    });

    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await handleApiResponse(response);
    
    // 토큰 정보 저장
    if (data.accessToken) {
      localStorage.setItem('kftc_access_token', data.accessToken);
      localStorage.setItem('kftc_user_seq_no', data.userSeqNo);
      localStorage.setItem('kftc_token_expires_at', 
        new Date(Date.now() + (data.expiresIn * 1000)).toISOString());
    }
    
    return {
      accessToken: data.accessToken,
      userSeqNo: data.userSeqNo,
      tokenType: data.tokenType,
      expiresIn: data.expiresIn,
      scope: data.scope
    };
    
  } catch (error) {
    console.error('KFTC 토큰 교환 실패:', error);
    throw new Error(`토큰 교환 실패: ${error.message}`);
  }
};

/**
 * 백엔드를 통한 계좌 정보 조회
 * @param {Object} params - { accessToken, userSeqNo }
 * @returns {Promise<Object>} 계좌 정보
 */
export const fetchAccountInfoViaBackend = async (params) => {
  try {
    console.log('백엔드 계좌 정보 조회 요청:', params);
    
    const response = await fetch(`${API_BASE_URL}/api/kftc/account-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('accessToken') && {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        })
      },
      body: JSON.stringify(params)
    });

    const data = await handleApiResponse(response);

    console.log('계좌 정보 조회 성공:', data);
    
    return data;
    
  } catch (error) {
    console.error('계좌 정보 조회 실패:', error);
    throw new Error(`계좌 정보 조회 실패: ${error.message}`);
  }
};

/**
 * 백엔드를 통한 통합 처리 (토큰 교환 + 계좌 정보 조회)
 * @param {Object} params - { code, redirect_uri }
 * @returns {Promise<Object>} 계좌 정보
 */
export const fetchTokenAndAccountInfo = async (params) => {
  try {
    console.log('백엔드 통합 처리 요청:', params);
    
    const response = await fetch(`${API_BASE_URL}/api/kftc/token-exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('accessToken') && {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        })
      },
      body: JSON.stringify(params)
    });

    const data = await handleApiResponse(response);
    
    // 토큰 정보를 로컬 스토리지에 저장
    if (data.accessToken) {
      localStorage.setItem('kftc_access_token', data.accessToken);
      localStorage.setItem('kftc_user_seq_no', data.userSeqNo);
      localStorage.setItem('kftc_token_expires_at', 
        new Date(Date.now() + (data.expiresIn * 1000)).toISOString());
    }
    return data;
    
  } catch (error) {
    // 네트워크 오류인 경우
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('네트워크 연결 오류가 발생했습니다.');
    }
    
    throw new Error(`통합 처리 실패: ${error.message}`);
  }
};

/**
 * 프론트엔드에서 직접 KFTC API 호출 (CORS 이슈가 있을 수 있음)
 * @param {Object} params - { accessToken, userSeqNo }
 * @returns {Promise<Object>} 계좌 정보
 */
export const fetchAccountInfoDirect = async (params) => {
  try {
    const { accessToken, userSeqNo } = params;
    
    // 계좌 목록 조회
    const accountListResponse = await fetch(`${KFTC_CONFIG.API_BASE_URL}/v2.0/account/list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bank_tran_id: `T990${Date.now()}`,
        user_seq_no: userSeqNo || '1100000001',
        include_cancel_yn: 'Y',
        sort_order: 'D',
        tran_dtime: new Date().toISOString().replace(/[-:]/g, '').slice(0, 14)
      })
    });

    if (!accountListResponse.ok) {
      throw new Error('계좌 목록 조회 실패');
    }

    const accountData = await accountListResponse.json();
    
    if (!accountData.res_list || accountData.res_list.length === 0) {
      throw new Error('등록된 계좌가 없습니다.');
    }

    const account = accountData.res_list[0];
    
    // 기본 계좌 정보
    const accountInfo = {
      bankName: account.bank_name || '알 수 없는 은행',
      accountNumber: account.account_num_masked || '****-****-****',
      ownerName: account.account_holder_name || '알 수 없음',
      balance: '0',
      transactions: [],
      fintechUseNum: account.fintech_use_num
    };

    // 잔액 조회
    try {
      const balanceResponse = await fetch(`${KFTC_CONFIG.API_BASE_URL}/v2.0/account/balance/fin_num`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bank_tran_id: `T991${Date.now()}`,
          fintech_use_num: account.fintech_use_num,
          tran_dtime: new Date().toISOString().replace(/[-:]/g, '').slice(0, 14)
        })
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        accountInfo.balance = balanceData.balance_amt || '0';
      }
    } catch (balanceError) {
      console.warn('잔액 조회 실패:', balanceError);
    }

    // 거래 내역 조회 (최근 7일)
    try {
      const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 10).replace(/-/g, '');
      const toDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      const transactionResponse = await fetch(`${KFTC_CONFIG.API_BASE_URL}/v2.0/account/transaction_list/fin_num`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bank_tran_id: `T992${Date.now()}`,
          fintech_use_num: account.fintech_use_num,
          inquiry_type: 'A',
          inquiry_base: 'D',
          from_date: fromDate,
          to_date: toDate,
          sort_order: 'D',
          tran_dtime: new Date().toISOString().replace(/[-:]/g, '').slice(0, 14)
        })
      });

      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json();
        accountInfo.transactions = transactionData.res_list || [];
      }
    } catch (transactionError) {
      console.warn('거래 내역 조회 실패:', transactionError);
    }

    return accountInfo;
    
  } catch (error) {
    console.error('직접 계좌 정보 조회 오류:', error);
    throw error;
  }
};

/**
 * 최신 잔액 조회
 * @param {Object} params - { accessToken, fintechUseNum }
 * @returns {Promise<string>} 잔액
 */
export const fetchLatestBalance = async (params) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/kftc/balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('accessToken') && {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        })
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('잔액 조회 실패');
    }

    const data = await response.json();
    return data.balance;
    
  } catch (error) {
    console.error('잔액 조회 실패:', error);
    throw error;
  }
};

/**
 * 백엔드 헬스체크
 * @returns {Promise<Object>} 헬스체크 결과
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/kftc/health`);
    
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('백엔드 헬스체크 실패:', error);
    throw error;
  }
};

/**
 * 계좌 잔액 조회
 */
export const fetchAccountBalance = async (fintechUseNum) => {
  try {
    const response = await fetch(`${KFTC_CONFIG.API_BASE_URL}/kftc/accounts/${fintechUseNum}/balance`, {
      method: 'GET',
      headers: getApiHeaders()
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('잔액 조회 실패:', error);
    throw error;
  }
};

/**
 * 거래내역 조회
 */
export const fetchTransactionHistory = async (fintechUseNum, fromDate, toDate, sortOrder = 'DESC') => {
  try {
    const params = new URLSearchParams({
      from_date: fromDate,
      to_date: toDate,
      sort_order: sortOrder
    });

    const response = await fetch(
      `${KFTC_CONFIG.API_BASE_URL}/kftc/accounts/${fintechUseNum}/transactions?${params}`, {
      method: 'GET',
      headers: getApiHeaders()
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('거래내역 조회 실패:', error);
    throw error;
  }
};

/**
 * 출금이체 (송금)
 */
export const processWithdrawTransfer = async (transferData) => {
  try {
    console.log('출금이체 요청:', transferData);
    
    const response = await fetch(`${KFTC_CONFIG.API_BASE_URL}/kftc/transfer/withdraw`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(transferData)
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('출금이체 실패:', error);
    throw error;
  }
};

/**
 * 입금이체 (수취)
 */
export const processDepositTransfer = async (transferData) => {
  try {
    console.log('입금이체 요청:', transferData);
    
    const response = await fetch(`${KFTC_CONFIG.API_BASE_URL}/kftc/transfer/deposit`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(transferData)
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('입금이체 실패:', error);
    throw error;
  }
};

/**
 * 토큰 유효성 검사
 */
export const isKftcTokenValid = () => {
  const token = localStorage.getItem('kftc_access_token');
  const expiresAt = localStorage.getItem('kftc_token_expires_at');
  
  if (!token || !expiresAt) {
    return false;
  }
  
  return new Date() < new Date(expiresAt);
};

/**
 * 토큰 정리
 */
export const clearKftcTokens = () => {
  localStorage.removeItem('kftc_access_token');
  localStorage.removeItem('kftc_user_seq_no');
  localStorage.removeItem('kftc_token_expires_at');
};