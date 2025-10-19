import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * LINE用週報テキストを生成
 */
export const generateWeeklyReportText = ({ weekStart, weekEnd, entries, plans, users }) => {
  const lines = [];

  // ヘッダー
  const startStr = format(weekStart, 'M/d(E)', { locale: ja });
  const endStr = format(weekEnd, 'M/d(E)', { locale: ja });
  const memberCount = users.length;

  lines.push(`【週次レポート】${startStr}〜${endStr} / 体制：常駐${memberCount}名`);
  lines.push('');

  // ユーザー別に日報をグループ化
  const entriesByUser = {};
  users.forEach(user => {
    entriesByUser[user.id] = entries
      .filter(e => e.user_id === user.id)
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  // 今週の実施（ユーザー別）
  users.forEach(user => {
    const userEntries = entriesByUser[user.id] || [];

    if (userEntries.length > 0) {
      lines.push(`■ 今週の実施（${user.name}）`);

      // 日付別にグループ化
      const entriesByDate = {};
      userEntries.forEach(entry => {
        if (!entriesByDate[entry.date]) {
          entriesByDate[entry.date] = [];
        }
        entriesByDate[entry.date].push(entry);
      });

      // 日付順に出力
      Object.keys(entriesByDate)
        .sort()
        .forEach(date => {
          const dateEntries = entriesByDate[date];
          const dateStr = format(parseISO(date), 'M/d', { locale: ja });

          // 最大3行まで表示
          const displayEntries = dateEntries.slice(0, 3);
          displayEntries.forEach(entry => {
            const summary = `[${entry.category}] ${entry.summary}`;
            const timeStr = entry.time_spent_h ? `（${entry.time_spent_h}h）` : '';
            const issueStr = entry.issues ? ` 課題:${entry.issues}` : '';

            lines.push(`・${dateStr}：${summary}${timeStr}${issueStr}`);
          });

          // 3件を超える場合は省略表示
          if (dateEntries.length > 3) {
            lines.push(`  ...他${dateEntries.length - 3}件（詳細は日報参照）`);
          }
        });

      lines.push('');
    }
  });

  // ハイライト（主要成果/課題）
  const highlights = extractHighlights(entries);
  if (highlights.length > 0) {
    lines.push('■ ハイライト');
    highlights.forEach(h => lines.push(`・${h}`));
    lines.push('');
  }

  // 来週やること
  if (plans.length > 0) {
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const nextWeekEnd = new Date(weekEnd);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    const nextStartStr = format(nextWeekStart, 'M/d', { locale: ja });
    const nextEndStr = format(nextWeekEnd, 'M/d', { locale: ja });

    lines.push(`■ 来週（${nextStartStr}〜${nextEndStr}）`);

    // ユーザー別に計画をグループ化
    const plansByUser = {};
    users.forEach(user => {
      plansByUser[user.id] = plans
        .filter(p => p.user_id === user.id)
        .sort((a, b) => a.priority - b.priority);
    });

    users.forEach(user => {
      const userPlans = plansByUser[user.id] || [];
      if (userPlans.length > 0) {
        const planTexts = userPlans.map((plan, idx) => {
          const estStr = plan.est_hours ? `(${plan.est_hours}h)` : '';
          return `${idx + 1}${plan.title}${estStr}`;
        });
        lines.push(`${user.name}：${planTexts.join(' ')}`);
      }
    });

    lines.push('');
  }

  // ご確認事項（課題がある場合）
  const confirmItems = extractConfirmItems(entries);
  if (confirmItems.length > 0) {
    lines.push('■ ご確認');
    confirmItems.forEach(item => lines.push(`・${item}`));
    lines.push('');
  }

  return lines.join('\n');
};

/**
 * ハイライト（主要成果）を抽出
 */
const extractHighlights = (entries) => {
  const highlights = [];

  // 成果に数値が含まれるものを優先的に抽出
  const withNumbers = entries.filter(e =>
    e.outcome && /\d+/.test(e.outcome)
  );

  if (withNumbers.length > 0) {
    // 最大3件まで
    withNumbers.slice(0, 3).forEach(entry => {
      highlights.push(`${entry.outcome}`);
    });
  }

  // カテゴリ別の件数集計
  const categoryCount = {};
  entries.forEach(entry => {
    categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
  });

  // 運用や開発が多い場合は追加
  if (categoryCount['運用'] >= 5) {
    highlights.push(`運用対応: ${categoryCount['運用']}件`);
  }
  if (categoryCount['不具合'] > 0) {
    highlights.push(`不具合対応: ${categoryCount['不具合']}件`);
  }

  return highlights;
};

/**
 * 確認事項を抽出（課題・リスクから）
 */
const extractConfirmItems = (entries) => {
  const items = [];

  entries.forEach(entry => {
    if (entry.issues && entry.issues.includes('承認')) {
      items.push(`${entry.summary}の承認可否のご連絡をお願いします`);
    } else if (entry.issues) {
      items.push(entry.issues);
    }
  });

  // 重複排除して最大3件まで
  return [...new Set(items)].slice(0, 3);
};

/**
 * PDF用のレポートデータを生成（今後実装）
 */
export const generatePDFReport = (data) => {
  // TODO: PDF生成ライブラリを使用して実装
  return null;
};

/**
 * PowerPoint用のレポートデータを生成（今後実装）
 */
export const generatePPTXReport = (data) => {
  // TODO: PPTX生成ライブラリを使用して実装
  return null;
};
