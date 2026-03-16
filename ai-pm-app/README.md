# AI PM 어시스턴트

PM(Product Manager) 업무를 지원하는 멀티에이전트 AI 입니다.

## 주요 기능

- **멀티에이전트 구조**: 전략 / 디스커버리 / 실행 전문 에이전트가 질문 유형에 따라 자동 라우팅
- **실시간 스트리밍**: 답변이 생성되는 과정을 실시간으로 확인
- **응답 품질 평가**: eval-agent가 완성도·전문성·실행가능성 10점 척도로 자동 평가
- **채팅 히스토리**: 대화 세션을 저장하고 왼쪽 패널에서 이전 대화 검색
- **파일 첨부**: PDF, DOCX, TXT, MD 파일을 첨부하여 문서 맥락 기반 질문 가능
- **관리자 대시보드**: 전체 대화 기록 및 AI 응답 평가 결과 조회

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, Vite 8 |
| AI | Google GenAI SDK (`gemini-3-flash-preview`) |
| DB / Auth | Supabase (PostgreSQL + Google OAuth) |
| 배포 | Vercel |

## 에이전트 구조

```
ai-pm-orchestrator
  ├── strategy-agent    시장분석 / 경쟁사 / OKR / 제품전략
  ├── discovery-agent   아이디어검증 / JTBD / PRD 작성
  ├── execution-agent   유저스토리 / 인터뷰설계 / UT / 우선순위
  └── eval-agent        응답 품질 평가 (1~10점)
```

에이전트 정의: `.claude/agents/`
스킬 정의: `.claude/skills/` (9개 PM 스킬)

## 로컬 실행

### 1. 의존성 설치

```bash
cd ai-pm-app
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 아래 값을 입력합니다:

```env
VITE_GOOGLE_API_KEY=...       # Google AI Studio에서 발급
VITE_SUPABASE_URL=...         # Supabase 프로젝트 URL
VITE_SUPABASE_ANON_KEY=...    # Supabase anon key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## Supabase 설정

### 필요한 테이블

```sql
-- 사용자 프로필 (role: 'user' | 'admin')
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user'
);

-- 채팅 세션
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT DEFAULT '새 대화',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 채팅 메시지
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT,
  content TEXT,
  agent_used TEXT,
  skills_used TEXT[],
  eval_score INT,
  eval_detail JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 관리자 권한 설정

```sql
UPDATE profiles SET role = 'admin' WHERE email = '관리자이메일@example.com';
```

## 환경변수 관리

| 파일 | 용도 | Git 커밋 |
|------|------|----------|
| `.env` | 실제 키 값 | ❌ 금지 |
| `.env.example` | 키 이름 템플릿 | ✅ 허용 |

## 라이선스

Private
