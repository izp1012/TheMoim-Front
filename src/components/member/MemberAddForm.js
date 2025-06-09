// src/components/member/MemberAddForm.js (수정)
import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // useParams 임포트
import '../../App.css';
import { addMemberToGroup } from '../../api/moimApp';

function MemberAddForm({ onAddMember }) { // onAddMember prop은 GroupDetailsPage에서 전달되므로 유지
  const { groupId } = useParams(); // URL에서 groupId 가져오기

  const [name, setName] = useState('');
  const [role, setRole] = useState('회원'); // 기본값 '회원'
  const [contactInfo, setContactInfo] = useState('');
  const [defaultFee, setDefaultFee] = useState(''); // 기본 회비
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupId) {
        setError('그룹 ID가 유효하지 않습니다. 다시 시도해주세요.');
        return;
    }
    if (!name.trim()) {
      setError('이름은 필수입니다.');
      return;
    }

    try {
      // UsrGroupMember 데이터 구조에 맞춰 전송
      const memberData = {
        name: name.trim(), // Member 엔티티의 이름으로 매핑되도록 백엔드에서 처리
        role,
        contactInfo: contactInfo.trim(),
        defaultFee: parseFloat(defaultFee) || 0,
        // UsrGroupMember가 실제 User/Member 엔티티를 참조하는 경우 추가 데이터 필요
        // memberId: (백엔드에서 자동으로 생성/매핑)
      };
      // onAddMember를 통해 상위 컴포넌트 (GroupDetailsPage)로 데이터 전달
      await onAddMember(memberData); // 여기서 실제 addMemberToGroup API 호출이 이루어짐

      // 폼 초기화
      setName('');
      setRole('회원');
      setContactInfo('');
      setDefaultFee('');
      setError('');
    } catch (err) {
      setError(`회원 추가 실패: ${err.message || '알 수 없는 오류'}`);
      console.error(err);
    }
  };

  return (
    <div className="form-card">
      <h3>그룹에 회원 추가</h3>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <label className="form-label">
          이름
          <input
            type="text"
            placeholder="회원 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field full-width"
            required
          />
        </label>
        <label className="form-label">
          역할
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="select-field full-width"
          >
            <option value="회원">회원</option>
            <option value="총무">총무</option>
            <option value="임원">임원</option>
          </select>
        </label>
        <label className="form-label">
          연락처 (선택 사항)
          <input
            type="text"
            placeholder="연락처 정보"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="input-field full-width"
          />
        </label>
        <label className="form-label">
          기본 회비 (원)
          <input
            type="number"
            placeholder="예: 10000 (선택 사항)"
            value={defaultFee}
            onChange={(e) => setDefaultFee(e.target.value)}
            className="input-field full-width"
            min="0"
          />
        </label>
        <button type="submit" className="submit-button-large">
          회원 추가
        </button>
      </form>
    </div>
  );
}

export default MemberAddForm;