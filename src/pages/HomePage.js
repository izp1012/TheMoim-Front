import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { getGroupsByUserId, createGroup } from '../api/moimApp';
import GroupAddForm from '../components/group/GroupAddForm';
import DefaultAccountInfo from '../components/home/DefaultAccountInfo';

function HomePage({ currentUsrId, onSelectGroup }) {
    const navigate = useNavigate();
    // groups 상태를 추가하여 모든 그룹을 관리합니다.
    const [groups, setGroups] = useState([]);
    const [defaultGroupId, setDefaultGroupId] = useState(null); // 기본 그룹 ID만 저장
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 컴포넌트 마운트 시 전체 그룹 목록을 가져옵니다.
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoading(true);
                if (currentUsrId) {
                    const allGroups = await getGroupsByUserId(currentUsrId);
                    setGroups(allGroups);
                    
                    // 첫 번째 그룹을 기본 그룹으로 설정 (또는 서버에서 가져오는 로직 구현)
                    if (allGroups.length > 0) {
                        setDefaultGroupId(allGroups[0].id);
                    }
                }
            } catch (err) {
                setError('모임 정보를 불러오는 데 실패했습니다.');
                console.error("Fetch groups error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [currentUsrId]);

    const handleCreateGroupSuccessFromHome = async (groupData) => {
        try {
            const newGroup = await createGroup({ ...groupData, createdByUsrId: currentUsrId });
            alert(`그룹 '${newGroup.groupName}'이(가) 성공적으로 생성되었습니다!`);
            // 새로운 그룹을 목록에 추가
            setGroups([...groups, newGroup]);
            setDefaultGroupId(newGroup.id);
            navigate(`/groups/${newGroup.id}/details`);
        } catch (err) {
            alert(`그룹 생성 실패: ${err.message || '알 수 없는 오류'}`);
            console.error("홈에서 그룹 생성 중 오류 발생:", err);
        }
    };
    
    // 기본 그룹 설정 함수
    const handleSetDefaultGroup = (groupId) => {
        setDefaultGroupId(groupId);
        alert('기본 그룹이 변경되었습니다.');
    };

    if (loading) return <div className="loading-message">홈 화면 로딩 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const defaultGroup = groups.find(group => group.id === defaultGroupId);

    return (
        <div className="home-page-container">
            <h2>내 모임</h2>
            {/* 기본 그룹 정보 표시 */}
            {defaultGroup && (
                <div className="default-group-info">
                    <p className="font-bold text-lg">{defaultGroup.groupName}</p>
                    <p className="text-gray-600">{defaultGroup.description}</p>
                    <button className="submit-button-large manage-group-button mt-4" onClick={() => onSelectGroup(defaultGroup.id)}>
                        그룹 관리하기
                    </button>
                </div>
            )}
            
            <h3 className="mt-8 mb-4 font-bold">전체 모임 목록</h3>
            {groups.length === 0 ? (
                <div className="empty-state-card">
                    <p>아직 연결된 모임이 없습니다.</p>
                    <p>새로운 모임을 만들고 시작해보세요!</p>
                    <GroupAddForm onCreateGroup={handleCreateGroupSuccessFromHome} onCancel={() => {}} />
                </div>
            ) : (
                <ul className="group-list">
                    {groups.map(group => (
                        <li key={group.id} className="group-list-item flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 mb-2 bg-white rounded-lg shadow-sm">
                            <div className="group-info">
                                <span className="group-name font-semibold">{group.groupName}</span>
                                <p className="group-description text-gray-500 text-sm mt-1">{group.description}</p>
                            </div>
                            <div className="group-actions flex-shrink-0 mt-3 sm:mt-0">
                                {defaultGroupId !== group.id && (
                                    <button 
                                        className="button-tertiary-small mr-2" 
                                        onClick={() => handleSetDefaultGroup(group.id)}
                                    >
                                        기본 그룹으로 설정
                                    </button>
                                )}
                                <button 
                                    className="button-primary-small" 
                                    onClick={() => onSelectGroup(group.id)}
                                >
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

export default HomePage;
