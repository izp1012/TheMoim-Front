import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FinancialApiConnector from '../../components/FinancialApiConnector';
import { fetchKftcToken } from '../../api/kftc';

function KftcCallbackPage({ onApiConnected }) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const redirect_uri = window.location.origin + '/auth/kftc/callback'; // 실제 등록한 redirect_uri와 일치해야 함

    if (code) {
      fetchKftcToken({ code, redirect_uri })
        .then(tokenResp => {
          // 토큰을 부모나 전역 상태로 전달하거나, 바로 계좌조회 등 후속처리
          if (onApiConnected) onApiConnected(tokenResp);
          alert('토큰 발급 성공: ' + tokenResp.accessToken);
        })
        .catch(err => {
          alert('토큰 발급 실패: ' + err.message);
        });
    }
  }, [location, onApiConnected]);

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