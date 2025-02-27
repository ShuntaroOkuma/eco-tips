import type { ParsedData, ApiConfig } from "../types";

const OPENAI_SYSTEM_PROMPT = `あなたは省エネアドバイザーです。
与えられたデータを基に、エコな生活のためのTipsを10個生成してください。
各Tipsは50文字以内で、具体的で実行可能な内容にしてください。`;

const ANTHROPIC_SYSTEM_PROMPT = `あなたは省エネアドバイザーです。
与えられたデータを基に、エコな生活のためのTipsを10個生成してください。
各Tipsは50文字以内で、具体的で実行可能な内容にしてください。`;

export async function generateTips(
  data: ParsedData,
  config: ApiConfig
): Promise<string[]> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, config }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "APIリクエストに失敗しました");
  }

  const result = await response.json();
  return result.tips;
}
