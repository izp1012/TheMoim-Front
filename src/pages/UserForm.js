// UserForm.js
import React, { useState } from 'react';

function UserForm({ onAddUser }) {
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      onAddUser(userName);
      setUserName('');
    }
  };

  return (
    <div className="form-card">
      <h2>사용자 추가</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="사용자 이름"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="submit-button">추가</button>
      </form>
    </div>
  );
}

export default UserForm;