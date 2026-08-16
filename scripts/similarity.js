/**
 * V3 Similarity Calculation Library
 */

/**
 * Jaccard Similarity: 집합 유사도 (0.0 ~ 1.0)
 */
export function jaccardSimilarity(setA, setB) {
  const intersection = setA.filter(item => setB.includes(item));
  const union = [...new Set([...setA, ...setB])];
  return union.length === 0 ? 0 : intersection.length / union.length;
}

/**
 * Cosine Similarity: 벡터 유사도 (0.0 ~ 1.0)
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA * magB === 0 ? 0 : dotProduct / (magA * magB);
}

/**
 * Category Vector 변환
 */
export function getCategoryVector(scores) {
  return [
    scores.automation,
    scores['web-development'],
    scores['ai-ml'],
    scores.devops,
    scores.architecture
  ];
}

/**
 * 다차원 유사도 계산 (V3 버전: categoryScores 중심)
 */
export function calculateSimilarity(source, candidate) {
  // 1. Category Alignment (70% 가중치) - 주요 지표
  const categorySim = cosineSimilarity(
    getCategoryVector(source.categoryScores),
    getCategoryVector(candidate.categoryScores)
  );

  // 2. Difficulty Match (20% 가중치)
  const difficultyDiff = Math.abs(source.difficulty - candidate.difficulty);
  const difficultySim = Math.max(0, 1 - difficultyDiff * 0.25);

  // 3. Complementary Relationship (10% 가중치)
  let complementarySim = 0.5;
  if (candidate.difficulty === source.difficulty + 1) {
    complementarySim = 0.8; // Next level
  } else if (candidate.difficulty === source.difficulty - 1) {
    complementarySim = 0.7; // Prerequisite
  }

  // 가중치 적용하여 최종 점수 계산
  return (
    categorySim * 0.70 +
    difficultySim * 0.20 +
    complementarySim * 0.10
  );
}

/**
 * 추천 타입 결정
 */
export function determineType(source, candidate) {
  const difficultyDiff = candidate.difficulty - source.difficulty;

  if (difficultyDiff === 1) return 'next-step';
  if (difficultyDiff === -1) return 'prerequisite';
  if (difficultyDiff === 0) return 'similar-topic';
  return 'complementary';
}

/**
 * 추천 이유 생성 (템플릿 기반)
 */
export function generateReason(source, candidate, score, type) {
  // 카테고리 레이블
  const categoryLabels = {
    ko: {
      'automation': '자동화',
      'web-development': '웹 개발',
      'ai-ml': 'AI/ML',
      'devops': 'DevOps',
      'architecture': '아키텍처'
    },
    ja: {
      'automation': '自動化',
      'web-development': 'Web開発',
      'ai-ml': 'AI/ML',
      'devops': 'DevOps',
      'architecture': 'アーキテクチャ'
    },
    en: {
      'automation': 'automation',
      'web-development': 'web development',
      'ai-ml': 'AI/ML',
      'devops': 'DevOps',
      'architecture': 'architecture'
    },
    zh: {
      'automation': '自动化',
      'web-development': 'Web开发',
      'ai-ml': 'AI/ML',
      'devops': 'DevOps',
      'architecture': '架构'
    }
  };

  // 공통 주요 카테고리 찾기 (둘 다 0.6 이상)
  const categories = ['automation', 'web-development', 'ai-ml', 'devops', 'architecture'];
  const commonCategories = categories.filter(cat =>
    source.categoryScores[cat] >= 0.6 && candidate.categoryScores[cat] >= 0.6
  );

  // 템플릿 기반 이유 생성
  const templates = {
    'next-step': {
      ko: (cats) => `다음 단계 학습으로 적합하며, ${cats.map(c => categoryLabels.ko[c]).join(', ')} 주제에서 연결됩니다.`,
      ja: (cats) => `次のステップの学習に適しており、${cats.map(c => categoryLabels.ja[c]).join('、')}のトピックで繋がります。`,
      en: (cats) => `Suitable as a next-step learning resource, connecting through ${cats.map(c => categoryLabels.en[c]).join(', ')} topics.`,
      zh: (cats) => `适合作为下一步学习资源，通过${cats.map(c => categoryLabels.zh[c]).join('、')}主题进行连接。`
    },
    'prerequisite': {
      ko: (cats) => `선행 학습 자료로 유용하며, ${cats.map(c => categoryLabels.ko[c]).join(', ')} 기초를 다룹니다.`,
      ja: (cats) => `事前学習資料として有用であり、${cats.map(c => categoryLabels.ja[c]).join('、')}の基礎を扱います。`,
      en: (cats) => `Useful as prerequisite knowledge, covering ${cats.map(c => categoryLabels.en[c]).join(', ')} fundamentals.`,
      zh: (cats) => `作为先修知识很有用，涵盖${cats.map(c => categoryLabels.zh[c]).join('、')}基础。`
    },
    'similar-topic': {
      ko: (cats) => `${cats.map(c => categoryLabels.ko[c]).join(', ')} 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.`,
      ja: (cats) => `${cats.map(c => categoryLabels.ja[c]).join('、')}分野で類似したトピックを扱い、同程度の難易度です。`,
      en: (cats) => `Covers similar topics in ${cats.map(c => categoryLabels.en[c]).join(', ')} with comparable difficulty.`,
      zh: (cats) => `在${cats.map(c => categoryLabels.zh[c]).join('、')}领域涵盖类似主题，难度相当。`
    },
    'complementary': {
      ko: (cats) => `${cats.map(c => categoryLabels.ko[c]).join(', ')} 관점에서 보완적인 내용을 제공합니다.`,
      ja: (cats) => `${cats.map(c => categoryLabels.ja[c]).join('、')}の観点から補完的な内容を提供します。`,
      en: (cats) => `Provides complementary content from ${cats.map(c => categoryLabels.en[c]).join(', ')} perspective.`,
      zh: (cats) => `从${cats.map(c => categoryLabels.zh[c]).join('、')}角度提供补充内容。`
    }
  };

  const cats = commonCategories.length > 0 ? commonCategories : [categories[0]];
  const template = templates[type] || templates['similar-topic'];

  return {
    ko: template.ko(cats),
    ja: template.ja(cats),
    en: template.en(cats),
    zh: template.zh(cats)
  };
}
