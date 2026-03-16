/**
 * 관리자 페이지
 * 전체 채팅 기록 조회 및 메시지별 Evaluation 결과를 확인한다.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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

export default function AdminPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchAllMessages();
  }, []);

  const fetchAllMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, profiles!chat_messages_user_id_fkey(email, name)')
      .eq('role', 'assistant')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setMessages(data);
    if (error) console.error('메시지 조회 오류:', error);
    setIsLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'score-high';
    if (score >= 6) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>관리자 대시보드</h2>
        <p>전체 대화 기록 및 AI 응답 평가 결과</p>
      </div>

      {isLoading ? (
        <div className="loading">데이터 로딩 중...</div>
      ) : (
        <div className="admin-content">
          {/* 메시지 목록 */}
          <div className="messages-list">
            <h3>AI 응답 목록 ({messages.length}개)</h3>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`admin-message-item ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="message-preview">
                  <span className="message-date">
                    {new Date(msg.created_at).toLocaleString('ko-KR')}
                  </span>
                  <span className="message-user">{msg.profiles?.email || '알 수 없음'}</span>
                </div>

                <div className="message-badges">
                  {msg.agent_used && (
                    <span className="agent-badge">
                      {AGENT_LABELS[msg.agent_used] || msg.agent_used}
                    </span>
                  )}
                  {msg.eval_score && (
                    <span className={`eval-score ${getScoreColor(msg.eval_score)}`}>
                      {msg.eval_score}/10
                    </span>
                  )}
                </div>

                <div className="content-preview">
                  {msg.content.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>

          {/* 선택된 메시지 상세 */}
          {selectedMessage && (
            <div className="message-detail">
              <h3>응답 상세 정보</h3>

              <div className="detail-section">
                <h4>메타데이터</h4>
                <p><strong>일시:</strong> {new Date(selectedMessage.created_at).toLocaleString('ko-KR')}</p>
                <p><strong>사용 에이전트:</strong> {AGENT_LABELS[selectedMessage.agent_used] || selectedMessage.agent_used}</p>

                {selectedMessage.skills_used?.length > 0 && (
                  <p>
                    <strong>사용 스킬:</strong>{' '}
                    {selectedMessage.skills_used.map((s) => SKILL_LABELS[s] || s).join(', ')}
                  </p>
                )}
              </div>

              {selectedMessage.eval_detail && (
                <div className="detail-section">
                  <h4>평가 결과</h4>
                  <div className={`eval-score-big ${getScoreColor(selectedMessage.eval_score)}`}>
                    종합 점수: {selectedMessage.eval_score}/10
                  </div>

                  {typeof selectedMessage.eval_detail === 'object' && (
                    <>
                      <p><strong>완성도:</strong> {selectedMessage.eval_detail.completeness}/10</p>
                      <p><strong>전문성:</strong> {selectedMessage.eval_detail.expertise}/10</p>
                      <p><strong>실행가능성:</strong> {selectedMessage.eval_detail.actionability}/10</p>
                      <p><strong>피드백:</strong> {selectedMessage.eval_detail.feedback}</p>

                      {selectedMessage.eval_detail.improvements?.length > 0 && (
                        <div>
                          <strong>개선 사항:</strong>
                          <ul>
                            {selectedMessage.eval_detail.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="detail-section">
                <h4>응답 내용</h4>
                <div className="response-content">{selectedMessage.content}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
