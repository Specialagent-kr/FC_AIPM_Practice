/**
 * AI PM 에이전트 클라이언트
 *
 * 계층 구조:
 *   ai-pm-orchestrator (오케스트레이터)
 *     ├── strategy-agent   : 시장/경쟁사/OKR 분석
 *     ├── discovery-agent  : 아이디어 검증/JTBD/PRD
 *     ├── execution-agent  : 유저스토리/인터뷰/UT/우선순위
 *     └── eval-agent       : 응답 품질 평가
 */

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
const MODEL = 'gemini-3-flash-preview';

// 공통 생성 파라미터
const GENERATION_CONFIG = {
  maxOutputTokens: 8192,
  temperature: 0.7,
  topP: 0.95,
};

// eval 전용 파라미터 (짧고 JSON만 반환)
const EVAL_CONFIG = {
  maxOutputTokens: 1024,
  temperature: 0.3,
};

// ──────────────────────────────────────────────
// 에이전트 시스템 프롬프트
// ──────────────────────────────────────────────

const AGENT_PROMPTS = {
  orchestrator: `당신은 PM(Product Manager) 업무 전반을 총괄하는 AI PM 오케스트레이터입니다.
사용자의 요청을 분석하여 가장 적합한 전문 영역(전략/디스커버리/실행)으로 분류하고,
해당 전문가 관점에서 최고 품질의 PM 답변을 제공합니다.

## 도메인 분류 기준
- 전략 (strategy): 시장 분석, 경쟁사, 고객 세그먼트, 제품 전략, OKR, 포지셔닝, 로드맵
- 디스커버리 (discovery): 아이디어, 검증, 고객 문제, PRD, JTBD, 문제 정의, 기능 기획
- 실행 (execution): 유저스토리, 인터뷰 설계, UT, 사용성 테스트, 우선순위, RICE, ICE, MoSCoW

## 응답 원칙
- 분류된 도메인의 전문 프레임워크와 방법론을 적용한다
- 정량적 근거와 구체적인 예시/템플릿을 포함한다
- 트레이드오프와 리스크를 함께 제시한다
- 모든 응답은 한글로 제공한다`,

  strategy: `당신은 PM 전략 전문가입니다.
시장 분석, 경쟁사 분석, 고객 세그먼트, OKR 설정, 제품 전략 수립을 담당합니다.
product-strategy, okr-analysis 스킬을 적용하여 전문적으로 답변하세요.

답변 포함 항목:
1. 핵심 인사이트 요약
2. 구체적인 실행 방안 (3-5개)
3. 고려해야 할 리스크
4. 다음 단계 추천

모든 응답은 한글로 제공한다.`,

  discovery: `당신은 PM 디스커버리 전문가입니다.
아이디어 검증, 고객 문제 정의, Jobs To Be Done 분석, PRD 작성을 담당합니다.
idea-diagnosis, jtbd-framework, prd-writing 스킬을 적용하여 전문적으로 답변하세요.

답변 포함 항목:
1. 문제/아이디어 분석
2. 고객 관점의 Jobs To Be Done
3. 검증 방법론
4. PRD 구조 또는 요구사항 초안

모든 응답은 한글로 제공한다.`,

  execution: `당신은 PM 실행 전문가입니다.
유저스토리 작성, 사용자 인터뷰 설계, UT 계획, 우선순위 검증을 담당합니다.
user-story-writing, user-interview, ut-planning, priority-validation 스킬을 적용하여 전문적으로 답변하세요.

답변 포함 항목:
1. 작업 목표 및 범위
2. 단계별 실행 계획
3. 템플릿/예시
4. 성공 지표

모든 응답은 한글로 제공한다.`,

  eval: `당신은 PM 전문가 응답을 평가하는 품질 관리 에이전트입니다.
완성도(Completeness), 전문성(Expertise), 실행가능성(Actionability) 기준으로 1-10점 평가합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "score": 숫자(1-10),
  "completeness": 숫자(1-10),
  "expertise": 숫자(1-10),
  "actionability": 숫자(1-10),
  "feedback": "한글 피드백",
  "improvements": ["개선점1", "개선점2"]
}`,
};

// ──────────────────────────────────────────────
// 에이전트 라우팅
// ──────────────────────────────────────────────

const ROUTING_RULES = {
  strategy: ['시장 분석', '경쟁사', '고객 세그먼트', '제품 전략', 'OKR', '목표', '포지셔닝', '로드맵', '성장 전략'],
  discovery: ['아이디어', '검증', '고객 문제', 'PRD', '요구사항', 'JTBD', 'Jobs', '문제 정의', '기능 기획'],
  execution: ['유저스토리', '인터뷰', 'UT', '사용성 테스트', '우선순위', 'RICE', 'ICE', 'MoSCoW', '스프린트'],
};

