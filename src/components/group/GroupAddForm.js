// src/components/group/GroupAddForm.js
import React, { useState } from 'react';
import '../../App.css';

function GroupAddForm({ onCreateGroup, onCancel }) {
  const [moimName, setMoimName] = useState('');
  const [moimDesp, setMoimDesp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (moimName.trim() === '') {
      alert('모임 이름은 필수입니다.');
      return;
    }
    onCreateGroup({ moimName, moimDesp });
  };

  return (
    <div className="form-card">
      <h2>새 모임 생성</h2>
      <form onSubmit={handleSubmit}>
        <label className="form-label">
          모임 이름
          <input
            type="text"
            placeholder="예: 우리 동호회, 가족 계 모임"
            value={moimName}
            onChange={(e) => setMoimName(e.target.value)}
            className="input-field full-width"
            required
          />
        </label>
        <label className="form-label">
          설명 (선택 사항)
          <textarea
            placeholder="모임에 대한 간략한 설명"
            value={moimDesp}
            onChange={(e) => setMoimDesp(e.target.value)}
            className="input-field full-width textarea-field"
          ></textarea>
        </label>
        <div className="form-action-buttons">
          <button type="submit" className="submit-button-large">
            생성하기
          </button>
          <button type="button" className="button-secondary" onClick={onCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default GroupAddForm;