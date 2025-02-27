import { useState } from "react";
import type { EcoData, ParsedData } from "../types";

interface Props {
  onDataSubmit: (data: ParsedData) => void;
}

export default function DataInput({ onDataSubmit }: Props) {
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string>("");

  const parseInput = (text: string): ParsedData | null => {
    try {
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
      const data: Partial<EcoData> = {};

      for (const line of lines) {
        if (line.includes("電力") || line.includes("kWh")) {
          const match = line.match(/\d+(\.\d+)?/);
          if (match) data.electricity = parseFloat(match[0]);
        }
        if (
          line.includes("水") ||
          line.includes("L") ||
          line.includes("リットル")
        ) {
          const match = line.match(/\d+(\.\d+)?/);
          if (match) data.water = parseFloat(match[0]);
        }
        if (
          line.includes("気温") ||
          line.includes("温度") ||
          line.includes("℃")
        ) {
          const match = line.match(/\d+(\.\d+)?/);
          if (match) data.temperature = parseFloat(match[0]);
        }
        if (line.includes("湿度") || line.includes("%")) {
          const match = line.match(/\d+(\.\d+)?/);
          if (match) data.humidity = parseFloat(match[0]);
        }
        if (line.includes("天気")) {
          const match = line.match(/天気[は:]?\s*(.+)/);
          if (match) data.weather = match[1];
        }
        if (line.includes("人数") || line.includes("人")) {
          const match = line.match(/\d+/);
          if (match) data.people = parseInt(match[0]);
        }
      }

      if (
        !data.electricity ||
        !data.water ||
        !data.temperature ||
        !data.humidity ||
        !data.weather ||
        !data.people
      ) {
        throw new Error("必要なデータが不足しています");
      }

      return {
        ...(data as EcoData),
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = () => {
    const data = parseInput(inputText);
    if (data) {
      setParsedData(data);
      setError("");
    } else {
      setError(
        "データの形式が正しくありません。以下の情報を含めてください：\n- 電力使用量（kWh）\n- 水使用量（L）\n- 気温（℃）\n- 湿度（%）\n- 天気\n- 在室人数"
      );
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      onDataSubmit(parsedData);
      setInputText("");
      setParsedData(null);
    }
  };

  return (
    <div className="space-y-4">
      {!parsedData && (
        <>
          <textarea
            className="w-full h-64 p-4 border rounded-lg"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="データを入力してください（例：
先月の電力使用量: 10kWh
先月の水使用量: 200L
気温: 25℃
湿度: 60%
天気: 晴れ
在室人数: 2人）"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            データを確認
          </button>
        </>
      )}

      {parsedData && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">入力内容の確認</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>先月の電力使用量: {parsedData.electricity}kWh</p>
            <p>先月の水使用量: {parsedData.water}L</p>
            <p>気温: {parsedData.temperature}℃</p>
            <p>湿度: {parsedData.humidity}%</p>
            <p>天気: {parsedData.weather}</p>
            <p>在室人数: {parsedData.people}人</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setParsedData(null)}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
            >
              修正する
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              確定してTipsを生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
