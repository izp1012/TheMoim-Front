// src/App.js (최종 버전)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignupPage';
import MainApp from './MainApp'; // 기존 앱 컨텐츠

import './styles/App.css'; // 전역 CSS

function App() {
  // 로그인 상태를 관리하는 state. 실제 앱에서는 localStorage나 Context API로 관리할 수 있습니다.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsrId, setCurrentUsrId] = useState(null); // 로그인된 사용자 ID

  useEffect(() => {
    // 앱 로드 시 로컬 스토리지 등에서 로그인 정보 확인 (예: 토큰 또는 사용자 ID)
    const storedUsrId = localStorage.getItem('usrId');
    if (storedUsrId) {
      setIsLoggedIn(true);
      setCurrentUsrId(parseInt(storedUsrId)); // 숫자로 변환
    }
  }, []);

  const handleLoginSuccess = (usrId) => {
    setIsLoggedIn(true);
    setCurrentUsrId(usrId);
    localStorage.setItem('usrId', usrId); // 사용자 ID 저장
    // 실제로는 토큰 등도 저장해야 함
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUsrId(null);
    localStorage.removeItem('usrId');
    // localStorage.removeItem('token');
    alert('로그아웃 되었습니다.');
  };

  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />

        {/* 회원가입 페이지 */}
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/" replace /> : <SignUpPage />} />

        {/* 메인 앱 컨텐츠 (로그인 필요) */}
        <Route
          path="/*" // 모든 하위 경로를 포함 (예: /, /groups, /payments 등)
          element={isLoggedIn ? <MainApp currentUsrId={currentUsrId} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;