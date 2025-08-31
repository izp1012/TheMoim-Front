// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignupPage';
import OAuthCallback from './pages/Auth/OAuthCallback';
import MainApp from './MainApp'; 
import FinancialApiConnector from './components/FinancialApiConnector';
import KftcCallbackPage from './pages/kftc/KftcCallbackPage';

import './App.css'; // 전역 CSS

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsrId, setCurrentUsrId] = useState(null); // 로그인된 사용자 ID
  const [connectedAccountInfo, setConnectedAccountInfo] = useState(null);

  useEffect(() => {
    const storedUsrId = localStorage.getItem('usrId');
    if (storedUsrId) {
      setIsLoggedIn(true);
      setCurrentUsrId(parseInt(storedUsrId));
    }
  }, []);

  const handleLoginSuccess = (usrData) => {

    const { usrId, accessToken } = usrData;

    setIsLoggedIn(true);
    setCurrentUsrId(usrId);
    localStorage.setItem('usrId', usrId);
    localStorage.setItem('accessToken', accessToken);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUsrId(null);
    localStorage.removeItem('usrId');
    localStorage.removeItem('accessToken');
    setConnectedAccountInfo(null);
    // localStorage.removeItem('token');
    alert('로그아웃 되었습니다.');
  };

  // 금융결재원 API 연결 성공 시 호출될 콜백 함수
  const handleKftcApiConnected = (accountInfo) => {
    console.log('금융결재원 API 연결 성공!', accountInfo);
    setConnectedAccountInfo(accountInfo);
    // 필요하다면 이 정보를 localStorage에 저장하거나,
    // 이 상태를 기반으로 사용자에게 계좌 정보를 보여주는 페이지로 리다이렉트할 수 있습니다.
    // navigate('/my-accounts'); // 예시: 내 계좌 페이지로 이동
  };
  
  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />

        {/* 회원가입 페이지 */}
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/" replace /> : <SignUpPage />} />

        {/* 메인 앱 컨텐츠 (로그인 필요) */}
        {/* MainApp으로 로그인 상태와 사용자 ID를 전달 */}
        <Route
          path="/*" // 모든 하위 경로를 MainApp에서 처리
          element={isLoggedIn ? 
          <MainApp 
            currentUsrId={currentUsrId} 
            onLogout={handleLogout} 
            connectedAccountInfo={connectedAccountInfo} 
            onKftcApiConnected={handleKftcApiConnected}/> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/oauth/callback" 
          element={<OAuthCallback onLoginSuccess={handleLoginSuccess} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;