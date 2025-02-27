import { NextResponse } from "next/server";
import type { ParsedData, ApiConfig } from "../../../types";

const OPENAI_SYSTEM_PROMPT = `あなたは省エネアドバイザーです。
与えられたデータを基に、エコな生活のためのTipsを10個生成してください。
各Tipsは50文字以内で、具体的で実行可能な内容にしてください。
回答はTipsを数字付きの箇条書きにした内容のみにしてください。ヘッダや前置き、まとめなどは不要です。`;

const ANTHROPIC_SYSTEM_PROMPT = `あなたは省エネアドバイザーです。
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
    } else {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1024,
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
      // let content = `
      //         '# エコライフTips\n' +
      //         '\n' +
      //         '1. 未使用の部屋の照明はこまめに消しましょう\n' +
      //         '2. シャワー時間を1分短縮すると約10Lの水が節約できます\n' +
      //         '3. 晴れの日は自然光を活用し、カーテンを開けましょう\n' +
      //         '4. 25℃なら冷房は28℃設定で十分快適に過ごせます\n' +
      //         '5. こまめな水道の蛇口閉めで無駄な水使用を防ぎましょう\n' +
      //         '6. 使わない電化製品はコンセントから抜きましょう\n' +
      //         '7. 2人で料理すると効率的にエネルギーが節約できます\n' +
      //         '8. 洗濯物は天気がいい日に外干しすると乾燥機が不要です\n' +
      //         '9. PCやスマホの画面の明るさを下げて省エネしましょう\n' +
      //         '10. 冷蔵庫の開閉回数を減らして電力消費を抑えましょう'
      // `;
      console.log("Anthropic API content:", content);

      const tips = content
        .replace(/'|\+/g, "")
        .replace(/\n\n/g, "\n")
        .split("\n")
        .filter((line: string) => line.trim())
        .slice(0, 10);

      console.log("Tips:", tips);

      // if (tips.length < 10) {
      //   return NextResponse.json(
      //     { error: "生成されたTipsが不足しています" },
      //     { status: 500 }
      //   );
      // }

      return NextResponse.json({ tips });
    }
  } catch (error) {
    console.error("API Error:", error);
    let errorMessage = "Unknown error occurred";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes("API key")) {
        statusCode = 401;
        errorMessage = "Invalid API key";
      } else if (error.message.includes("rate limit")) {
        statusCode = 429;
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (error.message.includes("model")) {
        statusCode = 400;
        errorMessage = "Invalid model specified";
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
