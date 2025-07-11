import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // React Router 6 훅 사용

const CLIENT_ID = '9a92d41c-5c0b-40eb-8099-414c81c5631d'; // 금융결재원 API에서 발급받은 Client ID
const AUTHORIZATION_URL = 'https://testapi.openbanking.or.kr/oauth/2.0/authorize'; // 금융결재원 인가 요청 URL
const API_SCOPE = 'login inquiry'; // 필요한 스코프 (예: 계좌조회)

function FinancialApiConnector({ onApiConnected }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const location = useLocation(); // 현재 URL 정보를 가져옵니다.
  const navigate = useNavigate(); // 프로그래밍 방식의 라우팅을 위해 사용합니다.

  // 컴포넌트 마운트 시 URL에 인가 코드가 있는지 확인합니다.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state'); // CSRF 방지를 위한 state 파라미터 (실제 구현 시 필요)

    // 금융결재원 콜백 URI로 설정한 경로 (예: /auth/kftc/callback)
    // const KFTC_REDIRECT_URI = window.location.origin + '/auth/kftc/callback'; 
    const KFTC_REDIRECT_URI = "https://localhoost:3000" + '/auth/kftc/callback'; 

// 
    if (code && location.pathname === '/auth/kftc/callback') {
      // 인가 코드를 성공적으로 수신했습니다.
      // 이제 이 코드를 백엔드로 보내 토큰 교환을 요청해야 합니다.
      setModalMessage('금융결재원으로부터 인증 코드를 수신했습니다. 토큰 교환을 백엔드에서 처리합니다...');
      setShowModal(true);

      // URL에서 인가 코드 파라미터를 제거하여 새로고침 시 다시 처리되는 것을 방지합니다.
      // 실제 앱에서는 백엔드에서 리다이렉트 시 이 부분이 처리되거나,
      // 콜백 페이지에서 직접 처리 후 메인 페이지로 리다이렉트됩니다.
      navigate('/auth/kftc/callback', { replace: true, state: { code, state } }); // URL 쿼리 파라미터 제거 (선택 사항)

      // 백엔드 API 호출을 시뮬레이션합니다.
      handleTokenExchangeAndFetchAccount(code);
    }
  }, [location, navigate, onApiConnected]);

  // 모달을 닫는 함수
  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // 금융결재원 인가 요청을 시작합니다.
  const handleConnectAPI = () => {
    setErrorMessage('');
    // const KFTC_REDIRECT_URI = "https://localhoost:8080" +'/auth/kftc/callback';
    const KFTC_REDIRECT_URI = "https://localhoost:8080" +'/html/callback/html';
    // 
        
    // + '/auth/kftc/callback'; 
    
    // 실제 인가 요청 URL을 생성합니다.
    const authUrl = `${AUTHORIZATION_URL}?`+
    `response_type=code&`+
    `client_id=${CLIENT_ID}&`+ 
    `redirect_uri=${KFTC_REDIRECT_URI}&`+
    `scope=${API_SCOPE}&`+
    `state=random_string_for_csrfprotection&`+
    `auth_type=0`;
    setModalMessage(`금융결재원 인증 페이지로 리다이렉트합니다. 이 페이지에서 동의 후 앱으로 돌아옵니다. (URL: ${authUrl})`);
    
    setShowModal(true);
    
    // 실제로는 이 시점에서 금융결재원 인가 페이지로 사용자를 리다이렉트합니다.
    // window.location = encodeURIComponent("https://testapi.openbanking.or.kr/oauth/2.0/authorize?response_type=code&client_id=9a92d41c-5c0b-40eb-8099-414c81c5631d&redirect_uri=https://localhoost:8080/html/callback/html&scope=login inquiry transfer&auth_type =0&state=random_string_for_csrfprotection"); 
    window.open(authUrl, '_blank', 'width=500,height=700');
  };

  // 인가 코드 수신 후 토큰 교환 및 계좌 정보 조회를 모의로 처리합니다.
  const handleTokenExchangeAndFetchAccount = async (authCode) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
        setModalMessage('백엔드를 통해 금융결재원 API와 통신을 시도합니다...');
        setShowModal(true);
      // --- 실제 구현 시: 백엔드 API 호출 ---
      const response = await fetch('/api/kBankCallbackPageftc/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '토큰 교환 실패');
      }
      // const mockAccountData = data.accountInfo; // 백엔드에서 받은 실제 계좌 정보

      // --- 시뮬레이션 (백엔드 없이 프론트엔드에서 모의) ---
      setModalMessage('가상의 토큰 교환 및 계좌 정보 조회를 진행합니다...');
      setShowModal(true);
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 지연 시뮬레이션

      const mockAccountData = {
        kftcName: '가상은행',
        accountNumber: '123-456-7890',
        balance: '1,234,567원',
        ownerName: '홍길동',
        transactions: [
          { id: 1, date: '2024-06-10', description: '급여', amount: '+1,000,000원' },
          { id: 2, date: '2024-06-11', description: '마트 지출', amount: '-50,000원' },
          { id: 3, date: '2024-06-12', description: '커피', amount: '-4,500원' },
        ],
      };
      // --- 시뮬레이션 끝 ---

      // 부모 컴포넌트에 연결 성공 및 데이터 전달
      if (onApiConnected) {
        onApiConnected(mockAccountData);
      }
      setModalMessage('계좌 정보를 성공적으로 가져왔습니다!');
      setShowModal(true);

    } catch (error) {
      console.error('API 호출 또는 토큰 교환 오류:', error);
      setErrorMessage('API 연동 중 오류가 발생했습니다. 다시 시도해주세요.');
      setModalMessage('API 연동 중 오류가 발생했습니다.');
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Custom Modal for messages */}
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