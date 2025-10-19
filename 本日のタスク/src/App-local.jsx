import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // デフォルト値として今日の日付を設定
  const getDefaultDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newTaskDate, setNewTaskDate] = useState(getDefaultDate());
  const [expandedSections, setExpandedSections] = useState({
    past: false,
    today: true,
    tomorrow: false,
    future: false
  });

  // LocalStorageからタスクを読み込む
  useEffect(() => {
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // タスクが変更されたらLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
  }, [tasks]);

  // 現在の日付をYYYY-MM-DD形式で取得
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // タスクを追加
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      date: newTaskDate,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDate(getDefaultDate());
  };

  // タスクの完了状態を切り替え
  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  // タスクを削除
  const handleDeleteTask = (taskId) => {
    if (!confirm('このタスクを削除しますか?')) return;
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // タスクを日付で分類
  const categorizeTasksByDate = () => {
    const now = new Date();
    const today = getTodayString();

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

    return {
      past: tasks.filter((t) => t.date < yesterday),
      yesterday: tasks.filter((t) => t.date === yesterday),
      today: tasks.filter((t) => t.date === today),
      tomorrow: tasks.filter((t) => t.date === tomorrow),
      future: tasks.filter((t) => t.date > tomorrow),
    };
  };

  const categorizedTasks = categorizeTasksByDate();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderTaskSection = (title, taskList, sectionKey, highlight = false, emoji = '') => {
    if (taskList.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];

    return (
      <div className={`mb-4 ${highlight ? 'bg-blue-50 border-2 border-blue-300' : 'bg-white border border-gray-200'} rounded-lg overflow-hidden`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between p-4 ${highlight ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-opacity-80 transition`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <h2 className={`text-base font-bold ${highlight ? 'text-blue-700' : 'text-gray-700'}`}>
              {title}
            </h2>
            <span className={`text-sm font-normal ${highlight ? 'text-blue-600' : 'text-gray-500'}`}>
              ({taskList.length})
            </span>
          </div>
          <span className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {isExpanded && (
          <div className="p-3 space-y-2">
            {taskList.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100 active:shadow-md transition"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task.id)}
                  className="w-6 h-6 min-w-6 cursor-pointer accent-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-base ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {task.date}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 active:text-red-700 font-bold text-2xl px-2 min-w-8"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-3 pb-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          📝 本日のタスク
        </h1>
        <div className="text-center text-sm text-gray-500 mb-6">
          {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
          })}
        </div>

        {/* タスク追加フォーム */}
        <form onSubmit={handleAddTask} className="mb-6 bg-white p-4 rounded-lg shadow-md sticky top-0 z-10">
          <div className="space-y-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="新しいタスクを入力"
              className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="flex-1 px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 active:bg-blue-700 transition text-base"
              >
                追加
              </button>
            </div>
          </div>
        </form>

        {/* タスク一覧 */}
        {renderTaskSection('先日のタスク', [...categorizedTasks.past, ...categorizedTasks.yesterday], 'past', false, '📅')}
        {renderTaskSection('本日のタスク', categorizedTasks.today, 'today', true, '⭐')}
        {renderTaskSection('明日のタスク', categorizedTasks.tomorrow, 'tomorrow', false, '📌')}
        {renderTaskSection('将来のタスク', categorizedTasks.future, 'future', false, '🔮')}

        {tasks.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            タスクがありません。上のフォームから追加してください。
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
