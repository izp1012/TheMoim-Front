// src/App.js
import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import MemberAddForm from './components/member/MemberAddForm';
import MemberListPage from './components/member/MemberListPage';
// API 모듈 임포트
import {
  addMember,
  getAllMembers
} from './api/moimApp';

function App() {
  const [activeTab, setActiveTab] = useState('members'); // 'members' 또는 'addMember'
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const membersData = await getAllMembers();
        setMembers(membersData);
      } catch (err) {
        setError('회원 목록을 불러오는 데 실패했습니다.');
        console.error("Fetch members error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleAddMember = async (newMember) => {
    try {
      const addedMember = await addMember(newMember);
      setMembers([...members, addedMember]);
      alert(`${addedMember.name} 회원이 추가되었습니다!`);
      setActiveTab('members'); // 회원 추가 후 회원 목록으로 이동
    } catch (err) {
      alert(`회원 추가 실패: ${err.message || '알 수 없는 오류'}`);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="loading-message">회원 정보를 불러오는 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    switch (activeTab) {
      case 'members':
        return <MemberListPage members={members} />;
      case 'addMember':
        return <MemberAddForm onAddMember={handleAddMember} />;
      // 다른 탭이 있다면 여기에 추가
      default:
        return <MemberListPage members={members} />;
    }
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-main-content">
        {renderContent()}
      </main>
      <BottomNav />
    </div>
  );
}

export default App;