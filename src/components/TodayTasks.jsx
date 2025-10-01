import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Check, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAppContext } from '../contexts/AppContext';

const TodayTasks = () => {
  const { tasks } = useAppContext();
  const [todayTasks, setTodayTasks] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // 簡易タスクリスト
  const [quickTasks, setQuickTasks] = useState([]);
  const [newQuickTaskText, setNewQuickTaskText] = useState('');

  // 7:00 から 24:00 までの時間スロットを生成
  const timeSlots = [];
  for (let hour = 7; hour <= 24; hour++) {
    timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
  }

  // LocalStorageからタスクを読み込み + 終了間近タスクを追加
  useEffect(() => {
    const savedTasks = localStorage.getItem('skecheck_today_tasks');
    if (savedTasks) {
      setTodayTasks(JSON.parse(savedTasks));
    }

    const savedQuickTasks = localStorage.getItem('skecheck_quick_tasks');
    let loadedQuickTasks = [];
    if (savedQuickTasks) {
      loadedQuickTasks = JSON.parse(savedQuickTasks);
    }

    // 本日が終了1週間前のタスクを取得
    const today = new Date();
    const upcomingDeadlineTasks = tasks.filter(task => {
      const oneWeekBeforeDeadline = new Date(task.deadline);
      oneWeekBeforeDeadline.setDate(oneWeekBeforeDeadline.getDate() - 7);
      return isSameDay(oneWeekBeforeDeadline, today) && task.status !== 'completed';
    });

    // 終了間近タスクを追加（既存のタスクと重複しないように）
    const deadlineTaskTexts = upcomingDeadlineTasks.map(t => `${t.taskName} 終了間近`);
    const existingTexts = loadedQuickTasks.map(t => t.text);

    upcomingDeadlineTasks.forEach(task => {
      const taskText = `${task.taskName} 終了間近`;
      if (!existingTexts.includes(taskText)) {
        loadedQuickTasks.push({
          id: `deadline-${task.id}`,
          text: taskText,
          completed: false,
          createdAt: new Date().toISOString(),
          isDeadlineWarning: true
        });
      }
    });

    setQuickTasks(loadedQuickTasks);
  }, [tasks]);

  // タスクをLocalStorageに保存
  const saveTasks = (updatedTasks) => {
    localStorage.setItem('skecheck_today_tasks', JSON.stringify(updatedTasks));
    setTodayTasks(updatedTasks);
  };

  // 簡易タスクをLocalStorageに保存
  const saveQuickTasks = (updatedTasks) => {
    localStorage.setItem('skecheck_quick_tasks', JSON.stringify(updatedTasks));
    setQuickTasks(updatedTasks);
  };

  // タスクを追加
  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedTimeSlot) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      time: selectedTimeSlot,
      startTime: startTime || selectedTimeSlot,
      endTime: endTime || '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...todayTasks, newTask].sort((a, b) => a.time.localeCompare(b.time));
    saveTasks(updatedTasks);
    setNewTaskTitle('');
    setStartTime('');
    setEndTime('');
    setSelectedTimeSlot(null);
  };

  // タスクを削除
  const handleDeleteTask = (id) => {
    const updatedTasks = todayTasks.filter(t => t.id !== id);
    saveTasks(updatedTasks);
  };

  // タスクの完了状態を切り替え
  const handleToggleComplete = (id) => {
    const updatedTasks = todayTasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updatedTasks);
  };

  // 簡易タスクを追加
  const handleAddQuickTask = () => {
    if (!newQuickTaskText.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      text: newQuickTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...quickTasks, newTask];
    saveQuickTasks(updatedTasks);
    setNewQuickTaskText('');
  };

  // 簡易タスクの完了状態を切り替え
  const handleToggleQuickTask = (id) => {
    const updatedTasks = quickTasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveQuickTasks(updatedTasks);
  };

  // 簡易タスクを削除
  const handleDeleteQuickTask = (id) => {
    const updatedTasks = quickTasks.filter(t => t.id !== id);
    saveQuickTasks(updatedTasks);
  };

  // 特定の時間のタスクを取得
  const getTasksForTime = (time) => {
    return todayTasks.filter(t => t.time === time);
  };

  // タスクが指定時間に跨っているかチェック
  const isTaskInTimeRange = (task, time) => {
    if (!task.endTime) return task.time === time;

    const timeToMinutes = (t) => {
      const [hours, minutes] = t.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const taskStartMinutes = timeToMinutes(task.startTime);
    const taskEndMinutes = timeToMinutes(task.endTime);
    const currentMinutes = timeToMinutes(time);

    return currentMinutes >= taskStartMinutes && currentMinutes < taskEndMinutes;
  };

  // 特定の時間に表示されるタスクを取得（時間範囲を考慮）
  const getTasksForTimeSlot = (time) => {
    return todayTasks.filter(t => isTaskInTimeRange(t, time));
  };

  // タスク統計
  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 現在時刻
  const currentHour = new Date().getHours();
  const currentTime = `${String(currentHour).padStart(2, '0')}:00`;

  return (
    <div className="space-y-6">
      {/* 簡易タスクリスト */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">タスクリスト</h3>

        {/* タスク追加フォーム */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newQuickTaskText}
            onChange={(e) => setNewQuickTaskText(e.target.value)}
            placeholder="タスクを入力..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddQuickTask();
              }
            }}
          />
          <button
            onClick={handleAddQuickTask}
            disabled={!newQuickTaskText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>追加</span>
          </button>
        </div>

        {/* タスク一覧 */}
        {quickTasks.length > 0 ? (
          <div className="space-y-2">
            {quickTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  task.isDeadlineWarning
                    ? task.completed
                      ? 'bg-yellow-50 border-yellow-300 opacity-60'
                      : 'bg-yellow-50 border-yellow-400 shadow-md'
                    : task.completed
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-white border-gray-300'
                }`}
              >
                <button
                  onClick={() => handleToggleQuickTask(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : task.isDeadlineWarning
                      ? 'border-yellow-500 hover:border-yellow-600'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>

                <div className="flex-1">
                  <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : task.isDeadlineWarning ? 'text-yellow-900 font-bold' : 'text-gray-800'}`}>
                    {task.isDeadlineWarning && '⚠️ '}
                    {task.text}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteQuickTask(task.id)}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">タスクがありません</p>
        )}

        {/* 統計 */}
        {quickTasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                完了: <span className="font-semibold text-green-600">{quickTasks.filter(t => t.completed).length}</span> /
                全体: <span className="font-semibold text-gray-800">{quickTasks.length}</span>
              </span>
              {quickTasks.filter(t => t.completed).length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('完了済みのタスクをすべて削除しますか？')) {
                      const updatedTasks = quickTasks.filter(t => !t.completed);
                      saveQuickTasks(updatedTasks);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  完了済みをクリア
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">本日のタスク</h2>
            <p className="text-sm text-gray-500">{format(new Date(), 'yyyy年M月d日 (E)', { locale: ja })}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">{completionRate}%</p>
            <p className="text-xs text-gray-500">達成率</p>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
            <p className="text-xs text-blue-600">総タスク</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            <p className="text-xs text-green-600">完了</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-600">{remainingTasks}</p>
            <p className="text-xs text-orange-600">残り</p>
          </div>
        </div>

        {/* タスク追加フォーム */}
        {selectedTimeSlot && (
          <div className="p-4 bg-primary-50 border-2 border-primary-300 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary-800">
                {selectedTimeSlot} のタスクを追加
              </h3>
              <button
                onClick={() => {
                  setSelectedTimeSlot(null);
                  setNewTaskTitle('');
                }}
                className="p-1 text-primary-600 hover:text-primary-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* タスクリストから選択 */}
            {quickTasks.filter(t => !t.completed).length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-primary-700 mb-2">タスクリストから選択:</p>
                <div className="flex flex-wrap gap-2">
                  {quickTasks.filter(t => !t.completed).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setNewTaskTitle(task.text)}
                      className="px-3 py-1.5 bg-white border border-primary-300 rounded-lg text-sm text-gray-700 hover:bg-primary-100 hover:border-primary-400 transition-colors"
                    >
                      {task.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="タスクの内容を入力..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask();
                  }
                }}
                autoFocus
              />
            </div>

            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs text-primary-700 mb-1">開始時間</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder={selectedTimeSlot}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-primary-700 mb-1">終了時間（任意）</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="終了時間"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>追加</span>
            </button>
          </div>
        )}
      </div>

      {/* タイムシート */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">タイムシート (7:00 - 24:00)</h3>
          <p className="text-sm text-gray-600 mb-4">
            時間をクリックしてタスクを追加できます
          </p>
        </div>

        {/* タイムライン */}
        <div className="divide-y divide-gray-200">
          {timeSlots.map((time) => {
            const tasks = getTasksForTimeSlot(time);
            const isCurrentTime = time === currentTime;
            const isPastTime = time < currentTime;

            return (
              <div
                key={time}
                className={`flex transition-colors ${
                  isCurrentTime
                    ? 'bg-yellow-50 border-l-4 border-yellow-400'
                    : isPastTime
                    ? 'bg-gray-50'
                    : ''
                }`}
              >
                {/* 時間表示 */}
                <div className="w-24 flex-shrink-0 p-4 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${isCurrentTime ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${
                      isCurrentTime ? 'text-yellow-700' : isPastTime ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {time}
                    </span>
                  </div>
                  {isCurrentTime && (
                    <span className="text-xs text-yellow-600 font-semibold">現在</span>
                  )}
                </div>

                {/* タスクエリア */}
                <div className="flex-1 p-4">
                  {tasks.length > 0 ? (
                    <div className="space-y-2">
                      {tasks.map((task) => {
                        const isTaskStart = task.time === time;

                        return (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                              task.endTime
                                ? task.completed
                                  ? 'bg-gray-100 border-l-4 border-gray-400 opacity-60'
                                  : 'bg-primary-100 border-l-4 border-primary-500'
                                : task.completed
                                ? 'bg-gray-50 border-2 border-gray-200 opacity-60'
                                : 'bg-white border-2 border-gray-300 hover:border-primary-400'
                            }`}
                          >
                            {isTaskStart && (
                              <button
                                onClick={() => handleToggleComplete(task.id)}
                                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  task.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 hover:border-primary-500'
                                }`}
                              >
                                {task.completed && <Check className="w-3 h-3 text-white" />}
                              </button>
                            )}

                            <div className="flex-1">
                              <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : task.endTime ? 'text-primary-800' : 'text-gray-800'}`}>
                                {task.title}
                              </p>
                              {task.endTime && isTaskStart && (
                                <p className="text-xs text-primary-600 mt-1">
                                  {task.startTime} 〜 {task.endTime}
                                </p>
                              )}
                              {task.endTime && !isTaskStart && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ⬆ {task.startTime}から継続中
                                </p>
                              )}
                            </div>

                            {isTaskStart && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedTimeSlot(time);
                        setStartTime(time);
                        setEndTime('');
                      }}
                      className="w-full py-2 text-sm text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors text-left px-3"
                    >
                      + タスクを追加
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodayTasks;
