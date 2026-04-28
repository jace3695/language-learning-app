"use client";

import { useEffect, useState, useCallback } from "react";

type Sentence = {
  japanese: string;
  reading?: string;
  koreanPronunciation?: string;
  meaning: string;
  category: "일상" | "여행" | "업무" | "친구";
  note: string;
};

const SENTENCES: Sentence[] = ([
  // ===== 여행 =====
  { japanese: "これをください", koreanPronunciation: "코레오 쿠다사이", meaning: "이거 주세요", category: "여행", note: "가게나 식당에서 주문할 때" },
  { japanese: "おすすめは何ですか？", koreanPronunciation: "오스스메와 난데스카?", meaning: "추천은 뭐예요?", category: "여행", note: "식당이나 가게에서 추천을 물을 때" },
  { japanese: "お会計お願いします", koreanPronunciation: "오카이케이 오네가이시마스", meaning: "계산 부탁합니다", category: "여행", note: "식당에서 계산을 요청할 때" },
  { japanese: "カードは使えますか？", koreanPronunciation: "카아도와 츠카에마스카?", meaning: "카드 사용할 수 있나요?", category: "여행", note: "결제 가능 여부를 확인할 때" },
  { japanese: "現金だけですか？", koreanPronunciation: "겐킨다케데스카?", meaning: "현금만 되나요?", category: "여행", note: "카드 결제가 안 되는지 확인할 때" },
  { japanese: "水をください", koreanPronunciation: "미즈오 쿠다사이", meaning: "물 주세요", category: "여행", note: "식당에서 물을 요청할 때" },
  { japanese: "トイレはどこですか？", koreanPronunciation: "토이레와 도코데스카?", meaning: "화장실은 어디예요?", category: "여행", note: "화장실 위치를 물을 때" },
  { japanese: "駅はどこですか？", koreanPronunciation: "에키와 도코데스카?", meaning: "역은 어디예요?", category: "여행", note: "역 위치를 물을 때" },
  { japanese: "ここから遠いですか？", koreanPronunciation: "코코카라 토오이데스카?", meaning: "여기서 멀어요?", category: "여행", note: "거리감을 물을 때" },
  { japanese: "歩いて行けますか？", koreanPronunciation: "아루이테 이케마스카?", meaning: "걸어서 갈 수 있어요?", category: "여행", note: "도보 이동 가능 여부를 물을 때" },
  { japanese: "予約しています", koreanPronunciation: "요야쿠시테이마스", meaning: "예약했습니다", category: "여행", note: "호텔이나 식당에서 예약 사실을 말할 때" },
  { japanese: "チェックインお願いします", koreanPronunciation: "첵쿠인 오네가이시마스", meaning: "체크인 부탁합니다", category: "여행", note: "호텔 체크인할 때" },
  { japanese: "チェックアウトは何時ですか？", koreanPronunciation: "첵쿠아우토와 난지데스카?", meaning: "체크아웃은 몇 시예요?", category: "여행", note: "호텔 체크아웃 시간을 물을 때" },
  { japanese: "荷物を預けたいです", koreanPronunciation: "니모츠오 아즈케타이데스", meaning: "짐을 맡기고 싶어요", category: "여행", note: "호텔이나 역에서 짐을 맡길 때" },
  { japanese: "英語は話せますか？", koreanPronunciation: "에이고와 하나세마스카?", meaning: "영어 할 수 있어요?", category: "여행", note: "의사소통 가능 언어를 물을 때" },
  { japanese: "日本語が少しできます", koreanPronunciation: "니혼고가 스코시 데키마스", meaning: "일본어를 조금 할 수 있어요", category: "여행", note: "자신의 일본어 수준을 말할 때" },
  { japanese: "ゆっくり話してください", koreanPronunciation: "윳쿠리 하나시테 쿠다사이", meaning: "천천히 말해 주세요", category: "여행", note: "상대 말이 빠를 때" },
  { japanese: "もう一度お願いします", koreanPronunciation: "모오 이치도 오네가이시마스", meaning: "한 번 더 부탁합니다", category: "여행", note: "다시 말해 달라고 할 때" },
  { japanese: "写真を撮ってもいいですか？", koreanPronunciation: "샤신오 톳테모 이이데스카?", meaning: "사진 찍어도 돼요?", category: "여행", note: "촬영 가능 여부를 물을 때" },
  { japanese: "これはいくらですか？", koreanPronunciation: "코레와 이쿠라데스카?", meaning: "이거 얼마예요?", category: "여행", note: "가격을 물을 때" },
  { japanese: "切符を買いたいです", koreanPronunciation: "킷푸오 카이타이데스", meaning: "표를 사고 싶어요", category: "여행", note: "교통권이나 입장권을 살 때" },
  { japanese: "この電車はどこに行きますか？", koreanPronunciation: "코노 덴샤와 도코니 이키마스카?", meaning: "이 전철은 어디로 가나요?", category: "여행", note: "전철 방향을 확인할 때" },
  { japanese: "次の駅で降ります", koreanPronunciation: "츠기노 에키데 오리마스", meaning: "다음 역에서 내립니다", category: "여행", note: "하차 위치를 말할 때" },
  { japanese: "この近くにコンビニはありますか？", koreanPronunciation: "코노 치카쿠니 콘비니와 아리마스카?", meaning: "이 근처에 편의점이 있나요?", category: "여행", note: "근처 편의시설을 찾을 때" },
  { japanese: "道に迷いました", koreanPronunciation: "미치니 마요이마시타", meaning: "길을 잃었어요", category: "여행", note: "길을 잃었을 때 도움을 요청할 때" },
  { japanese: "ここに行きたいです", koreanPronunciation: "코코니 이키타이데스", meaning: "여기에 가고 싶어요", category: "여행", note: "지도나 주소를 보여주며 말할 때" },
  { japanese: "タクシーを呼んでください", koreanPronunciation: "타쿠시오 욘데 쿠다사이", meaning: "택시를 불러 주세요", category: "여행", note: "택시 호출을 요청할 때" },
  { japanese: "辛くしないでください", koreanPronunciation: "카라쿠 시나이데 쿠다사이", meaning: "맵게 하지 말아 주세요", category: "여행", note: "음식 주문 시 요청할 때" },
  { japanese: "持ち帰りできますか？", koreanPronunciation: "모치카에리 데키마스카?", meaning: "포장 가능해요?", category: "여행", note: "음식 포장 가능 여부를 물을 때" },
  { japanese: "店内で食べます", koreanPronunciation: "텐나이데 타베마스", meaning: "매장에서 먹을게요", category: "여행", note: "식사 장소를 말할 때" },
  { japanese: "袋をください", koreanPronunciation: "후쿠로오 쿠다사이", meaning: "봉투 주세요", category: "여행", note: "가게에서 봉투를 요청할 때" },
  { japanese: "レシートをください", koreanPronunciation: "레시이토오 쿠다사이", meaning: "영수증 주세요", category: "여행", note: "영수증을 요청할 때" },
  { japanese: "免税できますか？", koreanPronunciation: "멘제이 데키마스카?", meaning: "면세 가능해요?", category: "여행", note: "쇼핑 시 면세 가능 여부를 물을 때" },
  { japanese: "試着してもいいですか？", koreanPronunciation: "시챠쿠시테모 이이데스카?", meaning: "입어봐도 돼요?", category: "여행", note: "옷가게에서 시착을 요청할 때" },
  { japanese: "別のサイズはありますか？", koreanPronunciation: "베츠노 사이즈와 아리마스카?", meaning: "다른 사이즈 있나요?", category: "여행", note: "사이즈를 물을 때" },
  { japanese: "これにします", koreanPronunciation: "코레니 시마스", meaning: "이걸로 할게요", category: "여행", note: "선택을 확정할 때" },
  { japanese: "少し考えます", koreanPronunciation: "스코시 칸가에마스", meaning: "조금 생각해볼게요", category: "여행", note: "구매를 잠시 보류할 때" },
  { japanese: "助けてください", koreanPronunciation: "타스케테 쿠다사이", meaning: "도와주세요", category: "여행", note: "도움이 필요할 때" },
  { japanese: "病院に行きたいです", koreanPronunciation: "뵤오인니 이키타이데스", meaning: "병원에 가고 싶어요", category: "여행", note: "몸이 아플 때" },
  { japanese: "薬局はどこですか？", koreanPronunciation: "야쿄쿠와 도코데스카?", meaning: "약국은 어디예요?", category: "여행", note: "약국 위치를 물을 때" },

  // ===== 업무 =====
  { japanese: "ご確認お願いします", koreanPronunciation: "고카쿠닌 오네가이시마스", meaning: "확인 부탁드립니다", category: "업무", note: "메일이나 업무 대화에서 확인을 요청할 때" },
  { japanese: "ご連絡ありがとうございます", koreanPronunciation: "고렌라쿠 아리가토오 고자이마스", meaning: "연락 감사합니다", category: "업무", note: "상대의 연락에 감사할 때" },
  { japanese: "資料を送付いたします", koreanPronunciation: "시료오 소오후 이타시마스", meaning: "자료를 송부드립니다", category: "업무", note: "자료를 보낼 때" },
  { japanese: "納期はいつですか？", koreanPronunciation: "노오키와 이츠데스카?", meaning: "납기는 언제입니까?", category: "업무", note: "납기 일정을 확인할 때" },
  { japanese: "見積をお願いします", koreanPronunciation: "미츠모리오 오네가이시마스", meaning: "견적 부탁드립니다", category: "업무", note: "견적 요청 시" },
  { japanese: "内容を確認中です", koreanPronunciation: "나이요오오 카쿠닌추우데스", meaning: "내용 확인 중입니다", category: "업무", note: "검토 중임을 알릴 때" },
  { japanese: "対応いたします", koreanPronunciation: "타이오오 이타시마스", meaning: "대응하겠습니다", category: "업무", note: "처리 의사를 전달할 때" },
  { japanese: "少々お待ちください", koreanPronunciation: "쇼오쇼오 오마치쿠다사이", meaning: "잠시만 기다려 주세요", category: "업무", note: "확인 시간이 필요할 때" },
  { japanese: "後ほどご連絡いたします", koreanPronunciation: "노치호도 고렌라쿠 이타시마스", meaning: "나중에 연락드리겠습니다", category: "업무", note: "추후 연락을 약속할 때" },
  { japanese: "問題ありません", koreanPronunciation: "몬다이 아리마센", meaning: "문제 없습니다", category: "업무", note: "이상이 없다고 말할 때" },
  { japanese: "修正をお願いします", koreanPronunciation: "슈우세이오 오네가이시마스", meaning: "수정 부탁드립니다", category: "업무", note: "수정을 요청할 때" },
  { japanese: "確認いたしました", koreanPronunciation: "카쿠닌 이타시마시타", meaning: "확인했습니다", category: "업무", note: "확인 완료를 전달할 때" },
  { japanese: "進捗はいかがですか？", koreanPronunciation: "신초쿠와 이카가데스카?", meaning: "진행 상황은 어떻습니까?", category: "업무", note: "진행 상태를 물을 때" },
  { japanese: "会議を設定しましょう", koreanPronunciation: "카이기오 셋테이시마쇼오", meaning: "회의를 설정합시다", category: "업무", note: "회의 일정을 잡을 때" },
  { japanese: "資料を確認してください", koreanPronunciation: "시료오 카쿠닌시테 쿠다사이", meaning: "자료를 확인해 주세요", category: "업무", note: "자료 검토를 요청할 때" },
  { japanese: "仕様を確認してください", koreanPronunciation: "시요오오 카쿠닌시테 쿠다사이", meaning: "사양을 확인해 주세요", category: "업무", note: "제품 사양 확인을 요청할 때" },
  { japanese: "仕様変更は可能ですか？", koreanPronunciation: "시요오헨코오와 카노오데스카?", meaning: "사양 변경은 가능합니까?", category: "업무", note: "사양 변경 가능 여부를 물을 때" },
  { japanese: "価格を教えてください", koreanPronunciation: "카카쿠오 오시에테 쿠다사이", meaning: "가격을 알려 주세요", category: "업무", note: "가격 정보를 요청할 때" },
  { japanese: "納期を短縮できますか？", koreanPronunciation: "노오키오 탄슈쿠 데키마스카?", meaning: "납기를 단축할 수 있습니까?", category: "업무", note: "납기 단축 가능 여부를 물을 때" },
  { japanese: "サンプルを送ってください", koreanPronunciation: "산푸루오 옷테 쿠다사이", meaning: "샘플을 보내 주세요", category: "업무", note: "샘플 요청 시" },
  { japanese: "図面を送付してください", koreanPronunciation: "즈멘오 소오후시테 쿠다사이", meaning: "도면을 송부해 주세요", category: "업무", note: "도면 요청 시" },
  { japanese: "不具合が発生しました", koreanPronunciation: "후구아이가 핫세이시마시타", meaning: "불량이 발생했습니다", category: "업무", note: "문제 발생을 보고할 때" },
  { japanese: "原因を確認しています", koreanPronunciation: "겐인오 카쿠닌시테이마스", meaning: "원인을 확인하고 있습니다", category: "업무", note: "원인 조사 중임을 말할 때" },
  { japanese: "対策を検討しています", koreanPronunciation: "타이사쿠오 켄토오시테이마스", meaning: "대책을 검토하고 있습니다", category: "업무", note: "대응 방안을 검토 중일 때" },
  { japanese: "回答をお待ちしております", koreanPronunciation: "카이토오오 오마치시테오리마스", meaning: "답변 기다리겠습니다", category: "업무", note: "메일 끝맺음으로 자주 쓰는 표현" },
  { japanese: "早急に対応お願いします", koreanPronunciation: "소오큐우니 타이오오 오네가이시마스", meaning: "조속한 대응 부탁드립니다", category: "업무", note: "긴급 대응을 요청할 때" },
  { japanese: "問題があればご連絡ください", koreanPronunciation: "몬다이가 아레바 고렌라쿠쿠다사이", meaning: "문제가 있으면 연락 주세요", category: "업무", note: "상대에게 확인을 요청할 때" },
  { japanese: "ご検討よろしくお願いします", koreanPronunciation: "고켄토오 요로시쿠 오네가이시마스", meaning: "검토 부탁드립니다", category: "업무", note: "제안이나 요청 후 마무리할 때" },
  { japanese: "ご対応ありがとうございます", koreanPronunciation: "고타이오오 아리가토오 고자이마스", meaning: "대응 감사합니다", category: "업무", note: "처리에 감사할 때" },
  { japanese: "今後ともよろしくお願いします", koreanPronunciation: "콩고토모 요로시쿠 오네가이시마스", meaning: "앞으로도 잘 부탁드립니다", category: "업무", note: "업무 관계에서 마무리 인사로 사용" },

  // ===== 친구 =====
  { japanese: "今何してる？", koreanPronunciation: "이마 난시테루?", meaning: "지금 뭐 해?", category: "친구", note: "친구에게 가볍게 물을 때" },
  { japanese: "今日暇？", koreanPronunciation: "쿄오 히마?", meaning: "오늘 시간 있어?", category: "친구", note: "약속 가능 여부를 물을 때" },
  { japanese: "一緒に行こう", koreanPronunciation: "잇쇼니 이코오", meaning: "같이 가자", category: "친구", note: "함께 가자고 할 때" },
  { japanese: "どこ行く？", koreanPronunciation: "도코 이쿠?", meaning: "어디 갈래?", category: "친구", note: "갈 장소를 물을 때" },
  { japanese: "ご飯食べた？", koreanPronunciation: "고한 타베타?", meaning: "밥 먹었어?", category: "친구", note: "일상적으로 안부를 물을 때" },
  { japanese: "あとで会おう", koreanPronunciation: "아토데 아오오", meaning: "나중에 만나자", category: "친구", note: "나중에 만날 약속을 할 때" },
  { japanese: "久しぶり！", koreanPronunciation: "히사시부리!", meaning: "오랜만!", category: "친구", note: "오랜만에 만났을 때" },
  { japanese: "元気？", koreanPronunciation: "겐키?", meaning: "잘 지냈어?", category: "친구", note: "친구에게 안부를 물을 때" },
  { japanese: "それいいね", koreanPronunciation: "소레 이이네", meaning: "그거 좋다", category: "친구", note: "상대 의견에 긍정할 때" },
  { japanese: "マジで？", koreanPronunciation: "마지데?", meaning: "진짜?", category: "친구", note: "놀라거나 반응할 때" },
  { japanese: "ちょっと待って", koreanPronunciation: "촛토 맛테", meaning: "잠깐만", category: "친구", note: "잠시 기다려 달라고 할 때" },
  { japanese: "後で連絡する", koreanPronunciation: "아토데 렌라쿠스루", meaning: "나중에 연락할게", category: "친구", note: "추후 연락을 말할 때" },
  { japanese: "眠い", koreanPronunciation: "네무이", meaning: "졸려", category: "친구", note: "상태를 가볍게 말할 때" },
  { japanese: "疲れた", koreanPronunciation: "츠카레타", meaning: "피곤해", category: "친구", note: "피곤함을 말할 때" },
  { japanese: "楽しかった", koreanPronunciation: "타노시캇타", meaning: "재밌었다", category: "친구", note: "좋았던 경험을 말할 때" },
  { japanese: "また行こう", koreanPronunciation: "마타 이코오", meaning: "또 가자", category: "친구", note: "다음 약속을 자연스럽게 말할 때" },
  { japanese: "写真送って", koreanPronunciation: "샤신 옷테", meaning: "사진 보내줘", category: "친구", note: "사진을 요청할 때" },
  { japanese: "何食べたい？", koreanPronunciation: "나니 타베타이?", meaning: "뭐 먹고 싶어?", category: "친구", note: "메뉴를 정할 때" },
  { japanese: "どっちがいい？", koreanPronunciation: "돗치가 이이?", meaning: "어느 쪽이 좋아?", category: "친구", note: "선택을 물을 때" },
  { japanese: "大丈夫？", koreanPronunciation: "다이조오부?", meaning: "괜찮아?", category: "친구", note: "상대 상태를 걱정할 때" },
  { japanese: "無理しないで", koreanPronunciation: "무리시나이데", meaning: "무리하지 마", category: "친구", note: "상대를 배려할 때" },
  { japanese: "すごいね", koreanPronunciation: "스고이네", meaning: "대단하네", category: "친구", note: "칭찬할 때" },
  { japanese: "分かった", koreanPronunciation: "와캇타", meaning: "알겠어", category: "친구", note: "이해했음을 말할 때" },
  { japanese: "知らなかった", koreanPronunciation: "시라나캇타", meaning: "몰랐어", category: "친구", note: "새로운 정보를 들었을 때" },
  { japanese: "いいと思う", koreanPronunciation: "이이토 오모우", meaning: "좋다고 생각해", category: "친구", note: "의견을 말할 때" },
  { japanese: "ちょっと難しい", koreanPronunciation: "촛토 무즈카시이", meaning: "조금 어려워", category: "친구", note: "난이도나 상황을 말할 때" },
  { japanese: "助かった", koreanPronunciation: "타스캇타", meaning: "도움 됐어", category: "친구", note: "고마움을 자연스럽게 표현할 때" },
  { japanese: "ありがとう", koreanPronunciation: "아리가토오", meaning: "고마워", category: "친구", note: "친구에게 감사할 때" },
  { japanese: "ごめんね", koreanPronunciation: "고멘네", meaning: "미안해", category: "친구", note: "가볍게 사과할 때" },
  { japanese: "またね", koreanPronunciation: "마타네", meaning: "또 봐", category: "친구", note: "헤어질 때 인사" },] as Sentence[]).map((sentence) => ({
  ...sentence,
  reading: sentence.reading ?? sentence.japanese,
  koreanPronunciation: sentence.koreanPronunciation ?? "발음 참고 준비 중",
}));

