// src/components/TransactionHistory.js - 거래내역 컴포넌트
import React, { useState, useEffect } from 'react';
import { fetchTransactionHistory } from '../utils/kftc';

function TransactionHistory({ account }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 전
    toDate: new Date().toISOString().split('T')[0] // 오늘
  });

  useEffect(() => {
    if (account) {
      loadTransactions();
    }
  }, [account]);

  const loadTransactions = async () => {
    if (!account) return;

    setLoading(true);
    setError(null);

    try {
      const fromDate = dateFilter.fromDate.replace(/-/g, '');
      const toDate = dateFilter.toDate.replace(/-/g, '');
      
      const response = await fetchTransactionHistory(
        account.fintechUseNum,
        fromDate,
        toDate,
        'DESC'
      );

      setTransactions(response.resList || []);
    } catch (error) {
      console.error('거래내역 조회 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatAmount = (amount, inoutType) => {
    const formattedAmount = new Intl.NumberFormat('ko-KR').format(Math.abs(amount));
    return inoutType === '1' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return '';
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const hour = time.substring(0, 2);
    const minute = time.substring(2, 4);
    const second = time.substring(4, 6);
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  };

  if (!account) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">거래내역을 조회할 계좌를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">거래내역 조회</h2>

        {/* 계좌 정보 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">조회 계좌</h3>
          <p className="text-sm text-gray-600">
            {account.bankName} {account.accountNumMasked}
          </p>
          <p className="text-sm text-gray-600">
            예금주: {account.accountHolderName}
          </p>
        </div>

        {/* 조회 조건 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-2">
              시작일
            </label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={dateFilter.fromDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-2">
              종료일
            </label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={dateFilter.toDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadTransactions}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? '조회 중...' : '조회'}
            </button>
          </div>
        </div>

        {/* 거래내역 목록 */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">거래내역을 불러올 수 없습니다.</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">해당 기간에 거래내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-4 p-3 bg-gray-100 rounded-lg font-medium text-sm text-gray-700">
              <div>거래일시</div>
              <div>거래내용</div>
              <div>입출금구분</div>
              <div className="text-right">거래금액</div>
              <div className="text-right">잔액</div>
            </div>
            
            {transactions.map((transaction, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 p-3 border-b border-gray-200 hover:bg-gray-50">
                <div className="text-sm text-gray-600">
                  {formatDateTime(transaction.tranDate, transaction.tranTime)}
                </div>
                <div className="text-sm">
                  <p className="font-medium">{transaction.printContent}</p>
                </div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.inoutType === '1' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.inoutType === '1' ? '입금' : '출금'}
                  </span>
                </div>
                <div className={`text-sm text-right font-medium ${
                  transaction.inoutType === '1' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatAmount(transaction.tranAmt, transaction.inoutType)}원
                </div>
                <div className="text-sm text-right font-medium">
                  {new Intl.NumberFormat('ko-KR').format(transaction.afterBalanceAmt)}원
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;