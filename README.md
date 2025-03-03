# エコ Tips ジェネレーター

電力と水の消費データ、気温、湿度、天気、在室人数を入力することで、エコな生活をするための Tips を 10 個生成する Web アプリケーションです。

## 機能

- 電力使用量、水使用量、気温、湿度、天気、在室人数のデータ入力
- OpenAI、Anthropic、Gemini の API を使用した Tips 生成
- データの永続化（localStorage）
- レスポンシブデザイン
- エラーハンドリング

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI API / Anthropic API / Gemini API

## 必要条件

- Node.js 18.0.0 以上
- 以下のいずれかの API キー：
  - OpenAI API キー
  - Anthropic API キー
  - Gemini API キー（Google Cloud のプロジェクト ID も必要）

## インストール方法

```bash
# リポジトリのクローン
git clone [リポジトリURL]
cd eco-tips

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 使用方法

1. アプリケーションを起動し、ブラウザで`http://localhost:3000`にアクセス
2. 使用する API を選択し、必要な認証情報を設定：
   - OpenAI: API キー
   - Anthropic: API キー
   - Gemini: API キーとプロジェクト ID
3. 以下のような形式でデータを入力：
   ```
   電力使用量: 15kWh
   水使用量: 150L
   気温: 28℃
   湿度: 65%
   天気: 曇り
   在室人数: 3人
   ```
4. 「データを確認」をクリックして入力内容を確認
5. 「確定して Tips を生成」をクリックして Tips を生成

## データ入力について

- 1 つのテキストエリアで自由形式の入力が可能
- 入力データは自動的に解析されます
- 不足しているデータがある場合は指摘されます
- 解析結果は確認画面で確認できます

## API の利用について

### セキュリティ

- API キーはブラウザのローカルストレージにのみ保存され、外部に送信されることはありません
- サーバーサイドでの API 呼び出し時のみ使用されます
- API キーは「API キーを削除」ボタンでいつでも削除可能です
- セキュリティのため、API キーは定期的な更新を推奨します

### 利用料金

このアプリケーションでは、選択した LLM サービスの API を使用します。
API の利用には各サービスの料金体系に基づいて料金が発生します：

#### OpenAI API

- GPT-3.5-turbo モデルを使用
- 1 リクエストあたりの料金は使用するモデルによって異なります
- 詳細は[OpenAI の料金ページ](https://openai.com/pricing)をご確認ください

#### Anthropic API

- Claude 3 Sonnet モデルを使用
- 入力と出力のトークン数に基づいて料金が計算されます
- 詳細は[Anthropic の料金ページ](https://www.anthropic.com/pricing)をご確認ください

#### Gemini API

- Gemini Pro モデルを使用
- 入力と出力のトークン数に基づいて料金が計算されます
- Google Cloud のプロジェクト ID が必要です
- 詳細は[Google Cloud の料金ページ](https://ai.google.dev/gemini-api/docs/pricing?hl=ja)をご確認ください

### API キーの管理

- API キーは「API キーを削除」ボタンで削除できます
- 新しい API キーはいつでも再設定可能です
- OpenAI、Anthropic、Gemini の API を切り替えて使用できます

## エラーハンドリング

以下のような場合にエラーメッセージが表示されます：

- API キーが無効な場合
- API のレート制限に達した場合
- データが不足している場合
- Tips 生成に失敗した場合
- プロジェクト ID が無効な場合（Gemini API）

## 注意事項

- API キーは適切に管理してください
- 大量のリクエストを送信しないようご注意ください
- 生成された Tips は参考情報として使用してください

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。
