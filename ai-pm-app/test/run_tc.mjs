/**
 * AI PM 앱 코드 레벨 자동 테스트
 * agentClient.js의 라우팅/스킬 매핑 로직을 검증한다.
 */

// ── 테스트 대상 함수 (agentClient.js에서 복사) ──
const ROUTING_RULES = {
  strategy: ['시장 분석', '경쟁사', '고객 세그먼트', '제품 전략', 'OKR', '목표', '포지셔닝', '로드맵', '성장 전략'],
  discovery: ['아이디어', '검증', '고객 문제', 'PRD', '요구사항', 'JTBD', 'Jobs', '문제 정의', '기능 기획'],
  execution: ['유저스토리', '인터뷰', 'UT', '사용성 테스트', '우선순위', 'RICE', 'ICE', 'MoSCoW', '스프린트'],
};

function selectAgent(message) {
  const msg = message.toLowerCase();
  for (const [agent, keywords] of Object.entries(ROUTING_RULES)) {
    if (keywords.some((kw) => msg.includes(kw.toLowerCase()))) return agent;
  }
  return 'strategy';
}

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

function getSkillsUsed(agent, message) {
  const msg = message.toLowerCase();
  const agentSkills = skillMap[agent] || {};
  const used = Object.entries(agentSkills)
    .filter(([, keywords]) => keywords.some((kw) => msg.includes(kw)))
    .map(([skill]) => skill);
  return used.length > 0 ? used : [Object.keys(agentSkills)[0]].filter(Boolean);
}

// ── 테스트 러너 ──
let passed = 0;
let failed = 0;

function test(name, actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    console.log(`     예상: ${JSON.stringify(expected)}`);
    console.log(`     실제: ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ── TC-1: 에이전트 라우팅 ──
console.log('\n[TC-1] 에이전트 라우팅');
test('TC-1-1: 시장 분석', selectAgent('시장 분석해줘'), 'strategy');
test('TC-1-2: 경쟁사 분석', selectAgent('경쟁사 분석'), 'strategy');
test('TC-1-3: OKR 설정', selectAgent('OKR 설정'), 'strategy');
test('TC-1-4: 아이디어 검증', selectAgent('아이디어 검증'), 'discovery');
test('TC-1-5: PRD 작성', selectAgent('PRD 작성'), 'discovery');
test('TC-1-6: JTBD 분석', selectAgent('JTBD 분석'), 'discovery');
test('TC-1-7: 유저스토리 작성', selectAgent('유저스토리 작성'), 'execution');
test('TC-1-8: 우선순위 RICE', selectAgent('우선순위 RICE 계산'), 'execution');
test('TC-1-9: 사용성 테스트', selectAgent('사용성 테스트 계획'), 'execution');
test('TC-1-10: 기본값(키워드 없음)', selectAgent('도와줘'), 'strategy');

// ── TC-2: 스킬 매핑 ──
console.log('\n[TC-2] 스킬 매핑');
test('TC-2-1: 제품 전략', getSkillsUsed('strategy', '제품 전략 수립'), ['product-strategy']);
test('TC-2-2: OKR 목표', getSkillsUsed('strategy', 'OKR 목표 설정'), ['okr-analysis']);
test('TC-2-3: 아이디어 가설', getSkillsUsed('discovery', '아이디어 가설 검증'), ['idea-diagnosis']);
test('TC-2-4: JTBD 고객 문제', getSkillsUsed('discovery', 'JTBD 고객 문제 분석'), ['jtbd-framework']);
test('TC-2-5: PRD 요구사항', getSkillsUsed('discovery', 'PRD 요구사항 작성'), ['prd-writing']);
test('TC-2-6: 유저스토리', getSkillsUsed('execution', '유저스토리 작성'), ['user-story-writing']);
test('TC-2-7: 인터뷰 설계', getSkillsUsed('execution', '인터뷰 설계'), ['user-interview']);
test('TC-2-8: UT 사용성 테스트', getSkillsUsed('execution', 'UT 사용성 테스트 계획'), ['ut-planning']);
test('TC-2-9: 우선순위 RICE', getSkillsUsed('execution', '우선순위 RICE ICE 검증'), ['priority-validation']);

// ── TC-3: 기본값 처리 ──
console.log('\n[TC-3] 기본값 처리');
test('TC-3-1: strategy 기본 스킬', getSkillsUsed('strategy', '도와줘'), ['product-strategy']);
test('TC-3-2: discovery 기본 스킬', getSkillsUsed('discovery', '도와줘'), ['idea-diagnosis']);
test('TC-3-3: execution 기본 스킬', getSkillsUsed('execution', '도와줘'), ['user-story-writing']);

// ── 결과 요약 ──
console.log(`\n${'─'.repeat(40)}`);
console.log(`총 ${passed + failed}개 | 통과: ${passed} | 실패: ${failed}`);
if (failed === 0) console.log('🎉 모든 테스트 통과!');
else console.log('⚠️  일부 테스트 실패 — 위 내용 확인 필요');
