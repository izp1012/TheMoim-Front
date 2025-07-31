// src/pages/bank/KftcConnectPage.js
import React, { useState, useEffect } from 'react';
import FinancialApiConnector from '../../components/FinancialApiConnector';

function KftcConnectPage({ connectedAccountInfo, onApiConnected }) {
  const [localAccountInfo, setLocalAccountInfo] = useState(connectedAccountInfo);

  // props로 받은 connectedAccountInfo가 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    setLocalAccountInfo(connectedAccountInfo);
  }, [connectedAccountInfo]);

  // API 연결 성공 시 처리
  const handleApiConnected = (accountInfo) => {
    console.log('계좌 연결 성공:', accountInfo);
    setLocalAccountInfo(accountInfo);
    
    // 부모 컴포넌트에 계좌 정보 전달
    if (onApiConnected) {
      onApiConnected(accountInfo);
    }
  };

  // 계좌 연결 해제
  const handleDisconnect = () => {
    const confirmed = window.confirm('계좌 연결을 해제하시겠습니까?');
    if (confirmed) {
      setLocalAccountInfo(null);
      
      // 부모 컴포넌트에 연결 해제 알림
      if (onApiConnected) {
        onApiConnected(null);
      }
      
      // 로컬 스토리지에서도 제거 (필요한 경우)
      localStorage.removeItem('kftc-account-info');
    }
  };

  // 금액 포맷팅 함수
  const formatAmount = (amount) => {
    if (!amount) return '0원';
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''));
    return numAmount.toLocaleString() + '원';
  };

  // 거래 내역 포맷팅
  const formatTransaction = (transaction) => {
    const amount = parseInt(transaction.tran_amt || '0');
    const isDeposit = transaction.inout_type === '1'; // 1: 입금, 2: 출금
    
    return {
      id: transaction.tran_date + transaction.tran_time + transaction.tran_amt,
      date: transaction.tran_date ? 
        `${transaction.tran_date.slice(0,4)}-${transaction.tran_date.slice(4,6)}-${transaction.tran_date.slice(6,8)}` : 
        new Date().toISOString().slice(0,10),
      time: transaction.tran_time ? 
        `${transaction.tran_time.slice(0,2)}:${transaction.tran_time.slice(2,4)}` : 
        '',
      description: transaction.print_content || transaction.tran_type || '거래',
      amount: (isDeposit ? '+' : '-') + amount.toLocaleString() + '원',
      balance: transaction.after_balance_amt ? 
        parseInt(transaction.after_balance_amt).toLocaleString() + '원' : 
        ''
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">금융 계좌 연결</h2>
      <p className="text-gray-600 mb-6">
        금융결재원 오픈 API를 통해 은행 계좌를 연결하고 실시간으로 계좌 정보를 조회할 수 있습니다.
      </p>

      {localAccountInfo ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-700">연결된 계좌 정보</h3>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              연결됨
            </span>
          </div>
          
          {/* 계좌 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">은행명</p>
              <p className="text-lg font-semibold text-gray-800">{localAccountInfo.bankName}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">계좌번호</p>
              <p className="text-lg font-semibold text-gray-800">{localAccountInfo.accountNumber}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">예금주</p>
              <p className="text-lg font-semibold text-gray-800">{localAccountInfo.ownerName}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">현재 잔액</p>
              <p className="text-2xl font-bold text-green-600">{formatAmount(localAccountInfo.balance)}</p>
            </div>
          </div>

          {/* 거래 내역 */}
          {localAccountInfo.transactions && localAccountInfo.transactions.length > 0 && (
            <div className="bg-white p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                최근 거래 내역 ({localAccountInfo.transactions.length}건)
              </h4>
              
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {localAccountInfo.transactions.map((tx) => {
                    const formattedTx = formatTransaction(tx);
                    return (
                      <div key={formattedTx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{formattedTx.description}</span>
                            <span className={`font-bold ${formattedTx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {formattedTx.amount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                            <span>{formattedTx.date} {formattedTx.time}</span>
                            {formattedTx.balance && <span>잔액: {formattedTx.balance}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDisconnect}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              계좌 연결 해제
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              정보 새로고침
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center mb-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">연결된 계좌가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              금융결재원을 통해 계좌를 연결하여 실시간 잔액과 거래내역을 확인하세요.
            </p>
          </div>
          
          <FinancialApiConnector onApiConnected={handleApiConnected} />
        </div>
      )}

      {/* 안내사항 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <svg className="flex-shrink-0 w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              안내사항
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>테스트 환경에서는 실제 계좌 정보가 아닌 샘플 데이터가 표시됩니다.</li>
                <li>실제 서비스에서는 금융결재원의 정식 승인이 필요합니다.</li>
                <li>개인정보 보호를 위해 계좌번호는 마스킹 처리됩니다.</li>
                <li>연결된 계좌 정보는 브라우저 세션이 종료되면 삭제됩니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KftcConnectPage;