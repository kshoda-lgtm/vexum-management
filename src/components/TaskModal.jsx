import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const TaskModal = ({ task, onClose }) => {
  const { staff, addTask, updateTask, deleteTask } = useAppContext();
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    taskName: '',
    projectName: '',
    clientName: '',
    staffId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    deadline: format(new Date(), 'yyyy-MM-dd'),
    completionRate: 0,
    status: 'not_started',
    overview: '',
    achievements: '',
    results: '',
    technologies: [],
    notes: '',
    createdFromMeetingId: null,
    reportToMeetingId: null
  });

  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        startDate: task.startDate ? format(new Date(task.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        deadline: format(new Date(task.deadline), 'yyyy-MM-dd'),
        technologies: task.technologies || []
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompletionRateChange = (e) => {
    const rate = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, completionRate: rate }));
  };

  const handleAddTechnology = () => {
    if (techInput.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (index) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      ...formData,
      startDate: new Date(formData.startDate),
      deadline: new Date(formData.deadline),
      completionRate: parseInt(formData.completionRate)
    };

    if (isEditing) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (confirm('このタスクを削除してもよろしいですか?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'タスク編集' : '新しいタスク'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">基本情報</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タスク名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="要件定義"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プロジェクト名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="プロジェクトX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  クライアント名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="クライアントA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当スタッフ <span className="text-red-500">*</span>
                </label>
                <select
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  業務開始日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期限 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="not_started">未着手</option>
                  <option value="in_progress">進行中</option>
                  <option value="completed">完了</option>
                  <option value="delayed">遅延</option>
                </select>
              </div>
            </div>
          </div>

          {/* 達成度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              達成度: {formData.completionRate}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.completionRate}
              onChange={handleCompletionRateChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          {/* 詳細情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">詳細情報</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                概要
              </label>
              <textarea
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="データ分析基盤の構築"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                達成内容
              </label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="- 要件定義完了&#10;- データ収集スクリプト作成"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                成果
              </label>
              <textarea
                name="results"
                value={formData.results}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="月間10万件のデータを自動収集可能に"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                使用技術
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechnology();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Python, TensorFlowなど"
                />
                <button
                  type="button"
                  onClick={handleAddTechnology}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  追加
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {formData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnology(index)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="その他メモ"
              />
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  削除
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {isEditing ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
