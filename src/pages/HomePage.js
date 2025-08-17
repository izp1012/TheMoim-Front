import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import { getGroupsByUserId, createGroup } from '../api/moimApp';
import GroupAddForm from '../components/group/GroupAddForm';
import DefaultAccountInfo from '../components/home/DefaultAccountInfo';

function HomePage({ currentUsrId, onSelectGroup }) {
    const navigate = useNavigate();
    const [defaultGroup, setDefaultGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndSetDefaultGroup = async () => {
            try {
                setLoading(true);
                // 현재 사용자가 속한 모든 그룹을 가져옵니다.
                const allGroups = await getGroupsByUserId(currentUsrId);
                
                // 그룹이 하나라도 있으면 첫 번째 그룹을 기본 그룹으로 설정합니다.
                if (allGroups.length > 0) {
                    setDefaultGroup(allGroups[0]);
                } else {
                    setDefaultGroup(null); // 그룹이 없으면 null로 설정
                }
            } catch (err) {
                setError('모임 정보를 불러오는 데 실패했습니다.');
                console.error("Fetch groups error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUsrId) { // 사용자 ID가 있을 때만 요청
            fetchAndSetDefaultGroup();
        } else {
            setLoading(false);
            setError('로그인 정보가 없습니다.');
        }
    }, [currentUsrId]);

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
            navigate(`/groups/${defaultGroup.id}/details`);
        } else {
            navigate('/groups');
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
                    {/* GroupAddForm에 handleCreateGroupSuccessFromHome 함수를 전달 */}
                    <GroupAddForm onCreateGroup={handleCreateGroupSuccessFromHome} onCancel={() => alert('그룹 생성을 취소했습니다.')} />
                </div>
            )}
        </div>
    );
}

export default HomePage;
