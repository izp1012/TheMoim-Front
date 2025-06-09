// src/components/group/GroupDetailsPage.js
import React, { useState, useEffect } from 'react';
import '../../App.css';
import { getGroupDetails, getGroupMembers, addMemberToGroup } from '../../api/moimApp';
import MemberAddForm from '../member/MemberAddForm'; // 기존 MemberAddForm 재사용
import MemberListPage from '../member/MemberListPage'; // 기존 MemberListPage 재사용

function GroupDetailsPage({ groupId, onBackToList, onNavigateToPaymentTab }) {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('membersList'); // 'membersList' | 'addMember'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const groupData = await getGroupDetails(groupId);
        setGroup(groupData);

        const membersData = await getGroupMembers(groupId);
        setMembers(membersData);

      } catch (err) {
        setError('그룹 정보를 불러오는 데 실패했습니다.');
        console.error("Fetch group details error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]); // groupId가 변경될 때마다 다시 불러옴

  const handleAddMemberToGroup = async (memberData) => {
    try {
      const newGroupMember = await addMemberToGroup(groupId, memberData); // API 호출
      setMembers([...members, newGroupMember]); // UsrGroupMember 객체가 추가됨
      alert(`${newGroupMember.name || memberData.name} 회원이 그룹에 추가되었습니다!`);
      setActiveSubTab('membersList'); // 추가 후 목록으로 이동
    } catch (err) {
      alert(`회원 추가 실패: ${err.message || '알 수 없는 오류'}`);
    }
  };

  if (loading) return <div className="loading-message">그룹 정보를 불러오는 중...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!group) return <div className="error-message">그룹을 찾을 수 없습니다.</div>;

  return (
    <div className="group-details-page">
      <div className="details-header">
        <button onClick={onBackToList} className="back-button">← 그룹 목록</button>
        <h2>{group.groupName}</h2>
      </div>

      <div className="group-detail-tabs">
        <button
          className={`tab-button ${activeSubTab === 'membersList' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('membersList')}
        >
          회원 목록
        </button>
        <button
          className={`tab-button ${activeSubTab === 'addMember' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('addMember')}
        >
          회원 추가
        </button>
      </div>

      <div className="group-detail-content">
        {activeSubTab === 'membersList' && <MemberListPage members={members} />}
        {activeSubTab === 'addMember' && <MemberAddForm onAddMember={handleAddMemberToGroup} />}

        {/* 모임비 관리 탭으로 바로 이동할 수 있는 버튼들 */}
        <div className="quick-links">
          <h3>모임비 관리 바로가기</h3>
          <button className="button-primary-small" onClick={() => onNavigateToPaymentTab('add')}>금액 추가</button>
          <button className="button-primary-small" onClick={() => onNavigateToPaymentTab('settlement')}>비용 정산</button>
          <button className="button-primary-small" onClick={() => onNavigateToPaymentTab('receipts')}>영수증 처리</button>
        </div>
      </div>
    </div>
  );
}

export default GroupDetailsPage;