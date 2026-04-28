"use client";

import { useEffect, useState, useCallback } from "react";

type Word = {
  word: string;
  reading?: string;
  koreanPronunciation?: string;
  meaning: string;
  example: string;
  exampleReading?: string;
  exampleKoreanPronunciation?: string;
  exampleMeaning?: string;
  category: "일상" | "여행" | "업무" | "친구";
};

const WORDS: Word[] = [
  // ===== 여행 =====
  { word: "入口", reading: "いりぐち", koreanPronunciation: "이리구치", meaning: "입구", example: "入口はどこですか？", exampleReading: "いりぐちはどこですか？", exampleKoreanPronunciation: "이리구치와 도코데스카?", exampleMeaning: "입구가 어디인가요?", category: "여행" },
  { word: "出口", reading: "でぐち", koreanPronunciation: "데구치", meaning: "출구", example: "出口はこちらです", exampleMeaning: "출구는 이쪽입니다", exampleReading: "でぐちはこちらです", exampleKoreanPronunciation: "데구치와 고치라데스", category: "여행" },
  { word: "会計", reading: "かいけい", koreanPronunciation: "카이케이", meaning: "계산", example: "会計お願いします", exampleMeaning: "계산 부탁드립니다", exampleReading: "かいけいおねがいします", exampleKoreanPronunciation: "카이케이 오네가이시마스", category: "여행" },
  { word: "予約", reading: "よやく", koreanPronunciation: "요야쿠", meaning: "예약", example: "予約しています", exampleMeaning: "예약했습니다", exampleReading: "よやくしています", exampleKoreanPronunciation: "요야쿠시테이마스", category: "여행" },
  { word: "注文", reading: "ちゅうもん", koreanPronunciation: "츄몬", meaning: "주문", example: "注文いいですか？", exampleMeaning: "주문해도 될까요?", exampleReading: "ちゅうもんいいですか？", exampleKoreanPronunciation: "츄몬 이이데스카?", category: "여행" },
  { word: "おすすめ", reading: "おすすめ", koreanPronunciation: "오스스메", meaning: "추천", example: "おすすめは何ですか？", exampleMeaning: "추천 메뉴는 무엇인가요?", exampleReading: "おすすめはなんですか？", exampleKoreanPronunciation: "오스스메와 난데스카?", category: "여행" },
  { word: "水", reading: "みず", koreanPronunciation: "미즈", meaning: "물", example: "水をください", exampleMeaning: "물 주세요", exampleReading: "みずをください", exampleKoreanPronunciation: "미즈오 구다사이", category: "여행" },
  { word: "お茶", reading: "おちゃ", koreanPronunciation: "오챠", meaning: "차", example: "お茶お願いします", exampleMeaning: "차 부탁드립니다", exampleReading: "おちゃおねがいします", exampleKoreanPronunciation: "오챠 오네가이시마스", category: "여행" },
  { word: "トイレ", reading: "トイレ", koreanPronunciation: "토이레", meaning: "화장실", example: "トイレはどこですか？", exampleMeaning: "화장실은 어디인가요?", exampleReading: "トイレはどこですか？", exampleKoreanPronunciation: "토이레와 도코데스카?", category: "여행" },
  { word: "駅", reading: "えき", koreanPronunciation: "에키", meaning: "역", example: "駅に行きます", exampleMeaning: "역에 갑니다", exampleReading: "えきにいきます", exampleKoreanPronunciation: "에키니 이키마스", category: "여행" },
  { word: "電車", reading: "でんしゃ", koreanPronunciation: "덴샤", meaning: "전철", example: "電車に乗ります", exampleMeaning: "전철을 탑니다", exampleReading: "でんしゃにのります", exampleKoreanPronunciation: "덴샤니 노리마스", category: "여행" },
  { word: "バス", reading: "バス", koreanPronunciation: "바스", meaning: "버스", example: "バスで行きます", exampleMeaning: "버스로 갑니다", exampleReading: "バスでいきます", exampleKoreanPronunciation: "바스데 이키마스", category: "여행" },
  { word: "ホテル", reading: "ホテル", koreanPronunciation: "호테루", meaning: "호텔", example: "ホテルに泊まります", exampleMeaning: "호텔에 묵습니다", exampleReading: "ホテルにとまります", exampleKoreanPronunciation: "호테루니 토마리마스", category: "여행" },
  { word: "地図", reading: "ちず", koreanPronunciation: "치즈", meaning: "지도", example: "地図を見せてください", exampleMeaning: "지도 좀 보여주세요", exampleReading: "ちずをみせてください", exampleKoreanPronunciation: "치즈오 미세테 구다사이", category: "여행" },
  { word: "道", reading: "みち", koreanPronunciation: "미치", meaning: "길", example: "道を教えてください", exampleMeaning: "길을 알려주세요", exampleReading: "みちをおしえてください", exampleKoreanPronunciation: "미치오 오시에테 구다사이", category: "여행" },
  { word: "右", reading: "みぎ", koreanPronunciation: "미기", meaning: "오른쪽", example: "右に曲がってください", exampleMeaning: "오른쪽으로 돌아주세요", exampleReading: "みぎにまがってください", exampleKoreanPronunciation: "미기니 마갓테 구다사이", category: "여행" },
  { word: "左", reading: "ひだり", koreanPronunciation: "히다리", meaning: "왼쪽", example: "左に行ってください", exampleMeaning: "왼쪽으로 가주세요", exampleReading: "ひだりにいってください", exampleKoreanPronunciation: "히다리니 잇테 구다사이", category: "여행" },
  { word: "まっすぐ", reading: "まっすぐ", koreanPronunciation: "맛스구", meaning: "직진", example: "まっすぐ行ってください", exampleMeaning: "곧장 가주세요", exampleReading: "まっすぐいってください", exampleKoreanPronunciation: "맛스구 잇테 구다사이", category: "여행" },
  { word: "遠い", reading: "とおい", koreanPronunciation: "토오이", meaning: "멀다", example: "ここは遠いです", exampleMeaning: "여기는 멉니다", exampleReading: "ここはとおいです", exampleKoreanPronunciation: "고코와 토오이데스", category: "여행" },
  { word: "近い", reading: "ちかい", koreanPronunciation: "치카이", meaning: "가깝다", example: "駅は近いです", exampleMeaning: "역은 가깝습니다", exampleReading: "えきはちかいです", exampleKoreanPronunciation: "에키와 치카이데스", category: "여행" },

  // ===== 업무 =====
  { word: "納期", reading: "のうき", koreanPronunciation: "노키", meaning: "납기", example: "納期はいつですか？", exampleMeaning: "납기는 언제인가요?", exampleReading: "のうきはいつですか？", exampleKoreanPronunciation: "노키와 이츠데스카?", category: "업무" },
  { word: "見積", reading: "みつもり", koreanPronunciation: "미츠모리", meaning: "견적", example: "見積をお願いします", exampleMeaning: "견적 부탁드립니다", exampleReading: "みつもりをおねがいします", exampleKoreanPronunciation: "미츠모리오 오네가이시마스", category: "업무" },
  { word: "仕様", reading: "しよう", koreanPronunciation: "시요", meaning: "사양", example: "仕様を確認してください", exampleMeaning: "사양을 확인해 주세요", exampleReading: "しようをかくにんしてください", exampleKoreanPronunciation: "시요오 카쿠닌시테 구다사이", category: "업무" },
  { word: "確認", reading: "かくにん", koreanPronunciation: "카쿠닌", meaning: "확인", example: "確認お願いします", exampleMeaning: "확인 부탁드립니다", exampleReading: "かくにんおねがいします", exampleKoreanPronunciation: "카쿠닌 오네가이시마스", category: "업무" },
  { word: "依頼", reading: "いらい", koreanPronunciation: "이라이", meaning: "의뢰", example: "依頼があります", exampleMeaning: "의뢰할 일이 있습니다", exampleReading: "いらいがあります", exampleKoreanPronunciation: "이라이가 아리마스", category: "업무" },
  { word: "資料", reading: "しりょう", koreanPronunciation: "시료", meaning: "자료", example: "資料を送ります", exampleMeaning: "자료를 보내겠습니다", exampleReading: "しりょうをおくります", exampleKoreanPronunciation: "시료오 오쿠리마스", category: "업무" },
  { word: "送付", reading: "そうふ", koreanPronunciation: "소후", meaning: "송부", example: "メールで送付します", exampleMeaning: "메일로 송부하겠습니다", exampleReading: "メールでそうふします", exampleKoreanPronunciation: "메루데 소후시마스", category: "업무" },
  { word: "連絡", reading: "れんらく", koreanPronunciation: "렌라쿠", meaning: "연락", example: "後で連絡します", exampleMeaning: "나중에 연락드리겠습니다", exampleReading: "あとでれんらくします", exampleKoreanPronunciation: "아토데 렌라쿠시마스", category: "업무" },
  { word: "対応", reading: "たいおう", koreanPronunciation: "타이오", meaning: "대응", example: "対応します", exampleMeaning: "대응하겠습니다", exampleReading: "たいおうします", exampleKoreanPronunciation: "타이오시마스", category: "업무" },
  { word: "変更", reading: "へんこう", koreanPronunciation: "헨코", meaning: "변경", example: "内容を変更します", exampleMeaning: "내용을 변경하겠습니다", exampleReading: "ないようをへんこうします", exampleKoreanPronunciation: "나이요오 헨코시마스", category: "업무" },
  { word: "追加", reading: "ついか", koreanPronunciation: "츠이카", meaning: "추가", example: "項目を追加します", exampleMeaning: "항목을 추가하겠습니다", exampleReading: "こうもくをついかします", exampleKoreanPronunciation: "코모쿠오 츠이카시마스", category: "업무" },
  { word: "削除", reading: "さくじょ", koreanPronunciation: "사쿠죠", meaning: "삭제", example: "データを削除します", exampleMeaning: "데이터를 삭제하겠습니다", exampleReading: "データをさくじょします", exampleKoreanPronunciation: "데타오 사쿠죠시마스", category: "업무" },
  { word: "問題", reading: "もんだい", koreanPronunciation: "몬다이", meaning: "문제", example: "問題があります", exampleMeaning: "문제가 있습니다", exampleReading: "もんだいがあります", exampleKoreanPronunciation: "몬다이가 아리마스", category: "업무" },
  { word: "原因", reading: "げんいん", koreanPronunciation: "겐인", meaning: "원인", example: "原因を確認します", exampleMeaning: "원인을 확인하겠습니다", exampleReading: "げんいんをかくにんします", exampleKoreanPronunciation: "겐인오 카쿠닌시마스", category: "업무" },
  { word: "結果", reading: "けっか", koreanPronunciation: "켁카", meaning: "결과", example: "結果を報告します", exampleMeaning: "결과를 보고하겠습니다", exampleReading: "けっかをほうこくします", exampleKoreanPronunciation: "켁카오 호코쿠시마스", category: "업무" },
  { word: "進捗", reading: "しんちょく", koreanPronunciation: "신초쿠", meaning: "진행상황", example: "進捗はどうですか？", exampleMeaning: "진행 상황은 어떠신가요?", exampleReading: "しんちょくはどうですか？", exampleKoreanPronunciation: "신초쿠와 도데스카?", category: "업무" },
  { word: "会議", reading: "かいぎ", koreanPronunciation: "카이기", meaning: "회의", example: "会議があります", exampleMeaning: "회의가 있습니다", exampleReading: "かいぎがあります", exampleKoreanPronunciation: "카이기가 아리마스", category: "업무" },
  { word: "担当", reading: "たんとう", koreanPronunciation: "탄토", meaning: "담당", example: "担当者は誰ですか？", exampleMeaning: "담당자는 누구인가요?", exampleReading: "たんとうしゃはだれですか？", exampleKoreanPronunciation: "탄토샤와 다레데스카?", category: "업무" },
  { word: "報告", reading: "ほうこく", koreanPronunciation: "호코쿠", meaning: "보고", example: "報告します", exampleMeaning: "보고하겠습니다", exampleReading: "ほうこくします", exampleKoreanPronunciation: "호코쿠시마스", category: "업무" },
  { word: "相談", reading: "そうだん", koreanPronunciation: "소단", meaning: "상담", example: "相談したいです", exampleMeaning: "상담하고 싶습니다", exampleReading: "そうだんしたいです", exampleKoreanPronunciation: "소단시타이데스", category: "업무" },

  // ===== 일상 =====
  { word: "今日", reading: "きょう", koreanPronunciation: "쿄", meaning: "오늘", example: "今日は忙しいです", exampleMeaning: "오늘은 바쁩니다", exampleReading: "きょうはいそがしいです", exampleKoreanPronunciation: "쿄와 이소가시이데스", category: "일상" },
  { word: "明日", reading: "あした", koreanPronunciation: "아시타", meaning: "내일", example: "明日会いましょう", exampleMeaning: "내일 만나요", exampleReading: "あしたあいましょう", exampleKoreanPronunciation: "아시타 아이마쇼", category: "일상" },
  { word: "昨日", reading: "きのう", koreanPronunciation: "키노", meaning: "어제", example: "昨日は楽しかったです", exampleMeaning: "어제는 즐거웠어요", exampleReading: "きのうはたのしかったです", exampleKoreanPronunciation: "키노와 타노시캇타데스", category: "일상" },
  { word: "今", reading: "いま", koreanPronunciation: "이마", meaning: "지금", example: "今何してる？", exampleMeaning: "지금 뭐 하고 있어?", exampleReading: "いまなにしてる？", exampleKoreanPronunciation: "이마 나니시테루?", category: "일상" },
  { word: "後で", reading: "あとで", koreanPronunciation: "아토데", meaning: "나중에", example: "後で行きます", exampleMeaning: "나중에 갈게요", exampleReading: "あとでいきます", exampleKoreanPronunciation: "아토데 이키마스", category: "일상" },
  { word: "一緒に", reading: "いっしょに", koreanPronunciation: "잇쇼니", meaning: "함께", example: "一緒に行こう", exampleMeaning: "같이 가자", exampleReading: "いっしょにいこう", exampleKoreanPronunciation: "잇쇼니 이코", category: "일상" },
  { word: "友達", reading: "ともだち", koreanPronunciation: "토모다치", meaning: "친구", example: "友達と遊ぶ", exampleMeaning: "친구와 논다", exampleReading: "ともだちとあそぶ", exampleKoreanPronunciation: "토모다치토 아소부", category: "일상" },
  { word: "家族", reading: "かぞく", koreanPronunciation: "카조쿠", meaning: "가족", example: "家族と住んでいます", exampleMeaning: "가족과 함께 살고 있습니다", exampleReading: "かぞくとすんでいます", exampleKoreanPronunciation: "카조쿠토 슨데이마스", category: "일상" },
  { word: "仕事", reading: "しごと", koreanPronunciation: "시고토", meaning: "일", example: "仕事が忙しい", exampleMeaning: "일이 바쁘다", exampleReading: "しごとがいそがしい", exampleKoreanPronunciation: "시고토가 이소가시이", category: "일상" },
  { word: "休み", reading: "やすみ", koreanPronunciation: "야스미", meaning: "휴식", example: "今日は休みです", exampleMeaning: "오늘은 쉬는 날입니다", exampleReading: "きょうはやすみです", exampleKoreanPronunciation: "쿄와 야스미데스", category: "일상" },
  { word: "趣味", reading: "しゅみ", koreanPronunciation: "슈미", meaning: "취미", example: "趣味は何ですか？", exampleMeaning: "취미가 무엇인가요?", exampleReading: "しゅみはなんですか？", exampleKoreanPronunciation: "슈미와 난데스카?", category: "일상" },
  { word: "映画", reading: "えいが", koreanPronunciation: "에이가", meaning: "영화", example: "映画を見ます", exampleMeaning: "영화를 봅니다", exampleReading: "えいがをみます", exampleKoreanPronunciation: "에이가오 미마스", category: "일상" },
  { word: "音楽", reading: "おんがく", koreanPronunciation: "온가쿠", meaning: "음악", example: "音楽を聞く", exampleMeaning: "음악을 듣는다", exampleReading: "おんがくをきく", exampleKoreanPronunciation: "온가쿠오 키쿠", category: "일상" },
  { word: "ご飯", reading: "ごはん", koreanPronunciation: "고항", meaning: "밥", example: "ご飯食べた？", exampleMeaning: "밥 먹었어?", exampleReading: "ごはんたべた？", exampleKoreanPronunciation: "고항 타베타?", category: "일상" },
  { word: "美味しい", reading: "おいしい", koreanPronunciation: "오이시이", meaning: "맛있다", example: "これ美味しい！", exampleMeaning: "이거 맛있다!", exampleReading: "これおいしい！", exampleKoreanPronunciation: "고레 오이시이!", category: "일상" },
  { word: "楽しい", reading: "たのしい", koreanPronunciation: "타노시이", meaning: "재밌다", example: "楽しかった", exampleMeaning: "즐거웠어", exampleReading: "たのしかった", exampleKoreanPronunciation: "타노시캇타", category: "일상" },
  { word: "疲れた", reading: "つかれた", koreanPronunciation: "츠카레타", meaning: "피곤하다", example: "ちょっと疲れた", exampleMeaning: "조금 피곤해", exampleReading: "ちょっとつかれた", exampleKoreanPronunciation: "쵸토 츠카레타", category: "일상" },
  { word: "眠い", reading: "ねむい", koreanPronunciation: "네무이", meaning: "졸리다", example: "眠いです", exampleMeaning: "졸립니다", exampleReading: "ねむいです", exampleKoreanPronunciation: "네무이데스", category: "일상" },
  { word: "忙しい", reading: "いそがしい", koreanPronunciation: "이소가시이", meaning: "바쁘다", example: "今忙しい", exampleMeaning: "지금 바빠", exampleReading: "いまいそがしい", exampleKoreanPronunciation: "이마 이소가시이", category: "일상" },
  { word: "暇", reading: "ひま", koreanPronunciation: "히마", meaning: "한가하다", example: "暇だよ", exampleMeaning: "한가해", exampleReading: "ひまだよ", exampleKoreanPronunciation: "히마다요", category: "일상" },

  // ===== 친구 =====
  { word: "友達", reading: "ともだち", koreanPronunciation: "토모다치", meaning: "친구", example: "友達と会いたい", exampleMeaning: "친구를 만나고 싶어", exampleReading: "ともだちとあいたい", exampleKoreanPronunciation: "토모다치토 아이타이", category: "친구" },
  { word: "一緒に", reading: "いっしょに", koreanPronunciation: "잇쇼니", meaning: "함께", example: "一緒に遊ぼう", exampleMeaning: "같이 놀자", exampleReading: "いっしょにあそぼう", exampleKoreanPronunciation: "잇쇼니 아소보", category: "친구" },
  { word: "遊ぶ", reading: "あそぶ", koreanPronunciation: "아소부", meaning: "놀다", example: "明日遊ばない？", exampleMeaning: "내일 놀지 않을래?", exampleReading: "あしたあそばない？", exampleKoreanPronunciation: "아시타 아소바나이?", category: "친구" },
  { word: "会う", reading: "あう", koreanPronunciation: "아우", meaning: "만나다", example: "今日会えない？", exampleMeaning: "오늘 만날 수 없어?", exampleReading: "きょうあえない？", exampleKoreanPronunciation: "쿄 아에나이?", category: "친구" },
  { word: "楽しい", reading: "たのしい", koreanPronunciation: "타노시이", meaning: "즐겁다", example: "今日すごく楽しかった", exampleMeaning: "오늘 정말 즐거웠어", exampleReading: "きょうすごくたのしかった", exampleKoreanPronunciation: "쿄 스고쿠 타노시캇타", category: "친구" },
  { word: "久しぶり", reading: "ひさしぶり", koreanPronunciation: "히사시부리", meaning: "오랜만", example: "久しぶり！元気だった？", exampleMeaning: "오랜만이야! 잘 지냈어?", exampleReading: "ひさしぶり！げんきだった？", exampleKoreanPronunciation: "히사시부리! 겐키닷타?", category: "친구" },
  { word: "元気", reading: "げんき", koreanPronunciation: "겐키", meaning: "건강함/잘 지냄", example: "最近元気？", exampleMeaning: "요즘 잘 지내?", exampleReading: "さいきんげんき？", exampleKoreanPronunciation: "사이킨 겐키?", category: "친구" },
  { word: "暇", reading: "ひま", koreanPronunciation: "히마", meaning: "한가함", example: "今日暇だから遊ぼう", exampleMeaning: "오늘 한가하니까 놀자", exampleReading: "きょうひまだからあそぼう", exampleKoreanPronunciation: "쿄 히마다카라 아소보", category: "친구" },
  { word: "約束", reading: "やくそく", koreanPronunciation: "야쿠소쿠", meaning: "약속", example: "約束忘れないでね", exampleMeaning: "약속 잊지 마", exampleReading: "やくそくわすれないでね", exampleKoreanPronunciation: "야쿠소쿠 와스레나이데네", category: "친구" },
  { word: "連絡", reading: "れんらく", koreanPronunciation: "렌라쿠", meaning: "연락", example: "後で連絡してね", exampleMeaning: "나중에 연락해 줘", exampleReading: "あとでれんらくしてね", exampleKoreanPronunciation: "아토데 렌라쿠시테네", category: "친구" },
  { word: "写真", reading: "しゃしん", koreanPronunciation: "샤신", meaning: "사진", example: "一緒に写真撮ろう", exampleMeaning: "같이 사진 찍자", exampleReading: "いっしょにしゃしんとろう", exampleKoreanPronunciation: "잇쇼니 샤신 토로", category: "친구" },
  { word: "ご飯", reading: "ごはん", koreanPronunciation: "고항", meaning: "밥", example: "一緒にご飯食べよう", exampleMeaning: "같이 밥 먹자", exampleReading: "いっしょにごはんたべよう", exampleKoreanPronunciation: "잇쇼니 고항 타베요", category: "친구" },
  { word: "映画", reading: "えいが", koreanPronunciation: "에이가", meaning: "영화", example: "映画一緒に見ない？", exampleMeaning: "영화 같이 보지 않을래?", exampleReading: "えいがいっしょにみない？", exampleKoreanPronunciation: "에이가 잇쇼니 미나이?", category: "친구" },
  { word: "音楽", reading: "おんがく", koreanPronunciation: "온가쿠", meaning: "음악", example: "この音楽好き？", exampleMeaning: "이 음악 좋아해?", exampleReading: "このおんがくすき？", exampleKoreanPronunciation: "코노 온가쿠 스키?", category: "친구" },
  { word: "好き", reading: "すき", koreanPronunciation: "스키", meaning: "좋아함", example: "これ好きだよ", exampleMeaning: "이거 좋아해", exampleReading: "これすきだよ", exampleKoreanPronunciation: "고레 스키다요", category: "친구" },
  { word: "大丈夫", reading: "だいじょうぶ", koreanPronunciation: "다이죠부", meaning: "괜찮음", example: "大丈夫？心配してたよ", exampleMeaning: "괜찮아? 걱정했어", exampleReading: "だいじょうぶ？しんぱいしてたよ", exampleKoreanPronunciation: "다이죠부? 신파이시테타요", category: "친구" },
  { word: "本当", reading: "ほんとう", koreanPronunciation: "혼토오", meaning: "정말", example: "本当に楽しかった！", exampleMeaning: "정말 즐거웠어!", exampleReading: "ほんとうにたのしかった！", exampleKoreanPronunciation: "혼토니 타노시캇타!", category: "친구" },
  { word: "すごい", reading: "すごい", koreanPronunciation: "스고이", meaning: "대단함", example: "すごい！さすがだね", exampleMeaning: "대단해! 역시 너답다", exampleReading: "すごい！さすがだね", exampleKoreanPronunciation: "스고이! 사스가다네", category: "친구" },
  { word: "ありがとう", reading: "ありがとう", koreanPronunciation: "아리가토오", meaning: "고마워", example: "来てくれてありがとう", exampleMeaning: "와줘서 고마워", exampleReading: "きてくれてありがとう", exampleKoreanPronunciation: "키테쿠레테 아리가토", category: "친구" },
  { word: "またね", reading: "またね", koreanPronunciation: "마타네", meaning: "또 봐", example: "またね！楽しかったよ", exampleMeaning: "또 보자! 즐거웠어", exampleReading: "またね！たのしかったよ", exampleKoreanPronunciation: "마타네! 타노시캇타요", category: "친구" },
];

