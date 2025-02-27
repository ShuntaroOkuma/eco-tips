"use client";

import { useState, useEffect } from "react";
import DataInput from "../components/DataInput";
import TipsDisplay from "../components/TipsDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorModal from "../components/ErrorModal";
import ApiNotice from "../components/ApiNotice";
import type { ParsedData, ApiConfig } from "../types";
import { generateTips } from "./api";

export default function Home() {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem("apiConfig");
    if (savedConfig) {
      setApiConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleApiConfig = (type: "openai" | "anthropic", apiKey: string) => {
    const config: ApiConfig = { type, apiKey };
    localStorage.setItem("apiConfig", JSON.stringify(config));
    setApiConfig(config);
  };

  const handleRemoveApiConfig = () => {
    localStorage.removeItem("apiConfig");
    setApiConfig(null);
    setTips([]);
  };

  const handleDataSubmit = async (data: ParsedData) => {
    if (!apiConfig) {
      setError("APIの設定が必要です");
      return;
    }

    setLoading(true);
    try {
      const newTips = await generateTips(data, apiConfig);
      setTips(newTips);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Tipsの生成に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">
          エコTips ジェネレーター
        </h1>

        <div className="space-y-4">
          <ApiNotice apiType={apiConfig?.type || null} />

          <h2 className="text-xl font-bold mt-8">API設定</h2>
          {!apiConfig ? (
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const apiKey = prompt("OpenAI APIキーを入力してください");
                  if (apiKey) handleApiConfig("openai", apiKey);
                }}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                OpenAI APIを使用
              </button>
              <button
                onClick={() => {
                  const apiKey = prompt("Anthropic APIキーを入力してください");
                  if (apiKey) handleApiConfig("anthropic", apiKey);
                }}
                className="flex-1 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
              >
                Anthropic API（Claude 3.7 Sonnet）を使用
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">現在の設定</p>
                <p className="font-medium">
                  {apiConfig.type === "openai" ? "OpenAI" : "Anthropic"}{" "}
                  APIを使用中
                </p>
              </div>
              <button
                onClick={handleRemoveApiConfig}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                APIキーを削除
              </button>
            </div>
          )}
        </div>

        {apiConfig && (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-bold">データ入力</h2>
              <DataInput onDataSubmit={handleDataSubmit} />
            </div>

            {loading && (
              <div className="text-center space-y-4">
                <p className="text-lg">エコTipsを生成中...</p>
                <LoadingSpinner />
              </div>
            )}

            {tips.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">エコTips</h2>
                <TipsDisplay tips={tips} />
              </div>
            )}
          </>
        )}

        {error && <ErrorModal error={error} onClose={() => setError(null)} />}
      </div>
    </main>
  );
}
