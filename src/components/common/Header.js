// src/components/common/Header.js (수정)
import React from 'react';
import '../../App.css';

function Header({
  activeTopTab,
  onTopTabChange,
  activeGroupSubTab,
  onGroupSubTabChange,
  activePaymentSubTab,
  onPaymentSubTabChange,
  selectedGroupId
}) {
  return (
    <header className="app-header-with-tabs">
      <div className="top-tab-container">
        <button
          className={`top-tab-button ${activeTopTab === 'group' ? 'active' : ''}`}
          onClick={() => onTopTabChange('group')}
        >
          그룹 관리
        </button>
        <button
          className={`top-tab-button ${activeTopTab === 'payment' ? 'active' : ''}`}
          onClick={() => onTopTabChange('payment')}
        >
          모임비 관리
        </button>
      </div>

      {activeTopTab === 'group' && (
        <div className="sub-tab-container">
          <button
            className={`sub-tab-button ${activeGroupSubTab === 'list' ? 'active' : ''}`}
            onClick={() => onGroupSubTabChange('list')}
          >
            그룹 목록
          </button>
          <button
            className={`sub-tab-button ${activeGroupSubTab === 'add' ? 'active' : ''}`}
            onClick={() => onGroupSubTabChange('add')}
          >
            그룹 추가
          </button>
          {selectedGroupId && ( // 그룹이 선택되어 있을 때만 상세 및 회원 관련 탭 표시
            <>
              <button
                className={`sub-tab-button ${activeGroupSubTab === 'details' ? 'active' : ''}`}
                onClick={() => onGroupSubTabChange('details')}
              >
                그룹 상세
              </button>
              {/* 그룹 상세 페이지 내에서 회원 목록/추가로 이동하도록 구성 */}
              {/* <button className={`sub-tab-button ${activeGroupSubTab === 'members' ? 'active' : ''}`} onClick={() => onGroupSubTabChange('members')}>회원 목록</button>
              <button className={`sub-tab-button ${activeGroupSubTab === 'addMember' ? 'active' : ''}`} onClick={() => onGroupSubTabChange('addMember')}>회원 추가</button> */}
            </>
          )}
        </div>
      )}

      {activeTopTab === 'payment' && selectedGroupId && ( // 그룹이 선택되어 있을 때만 모임비 하위 메뉴 표시
        <div className="sub-tab-container">
          <button
            className={`sub-tab-button ${activePaymentSubTab === 'add' ? 'active' : ''}`}
            onClick={() => onPaymentSubTabChange('add')}
          >
            금액 추가
          </button>
          <button
            className={`sub-tab-button ${activePaymentSubTab === 'settlement' ? 'active' : ''}`}
            onClick={() => onPaymentSubTabChange('settlement')}
          >
            비용 정산
          </button>
          <button
            className={`sub-tab-button ${activePaymentSubTab === 'receipts' ? 'active' : ''}`}
            onClick={() => onPaymentSubTabChange('receipts')}
          >
            영수증 처리
          </button>
        </div>
      )}
       {/* 선택된 그룹이 없을 때 모임비 관리 탭 활성화 시 메시지 */}
       {activeTopTab === 'payment' && !selectedGroupId && (
         <div className="sub-tab-message">그룹을 먼저 선택해주세요.</div>
       )}
    </header>
  );
}

export default Header;