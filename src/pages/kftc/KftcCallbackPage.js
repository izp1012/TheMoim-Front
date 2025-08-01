import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchKftcToken, fetchAccountInfoViaBackend, fetchTokenAndAccountInfo, fetchAccountInfoDirect } from '../../utils/kftc';

function KftcCallbackPage() {
  const location = useLocation();
  const [status, setStatus] = useState('처리 중...');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const error = params.get('error');
        const state = params.get('state');
        
        console.log('콜백 파라미터:', { code, error, state });

        if (error) {
          throw new Error(`인증 오류: ${error}`);
        }

        if (!code) {
          throw new Error('인증 코드가 없습니다.');
        }

        const redirect_uri = window.location.origin + '/auth/kftc/callback';
        alert(code);
        // 방법 1: 백엔드를 통한 통합 처리 (권장)
        await processViaBackendIntegrated(code, redirect_uri);
        
        // 방법 2: 백엔드를 통한 단계별 처리
        // await processViaBackendStepByStep(code, redirect_uri);
        
        // 방법 3: 프론트엔드에서 직접 처리 (CORS 이슈 가능)
        // await processDirectly(code, redirect_uri);
        
      } catch (error) {
        console.error('콜백 처리 실패:', error);
        setStatus(`오류 발생: ${error.message}`);
        
        // 부모 창으로 오류 메시지 전송
        if (window.opener) {
          window.opener.postMessage({
            type: 'KFTC_AUTH_ERROR',
            error: error.message
          }, window.location.origin);
        }
        
        // 오류 발생 시 3초 후 창 닫기
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    processCallback();
  }, [location]);

  // 방법 1: 백엔드 통합 처리
  const processViaBackendIntegrated = async (code, redirect_uri) => {
    setStatus('백엔드 통합 처리 중...');
    setProgress(20);
    
    console.log('백엔드 통합 처리 시작:', { code, redirect_uri });
    
    // 토큰 교환과 계좌 정보 조회를 한 번에 처리
    const accountInfo = await fetchTokenAndAccountInfo({ code, redirect_uri });
    
    setProgress(80);
    setStatus('계좌 정보 처리 완료!');
    console.log('통합 처리 성공:', accountInfo);
    
    // 부모 창으로 성공 메시지 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'KFTC_AUTH_SUCCESS',
        accountInfo: accountInfo
      }, window.location.origin);
    }
    
    setProgress(100);
    setStatus('완료! 창을 닫는 중...');
    
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  // 방법 2: 백엔드 단계별 처리
  const processViaBackendStepByStep = async (code, redirect_uri) => {
    setStatus('토큰 교환 중...');
    setProgress(20);
    
    // 1. 토큰 교환
    const tokenResponse = await fetchKftcToken({ code, redirect_uri });
    console.log('토큰 교환 성공:', tokenResponse);
    
    setProgress(50);
    setStatus('계좌 정보 조회 중...');
    
    // // 2. 계좌 정보 조회
    // const accountInfo = await fetchAccountInfoViaBackend({
    //   accessToken: tokenResponse.accessToken,
    //   userSeqNo: tokenResponse.userSeqNo
    // });
    
    setProgress(80);
    setStatus('처리 완료!');
    // console.log('계좌 정보 조회 성공:', accountInfo);
    
    // 부모 창으로 성공 메시지 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'KFTC_AUTH_SUCCESS',
        // accountInfo: accountInfo
      }, window.location.origin);
    }
    
    setProgress(100);
    setStatus('완료! 창을 닫는 중...');
    
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  // 방법 3: 프론트엔드 직접 처리
  const processDirectly = async (code, redirect_uri) => {
    setStatus('토큰 교환 중...');
    setProgress(20);
    
    // 1. 백엔드를 통해 토큰만 교환
    const tokenResponse = await fetchKftcToken({ code, redirect_uri });
    console.log('토큰 교환 성공:', tokenResponse);
    
    setProgress(50);
    setStatus('계좌 정보 조회 중...');
    
    // 2. 프론트엔드에서 직접 금융결재원 API 호출
    const accountInfo = await fetchAccountInfoDirect({
      accessToken: tokenResponse.accessToken,
      userSeqNo: tokenResponse.userSeqNo
    });
    
    setProgress(80);
    setStatus('처리 완료!');
    console.log('계좌 정보 조회 성공:', accountInfo);
    
    // 부모 창으로 성공 메시지 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'KFTC_AUTH_SUCCESS',
        accountInfo: accountInfo
      }, window.location.origin);
    }
    
    setProgress(100);
    setStatus('완료! 창을 닫는 중...');
    
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          {/* 로딩 애니메이션 */}
          <div className="mb-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
          
          {/* 제목 */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            금융결재원 인증 처리
          </h2>
          
          {/* 상태 메시지 */}
          <p className="text-gray-600 mb-6 text-lg">{status}</p>
          
          {/* 진행률 표시 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{progress}% 완료</p>
          
          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <svg className="flex-shrink-0 w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3 text-sm text-blue-700">
                <p className="font-medium">처리 중입니다</p>
                <p>잠시만 기다려 주세요. 인증이 완료되면 자동으로 창이 닫힙니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KftcCallbackPage;