# 進捗管理システム - GASバックエンド

このプロジェクトは、Google Apps Script (GAS) を使用してスプレッドシートをバックエンドとして利用する進捗管理システムのAPIです。

## スプレッドシート情報

- **スプレッドシートID**: `1l2-K33r5qRsM4J_FwtivhiTsH6VhAhcvCzPcgIiHtyc`
- **URL**: https://docs.google.com/spreadsheets/d/1l2-K33r5qRsM4J_FwtivhiTsH6VhAhcvCzPcgIiHtyc/edit

## シート構造

システムは以下の4つのシートを使用します:

1. **Staff** - スタッフ情報
2. **Tasks** - タスク情報
3. **Meetings** - ミーティング記録
4. **MonthlyReports** - 月次レポート

## デプロイ手順

### 1. Google Apps Scriptプロジェクトの作成

1. スプレッドシートを開く: https://docs.google.com/spreadsheets/d/1l2-K33r5qRsM4J_FwtivhiTsH6VhAhcvCzPcgIiHtyc/edit
2. メニューから「拡張機能」→「Apps Script」を選択
3. 新しいプロジェクトが開きます

### 2. コードのデプロイ

1. `Code.gs` の内容をGAS エディタにコピー&ペースト
2. ファイル名を `Code.gs` に変更
3. プロジェクト名を「進捗管理システムAPI」などに変更
4. 「保存」をクリック

### 3. 初期化の実行

1. GASエディタで `initializeAllSheets` 関数を選択
2. 「実行」ボタンをクリック
3. 初回実行時、権限の承認が必要です:
   - 「権限を確認」をクリック
   - Googleアカウントを選択
   - 「詳細」をクリック
   - 「(プロジェクト名) に移動」をクリック
   - 「許可」をクリック
4. 実行が完了すると、スプレッドシートに4つのシート(Staff, Tasks, Meetings, MonthlyReports)が作成されます

### 4. Web Appとしてデプロイ

1. GASエディタの右上にある「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で「ウェブアプリ」を選択
3. 設定:
   - **説明**: 進捗管理システムAPI v1
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック
5. **Web App URL** をコピーして保存 (例: `https://script.google.com/macros/s/XXXXX/exec`)

### 5. Web App URLの確認

デプロイ後、以下のようなURLが発行されます:
```
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
```

このURLを使用してAPIにアクセスします。

## API エンドポイント

### ベースURL
```
https://script.google.com/macros/s/{デプロイID}/exec
```

---

## API リファレンス

### 🔹 Staff (スタッフ)

#### 全スタッフを取得
```
GET {baseURL}?action=getAllStaff
```

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "name": "田中太郎",
      "currentClient": "クライアントA",
      "assignmentStartDate": "2025-01-01",
      "assignmentEndDate": "2025-12-31",
      "contactEmail": "tanaka@example.com",
      "contactPhone": "090-1234-5678",
      "profileImage": "",
      "dailyReportUrl": "https://docs.google.com/...",
      "dailyReportLastUpdated": "",
      "createdAt": "2025-10-03T10:00:00.000Z",
      "updatedAt": "2025-10-03T10:00:00.000Z"
    }
  ]
}
```

#### スタッフをIDで取得
```
GET {baseURL}?action=getStaffById&id={staffId}
```

#### スタッフを作成
```
POST {baseURL}?action=createStaff
Content-Type: application/json

{
  "name": "田中太郎",
  "currentClient": "クライアントA",
  "assignmentStartDate": "2025-01-01",
  "assignmentEndDate": "2025-12-31",
  "contactEmail": "tanaka@example.com",
  "contactPhone": "090-1234-5678",
  "dailyReportUrl": "https://docs.google.com/..."
}
```

#### スタッフを更新
```
POST {baseURL}?action=updateStaff
Content-Type: application/json

{
  "id": "uuid-xxx",
  "name": "田中太郎",
  "currentClient": "クライアントB"
}
```

#### スタッフを削除
```
POST {baseURL}?action=deleteStaff
Content-Type: application/json

