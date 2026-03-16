/**
 * 채팅 페이지
 * AI PM과 실시간 채팅 인터페이스를 제공한다.
 * 왼쪽 패널에서 채팅 히스토리를 확인하고 전환할 수 있다.
 *
 * 세션 생성 전략:
 * - 세션은 첫 메시지 전송 시점에만 DB에 INSERT한다.
 * - 그 전까지는 sessionId = null (임시 상태).
 * - 이렇게 하면 빈 세션이 목록에 노출되지 않는다.
 */

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { orchestrate } from '../agents/agentClient';
import { supabase } from '../lib/supabaseClient';
import { extractFileText, SUPPORTED_EXTENSIONS, MAX_FILE_SIZE_MB } from '../lib/fileExtractor';

const AGENT_LABELS = {
  strategy: '전략',
  discovery: '디스커버리',
  execution: '실행',
};

const SKILL_LABELS = {
  'product-strategy': '제품 전략',
  'okr-analysis': 'OKR 분석',
  'user-interview': '유저 인터뷰',
  'idea-diagnosis': '아이디어 진단',
  'jtbd-framework': 'JTBD',
  'prd-writing': 'PRD 작성',
  'priority-validation': '우선순위',
  'user-story-writing': '유저스토리',
  'ut-planning': 'UT 계획',
};

