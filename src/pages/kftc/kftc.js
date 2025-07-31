// src/api/kftc.js

/**
 * 금융결제원 토큰 발급 API 호출
 * @param {Object} params
 * @param {string} params.code - 금융결제원에서 받은 인가코드
 * @param {string} params.redirect_uri - 인증에 사용한 redirect_uri
 * @returns {Promise<Object>} - 토큰 응답(JSON)
 */
export async function fetchKftcToken({ code, redirect_uri }) {
    const response = await fetch('http://localhost:8080/api/kftc/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 필요시 Authorization 헤더 추가
      },
      body: JSON.stringify({ code, redirect_uri }),
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '금융결제원 토큰 발급 실패');
    }
    return response.json();
  }