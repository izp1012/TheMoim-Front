import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CLIENT_ID = '9a92d41c-5c0b-40eb-8099-414c81c5631d';
const AUTHORIZATION_URL = 'https://testapi.openbanking.or.kr/oauth/2.0/authorize';
const API_SCOPE = 'login inquiry';
const REDIRECT_URI = "http://localhost:3000/auth/kftc/callback"; // 콜백 URL 수정

function FinancialApiConnector({ onApiConnected }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 URL에 인가 코드가 있는지 확인
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      alert('code = '+code);
      setModalMessage('금융결재원으로부터 인증 코드를 수신했습니다. 토큰 교환을 백엔드에서 처리합니다...');
      setShowModal(true);
      handleTokenExchangeAndFetchAccount(code, REDIRECT_URI);
    }
  }, [location, navigate, onApiConnected]);

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // 금융결재원 인가 요청 시작
  const handleConnectAPI = () => {
    setErrorMessage('');
    
    // URL 파라미터를 올바르게 인코딩
    const authUrl = new URL(AUTHORIZATION_URL);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', API_SCOPE);
    authUrl.searchParams.set('state', 'random_string_for_csrfprotection');
    authUrl.searchParams.set('auth_type', '0');
    
    setModalMessage('금융결재원 인증 페이지로 리다이렉트합니다. 이 페이지에서 동의 후 앱으로 돌아옵니다.');
    setShowModal(true);
    
    window.open(authUrl.toString(), '_blank', 'width=500,height=700');
  };

  // 인가 코드 수신 후 토큰 교환 및 계좌 정보 조회
  const handleTokenExchangeAndFetchAccount = async (authCode, redirectUri) => {
    setIsLoading(true);
    setErrorMessage('');
    const jwtToken = localStorage.getItem('jwt-token');
    
    try {
      setModalMessage('백엔드를 통해 금융결재원 API와 통신을 시도합니다...');
      setShowModal(true);
      
      const response = await fetch('http://localhost:8080/api/kftc/token-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwtToken && { Authorization: `Bearer ${jwtToken}` }),
        },
        body: JSON.stringify({ 
          code: authCode, 
          redirect_uri: redirectUri 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || '토큰 교환 실패';
        throw new Error(errorMessage);
      }
      
      const accountData = await response.json();
      
      if (onApiConnected) {
        onApiConnected(accountData);
      }
      
      setModalMessage('계좌 정보를 성공적으로 가져왔습니다!');
      setShowModal(true);

    } catch (error) {
      console.error('API 호출 또는 토큰 교환 오류:', error);
      setErrorMessage('API 연동 중 오류가 발생했습니다. 다시 시도해주세요.');
      setModalMessage('API 연동 중 오류가 발생했습니다: ' + error.message);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 팝업 창에서 메시지 수신 처리
  useEffect(() => {
    function handleMessage(event) {
      console.log(event);
      // opener 창으로부터 인증 성공 메시지 수신
      if (
        event.origin === window.location.origin &&
        event.data &&
        event.data.type === 'KFTC_AUTH_SUCCESS'
      ) {
        const accountInfo = event.data.accountInfo;
        console.log('팝업 창으로부터 계좌 정보 수신:', accountInfo);
        
        // 계좌 정보를 상위 컴포넌트로 전달
        if (onApiConnected) {
          onApiConnected(accountInfo);
        }
        
        // 성공 메시지 표시
        setModalMessage('금융결재원 연동이 완료되었습니다!');
        setShowModal(true);
      }
    }
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onApiConnected]);

  return (
    <div className="p-4">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">오류: </strong>
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        onClick={handleConnectAPI}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
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