import { useState, useEffect } from 'react';
import { format, addWeeks } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const NextWeekPlanEditor = ({ weekStart }) => {
  const { users, nextWeekPlans, addNextWeekPlan, updateNextWeekPlan, deleteNextWeekPlan } = useAppContext();
  const [selectedUser, setSelectedUser] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    user_id: '',
    title: '',
    priority: '2',
    est_hours: '',
    planned_dates: ''
  });

  const nextWeekStart = addWeeks(weekStart, 1);
  const nextWeekEnd = addWeeks(nextWeekStart, 1);

  // 来週の計画を取得（week_idは今のところ未使用、日付範囲で判定）
  const weekPlans = nextWeekPlans.filter(plan => {
    // 仮実装：とりあえず全部表示（本来はweek_idで絞る）
    return true;
  });

  const filteredPlans = selectedUser === 'all'
    ? weekPlans
    : weekPlans.filter(plan => plan.user_id === selectedUser);

  const resetForm = () => {
    setFormData({
      user_id: '',
      title: '',
      priority: '2',
      est_hours: '',
      planned_dates: ''
    });
    setIsAdding(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      user_id: plan.user_id,
      title: plan.title,
      priority: plan.priority.toString(),
      est_hours: plan.est_hours?.toString() || '',
      planned_dates: plan.planned_dates?.join(', ') || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_id || !formData.title) {
      alert('担当者とタイトルは必須です');
      return;
    }

    try {
      const planData = {
        user_id: formData.user_id,
        title: formData.title,
        priority: parseInt(formData.priority),
        est_hours: formData.est_hours ? parseFloat(formData.est_hours) : null,
        planned_dates: formData.planned_dates
          ? formData.planned_dates.split(',').map(d => d.trim()).filter(d => d)
          : [],
        week_id: null // 後で週管理機能を追加時に設定
      };

      if (editingPlan) {
        await updateNextWeekPlan(editingPlan.id, planData);
      } else {
        await addNextWeekPlan(planData);
      }

      resetForm();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (planId) => {
    if (window.confirm('この計画を削除してもよろしいですか?')) {
      try {
        await deleteNextWeekPlan(planId);
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
      }
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : '不明';
  };

  const priorityLabels = {
    1: { label: '高', color: 'bg-red-100 text-red-800' },
    2: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
    3: { label: '低', color: 'bg-blue-100 text-blue-800' }
  };

  // ユーザー別にグループ化
  const plansByUser = users.reduce((acc, user) => {
    acc[user.id] = filteredPlans.filter(plan => plan.user_id === user.id);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            来週やること ({format(nextWeekStart, 'M/d', { locale: ja })} - {format(nextWeekEnd, 'M/d', { locale: ja })})
          </h3>
          <p className="text-sm text-gray-500 mt-1">週報に反映される計画を入力してください</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          計画追加
        </button>
      </div>

      {/* フィルター */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">担当者フィルター</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">全員</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      {/* 入力フォーム */}
      {(isAdding || editingPlan) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                担当者 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">選択してください</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">高</option>
                <option value="2">中</option>
                <option value="3">低</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例：FAQ反映、テスト実施"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">見積時間（h）</label>
              <input
                type="text"
                value={formData.est_hours}
                onChange={(e) => setFormData({ ...formData, est_hours: e.target.value })}
                placeholder="例：2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">実施予定日</label>
              <input
                type="text"
                value={formData.planned_dates}
                onChange={(e) => setFormData({ ...formData, planned_dates: e.target.value })}
                placeholder="例：10/23, 10/24（カンマ区切り）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingPlan ? '更新' : '追加'}
            </button>
          </div>
        </form>
      )}

      {/* 計画リスト */}
      {filteredPlans.length === 0 ? (
        <p className="text-gray-500 text-center py-8">来週の計画がまだありません</p>
      ) : (
        <div className="space-y-6">
          {selectedUser === 'all' ? (
            // ユーザー別表示
            users.map(user => {
              const userPlans = plansByUser[user.id] || [];
              if (userPlans.length === 0) return null;

              return (
                <div key={user.id} className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-700 mb-3">{user.name}</h4>
                  <div className="space-y-2">
                    {userPlans
                      .sort((a, b) => a.priority - b.priority)
                      .map(plan => (
                        <PlanItem
                          key={plan.id}
                          plan={plan}
                          priorityLabels={priorityLabels}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                  </div>
                </div>
              );
            })
          ) : (
            // 単一ユーザー表示
            <div className="space-y-2">
              {filteredPlans
                .sort((a, b) => a.priority - b.priority)
                .map(plan => (
                  <PlanItem
                    key={plan.id}
                    plan={plan}
                    priorityLabels={priorityLabels}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* サマリー */}
      {filteredPlans.length > 0 && (
        <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">総計画数</p>
            <p className="text-2xl font-bold text-green-600">{filteredPlans.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">総見積時間</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredPlans.reduce((sum, p) => sum + (p.est_hours || 0), 0).toFixed(1)}h
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const PlanItem = ({ plan, priorityLabels, onEdit, onDelete }) => {
  const priority = priorityLabels[plan.priority] || priorityLabels[2];

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${priority.color}`}>
              優先度: {priority.label}
            </span>
            {plan.est_hours && (
              <span className="text-sm text-gray-600">
                見積: {plan.est_hours}h
              </span>
            )}
          </div>
          <p className="font-medium text-gray-800 mb-1">{plan.title}</p>
          {plan.planned_dates && plan.planned_dates.length > 0 && (
            <p className="text-sm text-gray-600">
              実施予定: {plan.planned_dates.join(', ')}
            </p>
          )}
        </div>
        <div className="flex gap-1 ml-4">
          <button
            onClick={() => onEdit(plan)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(plan.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextWeekPlanEditor;
