export type GrammarCategory = "です/ます" | "조사" | "지시어" | "기타";

export type GrammarLesson = {
  id: string;
  title: string;
  level: "beginner";
  category: GrammarCategory;
  summary: string;
  explanation: string;
  pattern: string;
  examples: { japanese: string; reading?: string; meaning: string }[];
  quiz: { question: string; choices: string[]; answer: string; explanation: string };
};

export type GrammarProgressItem = {
  lessonId: string;
  title: string;
  category: string;
  pattern: string;
  correctCount: number;
  wrongCount: number;
  lastAnsweredAt: string;
  lastResult: "correct" | "wrong";
};

export const GRAMMAR_PROGRESS_KEY = "grammarProgress";

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: "desu",
    title: "です 문장",
    level: "beginner",
    category: "です/ます",
    summary: "명사나 상태를 공손하게 말할 때 사용해요.",
    explanation: "처음 만나는 사람과 대화할 때 기본이 되는 공손한 종결 표현이에요.",
    pattern: "A は B です",
    examples: [
      { japanese: "これは水です。", meaning: "이것은 물입니다." },
      { japanese: "私は学生です。", meaning: "저는 학생입니다." },
      { japanese: "ここは駅です。", meaning: "여기는 역입니다." },
    ],
    quiz: {
      question: "‘저는 학생입니다’를 일본어로 자연스럽게 표현한 것은?",
      choices: ["私は学生です。", "私を学生です。", "私に学生です。", "私で学生です。"],
      answer: "私は学生です。",
      explanation: "주제는 は를 사용하고, 공손한 명사 문장은 です로 끝내요.",
    },
  },
  {
    id: "masu",
    title: "ます 문장",
    level: "beginner",
    category: "です/ます",
    summary: "동작을 공손하게 말할 때 사용해요.",
    explanation: "동사를 ます형으로 바꾸면 일상에서 쓰기 좋은 공손한 문장이 돼요.",
    pattern: "동사ます",
    examples: [
      { japanese: "日本語を勉強します。", meaning: "일본어를 공부합니다." },
      { japanese: "駅に行きます。", meaning: "역에 갑니다." },
      { japanese: "水を飲みます。", meaning: "물을 마십니다." },
    ],
    quiz: {
      question: "공손한 동사 문장에 맞는 표현은?",
      choices: ["食べます", "食べるだ", "食べです", "食べに"],
      answer: "食べます",
      explanation: "동작을 공손하게 말할 때는 동사 ます형을 사용해요.",
    },
  },
  {
    id: "wa",
    title: "は 패턴",
    level: "beginner",
    category: "조사",
    summary: "문장의 주제나 대상을 꺼낼 때 사용해요.",
    explanation: "‘무엇에 대해 말하는지’를 먼저 제시할 때 자주 쓰는 핵심 조사예요.",
    pattern: "A は B です",
    examples: [
      { japanese: "私は会社員です。", meaning: "저는 회사원입니다." },
      { japanese: "これは本です。", meaning: "이것은 책입니다." },
      { japanese: "駅はどこですか。", meaning: "역은 어디입니까?" },
    ],
    quiz: {
      question: "문장의 주제를 나타내는 조사는 무엇인가요?",
      choices: ["は", "を", "に", "で"],
      answer: "は",
      explanation: "は는 문장의 화제를 제시하는 역할을 해요.",
    },
  },
  {
    id: "wo",
    title: "を 패턴",
    level: "beginner",
    category: "조사",
    summary: "동작의 대상을 나타낼 때 사용해요.",
    explanation: "무엇을 먹고, 마시고, 공부하는지 같은 목적어를 붙일 때 사용해요.",
    pattern: "A を 동사",
    examples: [
      { japanese: "水を飲みます。", meaning: "물을 마십니다." },
      { japanese: "ご飯を食べます。", meaning: "밥을 먹습니다." },
      { japanese: "日本語を勉強します。", meaning: "일본어를 공부합니다." },
    ],
    quiz: {
      question: "‘일본어를 공부합니다’에서 목적어를 나타내는 조사는?",
      choices: ["を", "に", "で", "は"],
      answer: "を",
      explanation: "동사의 직접 대상(목적어)에는 を를 사용해요.",
    },
  },
  {
    id: "ni",
    title: "に 패턴",
    level: "beginner",
    category: "조사",
    summary: "목적지, 시간, 대상 등을 나타낼 때 사용해요.",
    explanation: "어디에 가는지, 누구를 만나는지 같은 도착점·대상을 표현할 때 써요.",
    pattern: "장소 に 行きます",
    examples: [
      { japanese: "駅に行きます。", meaning: "역에 갑니다." },
      { japanese: "会社に行きます。", meaning: "회사에 갑니다." },
      { japanese: "友だちに会います。", meaning: "친구를 만납니다." },
    ],
    quiz: {
      question: "‘역에 갑니다’에서 ‘에’에 해당하는 조사는?",
      choices: ["に", "を", "で", "は"],
      answer: "に",
      explanation: "목적지나 대상을 나타낼 때 に를 사용해요.",
    },
  },
  {
    id: "de",
    title: "で 패턴",
    level: "beginner",
    category: "조사",
    summary: "장소나 수단을 나타낼 때 사용해요.",
    explanation: "어디에서 행동하는지, 무엇으로 이동하는지에 쓰는 조사예요.",
    pattern: "장소 で 동사",
    examples: [
      { japanese: "レストランで食べます。", meaning: "레스토랑에서 먹습니다." },
      { japanese: "会社で働きます。", meaning: "회사에서 일합니다." },
      { japanese: "電車で行きます。", meaning: "전철로 갑니다." },
    ],
    quiz: {
      question: "‘회사에서 일합니다’에서 장소를 나타내는 조사는?",
      choices: ["で", "に", "を", "は"],
      answer: "で",
      explanation: "행동이 일어나는 장소와 수단은 で를 써요.",
    },
  },
  {
    id: "kore-sore-are",
    title: "これ・それ・あれ",
    level: "beginner",
    category: "지시어",
    summary: "물건을 가리킬 때 사용해요.",
    explanation: "가까운 것(これ), 상대 쪽 것(それ), 멀리 있는 것(あれ)을 구분해요.",
    pattern: "これ / それ / あれ",
    examples: [
      { japanese: "これは何ですか。", meaning: "이것은 무엇입니까?" },
      { japanese: "それは水です。", meaning: "그것은 물입니다." },
      { japanese: "あれは駅です。", meaning: "저것은 역입니다." },
    ],
    quiz: {
      question: "화자에게서 멀리 있는 ‘저것’을 가리키는 말은?",
      choices: ["あれ", "これ", "それ", "どれ"],
      answer: "あれ",
      explanation: "あれ는 화자와 청자 모두에게서 멀리 있는 사물을 가리켜요.",
    },
  },
  {
    id: "koko-soko-asoko",
    title: "ここ・そこ・あそこ",
    level: "beginner",
    category: "지시어",
    summary: "장소를 가리킬 때 사용해요.",
    explanation: "위치 표현의 기본 세트로, 장소 질문과 안내에서 자주 나와요.",
    pattern: "ここ / そこ / あそこ",
    examples: [
      { japanese: "ここは駅です。", meaning: "여기는 역입니다." },
      { japanese: "そこはトイレです。", meaning: "거기는 화장실입니다." },
      { japanese: "あそこは会社です。", meaning: "저기는 회사입니다." },
    ],
    quiz: {
      question: "듣는 사람 가까운 장소 ‘거기’에 해당하는 표현은?",
      choices: ["そこ", "ここ", "あそこ", "どこ"],
      answer: "そこ",
      explanation: "そこ는 청자 가까운 장소를 가리킬 때 써요.",
    },
  },
];
