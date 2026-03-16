/**
 * 앱 루트 컴포넌트
 * 인증 상태에 따라 로그인 페이지 또는 채팅/관리자 페이지를 렌더링한다.
 */

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('chat');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setIsAdmin(false); setIsLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    setIsAdmin(data?.role === 'admin');
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return <div className="loading-screen">로딩 중...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      {isAdmin && (
        <nav className="admin-nav">
          <button
            className={currentPage === 'chat' ? 'active' : ''}
            onClick={() => setCurrentPage('chat')}
          >
            채팅
          </button>
          <button
            className={currentPage === 'admin' ? 'active' : ''}
            onClick={() => setCurrentPage('admin')}
          >
            관리자
          </button>
          <button onClick={handleSignOut} className="signout-btn">
            로그아웃
          </button>
        </nav>
      )}

      {!isAdmin && (
        <div className="user-nav">
          <button onClick={handleSignOut} className="signout-btn">
            로그아웃
          </button>
        </div>
      )}

      {currentPage === 'chat' ? (
        <ChatPage user={user} />
      ) : (
        <AdminPage />
      )}
    </div>
  );
}

export default App;
