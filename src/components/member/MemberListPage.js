// src/components/member/MemberListPage.js
import React from 'react';
import '../../App.css'; // App.css에서 스타일링 사용

function MemberListPage({ members }) {
  return (
    <div className="member-list-container">
      {members.length === 0 ? (
        <div className="empty-state-card">
          <p>아직 추가된 회원이 없습니다.</p>
          <p>회원 추가 탭에서 새로운 회원을 등록해주세요!</p>
          <button className="submit-button-large" onClick={() => {/* 회원 추가 탭으로 이동 로직 */}}>
            + 회원 등록하기
          </button>
        </div>
      ) : (
        <ul className="member-list">
          {members.map((member) => (
            <li key={member.id} className="member-list-item">
              <div className="member-info">
                <span className="member-name">{member.name}</span>
                <span className="member-type">({member.type})</span>
                <span className="member-contact">{member.contact}</span>
              </div>
              <div className="member-details">
                <span>회비: {member.fee.toLocaleString()}원</span>
                <span>입회일: {member.enrollmentDate}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MemberListPage;