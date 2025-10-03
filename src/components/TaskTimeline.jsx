import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Calendar, User, FileText, List, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

const TaskTimeline = () => {
  const { staff, tasks } = useAppContext();
  const [selectedClient, setSelectedClient] = useState('all');
  const [viewMode, setViewMode] = useState('calendar'); // 'timeline' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  // タスクごとの色を生成
  const taskColors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-lime-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-rose-500',
    'bg-violet-500',
  ];

  // タスクIDに基づいて色を割り当て
  const getTaskColor = (taskId) => {
    const hash = taskId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return taskColors[hash % taskColors.length];
  };

  // クライアント一覧
  const clients = [...new Set(tasks.map(t => t.clientName))].filter(Boolean);

  // フィルタリングされたタスク
  const filteredTasks = selectedClient === 'all'
    ? tasks
    : tasks.filter(t => t.clientName === selectedClient);

  // 日付順にソート
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(a.deadline) - new Date(b.deadline);
  });

  // クライアント別にグループ化
  const tasksByClient = sortedTasks.reduce((acc, task) => {
    if (!acc[task.clientName]) {
      acc[task.clientName] = [];
    }
    acc[task.clientName].push(task);
    return acc;
  }, {});

  // カレンダー用の日付生成
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();

  // 前の月へ
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 次の月へ
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 特定の日のタスクを取得（期限日のみ）
  const getTasksForDate = (date) => {
    return filteredTasks.filter(task => isSameDay(new Date(task.deadline), date));
  };

  // タスクが指定日に跨っているかチェック（開始日から期限まで）
  const isTaskInDateRange = (task, date) => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date(task.deadline);
    const endDate = new Date(task.deadline);

    // 時間を無視して日付のみで比較
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return checkDate >= start && checkDate <= end;
  };

  // 特定の日に表示されるタスクを取得（範囲を考慮）
  const getTasksForDateRange = (date) => {
    return filteredTasks.filter(task => isTaskInDateRange(task, date));
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">タスクタイムライン</h2>

          <div className="flex items-center gap-3">
            {/* 表示切り替えボタン */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">リスト</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm font-medium">カレンダー</span>
              </button>
            </div>

            {/* クライアント選択 */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全てのクライアント</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* カレンダービュー */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          {/* 月選択 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold">
              {format(currentDate, 'yyyy年M月')}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-2">
            {/* 曜日ヘッダー */}
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={`text-center font-semibold py-2 ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}

            {/* 空白セル */}
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {/* 日付セル */}
            {daysInMonth.map(date => {
              const dayTasks = getTasksForDateRange(date);
              const dayOfWeek = date.getDay();

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[120px] border rounded-lg p-2 ${
                    isToday(date)
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200'
                  } ${dayOfWeek === 0 ? 'bg-red-50' : dayOfWeek === 6 ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    dayOfWeek === 0 ? 'text-red-600' : dayOfWeek === 6 ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  {dayTasks.length > 0 && (
                    <div className="space-y-1">
                      {dayTasks.map(task => {
                        const taskStaff = staff.find(s => s.id === task.staffId);
                        const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
                        const isTaskStart = task.startDate && isSameDay(new Date(task.startDate), date);
                        const isTaskEnd = isSameDay(new Date(task.deadline), date);

                        // 終了1週間前かチェック
                        const oneWeekBeforeDeadline = new Date(task.deadline);
                        oneWeekBeforeDeadline.setDate(oneWeekBeforeDeadline.getDate() - 7);
                        const isOneWeekBefore = isSameDay(oneWeekBeforeDeadline, date);

                        // タスクごとの色を取得
                        const taskColor = getTaskColor(task.id);

                        // 完了済みは薄いグレー、遅延は赤、それ以外はタスクごとの色
                        const statusColor = task.status === 'completed'
                          ? 'bg-gray-400'
                          : isOverdue || task.status === 'delayed'
                          ? 'bg-red-500'
                          : taskColor;

                        // 開始日、終了日、終了1週間前のみ表示
                        if (!isTaskStart && !isTaskEnd && !isOneWeekBefore) return null;

                        return (
                          <div
                            key={task.id}
                            className={`text-xs ${statusColor} text-white px-1.5 py-1 rounded truncate ${
                              task.status === 'completed' ? 'opacity-60' : ''
                            } ${isOneWeekBefore ? 'font-bold border-2 border-yellow-300 shadow-md' : ''}`}
                            title={`${task.taskName}\n${task.startDate ? `開始: ${format(new Date(task.startDate), 'yyyy/MM/dd')}\n` : ''}期限: ${format(new Date(task.deadline), 'yyyy/MM/dd')}\n担当: ${taskStaff?.name || '未設定'}\n進捗: ${task.completionRate}%`}
                          >
                            {isTaskStart && `▶ ${task.taskName}`}
                            {isTaskEnd && `◀ ${task.taskName}`}
                            {isOneWeekBefore && `⚠️ 終了間近 ${task.taskName}`}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">凡例</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-400"></div>
                <span className="text-sm text-gray-600">完了</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-sm text-gray-600">遅延</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {taskColors.slice(0, 4).map((color, i) => (
                    <div key={i} className={`w-3 h-4 rounded ${color}`}></div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">タスクごとの色分け</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">▶ 開始日</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-600">◀ 期限日</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-600">終了間近 (1週間前)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* タイムラインビュー */}
      {viewMode === 'timeline' && (
        <>
          {Object.entries(tasksByClient).map(([clientName, clientTasks]) => (
            <div key={clientName} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                {clientName}
              </h3>

              <div className="relative">
                {/* タイムライン線 */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* タスク一覧 */}
                <div className="space-y-6">
                  {clientTasks.map((task, index) => {
                    const taskStaff = staff.find(s => s.id === task.staffId);
                    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';

                    // ステータスに応じた色
                    const statusColor = task.status === 'completed'
                      ? 'bg-green-500'
                      : task.status === 'delayed' || isOverdue
                      ? 'bg-red-500'
                      : task.status === 'in_progress'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400';

                    return (
                      <div key={task.id} className="relative pl-20">
                        {/* タイムラインドット */}
                        <div className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white ${statusColor} shadow`}></div>

                        {/* タスクカード */}
                        <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
                          {/* 日付 */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                              {task.startDate && (
                                <>
                                  {format(new Date(task.startDate), 'yyyy/MM/dd')} 〜
                                </>
                              )}
                              {format(new Date(task.deadline), 'yyyy/MM/dd')}
                              {isOverdue && ' (期限超過)'}
                            </span>
                          </div>

                          {/* タスク名とプロジェクト */}
                          <h4 className="text-lg font-bold text-gray-800 mb-1">{task.taskName}</h4>
                          <p className="text-sm text-gray-600 mb-3">{task.projectName}</p>

                          {/* 担当者 */}
                          <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                            <User className="w-4 h-4" />
                            <span>{taskStaff?.name || '未設定'}</span>
                          </div>

                          {/* 概要 */}
                          {task.overview && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-700">{task.overview}</p>
                            </div>
                          )}

                          {/* 達成内容 */}
                          {task.achievements && (
                            <div className="mb-3">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-gray-600 mb-1">達成内容</p>
                                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                    {task.achievements}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 成果 */}
                          {task.results && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-600 mb-1">成果</p>
                              <p className="text-sm text-gray-700">{task.results}</p>
                            </div>
                          )}

                          {/* 進捗率とステータス */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-gray-600">
                                進捗: <span className="font-semibold text-gray-800">{task.completionRate}%</span>
                              </div>
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${statusColor}`}
                                  style={{ width: `${task.completionRate}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                task.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : task.status === 'delayed' || isOverdue
                                  ? 'bg-red-100 text-red-700'
                                  : task.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {task.status === 'completed'
                                  ? '完了'
                                  : task.status === 'delayed' || isOverdue
                                  ? '遅延'
                                  : task.status === 'in_progress'
                                  ? '進行中'
                                  : '未着手'}
                              </span>
                            </div>
                          </div>

                          {/* 使用技術 */}
                          {task.technologies && task.technologies.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {task.technologies.map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {clientTasks.length === 0 && (
                <p className="text-gray-500 text-center py-8">このクライアントのタスクはありません</p>
              )}
            </div>
          ))}

          {Object.keys(tasksByClient).length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">タスクがありません</p>
              <p className="text-gray-400 text-sm mt-2">スケジュール画面からタスクを追加してください</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskTimeline;
