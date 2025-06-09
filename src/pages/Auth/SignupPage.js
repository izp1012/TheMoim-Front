// src/pages/Auth/SignUpPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, kakaoLogin, googleLogin } from '../../api/auth';
import '../../styles/App.css'; // 공통 스타일

function SignUpPage() {
  const [usrname, setUsrname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!usrname || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }

    try {
      // API 호출
      await signup(usrname, password);
      alert('회원가입이 성공적으로 완료되었습니다! 로그인 해주세요.');
      navigate('/login'); // 회원가입 성공 후 로그인 페이지로 이동
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>회원가입</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="error-message">{error}</p>}
          <label className="form-label">
            아이디
            <input
              type="text"
              placeholder="사용할 아이디를 입력해주세요"
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
              placeholder="비밀번호 (최소 6자)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field full-width"
              required
            />
          </label>
          <label className="form-label">
            비밀번호 확인
            <input
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field full-width"
              required
            />
          </label>
          <button type="submit" className="submit-button-large">
            회원가입
          </button>
        </form>

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
          이미 계정이 있으신가요? <Link to="/login" className="auth-link">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;