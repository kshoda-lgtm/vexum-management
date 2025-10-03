# Firebase設定手順

このアプリをスマホとPCで同期させるために、Firebaseの設定が必要です。

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: vexum-management）
4. Googleアナリティクスは不要なので無効化してOK
5. 「プロジェクトを作成」をクリック

## 2. Realtime Databaseの有効化

1. 左メニューから「構築」→「Realtime Database」を選択
2. 「データベースを作成」をクリック
3. ロケーションは「asia-southeast1」（シンガポール）を選択
4. セキュリティルールは「テストモードで開始」を選択
5. 「有効にする」をクリック

## 3. セキュリティルールの設定

データベース作成後、「ルール」タブで以下のルールに変更：

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**注意**: このルールは誰でも読み書きできます。本番環境では認証を追加することを推奨します。

## 4. Firebase設定の取得

1. プロジェクト概要ページで歯車アイコン→「プロジェクトの設定」
2. 下にスクロールして「マイアプリ」セクションへ
3. 「</> ウェブ」アイコンをクリック
4. アプリのニックネームを入力（例: vexum-web）
5. 「アプリを登録」をクリック
6. 表示された設定情報をコピー

## 5. アプリへの設定

`src/firebase.js` ファイルを開き、以下の部分を先ほどコピーした値に置き換えます：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ここに実際の値を入力
  authDomain: "YOUR_AUTH_DOMAIN",      // ここに実際の値を入力
  databaseURL: "YOUR_DATABASE_URL",    // ここに実際の値を入力
  projectId: "YOUR_PROJECT_ID",        // ここに実際の値を入力
  storageBucket: "YOUR_STORAGE_BUCKET",// ここに実際の値を入力
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ここに実際の値を入力
  appId: "YOUR_APP_ID"                 // ここに実際の値を入力
};
```

## 6. デプロイ

設定が完了したら、以下のコマンドでビルド＆デプロイ：

```bash
npm run build
cd dist
git init
git add -A
git commit -m "deploy"
git push -f https://github.com/kshoda-lgtm/vexum-management.git master:gh-pages
cd ..
```

## 無料枠について

Firebaseの無料枠（Sparkプラン）：
- **ストレージ**: 1GB
- **ダウンロード**: 10GB/月
- **同時接続**: 100接続

### 無料枠を超えた場合

- **自動停止**: Firebaseは無料枠を超えると自動的にリクエストを拒否します
- **通知表示**: アプリ上に「無料枠の上限に達しました」というエラーが表示されます
- **データ保護**: ローカルのデータは保持されます
- **課金なし**: 自動的に課金されることはありません

### 使用量の確認方法

1. Firebase Console を開く
2. 左メニューから「使用量と請求」を選択
3. Realtime Database の使用状況を確認

## トラブルシューティング

### データが同期されない場合

1. ブラウザのコンソール（F12）でエラーを確認
2. Firebase Console でデータベースルールを確認
3. `src/firebase.js` の設定が正しいか確認

### 無料枠を超えた場合

1. 古いデータを削除してストレージを節約
2. 必要に応じて有料プラン（Blazeプラン）への移行を検討
   - 従量課金制
   - 無料枠を超えた分のみ課金

## セキュリティ改善（オプション）

現在の設定では誰でもアクセス可能です。セキュリティを強化する場合：

1. Firebase Authentication を有効化
2. セキュリティルールを以下のように変更：

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

3. アプリにログイン機能を追加
