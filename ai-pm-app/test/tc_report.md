# AI PM 앱 테스트 케이스 리포트

**테스트 일시:** 2026-03-16
**테스트 환경:** 로컬 (http://localhost:5173)

---

## TC-1. 에이전트 라우팅 (agentClient.js)

| TC | 입력 키워드 | 예상 에이전트 | 결과 |
|----|------------|-------------|------|
| TC-1-1 | "시장 분석해줘" | strategy | ✅ |
| TC-1-2 | "경쟁사 분석" | strategy | ✅ |
| TC-1-3 | "OKR 설정" | strategy | ✅ |
| TC-1-4 | "아이디어 검증" | discovery | ✅ |
| TC-1-5 | "PRD 작성" | discovery | ✅ |
| TC-1-6 | "JTBD 분석" | discovery | ✅ |
| TC-1-7 | "유저스토리 작성" | execution | ✅ |
| TC-1-8 | "우선순위 RICE" | execution | ✅ |
| TC-1-9 | "사용성 테스트 계획" | execution | ✅ |
| TC-1-10 | (키워드 없음) | strategy (기본값) | ✅ |

---

## TC-2. 스킬 매핑 (agentClient.js)

| TC | 에이전트 | 입력 | 예상 스킬 | 결과 |
|----|---------|------|----------|------|
| TC-2-1 | strategy | "제품 전략 수립" | product-strategy | ✅ |
| TC-2-2 | strategy | "OKR 목표 설정" | okr-analysis | ✅ |
| TC-2-3 | discovery | "아이디어 가설 검증" | idea-diagnosis | ✅ |
| TC-2-4 | discovery | "JTBD 고객 문제" | jtbd-framework | ✅ |
| TC-2-5 | discovery | "PRD 요구사항" | prd-writing | ✅ |
| TC-2-6 | execution | "유저스토리 AC" | user-story-writing | ✅ |
| TC-2-7 | execution | "인터뷰 설계" | user-interview | ✅ |
| TC-2-8 | execution | "UT 사용성 테스트" | ut-planning | ✅ |
| TC-2-9 | execution | "우선순위 RICE ICE" | priority-validation | ✅ |

---

## TC-3. Supabase 연동

| TC | 항목 | 예상 결과 | 결과 |
|----|------|----------|------|
| TC-3-1 | supabaseClient.js 환경변수 로드 | URL/KEY 정상 로드 | ✅ |
| TC-3-2 | profiles 테이블 존재 확인 | 테이블 존재 | ✅ |
| TC-3-3 | chat_sessions 테이블 존재 확인 | 테이블 존재 | ✅ |
| TC-3-4 | chat_messages 테이블 존재 확인 | 테이블 존재 | ✅ |
| TC-3-5 | knowledge_base 테이블 존재 확인 | 테이블 존재 | ✅ |

---

## TC-4. 빌드 검증

| TC | 항목 | 결과 |
|----|------|------|
| TC-4-1 | `npm run build` 오류 없음 | ✅ |
| TC-4-2 | `npm run dev` 서버 정상 기동 (port 5173) | ✅ |
| TC-4-3 | react-markdown import 정상 | ✅ |
| TC-4-4 | @google/genai import 정상 | ✅ |
| TC-4-5 | @supabase/supabase-js import 정상 | ✅ |

---

## TC-5. UI 구조 검증

| TC | 항목 | 예상 결과 | 결과 |
|----|------|----------|------|
| TC-5-1 | 미인증 상태 → LoginPage 렌더링 | LoginPage 표시 | ✅ (코드 확인) |
| TC-5-2 | 인증 후 → ChatPage 렌더링 | ChatPage 표시 | 사용자 검증 필요 |
| TC-5-3 | profiles.role='admin' → 관리자 탭 표시 | 관리자 nav 표시 | 사용자 검증 필요 |
| TC-5-4 | Enter 키 전송 | 메시지 전송 | 사용자 검증 필요 |
| TC-5-5 | Shift+Enter 줄바꿈 | 줄바꿈 동작 | 사용자 검증 필요 |
| TC-5-6 | 복사 버튼 | 클립보드 복사 | 사용자 검증 필요 |
| TC-5-7 | AI 응답 마크다운 렌더링 | 마크다운 정상 표시 | 사용자 검증 필요 |
| TC-5-8 | 에이전트/스킬/평가 뱃지 표시 | 뱃지 정상 표시 | 사용자 검증 필요 |

---

## 코드 레벨 자동 검증 결과

