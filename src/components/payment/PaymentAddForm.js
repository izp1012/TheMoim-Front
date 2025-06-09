// src/components/payment/PaymentAddForm.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import { addPayment, getGroupMembers } from '../../api/moimApp';

function PaymentAddForm() {
  const { groupId } = useParams();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState('EXPENSE'); // 'INCOME', 'EXPENSE'
  const [payerMemberId, setPayerMemberId] = useState(''); // 돈을 낸 회원 ID (UsrGroupMember ID)
  const [groupMembers, setGroupMembers] = useState([]); // 그룹 회원 목록

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        if (groupId) {
          const members = await getGroupMembers(groupId);
          setGroupMembers(members);
          if (members.length > 0) {
            setPayerMemberId(members[0].id.toString()); // 첫 번째 회원을 기본값으로 설정
          }
        }
      } catch (err) {
        console.error("그룹 회원 목록 불러오기 실패:", err);
      }
    };
    fetchGroupMembers();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount.trim() === '' || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('유효한 금액을 입력해주세요.');
      return;
    }
    if (description.trim() === '') {
      alert('설명은 필수입니다.');
      return;
    }
    if (paymentType === 'EXPENSE' && !payerMemberId) {
      alert('지출의 경우 돈을 낸 회원을 선택해주세요.');
      return;
    }

    try {
      const paymentData = {
        amount: parseFloat(amount),
        description,
        type: paymentType,
        paymentDate: new Date().toISOString().split('T')[0], // 오늘 날짜 YYYY-MM-DD
        payerMemberId: paymentType === 'EXPENSE' ? parseInt(payerMemberId) : null, // 수입일 경우 null
      };
      await addPayment(groupId, paymentData);
      alert('금액이 성공적으로 추가되었습니다!');
      // 폼 초기화
      setAmount('');
      setDescription('');
      setPaymentType('EXPENSE');
    } catch (err) {
      alert(`금액 추가 실패: ${err.message || '알 수 없는 오류'}`);
    }
  };

  return (
    <div className="form-card">
      <h2>금액 추가</h2>
      <form onSubmit={handleSubmit}>
        <label className="form-label">
          구분
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="select-field full-width"
          >
            <option value="EXPENSE">지출</option>
            <option value="INCOME">수입</option>
          </select>
        </label>

        <label className="form-label">
          금액 (원)
          <input
            type="number"
            placeholder="금액을 입력해주세요."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field full-width"
            required
          />
        </label>

        <label className="form-label">
          설명
          <input
            type="text"
            placeholder="예: 점심 식비, 회비 납부"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field full-width"
            required
          />
        </label>

        {paymentType === 'EXPENSE' && groupMembers.length > 0 && (
          <label className="form-label">
            돈을 낸 회원
            <select
              value={payerMemberId}
              onChange={(e) => setPayerMemberId(e.target.value)}
              className="select-field full-width"
              required={paymentType === 'EXPENSE'}
            >
              {groupMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {paymentType === 'EXPENSE' && groupMembers.length === 0 && (
          <p className="small-text error-message">회원 목록을 불러올 수 없거나, 그룹에 등록된 회원이 없습니다.</p>
        )}

        <button type="submit" className="submit-button-large">
          등록
        </button>
      </form>
    </div>
  );
}

export default PaymentAddForm;