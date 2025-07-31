import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FinancialApiConnector from '../../components/FinancialApiConnector';
import { fetchKftcToken } from './kftc';

function KftcCallbackPage({ onApiConnected }) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const redirect_uri = window.location.origin + '/auth/kftc/callback';

    if (code) {
      fetchKftcToken({ code, redirect_uri })
        .then(tokenResp => {
          // 계좌 정보 조회
          return fetchAccountInfo(tokenResp.accessToken);
        })
        .then(accountInfo => {
          // 부모 창으로 메시지 전송
          if (window.opener) {
            window.opener.postMessage({
              type: 'KFTC_AUTH_SUCCESS',
              accountInfo: accountInfo
            }, window.location.origin);
          }
          
          // 팝업 창 닫기
          window.close();
        })
        .catch(err => {
          alert('인증 실패: ' + err.message);
          window.close();
        });
    }
  }, [location]);

  return (
    <div className="loading-container">
      <h2>인증 처리 중...</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
}

export default KftcCallbackPage;