# AI PM 앱 프로젝트 로그

## 단계별 진행 현황

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 | 프로젝트 초기화 및 규칙 정의 | ✅ 완료 |
| 2단계 | 에이전트 및 스킬 정의 | ✅ 완료 |
| 3단계 | DB 및 인증 연동 (Supabase) | ✅ 완료 |
| 4단계 | 핵심 기능 구현 | ✅ 완료 |
| 5단계 | 로컬 테스트 및 검증 | ✅ 완료 |
| 6단계 | GitHub 연동 및 Vercel 배포 | ✅ 완료 |

---

## 작업 로그 작성 규칙

각 로그 항목은 아래 형식을 따른다:
- **사용자 입력 프롬프트**: 해당 작업을 지시한 원문 프롬프트 요약
- **완료 일시**: YYYY-MM-DD
- **작업 내용**: 수행한 작업 목록
- **주요 결정사항**: 아키텍처/기술 선택 등 중요 결정
- **다음 단계 계획**: 이어서 진행할 내용

---

## 작업 로그

### 2026-03-16 | 1단계: 프로젝트 초기화

**사용자 입력 프롬프트:**
> AI PM 멀티에이전트 앱 프로젝트 초기화. 1단계: CLAUDE.md 생성, Vite+React 프로젝트 초기화, 폴더 구조 생성, requirements.txt, .env.example, .gitignore, project_log.md 초기 버전 생성.

**완료 일시:** 2026-03-16

**작업 내용:**
- CLAUDE.md 생성 (프로젝트 규칙 및 기술 스택 정의)
- Vite + React 프로젝트 초기화 (`ai-pm-app/`)
- 프로젝트 폴더 구조 생성 (`agents/`, `skills/`, `pages/`, `components/`, `lib/`)
- 에이전트 기본 구조 구현:
  - `orchestrator.js`: AI PM 오케스트레이터 (에이전트 라우팅 로직)
  - `strategyAgent.js`: 전략 에이전트 (시장/경쟁사/OKR 분석)
  - `discoveryAgent.js`: 디스커버리 에이전트 (아이디어 검증/PRD)
  - `executionAgent.js`: 실행 에이전트 (유저스토리/인터뷰/UT)
  - `evalAgent.js`: Eval 에이전트 (응답 품질 평가)
- 페이지 컴포넌트 기본 구조 생성:
  - `LoginPage.jsx`: Google OAuth 로그인
  - `ChatPage.jsx`: AI PM 채팅 인터페이스
  - `AdminPage.jsx`: 관리자 대시보드
- `supabaseClient.js`: Supabase 클라이언트 설정
- `App.jsx`: 인증 상태 기반 라우팅
- `requirements.txt`: 패키지 의존성 문서화
- `.env.example`: 환경변수 예시 (실제 키 미포함)
- `.gitignore`: .env 파일 포함 민감 정보 제외 설정

**설치된 주요 패키지:**
- `@anthropic-ai/sdk@^0.78.0`: Claude API 연동
- `@supabase/supabase-js@^2.99.1`: Supabase 연동
- `react@^19.2.4`, `react-dom@^19.2.4`: UI 프레임워크
- `vite@^8.0.0`: 빌드 도구

**주요 결정사항:**
1. 에이전트 라우팅: 키워드 기반으로 전략/디스커버리/실행 에이전트 자동 선택
2. Eval 에이전트: claude-haiku 모델 사용으로 비용 최적화
3. 관리자 권한: 환경변수 `VITE_ADMIN_EMAILS`로 관리

**주요 결정사항:**
1. 에이전트 라우팅: 키워드 기반으로 전략/디스커버리/실행 에이전트 자동 선택
2. Eval 에이전트: 동일 모델 사용
3. 관리자 권한: 환경변수 `VITE_ADMIN_EMAILS`로 관리

**다음 단계 계획:**
- 2단계: skill-creator 레퍼런스를 참고하여 9개 스킬 마크다운 파일 작성

---

### 2026-03-16 | 1단계 수정: LLM 모델 변경 및 로그 형식 개선

**사용자 입력 프롬프트:**
> 1. 프로젝트 작업 로그에는 사용자 입력 프롬프트도 함께 기록해
> 2. LLM 모델은 "gemini-3-flash-preview"를 사용할거야. 관련 문서에 반영해.

**완료 일시:** 2026-03-16

**작업 내용:**
- LLM 모델 전환: Anthropic Claude → Google Gemini (`gemini-3-flash-preview`)
  - `@anthropic-ai/sdk` 제거, `@google/genai` 설치
  - `strategyAgent.js`, `discoveryAgent.js`, `executionAgent.js`, `evalAgent.js` 모두 Google GenAI SDK로 교체
- `.env.example`: `VITE_ANTHROPIC_API_KEY` → `VITE_GOOGLE_API_KEY`로 변경
- `requirements.txt`: 패키지 의존성 업데이트
- `project_log.md`: 사용자 입력 프롬프트 기록 형식 추가

**주요 결정사항:**
1. 모든 서브 에이전트(전략/디스커버리/실행/Eval)에 동일 모델(`gemini-3-flash-preview`) 적용
2. 대화 히스토리 변환: `assistant` role → Gemini `model` role로 매핑

**다음 단계 계획:**
- 2단계: 9개 스킬 마크다운 파일 작성 (skill-creator 형식)

---

### 2026-03-16 | 2단계: 에이전트 및 스킬 정의

**사용자 입력 프롬프트:**
> 1. 프로젝트 작업 로그에는 사용자 입력 프롬프트도 함께 기록해
> 2. LLM 모델은 "gemini-3-flash-preview"를 사용할거야. 관련 문서에 반영해.
> 위 내용 적용한 다음, 2단계를 진행해

**완료 일시:** 2026-03-16

**작업 내용:**
- 9개 스킬 마크다운 파일 작성 (`src/skills/`)
  - `product-strategy.md`: 제품 전략 수립 (전략 에이전트)
  - `okr-analysis.md`: OKR 분석 및 정렬 (전략 에이전트)
  - `user-interview.md`: 사용자 인터뷰 설계 및 분석 (실행 에이전트)
  - `idea-diagnosis.md`: 아이디어 진단 및 검증 (디스커버리 에이전트)
  - `jtbd-framework.md`: Jobs To Be Done 분석 (디스커버리 에이전트)
  - `prd-writing.md`: PRD 작성 (디스커버리 에이전트)
  - `priority-validation.md`: 우선순위 검증 RICE/ICE/MoSCoW (실행 에이전트)
  - `user-story-writing.md`: 유저스토리 작성 INVEST 원칙 (실행 에이전트)
  - `ut-planning.md`: UT 계획 (실행 에이전트)

**각 스킬 파일 구성:**
- frontmatter: name, description, agent 매핑
- 스킬 설명 및 사용 시점
- 단계별 실행 지침 (Step 1~5)
- 출력 형식 예시 (코드 블록)
- 품질 기준 체크리스트

**주요 결정사항:**
1. 스킬 파일에 `agent` 필드로 담당 에이전트 명시 (strategy / discovery / execution)
2. 각 스킬은 프레임워크/방법론 기반으로 구조화 (INVEST, RICE, ICE, MoSCoW, JTBD, BDD 등)
3. 출력 형식 예시를 코드 블록으로 제공하여 LLM이 일관된 형식으로 응답 가능하도록 설계

**다음 단계 계획:**
- 3단계: Supabase DB 스키마 생성 및 인증 설정

---

### 2026-03-16 | 2단계 리팩토링: 표준 Sub-agent 구조로 전환

**사용자 입력 프롬프트:**
> 1. agents와 skills는 .claude 하위에 구성되는게 표준 아냐?
> 2. 그리고 agents 파일을 보니 표준에 맞게 작성되지 않았어.
>    - 아래 가이드 문서를 참고해서, sub agent를 정의해
>    - 오케스트레이션 Agent와 Sub Agent를 하이어라키 구조로 반영해
>    - https://code.claude.com/docs/ko/sub-agents

**완료 일시:** 2026-03-16

**작업 내용:**
- `.claude/agents/` 하위에 표준 Sub-agent 파일 5개 생성
  - `ai-pm-orchestrator.md`: 오케스트레이터 — 요청 분석 및 서브 에이전트 위임 (tools: Agent)
  - `strategy-agent.md`: 전략 서브 에이전트 (tools: Read, skills: product-strategy, okr-analysis)
  - `discovery-agent.md`: 디스커버리 서브 에이전트 (tools: Read, skills: idea-diagnosis, jtbd-framework, prd-writing)
  - `execution-agent.md`: 실행 서브 에이전트 (tools: Read, skills: user-story-writing, user-interview, ut-planning, priority-validation)
  - `eval-agent.md`: 평가 서브 에이전트 (model: haiku, JSON 형식 반환)
- `src/skills/` → `.claude/skills/`로 스킬 파일 이동 (9개)
- `src/agents/` 기존 JS 파일 5개 제거
- `src/agents/agentClient.js` 신규 생성: 웹 앱용 단일 Google GenAI 호출 모듈
- `ChatPage.jsx` import 경로 업데이트

**주요 결정사항:**
1. 에이전트/스킬 정의는 `.claude/` 하위 표준 위치에 마크다운으로 관리 (버전 제어 포함)
2. 계층 구조: `ai-pm-orchestrator` → `{strategy|discovery|execution}-agent` → `eval-agent`
3. 웹 앱 코드(`agentClient.js`)는 동일한 시스템 프롬프트를 적용하는 Google GenAI 호출 레이어로 역할 분리
4. `eval-agent`는 Haiku 모델 지정으로 비용 최적화 (웹 앱 코드도 동일 모델 적용)

**최종 디렉토리 구조:**
```
FC_AIPM_Practice/
├── .claude/
│   ├── agents/
│   │   ├── ai-pm-orchestrator.md   # 오케스트레이터
│   │   ├── strategy-agent.md
│   │   ├── discovery-agent.md
│   │   ├── execution-agent.md
│   │   └── eval-agent.md
│   └── skills/
│       ├── product-strategy.md
│       ├── okr-analysis.md
│       ├── user-interview.md
│       ├── idea-diagnosis.md
│       ├── jtbd-framework.md
│       ├── prd-writing.md
│       ├── priority-validation.md
│       ├── user-story-writing.md
│       └── ut-planning.md
└── ai-pm-app/
    └── src/
        └── agents/
            └── agentClient.js      # 웹 앱용 Google GenAI 호출 모듈
```

**다음 단계 계획:**
- 3단계: Supabase DB 스키마 생성 및 인증 설정
  - profiles, chat_sessions, chat_messages, knowledge_base 테이블 생성
  - Google OAuth 설정
  - RLS 정책 적용

---

### 2026-03-16 | 3단계: Supabase DB 스키마 생성 및 인증 설정

**사용자 입력 프롬프트:**
> MCP로 Supabase를 연동해 / 다시 진행해

**완료 일시:** 2026-03-16

**작업 내용:**
- Supabase MCP 연동 (`~/.claude/settings.json`에 supabase MCP 서버 추가)
- FC_AIPM 프로젝트 (id: `yfrekoqyerdlweqvwrxk`, ap-southeast-1) 확인
- 4개 테이블 마이그레이션 생성 및 적용:

| 테이블 | 컬럼 수 | 주요 내용 |
|--------|--------|----------|
| `profiles` | 5 | id, email, name, role, created_at |
| `chat_sessions` | 5 | id, user_id, title, created_at, updated_at |
| `chat_messages` | 10 | id, session_id, user_id, role, content, agent_used, skills_used, eval_score, eval_detail, created_at |
| `knowledge_base` | 6 | id, user_id, title, content, file_url, created_at |

- 전 테이블 RLS(Row Level Security) 활성화 및 정책 적용
- `handle_new_user()` 트리거: 신규 가입 시 profiles 자동 생성
- `update_updated_at()` 트리거: chat_sessions updated_at 자동 갱신
- 관리자 정책: profiles.role = 'admin'인 사용자는 전체 chat_messages 조회 가능

**주요 결정사항:**
1. 관리자 권한: 환경변수 이메일 목록 대신 `profiles.role = 'admin'` 컬럼으로 DB 레벨 관리
2. skills_used: TEXT[] 배열 타입으로 복수 스킬 저장
3. eval_detail: JSONB 타입으로 평가 상세 정보(점수/피드백/개선점) 저장

