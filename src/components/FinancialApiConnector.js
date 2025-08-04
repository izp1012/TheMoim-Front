import React, { useState, useEffect, useRef } from 'react';

const CLIENT_ID = '9a92d41c-5c0b-40eb-8099-414c81c5631d';
const AUTHORIZATION_URL = 'https://testapi.openbanking.or.kr/oauth/2.0/authorize';
const API_SCOPE = 'login inquiry transfer';
const REDIRECT_URI = "http://localhost:3000/auth/kftc/callback";

function FinancialApiConnector({ onApiConnected }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // useRef로 interval ID를 관리
  const checkClosedRef = useRef(null);
  const popupRef = useRef(null);

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  const cleanup = () => {
    if (checkClosedRef.current) {
      clearInterval(checkClosedRef.current);
      checkClosedRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }
  };

  // 금융결재원 인가 요청 시작
  const handleConnectAPI = () => {
    setErrorMessage('');
    setIsLoading(true);
    
    // URL 파라미터를 올바르게 인코딩
    const authUrl = new URL(AUTHORIZATION_URL);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', API_SCOPE);
    authUrl.searchParams.set('state', 'random_string_for_csrfprotection');
    authUrl.searchParams.set('auth_type', '0');
    
    setModalMessage('금융결재원 인증 페이지로 리다이렉트합니다. 인증 완료 후 자동으로 계좌 정보를 가져옵니다.');
    setShowModal(true);
    
    // 팝업 창 열기
    const popup = window.open(authUrl.toString(), 'kftc_auth', 'width=500,height=700');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // 팝업이 차단된 경우 처리
      setErrorMessage('팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
      setIsLoading(false);
      return;
    }
    
    popupRef.current = popup;
    
    // 팝업이 닫혔는지 주기적으로 확인 (사용자가 강제로 닫은 경우 처리)
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        cleanup();
        setIsLoading(false);
        clearInterval(checkClosed);
        
        // 성공 메시지가 표시되지 않았다면 취소로 간주
        if (!modalMessage.includes('완료')) {
          setModalMessage('인증이 취소되었습니다.');
          setShowModal(true);
        }
      }
    }, 1000);
  };

  useEffect(() => {
    function handleMessage(event) {
      // console.log('메시지 수신:', event);
      
      // 보안을 위해 origin 확인
      if (event.origin !== window.location.origin) {
        console.warn('잘못된 origin에서 메시지 수신:', event.origin);
        return;
      }

      if (event.data && event.data.type === 'KFTC_AUTH_SUCCESS') {
        const accountInfo = event.data.accountInfo;
        console.log('팝업 창으로부터 계좌 정보 수신:', accountInfo);
        
        // cleanup 먼저 실행
        cleanup();
        
        // 계좌 정보를 상위 컴포넌트로 전달
        if (onApiConnected) {
          onApiConnected(accountInfo);
        }
        
        // 성공 메시지 표시
        setModalMessage('금융결재원 연동이 완료되었습니다!');
        setShowModal(true);
        setIsLoading(false);
        
      } else if (event.data && event.data.type === 'KFTC_AUTH_ERROR') {
        console.error('인증 오류:', event.data.error);
        
        cleanup();
        setErrorMessage(event.data.error || '인증 중 오류가 발생했습니다.');
        setModalMessage('인증 중 오류가 발생했습니다:\n' + (event.data.error || '알 수 없는 오류'));
        setShowModal(true);
        setIsLoading(false);
      }
    }
    
    // 이벤트 리스너 등록
    window.addEventListener('message', handleMessage);
    
    // cleanup 함수
    return () => {
      window.removeEventListener('message', handleMessage);
      cleanup();
    };
  }, [onApiConnected]); // onApiConnected가 변경될 때만 재등록

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="p-4">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">오류: </strong>
          <span>{errorMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMessage('')}
          >
            <span className="text-red-700">&times;</span>
          </button>
        </div>
      )}

      <button
        onClick={handleConnectAPI}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? '연동 진행 중...' : '금융결재원 계좌 연결하기'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">알림</h3>
            <p className="text-gray-700 whitespace-pre-line mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialApiConnector;