# skecheck - スケジュール管理システム

スマホとPCで同期できる進捗管理・スケジュール管理システムです。

## 🌟 主な機能

### 📋 本日のタスク
- シンプルなタスクリスト
- 終了1週間前のタスク自動通知
- 日付が変わると自動リセット
- デフォルトで表示

### 👥 スタッフ管理
- スタッフ情報の登録・編集・削除
- プロジェクトごとの担当者管理

### 📅 スケジュール管理
- タスクの登録・進捗管理
- 担当者の割り当て
- ステータス管理（未着手/進行中/完了）

### 📝 ミーティング議事録
- 会議内容の記録
- 参加者・決定事項の管理

### 📊 月次レポート
- 自動レポート生成
- タスク完了率の集計
- スタッフ別の稼働状況

### 🗓️ シフト管理
- カレンダー形式のシフト表
- スクリーンショット保存機能

### 📈 タスクタイムライン
- カレンダービューとリストビュー
- タスクの色分け表示

### 📝 メモ
- 簡易メモ機能

### ☁️ データ同期
- Supabase Realtime Databaseによる自動同期
- スマホ↔PC間でリアルタイム同期
- 無料枠制限の自動検知と通知

## 🚀 セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Supabase設定

詳細は `SUPABASE_SETUP.md` を参照してください。

1. Supabase プロジェクトを作成
2. データベーステーブルを作成
3. `src/supabase.js` に設定情報を入力

### 3. 開発サーバーの起動

```bash
npm run dev
```

### 4. ビルド

```bash
npm run build
```

## 📱 デプロイ

GitHub Pagesにデプロイ済み：
https://kshoda-lgtm.github.io/vexum-management/

### 再デプロイ方法

```bash
npm run build
cd dist
git init
git add -A
git commit -m "deploy"
git push -f https://github.com/kshoda-lgtm/vexum-management.git master:gh-pages
cd ..
```

## 💾 データ管理

### バックアップ
- 「バックアップ管理」タブからJSON形式でエクスポート可能
- ダウンロードしたファイルを保存

### 復元
- JSONファイルをアップロードして復元

### 同期について
- Supabaseによる自動同期（設定後）
- スマホとPCで即座に反映
- 無料枠：データベース500MB、帯域幅5GB/月
- 上限到達時は自動停止＆通知表示

## 🛠️ 技術スタック

- **フロントエンド**: React 19 + Vite
- **スタイリング**: Tailwind CSS v3
- **アイコン**: Lucide React
- **日付処理**: date-fns
- **バックエンド**: Supabase (PostgreSQL + Realtime)
- **ホスティング**: GitHub Pages

## 📂 プロジェクト構成

```
src/
├── components/        # Reactコンポーネント
│   ├── StaffList.jsx
│   ├── ScheduleList.jsx
│   ├── MeetingList.jsx
│   ├── ReportGenerator.jsx
│   ├── ShiftSchedule.jsx
│   ├── TaskTimeline.jsx
│   ├── TodayTasks.jsx
│   ├── Memo.jsx
│   ├── BackupManager.jsx
│   ├── Header.jsx
│   └── ErrorNotification.jsx
├── contexts/          # Reactコンテキスト
│   └── AppContext.jsx
├── utils/             # ユーティリティ
│   └── storage.js
├── supabase.js        # Supabase設定
├── App.jsx           # メインアプリ
└── main.jsx          # エントリーポイント
```

## 📝 ライセンス

このプロジェクトは個人利用を目的としています。
