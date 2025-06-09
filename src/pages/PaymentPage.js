// src/pages/PaymentPage.js
import React, { useState } from 'react';
import axios from 'axios';

function PaymentPage() {
  const [groupId, setGroupId] = useState('');
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');

  const submitPayment = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/payments', {
        groupId: Number(groupId),
        payer,
        amount: Number(amount),
      });
      alert('Payment submitted for ' + res.data.payer);
    } catch (e) {
      console.error(e);
      alert('Failed to submit payment');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Add Payment</h1>
      <input
        className="border p-2 mr-2"
        placeholder="Group ID"
        value={groupId}
        onChange={e => setGroupId(e.target.value)}
      />
      <input
        className="border p-2 mr-2"
        placeholder="Payer"
        value={payer}
        onChange={e => setPayer(e.target.value)}
      />
      <input
        className="border p-2 mr-2"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button onClick={submitPayment} className="bg-green-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </div>
  );
}

export default PaymentPage;