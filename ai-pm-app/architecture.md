# AI PM 멀티에이전트 아키텍처

## 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                          사용자 요청                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ai-pm-orchestrator                           │
│                      (model: sonnet)                            │
│                                                                 │
│  요청 분석 → 에이전트 선택 → 위임 → 품질 검증 → 결과 종합        │
└────────────┬──────────────┬───────────────┬──────────────────────┘
             │              │               │
    전략 키워드       디스커버리 키워드      실행 키워드
    시장/OKR/로드맵    아이디어/PRD/JTBD    스토리/인터뷰/UT
             │              │               │
             ▼              ▼               ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────────┐
│ strategy-agent │  │discovery-agent │  │  execution-agent   │
│ (model:sonnet) │  │ (model:sonnet) │  │  (model: sonnet)   │
│                │  │                │  │                    │
│ 시장/경쟁사 분석│  │ 아이디어 검증  │  │ 유저스토리 작성    │
│ OKR 수립       │  │ JTBD 분석      │  │ 인터뷰 설계        │
│ 제품 전략/포지셔닝│ │ PRD 작성      │  │ UT 계획            │
└───────┬────────┘  └───────┬────────┘  │ 우선순위 검증      │
        │                   │           └────────┬───────────┘
        │                   │                    │
   ┌────┴──────┐      ┌─────┴──────┐      ┌──────┴──────────┐
   │ 스킬 2개  │      │  스킬 3개  │      │    스킬 4개     │
   └───────────┘      └────────────┘      └─────────────────┘
        │                   │                    │
        └───────────────────┴────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │       eval-agent        │
              │      (model: haiku)     │
              │                         │
              │  완성도 / 전문성 /       │
              │  실행가능성 (각 33%)    │
              │  → 1~10점 종합 평가     │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │        최종 응답         │
              │  에이전트명 + 스킬명 +   │
              │     품질 점수 포함       │
              └─────────────────────────┘
```

---

## 에이전트 상세

### 오케스트레이터

| 속성 | 값 |
|------|----|
| name | `ai-pm-orchestrator` |
| model | `sonnet` |
| tools | `Agent` |
| 역할 | 요청 분류 → 서브 에이전트 위임 → eval-agent 검증 → 최종 응답 종합 |

---

### 서브 에이전트 3종

| 에이전트 | model | tools | 담당 영역 |
|----------|-------|-------|-----------|
| `strategy-agent` | sonnet | Read | 시장 분석, 경쟁사, OKR, 제품 전략, 포지셔닝 |
| `discovery-agent` | sonnet | Read | 아이디어 검증, JTBD, PRD, 고객 문제 정의 |
| `execution-agent` | sonnet | Read | 유저스토리, 사용자 인터뷰, UT, 우선순위 |

---

### 평가 에이전트

| 속성 | 값 |
|------|----|
| name | `eval-agent` |
| model | `haiku` (비용 효율) |
| tools | `Read` |
| 역할 | 완성도·전문성·실행가능성 각 33% 가중 평가, JSON 형식 반환 |

---

## 스킬 구조

```
스킬 9개
│
├── strategy-agent 소속 (2개)
│   ├── product-strategy     — 비전·시장 분석·포지셔닝·로드맵
│   └── okr-analysis         — OKR 수립, CRAFT 검증, Baseline 포함
│
├── discovery-agent 소속 (3개)
│   ├── idea-diagnosis       — 아이디어 진단, Riskiest Assumption
│   ├── jtbd-framework       — Job Map, 기회 스코어링
│   └── prd-writing          — In/Out Scope, Given-When-Then AC
│
└── execution-agent 소속 (4개)
    ├── user-story-writing   — INVEST 원칙, Given-When-Then AC
    ├── user-interview       — 과거 행동 중심 질문, 어피니티 다이어그램
    ├── ut-planning          — 태스크 설계, 심각도 분류, SUS
    └── priority-validation  — RICE / ICE / MoSCoW
```

---

## 요청-에이전트 매핑

| 요청 키워드 예시 | 위임 에이전트 | 사용 스킬 |
|----------------|--------------|-----------|
| 시장 분석, 경쟁사, 포지셔닝 | strategy-agent | product-strategy |
| OKR, 목표, 성장 전략 | strategy-agent | okr-analysis |
| 아이디어 검증, 기능 기획 | discovery-agent | idea-diagnosis |
| JTBD, 고객 문제, 니즈 | discovery-agent | jtbd-framework |
| PRD, 요구사항 | discovery-agent | prd-writing |
| 유저스토리, 스프린트 | execution-agent | user-story-writing |
| 인터뷰 설계, 사용자 조사 | execution-agent | user-interview |
| UT, 사용성 테스트 | execution-agent | ut-planning |
| 우선순위, RICE, MoSCoW | execution-agent | priority-validation |
| 복합 요청 | 복수 에이전트 병렬/순차 | 복수 스킬 |

---

## 실행 흐름

```
1. 사용자 입력
       │
2. orchestrator: 키워드 분석 → 에이전트 선택
       │
3. sub-agent 실행 (strategy / discovery / execution 중 1개 이상)
       │  └─ 해당 스킬 실행 → 구조화된 마크다운 응답 생성
       │
4. eval-agent: 완성도·전문성·실행가능성 평가 → JSON 점수 반환
       │
5. orchestrator: 응답 + 점수 종합 → 최종 답변 출력
       │  └─ 사용된 에이전트명 / 스킬명 / 품질 점수 명시
       │
6. 사용자에게 전달
```

---

## 파일 위치

```
FC_AIPM_Practice/
├── .claude/
│   ├── agents/
│   │   ├── ai-pm-orchestrator.md
│   │   ├── strategy-agent.md
│   │   ├── discovery-agent.md
│   │   ├── execution-agent.md
│   │   └── eval-agent.md
│   └── skills/
│       ├── product-strategy.md
│       ├── okr-analysis.md
│       ├── idea-diagnosis.md
│       ├── jtbd-framework.md
│       ├── prd-writing.md
│       ├── user-story-writing.md
│       ├── user-interview.md
│       ├── ut-planning.md
│       └── priority-validation.md
└── ai-pm-app/
    └── architecture.md  ← 이 파일
```
