/**
 * Google Docs連携設定
 *
 * 実装方法：
 * 1. Google Apps Scriptでバックエンドを作成
 * 2. そのGASのWeb AppをデプロイしてURLを取得
 * 3. GOOGLE_DOCS_API_URLに設定
 */

export const GOOGLE_DOCS_CONFIG = {
  // Google Docs APIエンドポイント（GAS Web App URL）
  API_URL: process.env.VITE_GOOGLE_DOCS_API_URL || '',

  // 日報ドキュメントID（環境変数から取得）
  DOC_ID: process.env.VITE_GOOGLE_DOC_ID || '',

  // 日付見出しパターン（例：## 2025-10-19）
  DATE_HEADING_PATTERN: process.env.VITE_DOC_DATE_HEADING_PATTERN || '## {date}',

  // メンバー見出しパターン（例：### 常駐A）
  MEMBER_HEADING_PATTERN: process.env.VITE_DOC_MEMBER_HEADING_PATTERN || '### {name}',

  // 有効化フラグ
  ENABLED: process.env.VITE_GOOGLE_DOCS_ENABLED === 'true' || false,

  // リトライ設定
  RETRY_COUNT: 3,
  RETRY_DELAY_MS: 1000,
};

/**
 * Google Docsに日報を追記する
 * @param {Object} entry - 日報エントリー
 * @returns {Promise<{success: boolean, doc_ref?: string, error?: string}>}
 */
export const syncToGoogleDocs = async (entry) => {
  if (!GOOGLE_DOCS_CONFIG.ENABLED || !GOOGLE_DOCS_CONFIG.API_URL) {
    console.log('Google Docs連携は無効です');
    return { success: false, error: 'Google Docs連携が有効化されていません' };
  }

  try {
    const response = await fetch(`${GOOGLE_DOCS_CONFIG.API_URL}?action=appendEntry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doc_id: GOOGLE_DOCS_CONFIG.DOC_ID,
        entry: entry,
        date_pattern: GOOGLE_DOCS_CONFIG.DATE_HEADING_PATTERN,
        member_pattern: GOOGLE_DOCS_CONFIG.MEMBER_HEADING_PATTERN,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Google Docs同期エラー:', error);
    return { success: false, error: error.message };
  }
};

/**
 * リトライ付きGoogle Docs同期
 */
export const syncToGoogleDocsWithRetry = async (entry) => {
  let lastError = null;

  for (let i = 0; i < GOOGLE_DOCS_CONFIG.RETRY_COUNT; i++) {
    try {
      const result = await syncToGoogleDocs(entry);
      if (result.success) {
        return result;
      }
      lastError = result.error;
    } catch (error) {
      lastError = error.message;
    }

    // 最後の試行でない場合は待機
    if (i < GOOGLE_DOCS_CONFIG.RETRY_COUNT - 1) {
      await new Promise(resolve => setTimeout(resolve, GOOGLE_DOCS_CONFIG.RETRY_DELAY_MS));
    }
  }

  return { success: false, error: lastError || '同期に失敗しました' };
};
