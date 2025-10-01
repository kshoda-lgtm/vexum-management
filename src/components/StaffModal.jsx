import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const StaffModal = ({ staff, onClose }) => {
  const { addStaff, updateStaff, deleteStaff } = useAppContext();
  const isEditing = !!staff;

  const [formData, setFormData] = useState({
    name: staff?.name || '',
    currentClient: staff?.currentClient || '',
    assignmentPeriod: {
      start: staff?.assignmentPeriod?.start
        ? format(new Date(staff.assignmentPeriod.start), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      end: staff?.assignmentPeriod?.end
        ? format(new Date(staff.assignmentPeriod.end), 'yyyy-MM-dd')
        : ''
    },
    contact: {
      email: staff?.contact?.email || '',
      phone: staff?.contact?.phone || ''
    },
    profileImage: staff?.profileImage || null,
    dailyReportUrl: staff?.dailyReportUrl || '',
    dailyReportLastUpdated: staff?.dailyReportLastUpdated || null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else if (name.startsWith('assignmentPeriod.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        assignmentPeriod: { ...prev.assignmentPeriod, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const staffData = {
      ...formData,
      assignmentPeriod: {
        start: new Date(formData.assignmentPeriod.start),
        end: formData.assignmentPeriod.end ? new Date(formData.assignmentPeriod.end) : null
      }
    };

    if (isEditing) {
      updateStaff(staff.id, staffData);
    } else {
      addStaff(staffData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (confirm('このスタッフを削除してもよろしいですか?')) {
      deleteStaff(staff.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'スタッフ編集' : '新しいスタッフ'}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="田中太郎"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                現在の常駐先クライアント <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="currentClient"
                value={formData.currentClient}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="クライアントA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  常駐期間 開始日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="assignmentPeriod.start"
                  value={formData.assignmentPeriod.start}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  常駐期間 終了予定日
                </label>
                <input
                  type="date"
                  name="assignmentPeriod.end"
                  value={formData.assignmentPeriod.end}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 連絡先 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">連絡先</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="090-1234-5678"
              />
            </div>
          </div>

          {/* 業務日報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">業務日報</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                業務日報URL（Googleドキュメント）
              </label>
              <input
                type="url"
                name="dailyReportUrl"
                value={formData.dailyReportUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://docs.google.com/document/d/..."
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

export default StaffModal;