const STORAGE_KEY = "savedWords";
const WRONG_WORDS_KEY = "wrongWords";
type CategoryFilter = "전체" | "여행" | "업무" | "일상" | "친구";
type QuizType = "jp-to-kr" | "kr-to-jp" | "jp-to-kor-pron";
type PageMode = "study" | "quiz";

type WrongWord = {
  word: string;
  meaning: string;
  example: string;
  category: Word["category"];
  quizType: QuizType;
  createdAt: string;
};

function getWordKey(w: Pick<Word, "word" | "meaning" | "category">) {
  return `${w.word}|${w.meaning}|${w.category}`;
}

function normalizeSavedWord(item: Partial<Word>): Word | null {
  if (!item.word || !item.meaning || !item.example || !item.category) return null;

  return {
    word: item.word,
    reading: item.reading,
    koreanPronunciation: item.koreanPronunciation,
    meaning: item.meaning,
    example: item.example,
    exampleReading: item.exampleReading,
    exampleKoreanPronunciation: item.exampleKoreanPronunciation,
    exampleMeaning: item.exampleMeaning,
    category: item.category as Word["category"],
  };
}

function saveWrongWord(w: Word, quizType: QuizType) {
  try {
    const raw = localStorage.getItem(WRONG_WORDS_KEY);
    const prev: WrongWord[] = raw ? JSON.parse(raw) : [];
    const currentWordKey = getWordKey(w);
    const alreadyExists = prev.some(
      (item) =>
        getWordKey(item) === currentWordKey &&
        item.quizType === quizType
    );
    if (alreadyExists) return;
    const next: WrongWord[] = [
      ...prev,
      {
        word: w.word,
        meaning: w.meaning,
        example: w.example,
        category: w.category,
        quizType,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(next));
  } catch {}
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getChoices(correct: Word, pool: Word[], quizType: QuizType): string[] {
  const others = pool.filter((w) => getWordKey(w) !== getWordKey(correct));
  const shuffled = shuffle(others).slice(0, 3);
  const all = shuffle([...shuffled, correct]);
  if (quizType === "jp-to-kr") return all.map((w) => w.meaning);
  if (quizType === "kr-to-jp") return all.map((w) => w.word);
  return all.map((w) => w.koreanPronunciation ?? "");
}

export default function WordsPage() {
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [mode, setMode] = useState<PageMode>("study");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("전체");

  // 퀴즈 상태
  const [quizType, setQuizType] = useState<QuizType>("jp-to-kr");
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<Word>[];
      if (!Array.isArray(parsed)) return;

      const next = parsed
        .map((item) => normalizeSavedWord(item))
        .filter((item): item is Word => item !== null);

      setSavedWords(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const isSaved = (w: Word) =>
    savedWords.some((s) => getWordKey(s) === getWordKey(w));

  const handleSaveToggle = (w: Word) => {
    const targetKey = getWordKey(w);
    const next = isSaved(w)
      ? savedWords.filter((saved) => getWordKey(saved) !== targetKey)
      : [...savedWords, w];

    setSavedWords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const filteredWords =
    categoryFilter === "전체"
      ? WORDS
      : WORDS.filter((w) => w.category === categoryFilter);

  const quizPool =
    quizType === "jp-to-kor-pron"
      ? filteredWords.filter((w) => Boolean(w.koreanPronunciation))
      : filteredWords;

  const generateQuiz = useCallback(
    (pool: Word[], type: QuizType) => {
      if (pool.length < 4) return;
      const word = pool[Math.floor(Math.random() * pool.length)];
      setCurrentWord(word);
      setChoices(getChoices(word, pool, type));
      setSelected(null);
    },
    []
  );

  useEffect(() => {
    if (mode === "quiz") {
      generateQuiz(quizPool, quizType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, categoryFilter, quizType]);

  const handleAnswer = (choice: string) => {
    if (selected !== null || !currentWord) return;
    setSelected(choice);
    const correctAnswer =
      quizType === "jp-to-kr"
        ? currentWord.meaning
        : quizType === "kr-to-jp"
          ? currentWord.word
          : currentWord.koreanPronunciation ?? "";
    const isCorrect = choice === correctAnswer;
    if (!isCorrect) {
      saveWrongWord(currentWord, quizType);
    }
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const handleNext = () => {
    generateQuiz(quizPool, quizType);
  };

  const correctAnswer = currentWord
    ? quizType === "jp-to-kr"
      ? currentWord.meaning
      : quizType === "kr-to-jp"
        ? currentWord.word
        : currentWord.koreanPronunciation ?? ""
    : "";

  const CATEGORIES: CategoryFilter[] = ["전체", "여행", "업무", "일상", "친구"];

  return (
    <section>
      <div className="page-header">
        <h1>단어 학습</h1>
        <p className="muted" style={{ margin: 0 }}>
          단어를 확인하고 저장해 보세요.{" "}
          <span style={{ color: "#222" }}>저장 {savedWords.length}개</span>
        </p>
      </div>

      {/* 모드 전환 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          className="btn"
          onClick={() => setMode("study")}
          style={{
            flex: 1,
            background: mode === "study" ? "#222" : "transparent",
            color: mode === "study" ? "#fff" : "#222",
            border: "1.5px solid #222",
            fontWeight: 600,
          }}
        >
          학습 모드
        </button>
        <button
          className="btn"
          onClick={() => {
            setMode("quiz");
            setScore({ correct: 0, total: 0 });
          }}
          style={{
            flex: 1,
            background: mode === "quiz" ? "#222" : "transparent",
            color: mode === "quiz" ? "#fff" : "#222",
            border: "1.5px solid #222",
            fontWeight: 600,
          }}
        >
          퀴즈 모드
        </button>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="btn"
            onClick={() => {
              setCategoryFilter(cat);
              if (mode === "quiz") setScore({ correct: 0, total: 0 });
            }}
            style={{
              background: categoryFilter === cat ? "#555" : "transparent",
              color: categoryFilter === cat ? "#fff" : "#555",
              border: "1.5px solid #ccc",
              fontSize: "13px",
              padding: "6px 14px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ===== 학습 모드 ===== */}
      {mode === "study" && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredWords.map((w) => {
            const saved = isSaved(w);
            return (
              <li key={getWordKey(w)} className="card" style={{ marginBottom: "14px" }}>
                <div className="card-top">
                  <div className="jp-text">{w.word}</div>
                  <span className="badge">{w.category}</span>
                </div>
                {w.reading && (
                  <div style={{ marginTop: "6px" }}>
                    <div className="label">읽기</div>
                    <div style={{ color: "#444", fontSize: "15px" }}>{w.reading}</div>
                  </div>
                )}
                {w.koreanPronunciation && (
                  <div style={{ marginTop: "4px" }}>
                    <div className="label">한글 발음</div>
                    <div style={{ color: "#666", fontSize: "14px" }}>{w.koreanPronunciation}</div>
                  </div>
                )}
                <div style={{ marginTop: "10px" }}>
                  <div className="label">뜻</div>
                  <div>{w.meaning}</div>
                </div>
                {w.example && (
                  <>
                    <div style={{ marginTop: "10px" }}>
                      <div className="label">예문</div>
                      <div style={{ color: "#555" }}>{w.example}</div>
                    </div>
                    {w.exampleMeaning && (
                      <div style={{ marginTop: "4px" }}>
                        <div className="label">예문 뜻</div>
                        <div style={{ color: "#666", fontSize: "13px" }}>{w.exampleMeaning}</div>
                      </div>
                    )}
                    {w.exampleReading && (
                      <div style={{ marginTop: "4px" }}>
                        <div className="label">예문 읽기</div>
                        <div style={{ color: "#666", fontSize: "13px" }}>{w.exampleReading}</div>
                      </div>
                    )}
                    {w.exampleKoreanPronunciation && (
                      <div style={{ marginTop: "4px" }}>
                        <div className="label">예문 한글 발음</div>
                        <div style={{ color: "#888", fontSize: "13px" }}>{w.exampleKoreanPronunciation}</div>
                      </div>
                    )}
                  </>
                )}
                <div className="card-actions">
                  <button
                    onClick={() => handleSaveToggle(w)}
                    className="btn"
                  >
                    {saved ? "저장 취소" : "저장"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ===== 퀴즈 모드 ===== */}
      {mode === "quiz" && (
        <div>
          {quizPool.length < 4 ? (
            <div
              className="card"
              style={{ textAlign: "center", color: "#888", padding: "40px 20px" }}
            >
              {quizType === "jp-to-kor-pron"
                ? "발음 퀴즈를 위해 한글 발음이 있는 단어가 4개 이상 필요합니다."
                : "퀴즈를 위해 해당 카테고리에 단어가 4개 이상 필요합니다."}
            </div>
          ) : (
            <>
              {/* 점수 & 퀴즈 타입 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#555" }}>
                  점수:{" "}
                  <strong style={{ color: "#222" }}>
                    {score.correct} / {score.total}
                  </strong>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuizType("jp-to-kr");
                      setScore({ correct: 0, total: 0 });
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: quizType === "jp-to-kr" ? "#222" : "transparent",
                      color: quizType === "jp-to-kr" ? "#fff" : "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    일→뜻
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuizType("kr-to-jp");
                      setScore({ correct: 0, total: 0 });
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: quizType === "kr-to-jp" ? "#222" : "transparent",
                      color: quizType === "kr-to-jp" ? "#fff" : "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    뜻→일
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuizType("jp-to-kor-pron");
                      setScore({ correct: 0, total: 0 });
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: quizType === "jp-to-kor-pron" ? "#222" : "transparent",
                      color: quizType === "jp-to-kor-pron" ? "#fff" : "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    일→발음
                  </button>
                </div>
              </div>

              {/* 문제 카드 */}
              {currentWord && (
                <div className="card" style={{ marginBottom: "20px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <span className="badge">{currentWord.category}</span>
                  </div>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: 700,
                      textAlign: "center",
                      padding: "24px 0 4px",
                      letterSpacing: "2px",
                    }}
                  >
                    {quizType === "kr-to-jp" ? currentWord.meaning : currentWord.word}
                  </div>
                  {quizType === "jp-to-kr" && currentWord.reading && (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "2px",
                      }}
                    >
                      {currentWord.reading}
                    </div>
                  )}
                  {quizType === "jp-to-kr" && currentWord.koreanPronunciation && (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#999",
                        marginBottom: "2px",
                      }}
                    >
                      {currentWord.koreanPronunciation}
                    </div>
                  )}
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "13px",
                      color: "#aaa",
                      marginBottom: "8px",
                      marginTop: "4px",
                    }}
                  >
                    {quizType === "jp-to-kr"
                      ? "이 단어의 뜻은?"
                      : quizType === "kr-to-jp"
                        ? "이 뜻의 일본어는?"
                        : "이 단어의 한글 발음 참고를 고르세요"}
                  </div>

                  {/* 보기 */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    {choices.map((choice, idx) => {
                      const isCorrect = choice === correctAnswer;
                      const isSelected = choice === selected;
                      let bg = "transparent";
                      let color = "#222";
                      let border = "1.5px solid #ddd";

                      if (selected !== null) {
                        if (isCorrect) {
                          bg = "#e6f4ea";
                          color = "#1a7f37";
                          border = "1.5px solid #1a7f37";
                        } else if (isSelected) {
                          bg = "#fdecea";
                          color = "#c0392b";
                          border = "1.5px solid #c0392b";
                        }
                      }

                      return (
                        <button
                          key={`${choice}-${idx}`}
                          onClick={() => handleAnswer(choice)}
                          style={{
                            background: bg,
                            color,
                            border,
                            borderRadius: "10px",
                            padding: "14px 10px",
                            fontSize: "16px",
                            fontWeight: 600,
                            cursor: selected !== null ? "default" : "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>

                  {/* 피드백 */}
                  {selected !== null && (
                    <div
                      style={{
                        marginTop: "18px",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "18px",
                        color: selected === correctAnswer ? "#1a7f37" : "#c0392b",
                      }}
                    >
                      {selected === correctAnswer ? "정답! 🎉" : `오답 — 정답: ${correctAnswer}`}
                    </div>
                  )}

                  {/* 다음 문제 버튼 */}
                  {selected !== null && (
                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                      <button
                        className="btn"
                        onClick={handleNext}
                        style={{
                          background: "#222",
                          color: "#fff",
                          padding: "10px 32px",
                          fontWeight: 600,
                          fontSize: "15px",
                        }}
                      >
                        다음 문제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
