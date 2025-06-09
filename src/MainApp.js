// src/MainApp.js (수정)
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import HomePage from './pages/HomePage'; // 홈 페이지
import GroupListPage from './components/group/GroupListPage';
import GroupAddForm from './components/group/GroupAddForm';
import GroupDetailsPage from './components/group/GroupDetailsPage'; // 그룹 상세 페이지 (하위 메뉴 포함)
import MemberListPage from './components/member/MemberListPage'; // 그룹 회원 목록 (라우트 분리)
import MemberAddForm from './components/member/MemberAddForm'; // 그룹에 회원 추가 (라우트 분리)
import PaymentAddForm from './components/payment/PaymentAddForm';
import SettlementPage from './components/payment/SettlementPage';
import ReceiptManagementPage from './components/payment/ReceiptManagementPage';

// MainApp에서는 이제 더 이상 복잡한 탭 상태를 직접 관리하지 않습니다.
// 라우터가 페이지를 결정하며, selectedGroupId는 HomePage 또는 GroupListPage에서 설정되어
// props로 전달되거나 Context API로 관리됩니다.
import { createGroup } from './api/moimApp';

function MainApp({ currentUsrId, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 확인
  const [selectedGroupId, setSelectedGroupId] = useState(null); // 현재 선택된 그룹 ID

  // URL 파라미터에서 groupId를 추출하여 selectedGroupId에 설정
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const groupIdIndex = pathSegments.indexOf('groups') + 1;
    if (groupIdIndex > 0 && groupIdIndex < pathSegments.length) {
      const id = parseInt(pathSegments[groupIdIndex]);
      if (!isNaN(id)) {
        setSelectedGroupId(id);
      } else {
        setSelectedGroupId(null); // 유효하지 않은 groupId면 초기화
      }
    } else {
      setSelectedGroupId(null); // 그룹 경로가 아니면 초기화
    }
  }, [location.pathname]); // 경로가 변경될 때마다 실행

  const handleCreateGroup = async (groupData) => {
    try {
      // API 호출: groupData (groupName, description)와 생성자 ID (currentUsrId)를 함께 보냄
      const newGroup = await createGroup({ ...groupData, createdByUsrId: currentUsrId });
      alert(`그룹 '${newGroup.groupName}'이(가) 성공적으로 생성되었습니다!`);

      // 그룹 생성 성공 후, 그룹 목록 또는 새로 생성된 그룹의 상세 페이지로 이동
      // 예를 들어, 생성된 그룹의 상세 페이지로 이동:
      navigate(`/groups/${newGroup.id}/details`);
      // 또는 그룹 목록으로 이동:
      // navigate('/groups');

      // 필요한 경우, 그룹 목록을 다시 불러오거나 상태를 업데이트
      // (MainApp에서 모든 그룹 목록을 관리한다면, 여기에 업데이트 로직 추가)
      // fetchGroups(); // 그룹 목록 새로고침
    } catch (err) {
      alert(`그룹 생성 실패: ${err.message || '알 수 없는 오류'}`);
      console.error("그룹 생성 중 오류 발생:", err);
    }
  };

  // GroupListPage에서 그룹 선택 시 호출
  const handleSelectGroupFromList = (groupId) => {
    setSelectedGroupId(groupId);
    navigate(`/groups/${groupId}/details`); // 그룹 상세 페이지로 이동
  };

  return (
    <div className="app-container">
      <Header selectedGroupId={selectedGroupId} onLogout={onLogout} /> {/* selectedGroupId 전달 */}
      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<HomePage currentUsrId={currentUsrId} onSelectGroup={handleSelectGroupFromList} />} />

          {/* 그룹 관리 라우트 */}
          <Route path="/groups" element={<GroupListPage onSelectGroup={handleSelectGroupFromList} />} />
          {/* 그룹 추가 페이지 - 여기서 handleCreateGroup 함수를 onCreateGroup 프롭스로 전달 */}
          <Route path="/groups/add" element={<GroupAddForm onCreateGroup={handleCreateGroup} onCancel={() => navigate('/groups')} />} />
          
          <Route path="/groups/add" element={<GroupAddForm />} />
          {/* 그룹 상세 페이지 (하위 기능 포함) */}
          <Route path="/groups/:groupId/details" element={<GroupDetailsPage />} />
          <Route path="/groups/:groupId/members" element={<MemberListPage />} />
          <Route path="/groups/:groupId/members/add" element={<MemberAddForm />} />


          {/* 모임비 관리 라우트 (selectedGroupId가 필요하므로 라우트 파라미터로 명시) */}
          {/* MainApp의 selectedGroupId state를 넘겨주기 위해 element props를 사용하는 대신 render props나 wrapper 컴포넌트를 고려할 수 있으나,
             여기서는 간단화를 위해 selectedGroupId를 직접 넘겨줌. 실제 앱에서는 Context API가 더 적합. */}
          <Route path="/groups/:groupId/payments/add" element={selectedGroupId ? <PaymentAddForm groupId={selectedGroupId} /> : <div>그룹을 선택해주세요.</div>} />
          <Route path="/groups/:groupId/payments/settlement" element={selectedGroupId ? <SettlementPage groupId={selectedGroupId} /> : <div>그룹을 선택해주세요.</div>} />
          <Route path="/groups/:groupId/payments/receipts" element={selectedGroupId ? <ReceiptManagementPage groupId={selectedGroupId} /> : <div>그룹을 선택해주세요.</div>} />

          {/* Fallback for unmatched routes */}
          <Route path="*" element={<p style={{textAlign: 'center', padding: '20px'}}>페이지를 찾을 수 없습니다.</p>} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default MainApp;