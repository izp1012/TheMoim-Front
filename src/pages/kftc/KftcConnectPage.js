// src/pages/bank/KftcConnectPage.js
import React, { useState } from 'react';
import FinancialApiConnector from '../../components/FinancialApiConnector';

function KftcConnectPage({ connectedAccountInfo, onApiConnected }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKftcAuth = async () => {
    setIsLoading(true);
    
    try {
      // 금융결재원 인증 URL 생성
      const authUrl = `https://testapi.openbanking.or.kr/oauth/2.0/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=login inquiry transfer&state=1234567890&auth_type=0`;
      
      // 팝업 창 열기
      const popup = window.open(
        authUrl,
        'kftc_auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      // 팝업이 차단되었는지 확인
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        setIsLoading(false);
        return;
      }
      
    } catch (error) {
      console.error('인증 시작 실패:', error);
      setIsLoading(false);
    }
  };

  // KftcConnectPage.js에서 인증 완료 후 처리하는 함수
  const handleAuthSuccess = (accountInfo) => {
    // 1. 부모 창으로 메시지 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'KFTC_AUTH_SUCCESS',
        accountInfo: accountInfo
      }, window.location.origin);
    }
    
    // 2. 팝업 창 닫기
    window.close();
  };

  // 또는 인증 콜백에서 직접 처리하는 경우
  const handleAuthCallback = (response) => {
    // 계좌 정보 추출
    const accountInfo = {
      bankName: response.bankName,
      accountNumber: response.accountNumber,
      // 기타 필요한 정보들...
    };
    
    // 부모 창으로 메시지 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'KFTC_AUTH_SUCCESS',
        accountInfo: accountInfo
      }, window.location.origin);
    }
    
    // 팝업 창 닫기
    window.close();
  };

  console.log(`connectedAccountInfo = `+connectedAccountInfo);
  console.log(`onApiConnected = `+onApiConnected);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">금융 계좌 연결</h2>
      <p className="text-gray-600 mb-6">
        금융결재원 오픈 API를 통해 은행 계좌를 연결하고 정보를 조회할 수 있습니다.
      </p>

      {connectedAccountInfo ? (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">연결된 계좌 정보</h3>
          <p className="mb-2"><span className="font-medium">은행명:</span> {connectedAccountInfo.bankName}</p>
          <p className="mb-2"><span className="font-medium">계좌번호:</span> {connectedAccountInfo.accountNumber}</p>
          <p className="mb-2"><span className="font-medium">예금주:</span> {connectedAccountInfo.ownerName}</p>
          <p className="mb-4 text-lg font-bold text-green-600"><span className="font-medium">잔액:</span> {connectedAccountInfo.balance}</p>
          
          <h4 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">최근 거래 내역</h4>
          <ul className="space-y-1 text-sm">
            {connectedAccountInfo.transactions.map((tx) => (
              <li key={tx.id} className="flex justify-between">
                <span>{tx.date} - {tx.description}</span>
                <span className={`${tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'} font-bold`}>{tx.amount}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => onApiConnected(null)} // 연결 해제 시뮬레이션
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg mt-6"
          >
            계좌 연결 해제 (시뮬레이션)
          </button>
        </div>
      ) : (
        <FinancialApiConnector onApiConnected={onApiConnected} />
      )}
    </div>
  );
}

export default KftcConnectPage;