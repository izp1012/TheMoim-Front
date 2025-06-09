// src/pages/Auth/LoginPage.js (수정)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, kakaoLogin, googleLogin } from '../../api/auth'; // 소셜 로그인 함수도 임포트
import '../../App.css'; // 공통 스타일

function LoginPage({ onLoginSuccess }) {
  const [usrname, setUsrname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!usrname || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {     
      const usrData = await login(usrname, password);
      alert(`환영합니다, ${usrData.data.usrname}님!`);
      onLoginSuccess(usrData.data.usrname);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>로그인</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="error-message">{error}</p>}
          <label className="form-label">
            아이디
            <input
              type="text"
              placeholder="아이디를 입력해주세요"
              value={usrname}
              onChange={(e) => setUsrname(e.target.value)}
              className="input-field full-width"
              required
            />
          </label>
          <label className="form-label">
            비밀번호
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field full-width"
              required
            />
          </label>
          <button type="submit" className="submit-button-large">
            로그인
          </button>
        </form>

        {/* 소셜 로그인 섹션 추가 */}
        <div className="social-login-section">
          <p>- 또는 -</p>
          <button className="social-login-button kakao" onClick={kakaoLogin}>
            <img src="/kakao_logo.png" alt="Kakao Logo" className="social-logo" />
            카카오로 시작하기
          </button>
          <button className="social-login-button google" onClick={googleLogin}>
            <img src="/google_logo.png" alt="Google Logo" className="social-logo" />
            Google로 시작하기
          </button>
        </div>

        <p className="auth-link-text">
          계정이 없으신가요? <Link to="/signup" className="auth-link">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;