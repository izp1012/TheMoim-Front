// src/components/common/BottomNav.js
import React from 'react';
import '../../App.css'; // App.css에서 스타일링 사용

function BottomNav() {
  return (
    <footer className="bottom-nav">
      <button className="nav-button">
        <i className="icon-home"></i> {/* 실제 아이콘으로 대체 */}
        <span>홈</span>
      </button>
      <button className="nav-button active">
        <i className="icon-group"></i> {/* 실제 아이콘으로 대체 */}
        <span>모임관리</span>
      </button>
      <button className="nav-button">
        <i className="icon-settings"></i> {/* 실제 아이콘으로 대체 */}
        <span>환경설정</span>
      </button>
    </footer>
  );
}

export default BottomNav;