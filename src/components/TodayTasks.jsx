import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Check, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAppContext } from '../contexts/AppContext';

const TodayTasks = () => {
  const { tasks } = useAppContext();
  const [quickTasks, setQuickTasks] = useState([]);
  const [newQuickTaskText, setNewQuickTaskText] = useState('');

  const STORAGE_KEY = 'today_tasks_data';

  // LocalStorageからデータを読み込み
  useEffect(() => {
    loadTodayTasks();
  }, [tasks]);

  const loadTodayTasks = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : null;

      // 日付チェック
      const today = new Date().toISOString().split('T')[0];
      const lastResetDate = data?.last_reset_date;

      let loadedQuickTasks = [];

      if (lastResetDate !== today) {
        // 日付が変わっていたらリセット
        const newData = {
          quick_tasks: [],
          last_reset_date: today,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } else {
        loadedQuickTasks = data?.quick_tasks || [];
      }

      // 終了間近タスクを追加
      const todayDate = new Date();
      const upcomingDeadlineTasks = tasks.filter(task => {
        const oneWeekBeforeDeadline = new Date(task.deadline);
        oneWeekBeforeDeadline.setDate(oneWeekBeforeDeadline.getDate() - 7);
        return isSameDay(oneWeekBeforeDeadline, todayDate) && task.status !== 'completed';
      });

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
    } catch (err) {
      console.error('Error loading today tasks:', err);
    }
  };

  // 簡易タスクをLocalStorageに保存
  const saveQuickTasks = (updatedTasks) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};

      const newData = {
        ...data,
        quick_tasks: updatedTasks,
        last_reset_date: data?.last_reset_date || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setQuickTasks(updatedTasks);
    } catch (err) {
      console.error('Error saving quick tasks:', err);
    }
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

  return (
    <div className="space-y-6">
      {/* タスクリスト */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">本日のタスク</h2>
            <p className="text-sm text-gray-500">{format(new Date(), 'yyyy年M月d日 (E)', { locale: ja })}</p>
          </div>
        </div>
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
    </div>
  );
};

export default TodayTasks;
