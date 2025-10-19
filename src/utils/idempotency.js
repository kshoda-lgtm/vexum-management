/**
 * 冪等性チェック用のハッシュ生成
 * user_id, date, summary, category, time_spent_h からハッシュを生成
 */
export const createEntryHash = ({ user_id, date, summary, category, time_spent_h }) => {
  const data = `${user_id}|${date}|${summary}|${category}|${time_spent_h || ''}`;

  // シンプルなハッシュ関数（本番ではcrypto.subtle.digestなどを使用推奨）
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `hash_${Math.abs(hash).toString(36)}`;
};

/**
 * Google Docs用のテンプレート生成
 */
export const generateDocTemplate = (entry) => {
  const tickets = entry.tickets && entry.tickets.length > 0
    ? entry.tickets.join(', ')
    : 'なし';

  return `- [${entry.category}] ${entry.summary}${entry.time_spent_h ? `（${entry.time_spent_h}h）` : ''}
  成果/完了: ${entry.outcome}
  ${entry.detail ? `詳細: ${entry.detail}\n  ` : ''}${entry.issues ? `課題/リスク: ${entry.issues}\n  ` : ''}${entry.next_action ? `次アクション: ${entry.next_action}\n  ` : ''}参照: ${tickets}
  （記録元: スケチェック / ${entry.id}）`;
};