function selectAgent(message) {
  const msg = message.toLowerCase();
  for (const [agent, keywords] of Object.entries(ROUTING_RULES)) {
    if (keywords.some((kw) => msg.includes(kw.toLowerCase()))) {
      return agent;
    }
  }
  return 'strategy';
}

function getSkillsUsed(agent, message) {
  const msg = message.toLowerCase();
  const skillMap = {
    strategy: {
      'product-strategy': ['전략', '시장', '경쟁사', '포지셔닝', '로드맵'],
      'okr-analysis': ['okr', '목표', 'key result'],
    },
    discovery: {
      'idea-diagnosis': ['아이디어', '검증', '가설'],
      'jtbd-framework': ['jtbd', 'jobs', '고객 문제'],
      'prd-writing': ['prd', '요구사항', '기능 정의'],
    },
    execution: {
      'user-story-writing': ['유저스토리', 'user story', 'ac'],
      'user-interview': ['인터뷰', 'interview'],
      'ut-planning': ['ut', '사용성 테스트'],
      'priority-validation': ['우선순위', 'rice', 'ice', 'moscow'],
    },
  };

  const agentSkills = skillMap[agent] || {};
  const used = Object.entries(agentSkills)
    .filter(([, keywords]) => keywords.some((kw) => msg.includes(kw)))
    .map(([skill]) => skill);

  return used.length > 0 ? used : [Object.keys(agentSkills)[0]].filter(Boolean);
}

// ──────────────────────────────────────────────
// 서브 에이전트 실행 (스트리밍)
// onChunk(text): 청크가 도착할 때마다 호출
// ──────────────────────────────────────────────

async function runSubAgentStream(agentType, userMessage, conversationHistory = [], onChunk) {
  const history = conversationHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chat = ai.chats.create({
    model: MODEL,
    config: {
      systemInstruction: AGENT_PROMPTS[agentType],
      ...GENERATION_CONFIG,
    },
    history,
  });

  let fullText = '';
  const stream = await chat.sendMessageStream({ message: userMessage });

  for await (const chunk of stream) {
    const chunkText = chunk.text ?? '';
    if (chunkText) {
      fullText += chunkText;
      onChunk(fullText); // 누적 텍스트 전달
    }
  }

  return fullText;
}

// ──────────────────────────────────────────────
// Eval 에이전트 (비스트리밍, JSON 반환)
// ──────────────────────────────────────────────

async function runEvalAgent(originalQuestion, agentResponse) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      config: {
        systemInstruction: AGENT_PROMPTS.eval,
        ...EVAL_CONFIG,
      },
      contents: `질문: ${originalQuestion}\n\n응답: ${agentResponse}`,
    });

    const evalText = response.text;
    const jsonMatch = evalText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const evalData = JSON.parse(jsonMatch[0]);
      return { score: evalData.score || 7, detail: evalData };
    }
  } catch (error) {
    console.error('Eval 에이전트 오류:', error);
  }

  return {
    score: 7,
    detail: {
      score: 7,
      completeness: 7,
      expertise: 7,
      actionability: 7,
      feedback: '평가 처리 중 오류 발생',
      improvements: [],
    },
  };
}

// ──────────────────────────────────────────────
// 오케스트레이터 메인 함수 (스트리밍 지원)
// ──────────────────────────────────────────────

/**
 * AI PM 오케스트레이터 진입점
 * @param {string}   userMessage          - 사용자 입력
 * @param {Array}    conversationHistory  - 대화 히스토리 [{role, content}]
 * @param {Function} onChunk              - 스트리밍 청크 콜백 (누적 텍스트)
 * @returns {{ response, agentUsed, skillsUsed, evalScore, evalDetail }}
 */
export async function orchestrate(userMessage, conversationHistory = [], onChunk) {
  const selectedAgent = selectAgent(userMessage);
  const skillsUsed = getSkillsUsed(selectedAgent, userMessage);

  // 스트리밍으로 서브 에이전트 실행
  const agentResponse = await runSubAgentStream(
    selectedAgent,
    userMessage,
    conversationHistory,
    onChunk ?? (() => {}),
  );

  // Eval은 전체 응답 완성 후 실행 (백그라운드)
  const evalResult = await runEvalAgent(userMessage, agentResponse);

  return {
    response: agentResponse,
    agentUsed: selectedAgent,
    skillsUsed,
    evalScore: evalResult.score,
    evalDetail: evalResult.detail,
  };
}
