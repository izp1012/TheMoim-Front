import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // 1. 라이브러리 임포트

// 2. App.js에서 넘겨준 onLoginSuccess prop을 받습니다.
function OAuthCallback({ onLoginSuccess }) { 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // URL 쿼리 파라미터에서 accessToken을 가져옵니다.
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      // 향후 API 요청을 위해 Access Token을 localStorage에 저장합니다.
      localStorage.setItem('accessToken', accessToken);
      
      try {
        // 3. Access Token을 디코딩하여 사용자 정보를 추출합니다.
        const decodedToken = jwtDecode(accessToken);
        
        // ⭐️ 중요: 백엔드에서 JWT를 생성할 때 넣은 사용자 ID의 key 값(claim 이름)을 사용해야 합니다.
        // 보통 'id', 'sub', 'usrId' 등을 사용합니다. 백엔드 코드를 확인해보세요.
        const usrId = decodedToken.id || decodedToken.sub; 

        if (!usrId) {
          throw new Error("JWT에 사용자 ID(id 또는 sub)가 포함되어 있지 않습니다.");
        }

        // 4. App.js의 로그인 성공 처리 함수를 호출합니다!
        onLoginSuccess(usrId);
        
        // 5. 모든 처리가 끝났으므로 메인 페이지로 이동시킵니다.
        // replace: true 옵션으로 뒤로가기 시 콜백 페이지로 돌아오지 않도록 합니다.
        navigate('/', { replace: true });

      } catch (error) {
        console.error("토큰 처리 중 오류 발생:", error);
        alert('로그인 처리에 실패했습니다. 다시 시도해주세요.');
        navigate('/login', { replace: true });
      }
      
    } else {
      // URL에 토큰이 없는 비정상적인 경우
      alert('로그인에 실패했습니다. (인증 정보 없음)');
      navigate('/login', { replace: true });
    }
    // useEffect의 의존성 배열에 함수와 객체를 추가합니다.
  }, [onLoginSuccess, navigate, searchParams]);

  // 로직이 실행되는 동안 사용자에게 보여줄 화면
  return <div>소셜 로그인 처리 중입니다. 잠시만 기다려주세요...</div>;
}

export default OAuthCallback;