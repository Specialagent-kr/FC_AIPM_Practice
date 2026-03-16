# AI PM App - 패키지 의존성

## 프로덕션 의존성

@google/genai@^1.0.0             # Google Gemini AI SDK (gemini-3-flash-preview)
@supabase/supabase-js@^2.99.1   # Supabase DB/Auth 클라이언트
react@^19.2.4                    # React UI 라이브러리
react-dom@^19.2.4                # React DOM 렌더러

## 개발 의존성

@eslint/js@^9.39.4               # ESLint JavaScript 규칙
@types/react@^19.2.14            # React TypeScript 타입 정의
@types/react-dom@^19.2.3         # React DOM TypeScript 타입 정의
@vitejs/plugin-react@^6.0.0      # Vite React 플러그인
eslint@^9.39.4                   # JavaScript 린터
eslint-plugin-react-hooks@^7.0.1 # React Hooks ESLint 규칙
eslint-plugin-react-refresh@^0.5.2 # React Refresh ESLint 규칙
globals@^17.4.0                  # ESLint 전역 변수 설정
vite@^8.0.0                      # 빌드 도구 및 개발 서버

## 설치 방법

    npm install

## 추가 예정 패키지

react-router-dom    # 페이지 라우팅 (3단계에서 추가)
react-markdown      # 마크다운 렌더링 (4단계에서 추가)
