import { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Copy, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { generateWeeklyReportText } from '../utils/reportGenerator';

const WeeklyReportPreview = ({ weekStart, weekEnd }) => {
  const { dailyEntries, nextWeekPlans, users } = useAppContext();
  const [reportFormat, setReportFormat] = useState('line'); // 'line' | 'pdf' | 'pptx'
  const [reportText, setReportText] = useState('');
  const [copied, setCopied] = useState(false);

  // 週のエントリーを取得
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekEntries = dailyEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  useEffect(() => {
    if (reportFormat === 'line') {
      const text = generateWeeklyReportText({
        weekStart,
        weekEnd,
        entries: weekEntries,
        plans: nextWeekPlans,
        users
      });
      setReportText(text);
    } else {
      setReportText(`${reportFormat.toUpperCase()}形式は現在開発中です。`);
    }
  }, [reportFormat, weekEntries, nextWeekPlans, users, weekStart, weekEnd]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    if (window.confirm('この週報を承認しますか？\n承認後、クライアントへの送信が可能になります。')) {
      // TODO: 承認処理を実装
      alert('承認機能は開発中です');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">週報プレビュー＆出力</h3>

        {/* フォーマット選択 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setReportFormat('line')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportFormat === 'line'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            LINE用テキスト
          </button>
          <button
            onClick={() => setReportFormat('pdf')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportFormat === 'pdf'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            PDF
          </button>
          <button
            onClick={() => setReportFormat('pptx')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportFormat === 'pptx'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            PowerPoint
          </button>
        </div>

        {/* プレビューエリア */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700">プレビュー</h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  コピー完了
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  コピー
                </>
              )}
            </button>
          </div>

          {reportFormat === 'line' ? (
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-white p-4 rounded border border-gray-300 max-h-[600px] overflow-y-auto">
              {reportText}
            </pre>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">{reportText}</p>
              <p className="text-sm">PDF/PowerPoint出力機能は今後実装予定です</p>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p>期間: {format(weekStart, 'M/d(E)', { locale: ja })} - {format(weekEnd, 'M/d(E)', { locale: ja })}</p>
            <p>エントリー数: {weekEntries.length}件 / 来週計画: {nextWeekPlans.length}件</p>
          </div>

          <button
            onClick={handleApprove}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            承認して出力
          </button>
        </div>
      </div>

      {/* 使い方ヒント */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">使い方</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• LINE用テキストをコピーして、クライアントのLINEに貼り付けてください</li>
          <li>• 「承認して出力」をクリックすると、週報の記録が保存されます</li>
          <li>• 内容を修正したい場合は、「今週の実施」タブから日報を編集してください</li>
        </ul>
      </div>
    </div>
  );
};

export default WeeklyReportPreview;