{
  "id": "uuid-xxx"
}
```

---

### 🔹 Task (タスク)

#### 全タスクを取得
```
GET {baseURL}?action=getAllTasks
```

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "taskName": "要件定義",
      "projectName": "プロジェクトX",
      "clientName": "クライアントA",
      "staffId": "uuid-staff-xxx",
      "deadline": "2025-10-15",
      "completionRate": 100,
      "status": "completed",
      "overview": "データ分析基盤の要件定義",
      "achievements": "要件定義書作成完了",
      "results": "要件定義書v1.0納品",
      "technologies": ["Python", "Pandas"],
      "notes": "",
      "createdFromMeetingId": "",
      "reportToMeetingId": "",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-03T10:00:00.000Z"
    }
  ]
}
```

#### タスクをIDで取得
```
GET {baseURL}?action=getTaskById&id={taskId}
```

#### タスクを作成
```
POST {baseURL}?action=createTask
Content-Type: application/json

{
  "taskName": "要件定義",
  "projectName": "プロジェクトX",
  "clientName": "クライアントA",
  "staffId": "uuid-staff-xxx",
  "deadline": "2025-10-15",
  "completionRate": 0,
  "status": "not_started",
  "overview": "データ分析基盤の要件定義",
  "achievements": "",
  "results": "",
  "technologies": ["Python", "Pandas"],
  "notes": ""
}
```

**status の値:**
- `not_started` - 未着手
- `in_progress` - 進行中
- `completed` - 完了
- `delayed` - 遅延

#### タスクを更新
```
POST {baseURL}?action=updateTask
Content-Type: application/json

{
  "id": "uuid-xxx",
  "completionRate": 50,
  "status": "in_progress",
  "achievements": "要件ヒアリング完了"
}
```

#### タスクを削除
```
POST {baseURL}?action=deleteTask
Content-Type: application/json

{
  "id": "uuid-xxx"
}
```

---

### 🔹 Meeting (ミーティング)

#### 全ミーティングを取得
```
GET {baseURL}?action=getAllMeetings
```

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "date": "2025-10-01T14:00:00.000Z",
      "title": "クライアントA 定例MTG",
      "clientName": "クライアントA",
      "staffIds": ["uuid-staff-xxx"],
      "participants": ["田中太郎", "クライアント担当者"],
      "agenda": "進捗確認と今後の予定",
      "decisions": [
        {
          "id": "decision-xxx",
          "content": "要件定義書を10/15までに提出",
          "taskId": "uuid-task-xxx",
          "isTaskCreated": true
        }
      ],
      "actions": "次回までに要件定義書をレビュー",
      "notes": "",
      "nextMeetingDate": "2025-10-15T14:00:00.000Z",
      "nextAgenda": "要件定義書のレビュー",
      "createdAt": "2025-10-01T15:00:00.000Z",
      "updatedAt": "2025-10-01T15:00:00.000Z"
    }
  ]
}
```

#### ミーティングをIDで取得
```
GET {baseURL}?action=getMeetingById&id={meetingId}
```

#### ミーティングを作成
```
POST {baseURL}?action=createMeeting
Content-Type: application/json

{
  "date": "2025-10-01T14:00:00.000Z",
  "title": "クライアントA 定例MTG",
  "clientName": "クライアントA",
  "staffIds": ["uuid-staff-xxx"],
  "participants": ["田中太郎", "クライアント担当者"],
  "agenda": "進捗確認と今後の予定",
  "decisions": [],
  "actions": "",
  "notes": "",
  "nextMeetingDate": "",
  "nextAgenda": ""
}
```

#### ミーティングを更新
```
POST {baseURL}?action=updateMeeting
Content-Type: application/json