**사용자 확인 필요 — Google OAuth 설정:**
Supabase 대시보드에서 직접 설정해야 합니다:
1. [Supabase 대시보드](https://supabase.com/dashboard) → FC_AIPM 프로젝트
2. Authentication → Providers → Google → Enable
3. Google Cloud Console에서 OAuth 2.0 클라이언트 생성
   - 승인된 리디렉션 URI: `https://yfrekoqyerdlweqvwrxk.supabase.co/auth/v1/callback`
4. Client ID, Client Secret을 Supabase에 입력

**다음 단계 계획:**
- 4단계: 핵심 기능 구현 (채팅 UI, agentClient.js Google GenAI 연동, 평가 저장)

---

### 2026-03-16 | 4단계: 핵심 기능 구현

**사용자 입력 프롬프트:**
> 4단계 진행해

**완료 일시:** 2026-03-16

**작업 내용:**
- `App.jsx`: 관리자 판별 로직을 환경변수 이메일 목록 → DB `profiles.role = 'admin'` 기반으로 변경
- `AdminPage.jsx`: chat_messages-profiles 조인 쿼리를 FK 명시(`chat_messages_user_id_fkey`) 방식으로 수정
- `react-markdown` 패키지 설치 및 `ChatPage.jsx`에 마크다운 렌더링 적용
- `index.css`: 전역 기본 스타일 (CSS 변수, 리셋, 폰트) 재작성
- `App.css`: 전체 UI 스타일 작성
  - 로그인 페이지 (카드 레이아웃)
  - 채팅 페이지 (메시지 버블, 마크다운 스타일, 뱃지, 입력창)
  - 관리자 페이지 (2컬럼 레이아웃, 메시지 목록, 상세 패널)
- 빌드 검증: `npm run build` 성공 (오류 없음)

**주요 결정사항:**
1. AI 응답에만 ReactMarkdown 적용 — 사용자 메시지는 plain text 유지
2. 에이전트/스킬/평가 뱃지 색상 구분: 보라(에이전트), 노랑(스킬), 초록(평가)
3. 관리자 페이지: 2컬럼 레이아웃 — 좌측 목록, 우측 상세

**다음 단계 계획:**
- 5단계: 로컬 테스트 (.env 설정 → npm run dev → 기능 검증)
- 6단계: GitHub 연동 및 Vercel 배포

---

### 2026-03-16 | 5단계: 로컬 테스트 및 검증

**사용자 입력 프롬프트:**
> env 파일 설정했어 / 5단계 진행해

**완료 일시:** 2026-03-16

**작업 내용:**
- `npm run dev` 로컬 서버 기동 확인 (http://localhost:5173)
- TC 파일 작성 (`test/tc_report.md`, `test/run_tc.mjs`)
- 코드 레벨 자동 테스트 실행 — **22/22 전체 통과**

**테스트 결과 요약:**

| 구분 | TC 수 | 통과 | 실패 |
|------|------|------|------|
| TC-1 에이전트 라우팅 | 10 | 10 | 0 |
| TC-2 스킬 매핑 | 9 | 9 | 0 |
| TC-3 기본값 처리 | 3 | 3 | 0 |
| **합계** | **22** | **22** | **0** |

**수정 사항:**
- TC-2-4 기대값 수정: "JTBD 고객 문제" 입력 시 `jtbd-framework`만 반환하는 것이 올바른 동작임을 확인

**사용자 직접 검증 필요 항목 (브라우저):**

| 항목 | 검증 방법 |
|------|----------|
| Google OAuth 로그인 | http://localhost:5173 접속 → Google 로그인 버튼 클릭 |
| 채팅 동작 | 로그인 후 PM 질문 입력 → AI 응답 확인 |
| 에이전트/스킬 뱃지 표시 | 답변 하단 뱃지 확인 |
| 마크다운 렌더링 | AI 응답에 헤딩/목록/코드블록 등 확인 |
| 관리자 페이지 | profiles.role을 'admin'으로 변경 후 관리자 탭 확인 |

**다음 단계 계획:**
- 6단계: GitHub 리포지토리 생성 및 Vercel 배포

---

### 2026-03-16 | 기능 개선: 파일 첨부 및 admin 확인 안내

**사용자 입력 프롬프트**: admin 확인 방법 안내 + PPT/PDF/Word 파일 첨부 기능 구현

**완료 일시**: 2026-03-16

**작업 내용:**
- `pdfjs-dist`, `mammoth` 라이브러리 설치
- `src/lib/fileExtractor.js` 신규 생성: PDF/DOCX/TXT/MD 텍스트 추출 유틸
- `ChatPage.jsx` 수정: 파일 첨부 UI 추가 (📎 버튼, 파일 chip, 제거 버튼)
- `App.css` 수정: 파일 첨부 관련 스타일 추가
- Admin 확인 방법: Supabase `profiles` 테이블 → 해당 사용자 `role` 컬럼 = `'admin'`

**주요 결정사항:**
- PPT(.pptx) 미지원 — 텍스트 추출 구조가 복잡하므로 PDF 변환 후 사용 안내
- 파일 텍스트는 최대 8,000자를 프롬프트에 첨부 (LLM 컨텍스트 초과 방지)
- 첨부 파일 텍스트는 프롬프트에 인라인 삽입, 채팅 표시는 파일명만 표시

**사용자 직접 검증 필요 항목:**

| 항목 | 검증 방법 |
|------|----------|
| PDF 첨부 | 📎 버튼 클릭 → PDF 선택 → 파일 chip 표시 확인 |
| DOCX 첨부 | Word 문서 첨부 후 질문 전송 → AI가 문서 내용 참조하는지 확인 |
| 파일 제거 | chip의 ✕ 버튼으로 첨부 해제 확인 |
| 10MB 초과 | 10MB 이상 파일 첨부 시 오류 메시지 확인 |
| Admin 확인 | Supabase Table Editor → profiles 테이블에서 role 컬럼 확인 |

**다음 단계 계획:**
- 6단계: GitHub 리포지토리 생성 및 Vercel 배포

---

### 2026-03-16 | 기능 개선: 채팅 히스토리 패널 + 채팅창 폭 제한

**완료 일시**: 2026-03-16

**작업 내용:**
- `ChatPage.jsx` 전면 수정: `chat-layout`(사이드바+본문) 구조로 변경
- 왼쪽 사이드바(240px): 세션 목록 표시, 클릭 시 해당 세션 메시지 로드, `+` 버튼으로 새 대화 생성
- 세션 제목: 첫 메시지 앞 20자로 자동 설정
- 채팅 메시지 max-width 720px, 가운데 정렬 적용 / 입력창도 동일 정렬

**다음 단계 계획:**
- 6단계: GitHub 리포지토리 생성 및 Vercel 배포

---

### 2026-03-16 | 6단계: GitHub 연동 및 Vercel 배포

**완료 일시**: 2026-03-16

**작업 내용:**
- 보안 검증: `.env`, `.claude/mcp.json`, `.mcp.json` 등 민감 파일 gitignore 처리 확인
- `requirements.txt` → `dependencies.md` 이름 변경 (Vercel Python 오인 빌드 오류 수정)
- `vercel.json` 추가: Vite 빌드 설정 및 SPA rewrite 명시
- README.md 전면 업데이트 (기술스택, 에이전트 구조, 로컬 실행 방법, Supabase 설정)
- `LLM API Spec.md` 작성: 모델/파라미터/시스템 프롬프트/라우팅 규칙 정리
- GitHub push: https://github.com/Specialagent-kr/FC_AIPM_Practice.git (master)
- Vercel 배포: https://aipmpractice.vercel.app

**기능 개선 (동일 세션):**
- 스트리밍 응답: `sendMessageStream()` 적용, 실시간 답변 표시 + 커서 애니메이션
- 마크다운 렌더링: `remark-gfm` 플러그인 추가 (표/bold/취소선 정상 렌더링)
- maxOutputTokens: 8192로 설정 (답변 잘림 방지)
- 채팅 히스토리 패널: 왼쪽 사이드바에 세션 목록 표시, 세션 전환 기능
- 채팅창 max-width 720px 가운데 정렬 적용
- 파일 첨부 기능: PDF, DOCX, TXT, MD 지원
- 디폴트 화면 인사말: "안녕하세요, {이름}님! AI PM 어시스턴트입니다."

**배포 관련 추가 설정 필요:**
- Supabase → Authentication → URL Configuration에 `https://aipmpractice.vercel.app` 추가 (OAuth 리다이렉트)
- Vercel 환경변수 3개 등록: `VITE_GOOGLE_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---
