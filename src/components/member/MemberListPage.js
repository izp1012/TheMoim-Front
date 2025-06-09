// src/components/member/MemberListPage.js (수정)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // useParams 임포트
import '../../App.css';
import { getGroupMembers } from '../../api/moimApp';

function MemberListPage() { // members prop 제거
  const { groupId } = useParams(); // URL에서 groupId 가져오기
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getGroupMembers(groupId); // groupId로 회원 목록 요청
        setMembers(data);
      } catch (err) {
        setError('회원 목록을 불러오는 데 실패했습니다.');
        console.error("Fetch members error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (groupId) { // groupId가 유효할 때만 fetch
        fetchMembers();
    }
  }, [groupId]);

  if (loading) return <div className="loading-message">회원 목록 불러오는 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="member-list-container">
      <h3>그룹 회원 목록</h3>
      {members.length === 0 ? (
        <p>이 그룹에 등록된 회원이 없습니다. "회원 추가" 탭에서 추가해주세요.</p>
      ) : (
        <ul className="member-list">
          {members.map((member) => (
            // UsrGroupMember 객체의 속성에 따라 표시 (id, name, role, contactInfo 등)
            <li key={member.id} className="member-list-item">
              <span className="member-name">{member.name || `회원 ID: ${member.id}`}</span>
              <span className="member-role">{member.role}</span>
              <span className="member-contact">{member.contactInfo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MemberListPage;