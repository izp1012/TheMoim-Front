// src/components/member/MemberAddForm.js
import React, { useState } from 'react';
import '../../App.css'; // App.css에서 스타일링 사용

function MemberAddForm({ onAddMember }) {
  const [memberName, setMemberName] = useState('');
  const [memberType, setMemberType] = useState('회원'); // 기본값 '회원'
  const [contact, setContact] = useState('');
  const [fee, setFee] = useState('20000'); // 기본값 '20000'
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().substring(0, 10)); // 오늘 날짜

  const handleSubmit = (e) => {
    e.preventDefault();
    if (memberName.trim() === '' || contact.trim() === '') {
      alert('회원명과 연락처는 필수 입력입니다.');
      return;
    }
    if (isNaN(parseFloat(fee))) {
      alert('회비는 숫자만 입력 가능합니다.');
      return;
    }

    const newMember = {
      name: memberName,
      type: memberType,
      contact: contact,
      fee: parseFloat(fee),
      enrollmentDate: enrollmentDate,
    };
    onAddMember(newMember);
    // 폼 초기화
    setMemberName('');
    setContact('');
    setFee('20000');
    setEnrollmentDate(new Date().toISOString().substring(0, 10));
  };

  return (
    <div className="member-form-container">
      <div className="form-buttons-top">
        <button className="button-secondary">연락처에서 가져오기</button>
        <button className="button-secondary">도움말</button>
      </div>

      <form onSubmit={handleSubmit} className="member-add-form">
        <label className="form-label">
          회원명
          <input
            type="text"
            placeholder="회원명을 입력해주세요."
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            className="input-field full-width"
            required
          />
        </label>

        <label className="form-label">
          회원구분
          <select
            value={memberType}
            onChange={(e) => setMemberType(e.target.value)}
            className="select-field full-width"
          >
            <option value="회원">회원</option>
            <option value="임원">임원</option>
          </select>
        </label>

        <label className="form-label">
          연락처
          <span className="small-text">(휴대폰 번호를 등록해야만 회원이 모임수정의 내용을 조회할 수 있습니다.)</span>
          <input
            type="text"
            placeholder="연락처를 입력해주세요."
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="input-field full-width"
            required
          />
        </label>

        <label className="form-label">
          회비
          <input
            type="number"
            placeholder="회비"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="input-field full-width"
          />
        </label>

        <label className="form-label">
          입회일
          <input
            type="date"
            value={enrollmentDate}
            onChange={(e) => setEnrollmentDate(e.target.value)}
            className="input-field full-width"
          />
        </label>

        <button type="submit" className="submit-button-large">
          등록
        </button>
      </form>
    </div>
  );
}

export default MemberAddForm;