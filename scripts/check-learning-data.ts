import { WORDS, type RubySegment as WordRubySegment, type WordItem } from "../data/words.ts";
import { SENTENCES, type RubySegment as SentenceRubySegment, type SentenceItem } from "../data/sentences.ts";
import { CURRICULUM } from "../data/curriculum.ts";
import { GRAMMAR_LESSONS } from "../data/grammar.ts";

const KANJI_REGEX = /[一-龯々]/;

const hasKanji = (value?: string): boolean => Boolean(value && KANJI_REGEX.test(value));
const isBlank = (value?: string): boolean => !value || value.trim().length === 0;

const buildReadingFromRubySegments = (rubySegments?: Array<WordRubySegment | SentenceRubySegment>): string | undefined => {
  if (!rubySegments || rubySegments.length === 0) return undefined;

  const merged = rubySegments
    .map((segment) => {
      const source = segment.reading ?? segment.text;
      return hasKanji(source) ? "" : source;
    })
    .join("")
    .trim();

  return merged.length > 0 ? merged : undefined;
};

const buildWordTtsText = (word: WordItem): string => {
  const trimmedReading = word.reading?.trim();
  if (trimmedReading) return trimmedReading;

  const rubyReading = buildReadingFromRubySegments(word.rubySegments);
  if (rubyReading) return rubyReading;

  return word.word.trim();
};

const buildSentenceTtsText = (sentence: SentenceItem): string => {
  const trimmedReading = sentence.reading?.trim();
  if (trimmedReading) return trimmedReading;

  const rubyReading = buildReadingFromRubySegments(sentence.rubySegments);
  if (rubyReading) return rubyReading;

  return sentence.japanese.trim();
};

const warnings: string[] = [];

if (WORDS.length < 600) warnings.push(`[규모] 단어 600개 미만: ${WORDS.length}개`);
if (SENTENCES.length < 600) warnings.push(`[규모] 문장 600개 미만: ${SENTENCES.length}개`);
if (GRAMMAR_LESSONS.length < 30) warnings.push(`[규모] 문법 수업 30개 미만: ${GRAMMAR_LESSONS.length}개`);
if (new Set(WORDS.map((word) => word.word)).size !== WORDS.length) warnings.push("[중복] 단어 표제어가 중복됨");
if (new Set(SENTENCES.map((sentence) => sentence.japanese)).size !== SENTENCES.length) warnings.push("[중복] 일본어 문장이 중복됨");

WORDS.forEach((word, index) => {
  const label = `words[${index}](${word.word})`;

  if (hasKanji(word.word) && isBlank(word.reading)) {
    warnings.push(`[단어] 한자 포함 word인데 reading 비어 있음: ${label}`);
  }

  if (hasKanji(word.word) && isBlank(word.koreanPronunciation)) {
    warnings.push(`[단어] 한자 포함 word인데 koreanPronunciation 비어 있음: ${label}`);
  }

  if (hasKanji(word.example) && isBlank(word.exampleReading)) {
    warnings.push(`[단어] 한자 포함 example인데 exampleReading 비어 있음: ${label}`);
  }

  if (!isBlank(word.reading)) {
    const ttsText = buildWordTtsText(word);
    if (isBlank(ttsText) || hasKanji(ttsText)) {
      warnings.push(`[단어] reading 있음에도 듣기용 텍스트가 비정상(빈값/한자 포함): ${label} -> "${ttsText}"`);
    }
  }
});

SENTENCES.forEach((sentence, index) => {
  const label = `sentences[${index}](${sentence.japanese})`;

  if (hasKanji(sentence.japanese) && isBlank(sentence.reading)) {
    warnings.push(`[문장] 한자 포함 japanese인데 reading 비어 있음: ${label}`);
  }

  if (isBlank(sentence.koreanPronunciation)) {
    warnings.push(`[문장] koreanPronunciation 비어 있음: ${label}`);
  }

  if (sentence.rubySegments && sentence.rubySegments.length > 0 && isBlank(sentence.reading)) {
    const inferred = buildReadingFromRubySegments(sentence.rubySegments);
    if (isBlank(inferred)) {
      warnings.push(`[문장] ruby 데이터가 있으나 reading 추론 불가: ${label}`);
    } else {
      warnings.push(`[문장] ruby로 reading 추론 가능(수동 검토 권장): ${label} -> "${inferred}"`);
    }
  }

  const sentenceTts = buildSentenceTtsText(sentence);
  if (isBlank(sentenceTts)) {
    warnings.push(`[문장] 문장 듣기용 텍스트가 비어질 수 있음: ${label}`);
  }
});

const curriculumIds = new Set<string>();
CURRICULUM.forEach((lesson, index) => {
  const label = `curriculum[${index}](${lesson.id})`;
  if (curriculumIds.has(lesson.id)) warnings.push(`[과정] 중복 id: ${label}`);
  curriculumIds.add(lesson.id);
  if (lesson.words.length < 3) warnings.push(`[과정] 핵심 표현 3개 미만: ${label}`);
  if (lesson.dialogue.length < 2) warnings.push(`[과정] 대화 2줄 미만: ${label}`);
  if (lesson.quiz.length < 8) warnings.push(`[과정] 확인 문제 8개 미만: ${label}`);
  lesson.quiz.forEach((quiz, quizIndex) => {
    if (quiz.answer < 0 || quiz.answer >= quiz.choices.length) {
      warnings.push(`[과정] 정답 인덱스 오류: ${label} quiz[${quizIndex}]`);
    }
  });
});

if (warnings.length === 0) {
  console.log("데이터 검증 완료: 의심 항목 없음");
} else {
  console.log(`데이터 검증 완료: 의심 항목 ${warnings.length}건`);
  warnings.forEach((warning, idx) => {
    console.log(`${idx + 1}. ${warning}`);
  });
}
