// src/components/common/Header.js (수정)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

function Header({ selectedGroupId, onLogout }) { // onLogout 프롭스 추가
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null); // 'group' | 'payment' | null

  // 드롭다운 외부 클릭 감지용
  const groupMenuRef = useRef(null);
  const paymentMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (groupMenuRef.current && !groupMenuRef.current.contains(event.target)) &&
        (paymentMenuRef.current && !paymentMenuRef.current.contains(event.target))
      ) {
        setActiveMenu(null); // 메뉴 외부 클릭 시 닫기
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName); // 토글
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setActiveMenu(null); // 메뉴 항목 클릭 후 메뉴 닫기
  };

  return (
    <header className="app-header-dropdown">
      <div className="header-top-row">
        <h1 className="app-title" onClick={() => navigate('/')}>모임통장</h1>
        <div className="header-actions">
          <button className="logout-button" onClick={onLogout}>로그아웃</button>
        </div>
      </div>

      <nav className="main-nav-dropdown">
        <div className="nav-item-wrapper" ref={groupMenuRef}>
          <button
            className={`nav-button ${activeMenu === 'group' ? 'active' : ''}`}
            onClick={() => handleMenuToggle('group')}
            // onMouseEnter={() => setActiveMenu('group')} // 마우스 오버 시 열기 (선택 사항)
            // onMouseLeave={() => setActiveMenu(null)} // 마우스 리브 시 닫기 (선택 사항)
          >
            그룹 관리
          </button>
          {activeMenu === 'group' && (
            <div className="dropdown-menu">
              <button onClick={() => handleMenuItemClick('/groups')} className="dropdown-item">
                그룹 목록
              </button>
              <button onClick={() => handleMenuItemClick('/groups/add')} className="dropdown-item">
                그룹 추가
              </button>
              {selectedGroupId && (
                <>
                  <button onClick={() => handleMenuItemClick(`/groups/${selectedGroupId}/members`)} className="dropdown-item">
                    그룹 회원 목록
                  </button>
                  <button onClick={() => handleMenuItemClick(`/groups/${selectedGroupId}/members/add`)} className="dropdown-item">
                    그룹에 회원 추가
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="nav-item-wrapper" ref={paymentMenuRef}>
          <button
            className={`nav-button ${activeMenu === 'payment' ? 'active' : ''}`}
            onClick={() => handleMenuToggle('payment')}
            // onMouseEnter={() => setActiveMenu('payment')}
            // onMouseLeave={() => setActiveMenu(null)}
          >
            모임비 관리
          </button>
          {activeMenu === 'payment' && (
            <div className="dropdown-menu">
              {!selectedGroupId ? (
                <span className="dropdown-message">그룹을 먼저 선택해주세요</span>
              ) : (
                <>
                  <button onClick={() => handleMenuItemClick(`/groups/${selectedGroupId}/payments/add`)} className="dropdown-item">
                    금액 추가
                  </button>
                  <button onClick={() => handleMenuItemClick(`/groups/${selectedGroupId}/payments/settlement`)} className="dropdown-item">
                    비용 정산
                  </button>
                  <button onClick={() => handleMenuItemClick(`/groups/${selectedGroupId}/payments/receipts`)} className="dropdown-item">
                    영수증 처리
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;