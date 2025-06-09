// src/components/payment/SettlementPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import { getGroupPayments } from '../../api/moimApp';

function SettlementPage() {
  const { groupId } = useParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settlementResult, setSettlementResult] = useState(null); // 정산 결과

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getGroupPayments(groupId);
        setPayments(data);
      } catch (err) {
        setError('결제 내역을 불러오는 데 실패했습니다.');
        console.error("Fetch payments error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [groupId]);

  const handleCalculateSettlement = () => {
    // 여기에 정산 로직을 구현합니다.
    // 예를 들어, 모든 수입과 지출을 합산하고, 각 회원별로 정산 금액을 계산합니다.
    // 이 로직은 실제로는 백엔드에서 수행하는 것이 더 적합합니다.
    let totalIncome = 0;
    let totalExpense = 0;
    const memberContributions = {}; // 각 회원이 낸 돈

    payments.forEach(p => {
      if (p.type === 'INCOME') {
        totalIncome += p.amount;
      } else if (p.type === 'EXPENSE') {
        totalExpense += p.amount;
        // 실제로는 UsrGroupMember ID를 PayerMemberId로 사용해야 함
        memberContributions[p.payerMemberId] = (memberContributions[p.payerMemberId] || 0) + p.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;

    // 간단한 예시 정산 로직: 총 지출을 N빵
    const numMembers = 3; // 임의의 회원 수 (실제로는 그룹 멤버 수를 가져와야 함)
    const perMemberCost = totalExpense / numMembers;

    const result = {
      totalIncome,
      totalExpense,
      netBalance,
      perMemberCost,
      memberContributions, // 각 회원이 낸 돈
      // 여기에 각 회원이 받을/낼 돈 계산 로직 추가
    };
    setSettlementResult(result);
    alert('정산이 완료되었습니다! (임시 로직)');
  };

  if (loading) return <div className="loading-message">결제 내역 불러오는 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="settlement-page-container">
      <h2>비용 정산</h2>
      <p>현재 그룹의 모든 결제 내역을 기반으로 정산을 진행합니다.</p>

      <button className="submit-button-large" onClick={handleCalculateSettlement}>
        정산 계산하기
      </button>

      {settlementResult && (
        <div className="settlement-result-card">
          <h3>정산 결과</h3>
          <p>총 수입: {settlementResult.totalIncome.toLocaleString()}원</p>
          <p>총 지출: {settlementResult.totalExpense.toLocaleString()}원</p>
          <p>잔액: {settlementResult.netBalance.toLocaleString()}원</p>
          <p>1인당 예상 지출액 (임시): {settlementResult.perMemberCost.toLocaleString()}원</p>
          <h4>회원별 지불 내역 (임시)</h4>
          <ul>
            {Object.entries(settlementResult.memberContributions).map(([memberId, amount]) => (
              <li key={memberId}>회원 ID {memberId}: {amount.toLocaleString()}원 지불</li>
            ))}
          </ul>
          <p className="small-text">
            * 이 정산은 임시 로직이며, 실제 앱에서는 더 복잡하고 정확한 정산 알고리즘과 카카오페이 연동이 필요합니다.
          </p>
        </div>
      )}

      <h3>모든 결제 내역</h3>
      {payments.length === 0 ? <p>아직 등록된 결제 내역이 없습니다.</p> : (
        <ul className="payment-list">
          {payments.map(p => (
            <li key={p.id} className="payment-list-item">
              <span className={`payment-type ${p.type === 'INCOME' ? 'income' : 'expense'}`}>
                {p.type === 'INCOME' ? '수입' : '지출'}
              </span>
              <span className="payment-amount">{p.amount.toLocaleString()}원</span>
              <span className="payment-description">{p.description}</span>
              <span className="payment-date">({p.paymentDate})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SettlementPage;