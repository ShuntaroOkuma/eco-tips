import { NextResponse } from "next/server";
import type { ParsedData, ApiConfig } from "../../../types";
import {
  GoogleGenerativeAI,
  GenerateContentRequest,
} from "@google/generative-ai";

const OPENAI_SYSTEM_PROMPT = `あなたは省エネアドバイザーです。
与えられたデータを基に、エコな生活のためのTipsを10個生成してください。
各Tipsは50文字以内で、具体的で実行可能な内容にしてください。
回答はTipsを数字付きの箇条書きにした内容のみにしてください。ヘッダや前置き、まとめなどは不要です。`;

const ANTHROPIC_SYSTEM_PROMPT = `あなたは省エネアドバイザーです。
与えられたデータを基に、エコな生活のためのTipsを10個生成してください。
各Tipsは50文字以内で、具体的で実行可能な内容にしてください。
回答はTipsを数字付きの箇条書きにした内容のみにしてください。ヘッダや前置き、まとめなどは不要です。`;

const GEMINI_SYSTEM_PROMPT = `あなたは省エネアドバイザーです。
与えられたデータを基に、エコな生活のためのTipsを10個生成してください。
各Tipsは50文字以内で、具体的で実行可能な内容にしてください。
回答はTipsを数字付きの箇条書きにした内容のみにしてください。ヘッダや前置き、まとめなどは不要です。`;

export async function POST(request: Request) {
  try {
    const { data, config } = (await request.json()) as {
      data: ParsedData;
      config: ApiConfig;
    };

    const userPrompt = `
現在のデータ:
- 先月の電力使用量: ${data.electricity}kWh
- 先月の水使用量: ${data.water}L
- 気温: ${data.temperature}℃
- 湿度: ${data.humidity}%
- 天気: ${data.weather}
- 在室人数: ${data.people}人

このデータを基に、エコな生活のためのTipsを10個生成してください。`;

    if (config.type === "openai") {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: OPENAI_SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(
          {
            error: `OpenAI API error: ${
              error.error?.message || "Unknown error"
            }`,
          },
          { status: response.status }
        );
      }

      const result = await response.json();
      const tips = result.choices[0].message.content
        .split("\n")
        .filter((line: string) => line.trim())
        .slice(0, 10);

      return NextResponse.json({ tips });
    } else if (config.type === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
          system: ANTHROPIC_SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Anthropic API Error:", errorData);

        let errorMessage = "エラーが発生しました";
        if (errorData.error) {
          if (errorData.error.type === "authentication_error") {
            errorMessage = "APIキーが無効です";
          } else if (errorData.error.type === "rate_limit_error") {
            errorMessage =
              "APIの利用制限に達しました。しばらく時間をおいて再度お試しください。";
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      const result = await response.json();
      if (
        !result.content ||
        !Array.isArray(result.content) ||
        result.content.length === 0
      ) {
        return NextResponse.json(
          { error: "Unexpected response format from Anthropic API" },
          { status: 500 }
        );
      }

      const content = result.content[0].text || "";
      const tips = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line && !line.match(/^\d+\./))
        .slice(0, 10);

      return NextResponse.json({ tips });
    } else if (config.type === "gemini") {
      if (!config.projectId) {
        return NextResponse.json(
          { error: "Gemini APIにはプロジェクトIDが必要です" },
          { status: 400 }
        );
      }

      try {
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const contentRequest: GenerateContentRequest = {
          contents: [
            {
              role: "user",
              parts: [{ text: `${GEMINI_SYSTEM_PROMPT}\n\n${userPrompt}` }],
            },
          ],
        };

        const result = await model.generateContent(contentRequest);

        const response = await result.response;
        const content = response.text();

        const tips = content
          .split("\n")
          .map((line: string) => line.trim())
          .filter((line: string) => line && !line.match(/^\d+\./))
          .slice(0, 10);

        return NextResponse.json({ tips });
      } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Gemini APIでエラーが発生しました",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "無効なAPI種別です" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    let errorMessage = "エラーが発生しました";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes("API key")) {
        statusCode = 401;
        errorMessage = "APIキーが無効です";
      } else if (error.message.includes("rate limit")) {
        statusCode = 429;
        errorMessage =
          "APIの利用制限に達しました。しばらく時間をおいて再度お試しください。";
      } else if (error.message.includes("model")) {
        statusCode = 400;
        errorMessage = "無効なモデルが指定されました";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}
