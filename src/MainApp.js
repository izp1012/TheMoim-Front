// src/MainApp.js (새로운 파일)
import React, { useState, useEffect } from 'react';
import './App.css'; // MainApp도 App.css를 사용
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import GroupListPage from './components/group/GroupListPage';
import GroupAddForm from './components/group/GroupAddForm';
import GroupDetailsPage from './components/group/GroupDetailsPage';
import PaymentAddForm from './components/payment/PaymentAddForm';
import SettlementPage from './components/payment/SettlementPage';
import ReceiptManagementPage from './components/payment/ReceiptManagementPage';

import { getAllGroups, createGroup } from './api/moimApp'; // moimApp.js에서 API 함수 임포트

function MainApp({ currentUsrId }) { // 로그인된 사용자 ID를 프롭스로 받음
  const [activeTopTab, setActiveTopTab] = useState('group');
  const [activeGroupSubTab, setActiveGroupSubTab] = useState('list');
  const [activePaymentSubTab, setActivePaymentSubTab] = useState('add');
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        // 현재 로그인된 사용자의 그룹만 가져오도록 변경
        const groupsData = await getAllGroups(currentUsrId);
        setGroups(groupsData);
      } catch (err) {
        setError('그룹 목록을 불러오는 데 실패했습니다.');
        console.error("Fetch groups error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUsrId) { // usrId가 있을 때만 그룹을 불러옴
      fetchGroups();
    }
  }, [currentUsrId]);

  const handleCreateGroup = async (groupData) => {
    try {
      const newGroup = await createGroup({ ...groupData, createdByUsrId: currentUsrId }); // 생성자 ID 포함
      setGroups([...groups, newGroup]);
      alert(`그룹 '${newGroup.groupName}'이(가) 생성되었습니다!`);
      setActiveTopTab('group');
      setActiveGroupSubTab('list');
    } catch (err) {
      alert(`그룹 생성 실패: ${err.message || '알 수 없는 오류'}`);
    }
  };

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setActiveTopTab('group');
    setActiveGroupSubTab('details');
  };

  const renderContent = () => {
    if (loading) return <div className="loading-message">데이터를 불러오는 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    if (activeTopTab === 'group') {
      if (activeGroupSubTab === 'list') {
        return <GroupListPage groups={groups} onSelectGroup={handleSelectGroup} onAddGroupClick={() => setActiveGroupSubTab('add')} />;
      } else if (activeGroupSubTab === 'add') {
        return <GroupAddForm onCreateGroup={handleCreateGroup} onCancel={() => setActiveGroupSubTab('list')} />;
      } else if (activeGroupSubTab === 'details' && selectedGroupId) {
        return (
          <GroupDetailsPage
            groupId={selectedGroupId}
            onBackToList={() => {
              setSelectedGroupId(null);
              setActiveGroupSubTab('list');
            }}
            onNavigateToPaymentTab={(tab) => {
              setActiveTopTab('payment');
              setActivePaymentSubTab(tab);
            }}
          />
        );
      }
    } else if (activeTopTab === 'payment') {
      if (!selectedGroupId) {
        return (
            <div className="empty-state-card">
              <p>모임비를 관리할 그룹을 선택해주세요.</p>
              <button className="submit-button-large" onClick={() => { setActiveTopTab('group'); setActiveGroupSubTab('list'); }}>
                그룹 목록으로 이동
              </button>
            </div>
        );
      }
      switch (activePaymentSubTab) {
        case 'add':
          return <PaymentAddForm groupId={selectedGroupId} />;
        case 'settlement':
          return <SettlementPage groupId={selectedGroupId} />;
        case 'receipts':
          return <ReceiptManagementPage groupId={selectedGroupId} />;
        default:
          return <PaymentAddForm groupId={selectedGroupId} />;
      }
    }
    return null;
  };

  return (
    <div className="app-container">
      <Header
        activeTopTab={activeTopTab}
        onTopTabChange={setActiveTopTab}
        activeGroupSubTab={activeGroupSubTab}
        onGroupSubTabChange={setActiveGroupSubTab}
        activePaymentSubTab={activePaymentSubTab}
        onPaymentSubTabChange={setActivePaymentSubTab}
        selectedGroupId={selectedGroupId}
      />
      <main className="app-main-content">
        {renderContent()}
      </main>
      <BottomNav />
    </div>
  );
}

export default MainApp;