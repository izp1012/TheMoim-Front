// src/pages/Dashboard.js - 대시보드 페이지
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import KftcAuthButton from '../components/KftcAuthButton';
import AccountList from '../components/AccountList';
import TransferForm from '../components/TransferForm';
import TransactionHistory from '../components/TransactionHistory';
import { isKftcTokenValid, clearKftcTokens } from '../utils/kftc';

function Dashboard() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(isKftcTokenValid());
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('accounts');
  const [accountInfo, setAccountInfo] = useState(location.state?.accountInfo || null);

  useEffect(() => {
    if (location.state?.error) {
      alert(`인증 실패: ${location.state.error}`);
    }
  }, [location.state]);

  const handleAuthSuccess = (accountInfo) => {
    setIsAuthenticated(true);
    setAccountInfo(accountInfo);
    setActiveTab('accounts');
  };

  const handleAuthError = (error) => {
    alert(`인증 실패: ${error}`);
  };

  const handleLogout = () => {
    const confirm = window.confirm('연결을 해제하시겠습니까?');
    if (confirm) {
      clearKftcTokens();
      setIsAuthenticated(false);
      setSelectedAccount(null);
      setAccountInfo(null);
      setActiveTab('accounts');
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleTransferComplete = (result) => {
    // 이체 완료 후 필요한 처리
    console.log('이체 완료:', result);
    // 계좌 목록 새로고침 등
  };

  const tabs = [
    { id: 'accounts', name: '계좌 조회', icon: '🏦' },
    { id: 'transfer', name: '계좌 이체', icon: '💸' },
    { id: 'history', name: '거래내역', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              금융결재원 오픈뱅킹 대시보드
            </h1>
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  연결 해제
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          /* 인증이 필요한 상태 */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  계좌 연결 필요
                </h2>
                <p className="text-gray-600 mb-8">
                  금융결재원 오픈뱅킹 서비스를 이용하기 위해<br />
                  계좌 연결 인증을 진행해주세요.
                </p>
              </div>
              
              <KftcAuthButton 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
                className="w-full"
              />
              
              <div className="mt-6 text-sm text-gray-500">
                <p>안전한 금융결재원 공식 인증을 통해</p>
                <p>계좌 정보를 보호하며 서비스를 제공합니다.</p>
              </div>
            </div>
          </div>
        ) : (
          /* 인증 완료 후 메인 대시보드 */
          <div className="space-y-6">
            {/* 탭 네비게이션 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-6 text-center font-medium border-b-2 transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div>
              {activeTab === 'accounts' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <AccountList onAccountSelect={handleAccountSelect} />
                </div>
              )}

              {activeTab === 'transfer' && (
                <TransferForm 
                  sourceAccount={selectedAccount}
                  onTransferComplete={handleTransferComplete}
                />
              )}

              {activeTab === 'history' && (
                <TransactionHistory account={selectedAccount} />
              )}
            </div>

            {/* 선택된 계좌 정보 (사이드바 형태) */}
            {selectedAccount && (
              <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                <h4 className="font-medium text-gray-900 mb-2">선택된 계좌</h4>
                <p className="text-sm text-gray-600">
                  {selectedAccount.bankName} {selectedAccount.accountNumMasked}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAccount.accountHolderName}
                </p>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-700"
                >
                  선택 해제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;