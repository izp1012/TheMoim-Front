// src/components/common/Header.js
import React from 'react';
import '../../App.css'; // App.css에서 스타일링 사용

function Header({ activeTab, onTabChange }) {
  return (
    <header className="app-header-with-tabs">
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => onTabChange('members')}
        >
          회원목록
        </button>
        <button
          className={`tab-button ${activeTab === 'addMember' ? 'active' : ''}`}
          onClick={() => onTabChange('addMember')}
        >
          회원추가
        </button>
        {/* <button
          className={`tab-button ${activeTab === 'settlement' ? 'active' : ''}`}
          onClick={() => onTabChange('settlement')}
        >
          정산하기
        </button>
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => onTabChange('summary')}
        >
          총정리
        </button> */}
      </div>
    </header>
  );
}

export default Header;