/**
 * Google Docs連携 - 日報自動追記スクリプト
 *
 * 使い方：
 * 1. このスクリプトをGoogle Apps Scriptプロジェクトにコピー
 * 2. Web Appとしてデプロイ
 * 3. デプロイURLをフロントエンドの環境変数に設定
 */

/**
 * POSTリクエストを処理
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = e.parameter.action || params.action;

    switch (action) {
      case 'appendEntry':
        return appendEntryToDoc(params);

      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Unknown action: ' + action
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 日報エントリーをGoogle Docsに追記
 */
function appendEntryToDoc(params) {
  try {
    const docId = params.doc_id;
    const entry = params.entry;
    const datePattern = params.date_pattern || '## {date}';
    const memberPattern = params.member_pattern || '### {name}';

    // ドキュメントを開く
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();

    // 日付見出しを検索（例：## 2025-10-19）
    const dateHeading = datePattern.replace('{date}', entry.date);
    const dateElement = findHeading(body, dateHeading);

    if (!dateElement) {
      // 日付見出しが見つからない場合は作成
      const newDateParagraph = body.appendParagraph(dateHeading);
      newDateParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    }

    // ユーザー名を取得（entry.user_nameまたはentry.user_idを使用）
    const userName = entry.user_name || entry.user_id;
    const memberHeading = memberPattern.replace('{name}', userName);

    // メンバー見出しを検索
    const memberElement = findHeading(body, memberHeading);

    if (!memberElement) {
      // メンバー見出しが見つからない場合は作成
      const newMemberParagraph = body.appendParagraph(memberHeading);
      newMemberParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING3);
    }

    // エントリーテキストを生成
    const entryText = formatEntry(entry);

    // ドキュメントに追記
    const insertIndex = findInsertPosition(body, dateHeading, memberHeading);
    if (insertIndex >= 0) {
      body.insertParagraph(insertIndex, entryText);
    } else {
      body.appendParagraph(entryText);
    }

    // ドキュメント位置を記録
    const docRef = {
      doc_id: docId,
      heading: dateHeading + ' > ' + memberHeading,
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      doc_ref: docRef,
      duplicate: false
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in appendEntryToDoc: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 見出しを検索
 */
function findHeading(body, headingText) {
  const paragraphs = body.getParagraphs();
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    if (para.getText().trim() === headingText.trim()) {
      return para;
    }
  }
  return null;
}

/**
 * 挿入位置を検索
 */
function findInsertPosition(body, dateHeading, memberHeading) {
  const paragraphs = body.getParagraphs();
  let foundDate = false;
  let foundMember = false;

  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].getText().trim();

    if (text === dateHeading.trim()) {
      foundDate = true;
      continue;
    }

    if (foundDate && text === memberHeading.trim()) {
      foundMember = true;
      continue;
    }

    if (foundMember) {
      // 次の見出しまたは空行の直前に挿入
      if (text.startsWith('##') || text.startsWith('###') || text === '') {
        return i;
      }
    }
  }

  return -1; // 見つからない場合は末尾に追加
}

/**
 * エントリーをフォーマット
 */
function formatEntry(entry) {
  const tickets = entry.tickets && entry.tickets.length > 0
    ? entry.tickets.join(', ')
    : 'なし';

  const timeStr = entry.time_spent_h ? `（${entry.time_spent_h}h）` : '';

  let text = `- [${entry.category}] ${entry.summary}${timeStr}\n`;
  text += `  成果/完了: ${entry.outcome}\n`;

  if (entry.detail) {
    text += `  詳細: ${entry.detail}\n`;
  }

  if (entry.issues) {
    text += `  課題/リスク: ${entry.issues}\n`;
  }

  if (entry.next_action) {
    text += `  次アクション: ${entry.next_action}\n`;
  }

  text += `  参照: ${tickets}\n`;
  text += `  （記録元: スケチェック / ${entry.id}）`;

  return text;
}

/**
 * GETリクエストを処理（テスト用）
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'Google Docs Sync API is running',
    version: '1.0.0'
  })).setMimeType(ContentService.MimeType.JSON);
}