export default function ChatPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState(''); // 스트리밍 중인 텍스트
  // null = 아직 세션 미생성 (새 대화 상태)
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileError, setFileError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 사용자 이름 (이메일 @ 앞)
  const userName = user.email?.split('@')[0] ?? '사용자';

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── 세션 목록: 메시지가 있는 세션만 로드 ──
  const loadSessions = async () => {
    const { data } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, chat_messages(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      const nonEmpty = data.filter((s) => (s.chat_messages?.[0]?.count ?? 0) > 0);
      setSessions(nonEmpty);
    }
    // 초기 상태는 sessionId=null, messages=[] — 별도 DB INSERT 없음
  };

  // ── 새 대화 버튼: 상태 초기화만, DB INSERT 없음 ──
  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setInput('');
    setAttachedFile(null);
    setFileError('');
    setStreamingText('');
  };

  // ── 기존 세션 불러오기 ──
  const loadSession = async (sid) => {
    setSessionId(sid);
    const { data } = await supabase
      .from('chat_messages')
      .select('role, content, agent_used, skills_used, eval_score, eval_detail')
      .eq('session_id', sid)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(
        data.map((m) => ({
          role: m.role,
          content: m.content,
          agentUsed: m.agent_used,
          skillsUsed: m.skills_used,
          evalScore: m.eval_score,
          evalDetail: m.eval_detail,
        }))
      );
    }
  };

  // ── 파일 첨부 ──
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하여야 합니다.`);
      e.target.value = '';
      return;
    }

    setIsExtracting(true);
    try {
      const text = await extractFileText(file);
      setAttachedFile({ name: file.name, text });
    } catch (err) {
      setFileError(err.message);
    } finally {
      setIsExtracting(false);
      e.target.value = '';
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    setFileError('');
  };

  // ── 메시지 전송 ──
  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const userMessage = attachedFile
      ? `${input.trim() ? input.trim() + '\n\n' : ''}[첨부 문서: ${attachedFile.name}]\n\`\`\`\n${attachedFile.text.slice(0, 8000)}\n\`\`\``
      : input.trim();

    const displayMessage = input.trim() || `(${attachedFile?.name} 파일 첨부)`;

    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: displayMessage }]);
    setStreamingText(''); // 스트리밍 초기화

    try {
      // 스트리밍 콜백: 누적 텍스트를 실시간으로 화면에 표시
      const result = await orchestrate(userMessage, messages, (accumulated) => {
        setStreamingText(accumulated);
      });

      // 스트리밍 완료 → 정식 메시지로 교체
      setStreamingText('');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          agentUsed: result.agentUsed,
          skillsUsed: result.skillsUsed,
          evalScore: result.evalScore,
          evalDetail: result.evalDetail,
        },
      ]);

      // 세션이 없으면 첫 메시지 전송 시점에 생성
      let activeSid = sessionId;
      if (!activeSid) {
        const title =
          displayMessage.length > 20
            ? displayMessage.slice(0, 20) + '...'
            : displayMessage;
        const { data } = await supabase
          .from('chat_sessions')
          .insert({ user_id: user.id, title })
          .select()
          .single();

        if (data) {
          activeSid = data.id;
          setSessionId(data.id);
          setSessions((prev) => [data, ...prev]);
        }
      }

      if (activeSid) {
        await supabase.from('chat_messages').insert([
          { session_id: activeSid, user_id: user.id, role: 'user', content: displayMessage },
          {
            session_id: activeSid,
            user_id: user.id,
            role: 'assistant',
            content: result.response,
            agent_used: result.agentUsed,
            skills_used: result.skillsUsed,
            eval_score: result.evalScore,
            eval_detail: result.evalDetail,
          },
        ]);
      }
    } catch (error) {
      console.error('오케스트레이터 오류:', error);
      setStreamingText('');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      ]);
    } finally {
      setStreamingText('');
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chat-layout">
      {/* 왼쪽 히스토리 패널 */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">대화 목록</span>
          <button className="new-chat-btn" onClick={handleNewChat} title="새 대화">+</button>
        </div>
        <div className="session-list">
          {sessions.map((s) => (
            <button
              key={s.id}
              className={`session-item ${s.id === sessionId ? 'active' : ''}`}
              onClick={() => loadSession(s.id)}
            >
              <span className="session-title">{s.title}</span>
              <span className="session-date">{formatDate(s.created_at)}</span>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="no-sessions">대화 내역이 없습니다.</p>
          )}
        </div>
      </aside>

      {/* 채팅 본문 */}
      <div className="chat-container">
        <div className="chat-header">
          <h2>AI PM 어시스턴트</h2>
          <span className="user-email">{user.email}</span>
        </div>

        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p className="welcome-greeting">안녕하세요, {userName}님!</p>
              <p className="welcome-sub">AI PM 어시스턴트입니다. 무엇을 도와드릴까요?</p>
              <p className="welcome-hint">전략 · 디스커버리 · 실행 관련 질문을 자유롭게 해보세요.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.role === 'assistant'
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  : msg.content}
              </div>

              {msg.role === 'assistant' && msg.agentUsed && (
                <div className="message-meta">
                  <span className="agent-badge">
                    {AGENT_LABELS[msg.agentUsed] || msg.agentUsed} 에이전트
                  </span>
                  {msg.skillsUsed?.map((skill) => (
                    <span key={skill} className="skill-badge">
                      {SKILL_LABELS[skill] || skill}
                    </span>
                  ))}
                  {msg.evalScore && (
                    <span className="eval-badge">평가: {msg.evalScore}/10</span>
                  )}
                  <button className="copy-btn" onClick={() => copyToClipboard(msg.content)}>
                    복사
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* 스트리밍 중인 응답 실시간 표시 */}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content streaming">
                {streamingText
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText}</ReactMarkdown>
                  : <div className="loading-indicator">AI PM이 답변을 준비 중입니다...</div>
                }
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          {(attachedFile || fileError || isExtracting) && (
            <div className="file-attachment-area">
              {isExtracting && <span className="file-extracting">파일 분석 중...</span>}
              {fileError && <span className="file-error">{fileError}</span>}
              {attachedFile && !isExtracting && (
                <span className="file-chip">
                  📄 {attachedFile.name}
                  <button className="file-remove-btn" onClick={removeAttachedFile}>✕</button>
                </span>
              )}
            </div>
          )}

          <div className="input-row">
            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_EXTENSIONS}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isExtracting}
              title="PDF, DOCX, TXT, MD 파일 첨부"
            >
              📎
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="PM 관련 질문을 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
              rows={3}
            />
            <button onClick={handleSend} disabled={isLoading || (!input.trim() && !attachedFile)}>
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
