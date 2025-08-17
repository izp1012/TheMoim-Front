import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../App.css';
import { getGroupDetails, getGroupMembers, addMemberToGroup } from '../../api/moimApp';
import MemberAddForm from '../member/MemberAddForm';
import MemberListPage from '../member/MemberListPage';

function GroupDetailsPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('membersList');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const groupData = await getGroupDetails(groupId);
                setGroup(groupData);

                // 백엔드 API와 일치하는 getGroupMembers 함수를 사용합니다.
                const membersData = await getGroupMembers(groupId);
                setMembers(membersData);

            } catch (err) {
                setError('그룹 정보를 불러오는 데 실패했습니다.');
                console.error("Fetch group details error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (groupId) { // groupId가 유효할 때만 fetch
            fetchData();
        }
    }, [groupId]); // groupId가 변경될 때마다 다시 불러옴

    const handleAddMemberToGroup = async (memberData) => {
        try {
            // 백엔드 API와 일치하는 addMemberToGroup 함수를 사용합니다.
            const newGroupMember = await addMemberToGroup(groupId, memberData);
            setMembers([...members, newGroupMember]);
            alert(`${newGroupMember.name || memberData.name} 회원이 그룹에 추가되었습니다!`);
            setActiveSubTab('membersList');
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
                <button onClick={() => navigate('/groups')} className="back-button">← 그룹 목록</button>
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

                <div className="quick-links">
                    <h3>모임비 관리 바로가기</h3>
                    {/* 라우트로 직접 이동하도록 변경 */}
                    <button className="button-primary-small" onClick={() => navigate(`/groups/${groupId}/payments/add`)}>금액 추가</button>
                    <button className="button-primary-small" onClick={() => navigate(`/groups/${groupId}/payments/settlement`)}>비용 정산</button>
                    <button className="button-primary-small" onClick={() => navigate(`/groups/${groupId}/payments/receipts`)}>영수증 처리</button>
                </div>
            </div>
        </div>
    );
}

export default GroupDetailsPage;