{
  "id": "uuid-xxx",
  "decisions": [
    {
      "id": "decision-xxx",
      "content": "要件定義書を10/15までに提出",
      "taskId": "uuid-task-xxx",
      "isTaskCreated": true
    }
  ]
}
```

#### ミーティングを削除
```
POST {baseURL}?action=deleteMeeting
Content-Type: application/json

{
  "id": "uuid-xxx"
}
```

---

### 🔹 MonthlyReport (月次レポート)

#### 全月次レポートを取得
```
GET {baseURL}?action=getAllMonthlyReports
```

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "clientName": "クライアントA",
      "staffName": "田中太郎",
      "year": 2025,
      "month": 10,
      "startDate": "2025-10-01",
      "endDate": "2025-10-31",
      "tasks": [
        {
          "projectName": "プロジェクトX",
          "overview": "データ分析基盤の構築",
          "achievements": "要件定義完了、データ収集スクリプト作成",
          "results": "月間10万件のデータを自動収集可能に",
          "technologies": ["Python", "Pandas", "Apache Airflow"],
          "completionRate": 80
        }
      ],
      "comments": "順調に進んでいます",
      "issues": "データ品質の改善が必要",
      "nextMonthPlan": "モデルの本番環境への導入",
      "upcomingTasks": [
        {
          "taskName": "モデルデプロイ",
          "details": "本番環境へのモデル配置"
        }
      ],
      "generatedAt": "2025-10-31T10:00:00.000Z",
      "imageUrl": "",
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

#### 月次レポートをIDで取得
```
GET {baseURL}?action=getMonthlyReportById&id={reportId}
```

#### 月次レポートを作成
```
POST {baseURL}?action=createMonthlyReport
Content-Type: application/json

{
  "clientName": "クライアントA",
  "staffName": "田中太郎",
  "year": 2025,
  "month": 10,
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "tasks": [],
  "comments": "",
  "issues": "",
  "nextMonthPlan": "",
  "upcomingTasks": []
}
```

#### 月次レポートを更新
```
POST {baseURL}?action=updateMonthlyReport
Content-Type: application/json

{
  "id": "uuid-xxx",
  "comments": "順調に進んでいます",
  "issues": "データ品質の改善が必要"
}
```

#### 月次レポートを削除
```
POST {baseURL}?action=deleteMonthlyReport
Content-Type: application/json

{
  "id": "uuid-xxx"
}
```

---

### 🔹 その他

#### すべてのシートを初期化
```
GET {baseURL}?action=initializeAllSheets
```

**レスポンス:**
```json
{
  "success": true,
  "message": "All sheets initialized successfully"
}
```

---

## エラーハンドリング

すべてのAPIレスポンスは以下の形式で返されます:

**成功時:**
```json
{
  "success": true,
  "data": { ... }
}
```

**エラー時:**
```json
{
  "success": false,
  "message": "エラーメッセージ"
}
```

---

## テスト方法

### curlでのテスト例

```bash
# 全スタッフを取得
curl "https://script.google.com/macros/s/XXXXX/exec?action=getAllStaff"

# スタッフを作成
curl -X POST "https://script.google.com/macros/s/XXXXX/exec?action=createStaff" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "田中太郎",
    "currentClient": "クライアントA",
    "contactEmail": "tanaka@example.com"
  }'
```

### JavaScriptでのテスト例

```javascript
// GET リクエスト
const baseUrl = 'https://script.google.com/macros/s/XXXXX/exec';

fetch(`${baseUrl}?action=getAllStaff`)
  .then(response => response.json())
  .then(data => console.log(data));

// POST リクエスト
fetch(`${baseUrl}?action=createStaff`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '田中太郎',
    currentClient: 'クライアントA',
    contactEmail: 'tanaka@example.com'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## 更新履歴

- **v1.0** (2025-10-03): 初回リリース
  - Staff, Task, Meeting, MonthlyReport の CRUD API 実装
  - Web App デプロイ対応

---

## ライセンス

このプロジェクトは内部使用のみを目的としています。

---

## サポート

質問や問題がある場合は、プロジェクト管理者に連絡してください。
