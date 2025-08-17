import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../App.css';
import { getGroupMembers, addPayment } from '../../api/moimApp';

function PaymentAddForm() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [payerMemberId, setPayerMemberId] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const membersData = await getGroupMembers(groupId);
                setMembers(membersData);
                if (membersData.length > 0) {
                    setPayerMemberId(membersData[0].id); // 첫 번째 멤버를 기본값으로 설정
                }
            } catch (err) {
                setError('회원 목록을 불러오는 데 실패했습니다.');
                console.error("Fetch members error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            fetchMembers();
        }
    }, [groupId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!payerMemberId || !amount || !paymentDate) {
            setError('필수 입력 항목을 모두 채워주세요.');
            return;
        }

        try {
            // 백엔드 PaymentReqDTO에 맞춰 데이터를 전송
            const paymentData = {
                moimId: parseInt(groupId),
                amount: parseFloat(amount),
                description: description.trim(),
                paymentDate: paymentDate, // 날짜 형식에 맞게 변환 필요
                payerMemberId: parseInt(payerMemberId),
            };

            await addPayment(paymentData);
            alert('결제 내역이 성공적으로 추가되었습니다.');
            navigate(`/groups/${groupId}/details`); // 상세 페이지로 이동
        } catch (err) {
            setError(`결제 추가 실패: ${err.message || '알 수 없는 오류'}`);
        }
    };

    if (loading) return <div>회원 목록을 불러오는 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="payment-form-container">
            <h3>모임비 내역 추가</h3>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-group">
                    <label>지불자</label>
                    <select
                        value={payerMemberId}
                        onChange={(e) => setPayerMemberId(e.target.value)}
                        className="select-field"
                        required
                    >
                        {members.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>금액 (원)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field"
                        placeholder="예: 10000"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>내용</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field"
                        placeholder="예: 저녁 식사비"
                    />
                </div>

                <div className="form-group">
                    <label>결제일</label>
                    <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="input-field"
                        required
                    />
                </div>

                <button type="submit" className="submit-button-large">
                    내역 추가하기
                </button>
            </form>
        </div>
    );
}

export default PaymentAddForm;
