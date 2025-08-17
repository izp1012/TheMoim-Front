import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

// GroupListPage는 이제 groups 데이터를 props로 받습니다.
function GroupListPage({ groups, onSelectGroup }) {
    const navigate = useNavigate();

    const handleAddGroupClick = () => {
        navigate('/groups/add');
    };

    return (
        <div className="group-list-container">
            <h2>내 모임 목록</h2>
            {groups.length === 0 ? (
                <div className="empty-state-card">
                    <p>아직 생성된 모임이 없습니다.</p>
                    <p>새로운 모임을 시작해보세요! 🎉</p>
                    <button className="submit-button-large" onClick={handleAddGroupClick}>
                        + 새 모임 생성
                    </button>
                </div>
            ) : (
                <ul className="group-list">
                    {groups.map((group) => (
                        <li key={group.id} className="group-list-item" onClick={() => onSelectGroup(group.id)}>
                            <div className="group-info">
                                <span className="group-name">{group.groupName}</span>
                                <span className="group-description">{group.description}</span>
                            </div>
                            <div className="group-actions">
                                {/* 상세 보기 버튼 클릭 시 onSelectGroup 호출 */}
                                <button className="button-primary-small" onClick={(e) => { e.stopPropagation(); onSelectGroup(group.id); }}>
                                    상세 보기
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default GroupListPage;