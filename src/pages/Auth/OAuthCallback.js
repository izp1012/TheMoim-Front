import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// (선택) 사용자 로그인 상태 관리를 위한 Recoil, Zustand, Redux 등의 상태 관리 훅
// import { useSetRecoilState } from 'recoil';
// import { userState } from '../../store/atom';

function OAuthCallback() {
  // URL의 쿼리 파라미터를 읽기 위한 훅
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const setUser = useSetRecoilState(userState); // Recoil 예시

  useEffect(() => {
    // URL에서 accessToken과 refreshToken을 추출합니다.
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
      console.log("로그인 성공! Access Token:", accessToken);

      // 1. 토큰을 localStorage에 저장합니다. (가장 일반적인 방식)
      //    보안이 더 중요하다면 httpOnly 쿠키를 사용하는 것이 좋습니다.
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // 2. (선택) 전역 상태(Recoil, Redux 등)에 사용자 로그인 상태를 업데이트합니다.
      //    예: 사용자 정보를 가져오는 API를 호출한 후 상태 업데이트
      // const userData = await getMyInfo(accessToken);
      // setUser(userData);

      // 3. 토큰 저장 후 사용자를 메인 페이지 또는 기존에 접근하려던 페이지로 이동시킵니다.
      alert('로그인에 성공했습니다.');
      navigate('/');
      
    } else {
      // 토큰이 없는 경우, 에러 처리
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행합니다.

  // 로직 처리 중에는 사용자에게 로딩 중임을 알려주는 것이 좋습니다.
  return <div>로그인 처리 중입니다...</div>;
}

export default OAuthCallback;