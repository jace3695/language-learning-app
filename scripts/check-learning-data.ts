import { WORDS, type RubySegment as WordRubySegment, type WordItem } from "../data/words";
import { SENTENCES, type RubySegment as SentenceRubySegment, type SentenceItem } from "../data/sentences";

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

if (warnings.length === 0) {
  console.log("데이터 검증 완료: 의심 항목 없음");
} else {
  console.log(`데이터 검증 완료: 의심 항목 ${warnings.length}건`);
  warnings.forEach((warning, idx) => {
    console.log(`${idx + 1}. ${warning}`);
  });
}
