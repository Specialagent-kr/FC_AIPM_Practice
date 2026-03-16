/**
 * 로그인 페이지
 * Google OAuth를 통한 로그인을 제공한다.
 */

import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error('로그인 오류:', error);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>AI PM 어시스턴트</h1>
        <p>PM 업무를 지원하는 전문 AI 어시스턴트입니다.</p>
        <button onClick={handleGoogleLogin} className="google-login-btn">
          Google로 로그인
        </button>
      </div>
    </div>
  );
}
