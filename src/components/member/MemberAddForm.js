import React, { useState } from 'react';
import '../../styles/Form.css';

function MemberAddForm({ onAddMember }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // GroupDetailsPage에서 전달된 onAddMember 함수를 호출합니다.
      // 백엔드 API가 사용자 식별자로 email을 기대한다고 가정합니다.
      onAddMember({ email });
      setEmail('');
    }
  };

  return (
    <div className="form-card">
      <h2>그룹에 회원 추가</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="추가할 회원의 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        <button type="submit" className="submit-button">추가하기</button>
      </form>
    </div>
  );
}

export default MemberAddForm;