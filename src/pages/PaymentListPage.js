// src/pages/PaymentListPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PaymentListPage() {
  const { groupId } = useParams();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/payments/group/${groupId}`);
        setPayments(res.data);
      } catch (e) {
        console.error(e);
        alert('Failed to load payments');
      }
    };
    fetchPayments();
  }, [groupId]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Payments for Group {groupId}</h1>
      <ul>
        {payments.map(payment => (
          <li key={payment.id} className="mb-2">
            {payment.payer} paid {payment.amount} at {new Date(payment.paidAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentListPage;
