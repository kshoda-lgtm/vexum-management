import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { X, Save, AlertCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { createEntryHash } from '../utils/idempotency';

const DailyReportModal = ({ date, onClose, entryToEdit = null }) => {
  const { users, addDailyEntry, updateDailyEntry, dailyEntries } = useAppContext();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'

  const [formData, setFormData] = useState({
    user_id: '',
    category: '',
    summary: '',
    outcome: '',
    detail: '',
    tickets: '',
    time_spent_h: '',
    issues: '',
    next_action: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        user_id: entryToEdit.user_id || '',
        category: entryToEdit.category || '',
        summary: entryToEdit.summary || '',
        outcome: entryToEdit.outcome || '',
        detail: entryToEdit.detail || '',
        tickets: entryToEdit.tickets?.join(', ') || '',
        time_spent_h: entryToEdit.time_spent_h || '',
        issues: entryToEdit.issues || '',
        next_action: entryToEdit.next_action || ''
      });
    }
  }, [entryToEdit]);

  const categories = [
    { value: '運用', label: '運用' },
    { value: '開発', label: '開発' },
    { value: 'MTG', label: 'MTG' },
    { value: '不具合', label: '不具合' },
    { value: 'その他', label: 'その他' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id) newErrors.user_id = '担当者を選択してください';
    if (!formData.category) newErrors.category = 'カテゴリを選択してください';
    if (!formData.summary) newErrors.summary = '実施内容を入力してください';
    if (!formData.outcome) newErrors.outcome = '成果/完了を入力してください';

    if (formData.time_spent_h && !/^\d+(\.\d{1,2})?$/.test(formData.time_spent_h)) {
      newErrors.time_spent_h = '数値を入力してください（0.25刻み推奨）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicate = () => {
    const hash = createEntryHash({
      user_id: formData.user_id,
      date: format(date, 'yyyy-MM-dd'),
      summary: formData.summary,
      category: formData.category,
      time_spent_h: formData.time_spent_h
    });

    // 編集中のエントリーは除外
    const existingEntry = dailyEntries.find(entry =>
      entry.idempotency_hash === hash &&
      (!entryToEdit || entry.id !== entryToEdit.id)
    );

    return existingEntry;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // 冪等性チェック（新規作成時のみ）
    if (!entryToEdit) {
      const duplicate = checkDuplicate();
      if (duplicate) {
        setToastType('error');
        setToastMessage('同じ内容の日報が既に登録されています');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
    }

    try {
      const ticketsArray = formData.tickets
        ? formData.tickets.split(',').map(t => t.trim()).filter(t => t)
        : [];

      const entryData = {
        date: format(date, 'yyyy-MM-dd'),
        user_id: formData.user_id,
        category: formData.category,
        summary: formData.summary,
        outcome: formData.outcome,
        detail: formData.detail,
        tickets: ticketsArray,
        time_spent_h: formData.time_spent_h ? parseFloat(formData.time_spent_h) : null,
        issues: formData.issues,
        next_action: formData.next_action,
        source_doc_location: null, // Google Docs連携実装後に更新
        idempotency_hash: createEntryHash({
          user_id: formData.user_id,
          date: format(date, 'yyyy-MM-dd'),
          summary: formData.summary,
          category: formData.category,
          time_spent_h: formData.time_spent_h
        })
      };

      if (entryToEdit) {
        await updateDailyEntry(entryToEdit.id, entryData);
        setToastMessage('日報を更新しました');
      } else {
        await addDailyEntry(entryData);
        setToastMessage('日報を保存しました（※Google Docs連携は未実装）');
      }

      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('日報保存エラー:', error);
      setToastType('error');
      setToastMessage('日報の保存に失敗しました');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {entryToEdit ? '日報編集' : '日報入力'} - {format(date, 'yyyy年M月d日(E)', { locale: ja })}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* トースト通知 */}
        {showToast && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center gap-2 ${
            toastType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 担当者 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              担当者 <span className="text-red-500">*</span>
            </label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.user_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">選択してください</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.user_id && <p className="mt-1 text-sm text-red-500">{errors.user_id}</p>}
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作業カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">選択してください</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* 実施内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              実施内容（要約1行） <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="例：FAQ更新5件を実施"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.summary ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.summary && <p className="mt-1 text-sm text-red-500">{errors.summary}</p>}
          </div>

          {/* 成果/完了 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              成果/完了 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
              placeholder="例：5件完了、問い合わせ削減見込み-12%"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.outcome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.outcome && <p className="mt-1 text-sm text-red-500">{errors.outcome}</p>}
          </div>

          {/* 所要時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              所要時間（時間）
            </label>
            <input
              type="text"
              name="time_spent_h"
              value={formData.time_spent_h}
              onChange={handleChange}
              placeholder="例：1.5（0.25刻み推奨）"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.time_spent_h ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.time_spent_h && <p className="mt-1 text-sm text-red-500">{errors.time_spent_h}</p>}
          </div>

          {/* 詳細 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              詳細
            </label>
            <textarea
              name="detail"
              value={formData.detail}
              onChange={handleChange}
              rows={3}
              placeholder="詳細な説明があれば記入してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 関連チケット/URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              関連チケット/URL
            </label>
            <input
              type="text"
              name="tickets"
              value={formData.tickets}
              onChange={handleChange}
              placeholder="例：TICKET-123, https://example.com（カンマ区切り）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 課題/リスク */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              課題/リスク
            </label>
            <textarea
              name="issues"
              value={formData.issues}
              onChange={handleChange}
              rows={2}
              placeholder="課題やリスクがあれば記入してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 次アクション */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              次アクション
            </label>
            <input
              type="text"
              name="next_action"
              value={formData.next_action}
              onChange={handleChange}
              placeholder="例：承認待ち、テスト実施予定"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {entryToEdit ? '更新' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyReportModal;
