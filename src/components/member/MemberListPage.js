
import React from 'react';
import '../../App.css';

function MemberListPage({ members }) {
  if (!members || !Array.isArray(members) || members.length === 0) {
    return <p>이 그룹에 아직 회원이 없습니다.</p>;
  }

  return (
    <div className="member-list-container">
      <h3>회원 목록</h3>
      <ul className="member-list">
        {members.map((member, index) => (
          <li key={member.id || index} className="member-list-item">
            {/* 백엔드에서 오는 회원 정보 구조에 맞게 표시 */}
            <span className="member-name">{member.name || member.email || `회원 ${index + 1}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MemberListPage;
