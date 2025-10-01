import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Plus, FileText, Filter } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import StaffModal from './StaffModal';

const ScheduleList = () => {
  const { staff, tasks } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // クライアント一覧を取得
  const clients = [...new Set(tasks.map(t => t.clientName))];

  // フィルタリングされたタスク
  const filteredTasks = tasks.filter(task => {
    // ステータスフィルター
    if (filter === 'in_progress' && task.status !== 'in_progress' && task.status !== 'not_started') {
      return false;
    }
    if (filter === 'delayed' && task.status !== 'delayed') {
      return false;
    }
    if (filter === 'this_week') {
      const now = new Date();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(task.deadline);
      if (deadline > weekEnd) return false;
    }

    // クライアントフィルター
    if (selectedClient !== 'all' && task.clientName !== selectedClient) {
      return false;
    }

    // スタッフフィルター
    if (selectedStaff !== 'all' && task.staffId !== selectedStaff) {
      return false;
    }

    return true;
  });

  // クライアント別にグループ化
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const key = `${task.clientName}-${task.staffId}`;
    if (!acc[key]) {
      acc[key] = {
        clientName: task.clientName,
        staffId: task.staffId,
        tasks: []
      };
    }
    acc[key].tasks.push(task);
    return acc;
  }, {});

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">フィルター</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ステータスフィルター */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全て
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'in_progress'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              進行中
            </button>
            <button
              onClick={() => setFilter('delayed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'delayed'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              遅延中
            </button>
            <button
              onClick={() => setFilter('this_week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'this_week'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              今週期限
            </button>
          </div>

          {/* クライアントフィルター */}
          <div>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全てのクライアント</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          {/* スタッフフィルター */}
          <div>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全てのスタッフ</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* タスク一覧 */}
      <div className="space-y-6">
        {Object.values(groupedTasks).map(group => {
          const staffMember = staff.find(s => s.id === group.staffId);
          return (
            <div key={`${group.clientName}-${group.staffId}`} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {group.clientName} - {staffMember?.name || '未設定'}
                  </h3>
                  {staffMember?.dailyReportUrl && (
                    <a
                      href={staffMember.dailyReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>日報を見る</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {group.tasks
                  .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                  .map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                    />
                  ))}
              </div>
            </div>
          );
        })}

        {Object.keys(groupedTasks).length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">タスクがありません</p>
            <p className="text-gray-400 text-sm mt-2">新しいタスクを追加してください</p>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <button
          onClick={() => setIsStaffModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>スタッフを追加</span>
        </button>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>タスクを追加</span>
        </button>
      </div>

      {/* モーダル */}
      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseTaskModal}
        />
      )}

      {isStaffModalOpen && (
        <StaffModal onClose={() => setIsStaffModalOpen(false)} />
      )}
    </div>
  );
};

export default ScheduleList;
