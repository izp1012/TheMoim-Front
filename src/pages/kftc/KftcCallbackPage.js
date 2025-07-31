import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchKftcToken } from './kftc';
import { KFTC_CONFIG } from '../../config/kftc';

// 계좌 정보 조회 함수
const fetchAccountInfo = async (tokenResponse) => {
  try {
    const { accessToken, userSeqNo } = tokenResponse;
    
    // 계좌 목록 조회 API 호출
    const response = await fetch(`${KFTC_CONFIG.API_BASE_URL}/v2.0/account/list`, {
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.rsp_message || '계좌 정보 조회 실패');
    }

    const data = await response.json();
    
    if (data.res_list && data.res_list.length > 0) {
      const account = data.res_list[0];
      
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
    } else {
      throw new Error('등록된 계좌가 없습니다.');
    }
  } catch (error) {
    console.error('계좌 정보 조회 오류:', error);
    throw error;
  }
};

function KftcCallbackPage() {
  const location = useLocation();
  const [status, setStatus] = useState('처리 중...');
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const error = params.get('error');
        const state = params.get('state');
        
        console.log('콜백 파라미터:', { code, error, state });

        if (error) {
          throw new Error(`인증 오류: ${error}`);
        }

        if (!code) {
          throw new Error('인증 코드가 없습니다.');
        }

        setStatus('토큰 교환 중...');
        
        const redirect_uri = window.location.origin + '/auth/kftc/callback';
        console.log('토큰 교환 요청:', { code, redirect_uri });
        
        // 토큰 교환
        const tokenResponse = await fetchKftcToken({ code, redirect_uri });
        console.log('토큰 교환 성공:', tokenResponse);
        
        setStatus('계좌 정보 조회 중...');
        
        // 계좌 정보 조회
        const accountInfo = await fetchAccountInfo(tokenResponse);
        console.log('계좌 정보 조회 성공:', accountInfo);
        
        setStatus('완료! 창을 닫는 중...');
        
        // 부모 창으로 성공 메시지 전송
        if (window.opener) {
          window.opener.postMessage({
            type: 'KFTC_AUTH_SUCCESS',
            accountInfo: accountInfo
          }, window.location.origin);
        }
        
        // 잠시 후 팝업 창 닫기
        setTimeout(() => {
          window.close();
        }, 1000);
        
      } catch (error) {
        console.error('콜백 처리 실패:', error);
        setStatus(`오류 발생: ${error.message}`);
        
        // 부모 창으로 오류 메시지 전송
        if (window.opener) {
          window.opener.postMessage({
            type: 'KFTC_AUTH_ERROR',
            error: error.message
          }, window.location.origin);
        }
        
        // 오류 발생 시 3초 후 창 닫기
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    processCallback();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">금융결재원 인증 처리</h2>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
}

export default KftcCallbackPage;