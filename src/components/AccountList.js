// src/components/AccountList.js - 계좌 목록 컴포넌트
import React, { useState, useEffect } from 'react';
import { fetchAccountInfoViaBackend, fetchAccountBalance } from '../utils/kftc';
import { BANK_CODES } from '../config/kftc';

function AccountList({ onAccountSelect }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountInfo = await fetchAccountInfoViaBackend();
      setAccounts(accountInfo.resList || []);
      
      // 각 계좌의 잔액 조회
      const balancePromises = (accountInfo.resList || []).map(async (account) => {
        try {
          const balance = await fetchAccountBalance(account.fintechUseNum);
          return { fintechUseNum: account.fintechUseNum, balance };
        } catch (error) {
          console.error(`잔액 조회 실패 (${account.fintechUseNum}):`, error);
          return { fintechUseNum: account.fintechUseNum, balance: null };
        }
      });

      const balanceResults = await Promise.all(balancePromises);
      const balanceMap = {};
      balanceResults.forEach(result => {
        balanceMap[result.fintechUseNum] = result.balance;
      });
      setBalances(balanceMap);

    } catch (error) {
      console.error('계좌 정보 로드 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '조회 실패';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const getBankName = (bankCode) => {
    return BANK_CODES[bankCode] || `은행코드 ${bankCode}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">계좌 정보를 불러올 수 없습니다.</p>
        <p className="text-gray-500 text-sm">{error}</p>
        <button 
          onClick={loadAccounts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">연결된 계좌</h3>
      
      {accounts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">연결된 계좌가 없습니다.</p>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => {
            const balance = balances[account.fintechUseNum];
            
            return (
              <div
                key={account.fintechUseNum}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onAccountSelect?.(account)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {getBankName(account.bankCodeStd)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {account.accountAlias || '계좌'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      계좌번호: {account.accountNumMasked}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      계좌명: {account.accountHolderName}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">
                      {balance ? formatAmount(balance.balance) : '조회 중...'}
                    </p>
                    {balance && (
                      <p className="text-xs text-gray-500">
                        조회일시: {new Date(balance.tranDate + ' ' + balance.tranTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default AccountList;