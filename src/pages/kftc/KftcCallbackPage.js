import React, { useEffect } from 'react';
import FinancialApiConnector from '../../components/FinancialApiConnector';

function KftcCallbackPage({ onApiConnected }) {
  // 인증 완료 후 opener 창으로 메시지 전송 및 창 닫기
  const handleApiConnected = (accountInfo) => {
    // opener 창이 존재하는지 확인
    if (window.opener && !window.opener.closed) {
      // opener 창으로 계좌 정보 전달
      window.opener.postMessage({
        type: 'KFTC_AUTH_SUCCESS',
        accountInfo: accountInfo
      }, window.location.origin);
      
      // 성공 메시지 표시
      alert('금융결재원 연동이 완료되었습니다!');
      
      // 팝업 창 닫기
      window.close();
    } else {
      // opener가 없는 경우 (직접 접근한 경우)
      if (onApiConnected) {
        onApiConnected(accountInfo);
      }
      alert('금융결재원 연동 및 계좌 정보 조회가 완료되었습니다!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        금융결재원 연동 처리 중...
      </h1>
      <p className="text-gray-600 mb-4">
        잠시만 기다려 주세요. 금융결재원으로부터 정보를 가져오는 중입니다.
      </p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      
      <FinancialApiConnector onApiConnected={handleApiConnected} />
    </div>
  );
}

export default KftcCallbackPage;