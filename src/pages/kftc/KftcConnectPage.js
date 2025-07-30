// src/pages/bank/KftcConnectPage.js
import React from 'react';
import FinancialApiConnector from '../../components/FinancialApiConnector';

function KftcConnectPage({ connectedAccountInfo, onApiConnected }) {
  console.log(`connectedAccountInfo = `+connectedAccountInfo);
  console.log(`onApiConnected = `+onApiConnected);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">금융 계좌 연결</h2>
      <p className="text-gray-600 mb-6">
        금융결재원 오픈 API를 통해 은행 계좌를 연결하고 정보를 조회할 수 있습니다.
      </p>

      {connectedAccountInfo ? (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">연결된 계좌 정보</h3>
          <p className="mb-2"><span className="font-medium">은행명:</span> {connectedAccountInfo.bankName}</p>
          <p className="mb-2"><span className="font-medium">계좌번호:</span> {connectedAccountInfo.accountNumber}</p>
          <p className="mb-2"><span className="font-medium">예금주:</span> {connectedAccountInfo.ownerName}</p>
          <p className="mb-4 text-lg font-bold text-green-600"><span className="font-medium">잔액:</span> {connectedAccountInfo.balance}</p>
          
          <h4 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">최근 거래 내역</h4>
          <ul className="space-y-1 text-sm">
            {connectedAccountInfo.transactions.map((tx) => (
              <li key={tx.id} className="flex justify-between">
                <span>{tx.date} - {tx.description}</span>
                <span className={`${tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'} font-bold`}>{tx.amount}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => onApiConnected(null)} // 연결 해제 시뮬레이션
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg mt-6"
          >
            계좌 연결 해제 (시뮬레이션)
          </button>
        </div>
      ) : (
        <FinancialApiConnector onApiConnected={onApiConnected} />
      )}
    </div>
  );
}

export default KftcConnectPage;