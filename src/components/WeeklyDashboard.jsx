import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import NextWeekPlanEditor from './NextWeekPlanEditor';
import WeeklyReportPreview from './WeeklyReportPreview';
import DailyReportModal from './DailyReportModal';

const WeeklyDashboard = () => {
  const { dailyEntries, users, deleteDailyEntry } = useAppContext();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { locale: ja }));
  const [selectedTab, setSelectedTab] = useState('entries'); // 'entries' | 'plans' | 'report'
  const [editingEntry, setEditingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekEnd = endOfWeek(currentWeekStart, { locale: ja });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const handleThisWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { locale: ja }));

  // 現在の週の日報エントリーを取得
  const weekEntries = dailyEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= currentWeekStart && entryDate <= weekEnd;
  });

  // ユーザー別にグループ化
  const entriesByUser = users.reduce((acc, user) => {
    acc[user.id] = weekEntries.filter(entry => entry.user_id === user.id);
    return acc;
  }, {});

  // 日付別にグループ化
  const entriesByDate = weekDays.reduce((acc, day) => {
    acc[format(day, 'yyyy-MM-dd')] = weekEntries.filter(entry =>
      isSameDay(parseISO(entry.date), day)
    );
    return acc;
  }, {});

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('この日報を削除してもよろしいですか?')) {
      try {
        await deleteDailyEntry(entryId);
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
      }
    }
  };

  const handleCopyEntry = (entry) => {
    const text = `[${entry.category}] ${entry.summary}
成果: ${entry.outcome}
${entry.detail ? `詳細: ${entry.detail}\n` : ''}${entry.issues ? `課題: ${entry.issues}\n` : ''}${entry.next_action ? `次: ${entry.next_action}` : ''}`;
    navigator.clipboard.writeText(text);
    alert('コピーしました');
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : '不明';
  };

  const categoryColors = {
    '運用': 'bg-blue-100 text-blue-800',
    '開発': 'bg-green-100 text-green-800',
    'MTG': 'bg-purple-100 text-purple-800',
    '不具合': 'bg-red-100 text-red-800',
    'その他': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">週次ダッシュボード</h2>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {format(currentWeekStart, 'M/d', { locale: ja })} - {format(weekEnd, 'M/d', { locale: ja })}
              </h3>
              <button
                onClick={handleThisWeek}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                今週
              </button>
            </div>

            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setSelectedTab('entries')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'entries'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            今週の実施
          </button>
          <button
            onClick={() => setSelectedTab('plans')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'plans'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            来週やること
          </button>
          <button
            onClick={() => setSelectedTab('report')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'report'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            週報プレビュー
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      {selectedTab === 'entries' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">今週の実施内容</h3>

          {weekEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">この週の日報はまだありません</p>
          ) : (
            <div className="space-y-6">
              {/* 日付別表示 */}
              {weekDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEntries = entriesByDate[dateKey] || [];

                if (dayEntries.length === 0) return null;

                return (
                  <div key={dateKey} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      {format(day, 'M月d日(E)', { locale: ja })}
                    </h4>
                    <div className="space-y-3">
                      {dayEntries.map(entry => (
                        <div
                          key={entry.id}
                          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  categoryColors[entry.category] || categoryColors['その他']
                                }`}>
                                  {entry.category}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {getUserName(entry.user_id)}
                                </span>
                                {entry.time_spent_h && (
                                  <span className="text-sm text-gray-500">
                                    ({entry.time_spent_h}h)
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 mb-1">{entry.summary}</p>
                              <p className="text-sm text-gray-600 mb-2">
                                成果: {entry.outcome}
                              </p>
                              {entry.detail && (
                                <p className="text-sm text-gray-600 mb-1">詳細: {entry.detail}</p>
                              )}
                              {entry.issues && (
                                <p className="text-sm text-orange-600 mb-1">課題: {entry.issues}</p>
                              )}
                              {entry.next_action && (
                                <p className="text-sm text-blue-600">次: {entry.next_action}</p>
                              )}
                            </div>
                            <div className="flex gap-1 ml-4">
                              <button
                                onClick={() => handleCopyEntry(entry)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="コピー"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="編集"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="削除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* サマリー */}
          <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">総エントリー数</p>
              <p className="text-2xl font-bold text-blue-600">{weekEntries.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">総作業時間</p>
              <p className="text-2xl font-bold text-green-600">
                {weekEntries.reduce((sum, e) => sum + (e.time_spent_h || 0), 0).toFixed(1)}h
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">参加メンバー</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(weekEntries.map(e => e.user_id)).size}人
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'plans' && (
        <NextWeekPlanEditor weekStart={currentWeekStart} />
      )}

      {selectedTab === 'report' && (
        <WeeklyReportPreview weekStart={currentWeekStart} weekEnd={weekEnd} />
      )}

      {/* 日報編集モーダル */}
      {isModalOpen && editingEntry && (
        <DailyReportModal
          date={parseISO(editingEntry.date)}
          entryToEdit={editingEntry}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
};

export default WeeklyDashboard;
