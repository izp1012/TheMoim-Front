// AmountForm.js
import React, { useState } from 'react';

function AmountForm({ onAddAmount }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount.trim() && description.trim() && !isNaN(amount)) {
      onAddAmount(parseFloat(amount), description);
      setAmount('');
      setDescription('');
    } else {
      alert('금액과 설명을 올바르게 입력해주세요.');
    }
  };

  return (
    <div className="form-card">
      <h2>금액 추가</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="금액 (원)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="설명 (예: 식비, 회비)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="submit-button">추가</button>
      </form>
    </div>
  );
}

export default AmountForm;