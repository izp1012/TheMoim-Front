// src/components/payment/ReceiptManagementPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import { getPaymentsByGroupId, uploadReceiptPhoto, getReceiptPhotos } from '../../api/moimApp';

function ReceiptManagementPage() {
  const { groupId } = useParams();
  const [payments, setPayments] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getPaymentsByGroupId(groupId);
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

  useEffect(() => {
    const fetchReceipts = async () => {
      if (selectedPaymentId) {
        try {
          const data = await getReceiptPhotos(selectedPaymentId);
          setReceipts(data);
        } catch (err) {
          console.error("영수증 사진 불러오기 실패:", err);
          setReceipts([]);
        }
      } else {
        setReceipts([]);
      }
    };
    fetchReceipts();
  }, [selectedPaymentId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && selectedPaymentId) {
      try {
        const uploadedPhoto = await uploadReceiptPhoto(selectedPaymentId, file);
        setReceipts([...receipts, uploadedPhoto]);
        alert('영수증 사진이 업로드되었습니다!');
      } catch (err) {
        alert(`영수증 업로드 실패: ${err.message || '알 수 없는 오류'}`);
      }
    } else if (!selectedPaymentId) {
      alert('먼저 영수증을 추가할 결제 내역을 선택해주세요.');
    }
  };

  if (loading) return <div className="loading-message">결제 내역 불러오는 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="receipt-management-container">
      <h2>영수증 처리</h2>
      <p>영수증을 첨부할 결제 내역을 선택하고 사진을 업로드하세요.</p>

      <label className="form-label">
        결제 내역 선택
        <select
          value={selectedPaymentId || ''}
          onChange={(e) => setSelectedPaymentId(parseInt(e.target.value))}
          className="select-field full-width"
        >
          <option value="">-- 결제 내역 선택 --</option>
          {payments.map(p => (
            <option key={p.id} value={p.id}>
              [{p.type === 'INCOME' ? '수입' : '지출'}] {p.description} ({p.amount.toLocaleString()}원)
            </option>
          ))}
        </select>
      </label>

      {selectedPaymentId && (
        <div className="receipt-upload-section">
          <h3>선택된 결제 내역 영수증</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
            id="receipt-file-input"
          />
          <label htmlFor="receipt-file-input" className="file-input-label">
            <i className="icon-upload"></i> 영수증 사진 업로드
          </label>

          {receipts.length === 0 ? <p className="small-text">아직 등록된 영수증 사진이 없습니다.</p> : (
            <div className="photo-grid">
              {receipts.map((photo, index) => (
                <img key={photo.id || index} src={photo.url} alt={`Receipt ${index}`} className="uploaded-photo" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReceiptManagementPage;