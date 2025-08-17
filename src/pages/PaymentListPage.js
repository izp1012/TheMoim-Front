import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/App.css';
import { getPaymentsByGroupId } from '../api/moimApp';

function PaymentListPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const fetchedPayments = await getPaymentsByGroupId(groupId);
                setPayments(fetchedPayments);
            } catch (err) {
                setError('결제 내역을 불러오는 데 실패했습니다.');
                console.error("Fetch payments error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            fetchPayments();
        }
    }, [groupId]);

    if (loading) return <div>결제 내역을 불러오는 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="payment-list-container">
            <h3>모임비 내역</h3>
            <button className="button-primary-small" onClick={() => navigate(`/groups/${groupId}/payments/add`)}>+ 내역 추가</button>
            
            {payments.length === 0 ? (
                <div className="empty-state-card">
                    <p>아직 등록된 결제 내역이 없습니다.</p>
                </div>
            ) : (
                <ul className="payment-list">
                    {payments.map(payment => (
                        <li key={payment.id} className="payment-list-item">
                            <div className="payment-info">
                                <span className="payment-date">{payment.paymentDate}</span>
                                <span className="payment-description">{payment.description}</span>
                            </div>
                            <div className="payment-details">
                                <span className="payment-amount">{payment.amount.toLocaleString()}원</span>
                                <span className="payment-payer">{payment.payerName}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default PaymentListPage;
