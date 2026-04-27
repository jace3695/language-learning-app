import { NextResponse } from "next/server";

type RequestBody = {
  targetChar?: string;
  romaji?: string;
  imageDataUrl?: string;
};

type HandwritingFeedback = {
  summary: string;
  goodPoints: string;
  advice: string;
  exampleTip: string;
};

function buildPrompt(targetChar: string, romaji?: string): string {
  const romajiText = romaji?.trim() ? ` (로마자: ${romaji.trim()})` : "";

  return `너는 일본어 초보 학습자를 도와주는 친절한 선생님이야.
사용자가 쓴 글자를 보고 정답 글자와 비교해 짧고 부드럽게 피드백해줘.

정답 글자: ${targetChar}${romajiText}

반드시 지킬 규칙:
- 한국어로만 작성
- 너무 엄격하게 채점하지 말고, 초보 기준으로 격려 중심으로 작성
- 전체 모양이 정답 글자와 얼마나 비슷한지 설명
- 잘한 점 1개
- 고칠 점 1개
- 다음에 쓸 때 팁 1개
- 각 항목은 짧고 이해하기 쉽게

출력은 반드시 아래 JSON 형식만:
{"summary":"","goodPoints":"","advice":"","exampleTip":""}`;
}

function safeParseFeedback(raw: string): Partial<HandwritingFeedback> {
  if (!raw) return {};

  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1);
  }

  try {
    return JSON.parse(text) as Partial<HandwritingFeedback>;
  } catch {
    return {};
  }
}

function normalizeFeedback(parsed: Partial<HandwritingFeedback>): HandwritingFeedback {
  return {
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "전체적으로 정답 글자와 비슷하게 쓰려고 한 점이 좋아요.",
    goodPoints:
      typeof parsed.goodPoints === "string" && parsed.goodPoints.trim()
        ? parsed.goodPoints.trim()
        : "큰 흐름을 맞추려는 시도가 잘 보였어요.",
    advice:
      typeof parsed.advice === "string" && parsed.advice.trim()
        ? parsed.advice.trim()
        : "획의 시작과 끝을 조금 더 또렷하게 구분해 보세요.",
    exampleTip:
      typeof parsed.exampleTip === "string" && parsed.exampleTip.trim()
        ? parsed.exampleTip.trim()
        : "다음에는 천천히 한 획씩 순서를 의식하며 써보면 더 좋아져요.",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const targetChar = body.targetChar?.trim();
    const imageDataUrl = body.imageDataUrl?.trim();

    if (!targetChar || !imageDataUrl) {
      return NextResponse.json(
        { error: "targetChar와 imageDataUrl은 필수입니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY가 설정되어 있지 않습니다.",
          summary: "현재 AI 평가를 사용할 수 없어요.",
          goodPoints: "그래도 계속 써보는 연습 자체가 큰 도움이 돼요.",
          advice: "환경 변수 설정 후 다시 시도해 주세요.",
          exampleTip: "한 글자를 3번씩 반복해 쓰며 모양을 익혀보세요.",
        },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(targetChar, body.romaji);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        {
          error: `OpenAI API 요청 실패 (${response.status})`,
          detail: errorText.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = (data?.choices?.[0]?.message?.content as string | undefined) ?? "";
    const parsed = safeParseFeedback(content);
    const result = normalizeFeedback(parsed);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";

    return NextResponse.json(
      {
        error: "손글씨 피드백 처리 중 오류가 발생했습니다.",
        detail: message,
      },
      { status: 500 }
    );
  }
}
