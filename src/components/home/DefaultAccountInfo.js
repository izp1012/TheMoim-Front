// src/components/home/DefaultAccountInfo.js
import React from 'react';
import '../../App.css'; // 공통 스타일

function DefaultAccountInfo({ group }) {
  if (!group) {
    return null; // 그룹 정보가 없으면 아무것도 렌더링하지 않음
  }

  // 가상의 계좌 정보 (실제 연동 시 카카오페이 API에서 받아옴)
  const accountNumber = '3333-12-3456789 (카카오페이 모임통장)';
  const currentBalance = '1,234,500원'; // 예시 잔액
  const lastUpdate = '2025.06.07 15:30'; // 예시 업데이트 시간

  return (
    <div className="default-account-info-card">
      <h3>{group.groupName} 모임통장</h3>
      <div className="account-details">
        <p className="account-number">계좌번호: <strong>{accountNumber}</strong></p>
        <p className="current-balance">현재 잔액: <strong>{currentBalance}</strong></p>
        <p className="last-update">최근 업데이트: {lastUpdate}</p>
      </div>
      <div className="account-actions">
        {/* 실제로는 카카오페이 모임통장 앱으로 연결하는 버튼이 될 수 있음 */}
        <button className="button-secondary-small">거래 내역 보기</button>
        <button className="button-secondary-small">회비 납부 현황</button>
      </div>
    </div>
  );
}

export default DefaultAccountInfo;