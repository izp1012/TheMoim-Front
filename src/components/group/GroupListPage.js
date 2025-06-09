// src/components/group/GroupListPage.js
import React from 'react';
import '../../App.css';

function GroupListPage({ groups, onSelectGroup, onAddGroupClick }) {
  return (
    <div className="group-list-container">
      <h2>내 모임 목록</h2>
      {groups.length === 0 ? (
        <div className="empty-state-card">
          <p>아직 생성된 모임이 없습니다.</p>
          <p>새로운 모임을 시작해보세요!</p>
          <button className="submit-button-large" onClick={onAddGroupClick}>
            + 새 모임 생성
          </button>
        </div>
      ) : (
        <ul className="group-list">
          {groups.map((group) => (
            <li key={group.id} className="group-list-item" onClick={() => onSelectGroup(group.id)}>
              <div className="group-info">
                <span className="group-name">{group.groupName}</span>
                <span className="group-description">{group.description}</span>
              </div>
              <div className="group-actions">
                <button className="button-primary-small">상세 보기</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GroupListPage;