const STORAGE_KEY = "savedSentences";
const WRONG_SENTENCES_KEY = "wrongSentences";

type Category = "전체" | "여행" | "업무" | "친구" | "일상";
type Mode = "학습" | "퀴즈";
type QuizType = "jp-to-kr" | "kr-to-jp";

interface QuizState {
  question: Sentence;
  choices: string[];
  quizType: QuizType;
  selected: string | null;
  isCorrect: boolean | null;
}

type AppSettings = {
  ttsRate: number;
  repeatCount: number;
  showKoreanPronunciation: boolean;
  showReading: boolean;
};

const APP_SETTINGS_KEY = "japaneseAppSettings";
const DEFAULT_SETTINGS: AppSettings = {
  ttsRate: 1,
  repeatCount: 1,
  showKoreanPronunciation: true,
  showReading: true,
};

function speakJapaneseFallback(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = 0.9;
  setTimeout(() => {
    window.speechSynthesis.speak(utter);
  }, 50);
}

async function speakJapanese(text: string) {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("TTS API error");
    const { audioContent } = await res.json();
    if (!audioContent) throw new Error("No audioContent");

    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
    audio.onerror = () => speakJapaneseFallback(text);
    await audio.play();
  } catch {
    speakJapaneseFallback(text);
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuiz(pool: Sentence[]): QuizState {
  const shuffled = shuffle(pool);
  const question = shuffled[0];
  const quizType: QuizType = Math.random() < 0.5 ? "jp-to-kr" : "kr-to-jp";

  const wrongCandidates = shuffled.slice(1);
  const wrongs = shuffle(wrongCandidates).slice(0, 3);

  let correctAnswer: string;
  let wrongAnswers: string[];

  if (quizType === "jp-to-kr") {
    correctAnswer = question.meaning;
    wrongAnswers = wrongs.map((s) => s.meaning);
  } else {
    correctAnswer = question.japanese;
    wrongAnswers = wrongs.map((s) => s.japanese);
  }

  const choices = shuffle([correctAnswer, ...wrongAnswers]);

  return {
    question,
    choices,
    quizType,
    selected: null,
    isCorrect: null,
  };
}

export default function SentencesPage() {
  const [savedSentences, setSavedSentences] = useState<Sentence[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>("학습");
  const [category, setCategory] = useState<Category>("전체");
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_SETTINGS_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedSentences(JSON.parse(raw) as Sentence[]);
      }
    } catch {
      // 무시
    }
  }, []);

  const filteredSentences = SENTENCES.filter(
    (s) => category === "전체" || s.category === category
  );

  const startQuiz = useCallback(() => {
    const pool = SENTENCES.filter(
      (s) => category === "전체" || s.category === category
    );
    if (pool.length < 4) return;
    setQuiz(generateQuiz(pool));
    setScore({ correct: 0, total: 0 });
  }, [category]);

  useEffect(() => {
    if (mode === "퀴즈") {
      startQuiz();
    }
  }, [mode, startQuiz]);

  const isSaved = (s: Sentence) =>
    savedSentences.some((x) => x.japanese === s.japanese);

  const handleSave = (s: Sentence) => {
    if (isSaved(s)) return;
    const next = [...savedSentences, s];
    setSavedSentences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveWrongSentence = (q: QuizState) => {
    try {
      const raw = localStorage.getItem(WRONG_SENTENCES_KEY);
      const prev: Array<{
        japanese: string;
        meaning: string;
        category: string;
        note: string;
        quizType: QuizType;
        createdAt: string;
      }> = raw ? JSON.parse(raw) : [];

      const isDuplicate = prev.some(
        (x) => x.japanese === q.question.japanese && x.quizType === q.quizType
      );
      if (isDuplicate) return;

      const next = [
        ...prev,
        {
          japanese: q.question.japanese,
          meaning: q.question.meaning,
          category: q.question.category,
          note: q.question.note,
          quizType: q.quizType,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(WRONG_SENTENCES_KEY, JSON.stringify(next));
    } catch {
      // 무시
    }
  };

  const handleChoiceSelect = (choice: string) => {
    if (!quiz || quiz.selected !== null) return;

    const correctAnswer =
      quiz.quizType === "jp-to-kr"
        ? quiz.question.meaning
        : quiz.question.japanese;

    const isCorrect = choice === correctAnswer;

    const updatedQuiz = { ...quiz, selected: choice, isCorrect };
    setQuiz(updatedQuiz);
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (!isCorrect) {
      saveWrongSentence(updatedQuiz);
    }
  };

  const handleNextQuiz = () => {
    const pool = SENTENCES.filter(
      (s) => category === "전체" || s.category === category
    );
    if (pool.length < 4) return;
    setQuiz(generateQuiz(pool));
  };

  const CATEGORIES: Category[] = ["전체", "여행", "업무", "친구", "일상"];

  return (
    <section>
      <div className="page-header">
        <h1>문장 학습</h1>
        <p className="muted" style={{ margin: 0 }}>
          문장을 확인하고 저장해 보세요.{" "}
          <span style={{ color: "#222" }}>저장 {savedSentences.length}개</span>
        </p>
      </div>

      {/* 모드 전환 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {(["학습", "퀴즈"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="btn"
            style={{
              fontWeight: mode === m ? 700 : 400,
              background: mode === m ? "#222" : undefined,
              color: mode === m ? "#fff" : undefined,
            }}
          >
            {m} 모드
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="btn"
            style={{
              fontSize: "13px",
              padding: "4px 12px",
              fontWeight: category === c ? 700 : 400,
              background: category === c ? "#444" : undefined,
              color: category === c ? "#fff" : undefined,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 학습 모드 */}
      {mode === "학습" && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredSentences.map((s) => {
            const saved = isSaved(s);
            return (
              <li key={s.japanese} className="card" style={{ marginBottom: "14px" }}>
                <div>
                  <div className="jp-text">{s.japanese}</div>
                  {settings.showReading && (
                    <div style={{ marginTop: "8px", color: "#444", fontSize: "14px" }}>
                      <span className="label" style={{ marginRight: "6px" }}>읽기</span>
                      {s.reading}
                    </div>
                  )}
                  {settings.showKoreanPronunciation && (
                    <div style={{ marginTop: "4px", color: "#666", fontSize: "14px" }}>
                      <span className="label" style={{ marginRight: "6px" }}>한글 발음 참고</span>
                      {s.koreanPronunciation}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="label">뜻</div>
                    <span className="badge">{s.category}</span>
                  </div>
                  <div>{s.meaning}</div>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <div className="label">설명</div>
                  <div style={{ color: "#555" }}>{s.note}</div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => speakJapanese(s.japanese)}
                    className="btn"
                    type="button"
                  >
                    듣기
                  </button>
                  <button
                    onClick={() => handleSave(s)}
                    disabled={saved}
                    className="btn"
                  >
                    {saved ? "저장됨" : "저장"}
                  </button>
                </div>
              </li>
            );
          })}
          {filteredSentences.length === 0 && (
            <li style={{ color: "#888", textAlign: "center", padding: "32px 0" }}>
              해당 카테고리의 문장이 없습니다.
            </li>
          )}
        </ul>
      )}

      {/* 퀴즈 모드 */}
      {mode === "퀴즈" && (
        <div>
          {/* 점수 */}
          <div
            className="card"
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600 }}>점수</span>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              {score.correct} / {score.total}
            </span>
          </div>

          {filteredSentences.length < 4 ? (
            <div
              className="card"
              style={{ textAlign: "center", color: "#888", padding: "32px 0" }}
            >
              퀴즈를 위해 해당 카테고리에 최소 4개의 문장이 필요합니다.
            </div>
          ) : quiz ? (
            <div className="card">
              {/* 문제 유형 */}
              <div style={{ marginBottom: "8px" }}>
                <span className="badge">
                  {quiz.quizType === "jp-to-kr"
                    ? "일본어 → 한국어"
                    : "한국어 → 일본어"}
                </span>
              </div>

              {/* 문제 */}
              <div
                style={{
                  fontSize: quiz.quizType === "jp-to-kr" ? "22px" : "18px",
                  fontWeight: 700,
                  margin: "16px 0",
                  lineHeight: 1.4,
                }}
              >
                {quiz.quizType === "jp-to-kr"
                  ? quiz.question.japanese
                  : quiz.question.meaning}
              </div>

              {/* TTS (일본어 문제일 때) */}
              {quiz.quizType === "jp-to-kr" && (
                <div style={{ marginBottom: "16px" }}>
                  <button
                    className="btn"
                    onClick={() => speakJapanese(quiz.question.japanese)}
                    type="button"
                  >
                    듣기
                  </button>
                </div>
              )}

              {/* 보기 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {quiz.choices.map((choice, idx) => {
                  const correctAnswer =
                    quiz.quizType === "jp-to-kr"
                      ? quiz.question.meaning
                      : quiz.question.japanese;
                  const isSelected = quiz.selected === choice;
                  const isCorrectChoice = choice === correctAnswer;
                  const revealed = quiz.selected !== null;

                  let bg = "transparent";
                  let border = "1.5px solid #ddd";
                  let color = "#222";

                  if (revealed) {
                    if (isCorrectChoice) {
                      bg = "#d4f5d4";
                      border = "1.5px solid #4caf50";
                      color = "#1b5e20";
                    } else if (isSelected && !isCorrectChoice) {
                      bg = "#fde8e8";
                      border = "1.5px solid #e53935";
                      color = "#b71c1c";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={revealed}
                      style={{
                        padding: "12px 10px",
                        borderRadius: "8px",
                        border,
                        background: bg,
                        color,
                        fontWeight: isSelected || (revealed && isCorrectChoice) ? 700 : 400,
                        fontSize: "14px",
                        cursor: revealed ? "default" : "pointer",
                        textAlign: "left",
                        lineHeight: 1.4,
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ opacity: 0.5, marginRight: "6px" }}>
                        {idx + 1}.
                      </span>
                      {choice}
                    </button>
                  );
                })}
              </div>

              {/* 정답/오답 피드백 */}
              {quiz.selected !== null && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: quiz.isCorrect ? "#d4f5d4" : "#fde8e8",
                    color: quiz.isCorrect ? "#1b5e20" : "#b71c1c",
                    fontWeight: 600,
                    marginBottom: "14px",
                    fontSize: "15px",
                  }}
                >
                  {quiz.isCorrect ? "✓ 정답입니다!" : "✗ 오답입니다."}
                  {!quiz.isCorrect && (
                    <div style={{ fontWeight: 400, marginTop: "4px", fontSize: "13px" }}>
                      정답:{" "}
                      <strong>
                        {quiz.quizType === "jp-to-kr"
                          ? quiz.question.meaning
                          : quiz.question.japanese}
                      </strong>
                    </div>
                  )}
                  <div style={{ fontWeight: 400, marginTop: "4px", fontSize: "13px", opacity: 0.8 }}>
                    {quiz.question.note}
                  </div>
                </div>
              )}

              {/* 다음 문제 버튼 */}
              {quiz.selected !== null && (
                <button
                  className="btn"
                  onClick={handleNextQuiz}
                  style={{ fontWeight: 700, width: "100%" }}
                >
                  다음 문제
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
