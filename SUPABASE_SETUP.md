# Supabase設定手順

このアプリをスマホとPCで同期させるために、Supabaseの設定が必要です。

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/) にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインイン
4. 「New project」をクリック
5. 以下を入力：
   - **Name**: `vexum-management` （任意の名前でOK）
   - **Database Password**: 自動生成されたものをそのまま使用（必ずメモしてください！）
   - **Region**: `Northeast Asia (Tokyo)`
6. 「Create new project」をクリック

## 2. データベーステーブルの作成

プロジェクト作成後、左メニューから「Table Editor」を選択：

### テーブル作成手順

1. 「Create a new table」をクリック
2. 以下の設定でテーブルを作成：

```sql
-- Table Editorの「SQL Editor」タブを開いて以下を実行

CREATE TABLE app_data (
  id BIGINT PRIMARY KEY DEFAULT 1,
  staff JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  meetings JSONB DEFAULT '[]'::jsonb,
  reports JSONB DEFAULT '[]'::jsonb,
  shifts JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (id = 1)
);

-- 初期データを挿入
INSERT INTO app_data (id, staff, tasks, meetings, reports, shifts)
VALUES (1, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb);

-- Realtime機能を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE app_data;
```

## 3. Row Level Security (RLS) の設定

セキュリティポリシーを設定します。Table Editorで `app_data` テーブルを開き、「RLS」タブへ：

```sql
-- RLSを有効化
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーが読み書き可能なポリシー（開発用）
CREATE POLICY "誰でも読み取り可能" ON app_data
  FOR SELECT USING (true);

CREATE POLICY "誰でも更新可能" ON app_data
  FOR UPDATE USING (true);

CREATE POLICY "誰でも挿入可能" ON app_data
  FOR INSERT WITH CHECK (true);
```

**注意**: このポリシーは誰でもアクセス可能です。本番環境では認証を追加することを推奨します。

## 4. API KeyとURLの取得

1. 左メニューから「Settings」→「API」を選択
2. 以下の2つをコピー：
   - **Project URL** (例: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (非常に長い文字列)

## 5. アプリへの設定

`src/supabase.js` ファイルを開き、コピーした値を入力：

```javascript
const supabaseUrl = 'https://xxxxxxxxxxxxx.supabase.co';  // Project URLを入力
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cC...';      // anon keyを入力
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

Supabaseの無料枠（Freeプラン）：
- **データベース**: 500MB
- **ストレージ**: 1GB
- **帯域幅**: 5GB/月
- **リアルタイム接続**: 200同時接続

### 無料枠を超えた場合

- **自動停止**: Supabaseは無料枠を超えると自動的にリクエストを拒否します
- **通知表示**: アプリ上に「無料枠の上限に達しました」というエラーが表示されます
- **課金なし**: 自動的に課金されることはありません（手動でアップグレードが必要）

### 使用量の確認方法

1. Supabase Dashboard を開く
2. 左メニューから「Settings」→「Usage」を選択
3. データベースとAPIの使用状況を確認

## トラブルシューティング

### データが同期されない場合

1. ブラウザのコンソール（F12）でエラーを確認
2. Supabase Dashboard でテーブルとRLSポリシーを確認
3. `src/supabase.js` の設定が正しいか確認

### Realtime機能が動作しない場合

1. SQL Editorで以下を実行：
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE app_data;
```

2. ブラウザをリロード

## セキュリティ改善（オプション）

現在の設定では誰でもアクセス可能です。セキュリティを強化する場合：

### 1. 認証を有効化

左メニュー「Authentication」→「Providers」でEmailまたはGoogle認証を有効化

### 2. RLSポリシーを変更

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "誰でも読み取り可能" ON app_data;
DROP POLICY IF EXISTS "誰でも更新可能" ON app_data;
DROP POLICY IF EXISTS "誰でも挿入可能" ON app_data;

-- 認証済みユーザーのみアクセス可能
CREATE POLICY "認証済みユーザーのみ読み取り" ON app_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "認証済みユーザーのみ更新" ON app_data
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "認証済みユーザーのみ挿入" ON app_data
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 3. アプリにログイン機能を追加

```javascript
// ログイン例
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```
