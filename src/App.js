// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import MainApp from './MainApp'; // 기존 앱 컨텐츠

import './App.css'; // 전역 CSS

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsrId, setCurrentUsrId] = useState(null); // 로그인된 사용자 ID

  useEffect(() => {
    const storedUsrId = localStorage.getItem('usrId');
    if (storedUsrId) {
      setIsLoggedIn(true);
      setCurrentUsrId(parseInt(storedUsrId));
    }
  }, []);

  const handleLoginSuccess = (usrId) => {
    setIsLoggedIn(true);
    setCurrentUsrId(usrId);
    localStorage.setItem('usrId', usrId);
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
        {/* MainApp으로 로그인 상태와 사용자 ID를 전달 */}
        <Route
          path="/*" // 모든 하위 경로를 MainApp에서 처리
          element={isLoggedIn ? <MainApp currentUsrId={currentUsrId} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;