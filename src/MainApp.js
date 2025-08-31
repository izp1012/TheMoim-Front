import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import './App.css';
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import HomePage from './pages/HomePage'; // 홈 페이지
// import GroupListPage from './components/group/GroupListPage'; // GroupListPage 삭제
import GroupAddForm from './components/group/GroupAddForm';
import GroupDetailsPage from './components/group/GroupDetailsPage'; // 그룹 상세 페이지 (하위 메뉴 포함)
import MemberListPage from './components/member/MemberListPage'; // 그룹 회원 목록 (라우트 분리)
// import MemberAddForm from './components/member/MemberAddForm'; // MemberAddForm 라우팅 삭제
import PaymentAddForm from './components/payment/PaymentAddForm';
import SettlementPage from './components/payment/SettlementPage';
import ReceiptManagementPage from './components/payment/ReceiptManagementPage';
import PaymentListPage from './pages/PaymentListPage'
import KftcConnectPage from './pages/kftc/KftcConnectPage'; 
import KftcCallbackPage from './pages/kftc/KftcCallbackPage'; 
import Dashboard from './pages/Dashboard';
import { createGroup, getGroupsByUserId } from './api/moimApp';

function MainApp({ currentUsrId, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [connectedAccountInfo, setConnectedAccountInfo] = useState(null);

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const groupIdIndex = pathSegments.indexOf('groups') + 1;
    if (groupIdIndex > 0 && groupIdIndex < pathSegments.length) {
      const id = parseInt(pathSegments[groupIdIndex]);
      if (!isNaN(id)) {
        setSelectedGroupId(id);
      } else {
        setSelectedGroupId(null);
      }
    } else {
      setSelectedGroupId(null);
    }
  }, [location.pathname]);

  const onBankApiConnected = (accountInfo) => {
    setConnectedAccountInfo(accountInfo);
  };

  const handleCreateGroup = async (groupData) => {
    try {
        const newGroup = await createGroup({ ...groupData, createdByUsrId: currentUsrId });
        alert(`그룹 '${newGroup.moimname}'이(가) 성공적으로 생성되었습니다!`);
        navigate(`/groups/${newGroup.id}/details`);
    } catch (err) {
        alert(`그룹 생성 실패: ${err.message || '알 수 없는 오류'}`);
        console.error("그룹 생성 중 오류 발생:", err);
    }
  };

  const handleSelectGroupFromList = (groupId) => {
    setSelectedGroupId(groupId);
    navigate(`/groups/${groupId}/details`);
  };

  return (
    <div className="app-container">
      <Header 
        selectedGroupId={selectedGroupId} 
        onLogout={onLogout} 
        connectedAccountInfo={connectedAccountInfo}
      />
      <main className="app-main-content">
      {connectedAccountInfo ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">은행 계좌 연결됨: </strong>
            <span className="block sm:inline">{connectedAccountInfo.bankName} - {connectedAccountInfo.accountNumber}</span>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">알림: </strong>
            <span className="block sm:inline">아직 연결된 은행 계좌가 없습니다. 
              <Link to="/bank-connect" className="text-blue-700 hover:underline">지금 연결하기</Link></span>
          </div>
        )}
        <Routes>
          <Route path="/" element={<HomePage currentUsrId={currentUsrId} onSelectGroup={handleSelectGroupFromList} />} />
          <Route path="/groups" element={<HomePage currentUsrId={currentUsrId} onSelectGroup={handleSelectGroupFromList} />} />
          
          <Route path="/groups/add" element={<GroupAddForm onCreateGroup={handleCreateGroup} onCancel={() => navigate('/groups')} />} />
          
          <Route path="/groups/:groupId/details" element={<GroupDetailsPage />} />
          <Route path="/groups/:groupId/members" element={<MemberListPage />} />
          {/* MemberAddForm 라우팅을 GroupDetailsPage 내부에서 처리하므로 여기서 삭제 */}
          {/* <Route path="/groups/:groupId/members/add" element={<MemberAddForm />} /> */}

          <Route path="/groups/:groupId/payments/:paymentId/receipts" element={<ReceiptManagementPage />} />
          <Route path="/groups/:groupId/payments/add" element={selectedGroupId ? <PaymentAddForm groupId={selectedGroupId} /> : <div>그룹을 선택해주세요.</div>} />
          <Route path="/groups/:groupId/payments/settlement" element={selectedGroupId ? <SettlementPage groupId={selectedGroupId} /> : <div>그룹을 선택해주세요.</div>} />
          <Route path="/groups/:groupId/payments/receipts" element={selectedGroupId ? <ReceiptManagementPage groupId={selectedGroupId} /> : <div>그룹을 선택해주세요.</div>} />
          <Route path="/groups/:groupId/payments/list" element={<PaymentListPage />} />
          
          <Route 
            path="/bank-connect" 
            element={
              <KftcConnectPage 
                connectedAccountInfo={connectedAccountInfo} 
                onApiConnected={onBankApiConnected} 
              />
            } 
          />
          <Route path="/auth/kftc/callback" element={<Dashboard />} />
          <Route 
            path="/auth/kftc/callback" 
            element={<KftcCallbackPage onApiConnected={onBankApiConnected} />} 
          />

          <Route path="*" element={<p style={{textAlign: 'center', padding: '20px'}}>페이지를 찾을 수 없습니다.</p>} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default MainApp;
