// src/components/KftcAuthButton.js - 인증 버튼
import React, { useState } from 'react';
import { isKftcTokenValid } from '../utils/kftc';
import { getAuthUrl } from '../config/kftc';

function KftcAuthButton({ onAuthSuccess, onAuthError, className = '' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(isKftcTokenValid());

  const handleAuth = () => {
    if (isAuthenticated) {
      // 이미 인증된 경우 재인증 확인
      const confirm = window.confirm('이미 인증되어 있습니다. 다시 인증하시겠습니까?');
      if (!confirm) return;
    }

    setIsLoading(true);
    
    // 팝업 창으로 인증 진행
    const authWindow = window.open(
      getAuthUrl(),
      'kftc_auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // 메시지 리스너 등록
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'KFTC_AUTH_SUCCESS') {
        console.log('KFTC 인증 성공:', event.data.accountInfo);
        setIsAuthenticated(true);
        setIsLoading(false);
        onAuthSuccess?.(event.data.accountInfo);
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'KFTC_AUTH_ERROR') {
        console.error('KFTC 인증 실패:', event.data.error);
        setIsLoading(false);
        onAuthError?.(event.data.error);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // 팝업이 닫힌 경우 처리
    const checkClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkClosed);
        setIsLoading(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  return (
    <button
      onClick={handleAuth}
      disabled={isLoading}
      className={`
        flex items-center justify-center px-6 py-3 
        bg-blue-600 hover:bg-blue-700 
        text-white font-medium rounded-lg
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          인증 중...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isAuthenticated ? '계좌 재연결' : '계좌 연결'}
        </>
      )}
    </button>
  );
}

export default KftcAuthButton;