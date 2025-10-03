import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Plus, FileText, Users, Edit } from 'lucide-react';
import { format } from 'date-fns';
import StaffModal from './StaffModal';

const StaffList = () => {
  const { staff } = useAppContext();
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setIsStaffModalOpen(true);
  };

  const handleCloseStaffModal = () => {
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-primary-500" />
            <h2 className="text-2xl font-bold text-gray-800">スタッフ管理</h2>
          </div>
          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>新しいスタッフ</span>
          </button>
        </div>

        {staff.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((staffMember) => (
              <div
                key={staffMember.id}
                onClick={() => handleEditStaff(staffMember)}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{staffMember.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{staffMember.currentClient}</p>
                  </div>
                  <Edit className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">常駐期間:</span>
                    <p className="text-gray-800">
                      {format(new Date(staffMember.assignmentPeriod.start), 'yyyy/MM/dd')}
                      {' 〜 '}
                      {staffMember.assignmentPeriod.end
                        ? format(new Date(staffMember.assignmentPeriod.end), 'yyyy/MM/dd')
                        : '継続中'}
                    </p>
                  </div>

                  {staffMember.contact.email && (
                    <div>
                      <span className="text-gray-600">メール:</span>
                      <p className="text-gray-800 truncate">{staffMember.contact.email}</p>
                    </div>
                  )}

                  {staffMember.contact.phone && (
                    <div>
                      <span className="text-gray-600">電話:</span>
                      <p className="text-gray-800">{staffMember.contact.phone}</p>
                    </div>
                  )}

                  {staffMember.dailyReportUrl && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <a
                        href={staffMember.dailyReportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span>日報を開く</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">スタッフが登録されていません</p>
            <p className="text-gray-400 text-sm mt-2">「新しいスタッフ」ボタンから追加してください</p>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      {staff.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">統計情報</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">総スタッフ数</p>
              <p className="text-3xl font-bold text-blue-800">{staff.length}</p>
              <p className="text-xs text-blue-600">名</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">稼働中</p>
              <p className="text-3xl font-bold text-green-800">
                {staff.filter((s) => !s.assignmentPeriod.end || new Date(s.assignmentPeriod.end) > new Date()).length}
              </p>
              <p className="text-xs text-green-600">名</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">クライアント数</p>
              <p className="text-3xl font-bold text-purple-800">
                {[...new Set(staff.map((s) => s.currentClient))].length}
              </p>
              <p className="text-xs text-purple-600">社</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">日報登録率</p>
              <p className="text-3xl font-bold text-orange-800">
                {Math.round((staff.filter((s) => s.dailyReportUrl).length / staff.length) * 100)}
              </p>
              <p className="text-xs text-orange-600">%</p>
            </div>
          </div>
        </div>
      )}

      {/* モーダル */}
      {isStaffModalOpen && (
        <StaffModal
          staff={editingStaff}
          onClose={handleCloseStaffModal}
        />
      )}
    </div>
  );
};

export default StaffList;
