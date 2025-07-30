// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import { getDefaultGroup, createGroup } from '../api/moimApp';
import GroupAddForm from '../components/group/GroupAddForm'; // 그룹 추가 폼 재사용
import DefaultAccountInfo from '../components/home/DefaultAccountInfo'; // 새로운 컴포넌트

function HomePage({ currentUsrId, onSelectGroup }) {
  const navigate = useNavigate();
  const [defaultGroup, setDefaultGroup] = useState(null); // 사용자의 기본 그룹
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDefaultGroup = async () => {
      try {
        setLoading(true);
        // 서버에서 현재 사용자의 '기본' 그룹 정보를 가져옴
        // 백엔드에서 사용자별로 대표 그룹을 설정하는 로직이 필요
        const group = await getDefaultGroup(currentUsrId);
        setDefaultGroup(group);
      } catch (err) {
        setError('기본 그룹 정보를 불러오는 데 실패했습니다.');
        console.error("Fetch default group error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUsrId) { // 사용자 ID가 있을 때만 요청
      fetchDefaultGroup();
    } else {
        // 로그인 되지 않은 상태
        setLoading(false);
        setError('로그인 정보가 없습니다.');
    }
  }, [currentUsrId]);

  const handleCreateGroupSuccess = (newGroup) => {
    setDefaultGroup(newGroup); // 새로 생성된 그룹을 기본 그룹으로 설정
    navigate(`/groups/${newGroup.id}/details`); // 새 그룹의 상세 페이지로 이동
  };

  const handleCreateGroupSuccessFromHome = async (groupData) => {
    try {
      const newGroup = await createGroup({ ...groupData, createdByUsrId: currentUsrId });
      alert(`그룹 '${newGroup.groupName}'이(가) 생성되었습니다!`);
      setDefaultGroup(newGroup); // 새로 생성된 그룹을 기본 그룹으로 설정
      navigate(`/groups/${newGroup.id}/details`); // 새 그룹의 상세 페이지로 이동
    } catch (err) {
      alert(`그룹 생성 실패: ${err.message || '알 수 없는 오류'}`);
      console.error("홈에서 그룹 생성 중 오류 발생:", err);
    } 
  };

  const handleManageGroupClick = () => {
    if (defaultGroup) {
      navigate(`/groups/${defaultGroup.id}/details`); // 기본 그룹의 상세 페이지로 이동
    } else {
      navigate('/groups'); // 그룹 목록 페이지로 이동
    }
  };

  if (loading) return <div className="loading-message">홈 화면 로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-page-container">
      <h2>환영합니다!</h2>
      {defaultGroup ? (
        <>
          {/* 계좌 정보 및 모임 정보 표시 */}
          <DefaultAccountInfo group={defaultGroup} />
          <button className="submit-button-large manage-group-button" onClick={handleManageGroupClick}>
            그룹 관리하기
          </button>
        </>
      ) : (
        <div className="empty-state-card">
          <p>아직 연결된 모임이 없습니다.</p>
          <p>새로운 모임을 만들고 시작해보세요!</p>
          {/* GroupAddForm은 onCreateGroup prop을 받아 처리 */}
          <GroupAddForm onCreateGroup={handleCreateGroupSuccess} onCancel={() => { /* 취소 로직 (홈 화면에서 취소 시 다른 동작) */ alert('그룹 생성을 취소했습니다.'); }} />
        </div>
      )}
    </div>
  );
}

export default HomePage;