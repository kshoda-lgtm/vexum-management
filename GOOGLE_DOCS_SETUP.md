# Google Docs連携 セットアップガイド

このガイドでは、日報を既存のGoogle Docsドキュメントに自動追記する機能の設定方法を説明します。

## 前提条件

- Googleアカウント
- 日報を記録するGoogle Docsドキュメント
- Google Apps Scriptの基本的な知識（推奨）

## セットアップ手順

### 1. Google Docsドキュメントの準備

1. Google Docsで日報用のドキュメントを作成または開きます
2. 以下のような見出し構造を設定します：

```
# 業務日報

## 2025-10-19（土）

### 常駐A

（ここに日報が自動追記されます）

### 常駐B

（ここに日報が自動追記されます）

## 2025-10-20（日）

### 常駐A

### 常駐B
```

3. ドキュメントIDをメモします
   - URLの `https://docs.google.com/document/d/DOCUMENT_ID/edit` から `DOCUMENT_ID` 部分をコピー

### 2. Google Apps Scriptプロジェクトの作成

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「DocsSync」などに変更
4. `gas-backend/DocsSync.gs` の内容をコピー＆ペースト
5. 「保存」をクリック

### 3. Web Appとしてデプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 種類の選択で「ウェブアプリ」を選択
3. 設定：
   - **説明**: DocsSync API v1
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック
5. 権限の承認画面が表示されたら、承認します
6. **デプロイ ID** と **ウェブアプリ URL** をコピーしてメモします

### 4. フロントエンドの環境変数設定

1. プロジェクトルートに `.env` ファイルを作成（`.env.example` を参考に）

```env
# Google Docs連携設定
VITE_GOOGLE_DOCS_ENABLED=true
VITE_GOOGLE_DOCS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_GOOGLE_DOC_ID=your-google-doc-id
VITE_DOC_DATE_HEADING_PATTERN=## {date}（{weekday}）
VITE_DOC_MEMBER_HEADING_PATTERN=### {name}
```

2. 以下の値を実際の値に置き換えます：
   - `YOUR_DEPLOYMENT_ID`: 手順3でコピーしたデプロイID
   - `your-google-doc-id`: 手順1でコピーしたドキュメントID
   - `{date}`: 日付フォーマット（例：2025-10-19）
   - `{name}`: ユーザー名（例：常駐A）

### 5. テスト

1. 開発サーバーを再起動：
```bash
npm run dev
```

2. 日報カレンダーから日付を選択し、日報を入力
3. 保存後、Google Docsドキュメントを確認
4. 該当日付・メンバーのセクションに日報が追記されていることを確認

## トラブルシューティング

### エラー: "Google Docs連携が有効化されていません"

- `.env` ファイルで `VITE_GOOGLE_DOCS_ENABLED=true` に設定されているか確認
- 開発サーバーを再起動

### エラー: "同期に失敗しました"

1. Google Apps ScriptのデプロイURLが正しいか確認
2. Google Apps Scriptのログを確認：
   - Apps Scriptエディタ → 「実行」→「ログ」
3. ドキュメントIDが正しいか確認
4. Google Apps Scriptの権限が正しく設定されているか確認

### 日報が追記されない

1. ドキュメントの見出し構造が正しいか確認
   - 日付見出し：`## 2025-10-19`
   - メンバー見出し：`### 常駐A`
2. 環境変数の `VITE_DOC_DATE_HEADING_PATTERN` と `VITE_DOC_MEMBER_HEADING_PATTERN` が一致しているか確認

### 重複して追記される

- 冪等性チェックが機能しているか確認
- ブラウザのコンソールログを確認

## セキュリティ考慮事項

- Google Apps Scriptは「自分として実行」に設定してください
- デプロイURLは外部に公開しないでください
- 本番環境では、適切なアクセス制御を実装してください

## 高度な設定

### カスタム見出しパターン

曜日を含める場合：
```env
VITE_DOC_DATE_HEADING_PATTERN=## {date}（{weekday}）
```

階層を変える場合：
```env
VITE_DOC_DATE_HEADING_PATTERN=### {date}
VITE_DOC_MEMBER_HEADING_PATTERN=#### {name}
```

### リトライ設定

`src/config/googleDocs.js` で設定を変更できます：
```javascript
RETRY_COUNT: 3,          // リトライ回数
RETRY_DELAY_MS: 1000,    // リトライ間隔（ミリ秒）
```

## サポート

問題が解決しない場合は、以下を確認してください：
- [Google Apps Script ドキュメント](https://developers.google.com/apps-script)
- [Google Docs API](https://developers.google.com/docs/api)
