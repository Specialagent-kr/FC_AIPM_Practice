# LLM API Spec

AI PM 앱에서 사용하는 Google GenAI API 호출 사양을 정리한 문서입니다.

---

## 기본 정보

| 항목 | 값 |
|------|-----|
| SDK | `@google/genai` |
| 모델 | `gemini-3-flash-preview` |
| API Key 환경변수 | `VITE_GOOGLE_API_KEY` |
| 호출 위치 | `src/agents/agentClient.js` |

---

## 생성 파라미터

### 서브 에이전트 공통 (strategy / discovery / execution)

| 파라미터 | 값 | 설명 |
|----------|-----|------|
| `maxOutputTokens` | `8192` | 최대 출력 토큰 수 |
| `temperature` | `0.7` | 창의성/다양성 조절 (0=결정적, 1=창의적) |
| `topP` | `0.95` | 누적 확률 샘플링 (nucleus sampling) |
| 스트리밍 | `sendMessageStream()` | 청크 단위 실시간 스트리밍 |

### Eval 에이전트

| 파라미터 | 값 | 설명 |
|----------|-----|------|
| `maxOutputTokens` | `1024` | JSON만 반환하므로 짧게 설정 |
| `temperature` | `0.3` | 일관된 JSON 출력을 위해 낮게 설정 |
| 스트리밍 | 미사용 (`generateContent`) | 전체 응답 후 JSON 파싱 필요 |

---

## 에이전트별 시스템 프롬프트 요약

### orchestrator
- 역할: 사용자 요청을 전략/디스커버리/실행으로 분류
- 도메인 분류 기준: 키워드 기반 라우팅
- 응답 원칙: 전문 프레임워크, 정량적 근거, 트레이드오프 포함, 한글 응답

### strategy-agent
- 역할: 시장 분석, 경쟁사, OKR, 제품 전략
- 적용 스킬: `product-strategy`, `okr-analysis`
- 답변 구조: 핵심 인사이트 → 실행 방안(3~5개) → 리스크 → 다음 단계

### discovery-agent
- 역할: 아이디어 검증, JTBD 분석, PRD 작성
- 적용 스킬: `idea-diagnosis`, `jtbd-framework`, `prd-writing`
- 답변 구조: 문제 분석 → JTBD → 검증 방법론 → PRD 초안

### execution-agent
- 역할: 유저스토리, 인터뷰 설계, UT 계획, 우선순위 검증
- 적용 스킬: `user-story-writing`, `user-interview`, `ut-planning`, `priority-validation`
- 답변 구조: 목표/범위 → 단계별 실행 계획 → 템플릿/예시 → 성공 지표

### eval-agent
- 역할: 응답 품질 평가 (완성도 / 전문성 / 실행가능성)
- 출력 형식: JSON `{ score, completeness, expertise, actionability, feedback, improvements }`
- 점수 범위: 1~10점

---

## 에이전트 라우팅 규칙

| 에이전트 | 트리거 키워드 |
|----------|--------------|
| strategy | 시장 분석, 경쟁사, 고객 세그먼트, 제품 전략, OKR, 목표, 포지셔닝, 로드맵, 성장 전략 |
| discovery | 아이디어, 검증, 고객 문제, PRD, 요구사항, JTBD, Jobs, 문제 정의, 기능 기획 |
| execution | 유저스토리, 인터뷰, UT, 사용성 테스트, 우선순위, RICE, ICE, MoSCoW, 스프린트 |
| (기본값) | 매칭 없을 시 → strategy |

---

## 호출 흐름

```
사용자 입력
  └─► selectAgent()          # 키워드 기반 라우팅
  └─► runSubAgentStream()    # 스트리밍 응답 (onChunk 콜백)
        └─► ai.chats.create() → sendMessageStream()
  └─► runEvalAgent()         # 완성된 응답 품질 평가
        └─► ai.models.generateContent()
  └─► 결과 반환 { response, agentUsed, skillsUsed, evalScore, evalDetail }
```

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-03-16 | 초기 작성. 모델: `gemini-3-flash-preview`, maxOutputTokens 미설정 |
| 2026-03-16 | maxOutputTokens 8192 설정. 스트리밍 적용. 모델: `gemini-3-flash-preview` |
