interface Props {
  apiType: "openai" | "anthropic" | null;
}

export default function ApiNotice({ apiType }: Props) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <h3 className="font-bold text-blue-900">APIの利用について</h3>

      <div className="space-y-2 text-sm text-blue-800">
        <p>
          <span className="font-medium">🔒 セキュリティについて：</span>
          <br />
          APIキーはお使いのブラウザのローカルストレージにのみ保存され、外部に送信されることはありません。
          LLMのAPI呼び出し時のみ使用されます。
        </p>

        <p>
          <span className="font-medium">💰 利用料金について：</span>
          <br />
          {apiType === "openai" ? (
            <>
              OpenAI APIの利用には料金が発生します。
              1リクエストあたりの料金は使用するモデルによって異なります。 詳細は
              <a
                href="https://openai.com/ja-JP/api/pricing/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAIの料金ページ
              </a>
              をご確認ください。
            </>
          ) : apiType === "anthropic" ? (
            <>
              Anthropic APIの利用には料金が発生します。
              利用料金は入力と出力のトークン数に基づいて計算されます。 詳細は
              <a
                href="https://www.anthropic.com/pricing#anthropic-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Anthropicの料金ページ
              </a>
              をご確認ください。
            </>
          ) : (
            <>
              APIの利用には各サービスの料金体系に基づいて料金が発生します。
              詳細は各サービスの料金ページをご確認ください。
            </>
          )}
        </p>

        <p>
          <span className="font-medium">⚠️ 注意事項：</span>
          <br />
          ・APIキーは定期的な更新をお勧めします
          <br />
          ・大量のリクエストにご注意ください
          <br />
          ・生成されたTipsは参考情報としてお使いください
        </p>
      </div>
    </div>
  );
}
