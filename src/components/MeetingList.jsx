import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Plus, Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import MeetingModal from './MeetingModal';

const MeetingList = () => {
  const { meetings, staff } = useAppContext();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  // クライアント一覧
  const clients = [...new Set(meetings.map(m => m.clientName))];

  // 今後のミーティングと過去のミーティングを分類
  const now = new Date();
  const upcomingMeetings = meetings.filter(m => {
    if (m.nextMeetingDate && new Date(m.nextMeetingDate) > now) {
      return true;
    }
    return false;
  });

  const pastMeetings = meetings.filter(m => {
    if (selectedClient !== 'all' && m.clientName !== selectedClient) {
      return false;
    }
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setIsMeetingModalOpen(true);
  };

  const handleCloseMeetingModal = () => {
    setIsMeetingModalOpen(false);
    setEditingMeeting(null);
  };

  const getStaffNames = (staffIds) => {
    return staffIds
      .map(id => staff.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* 今後の予定 */}
      {upcomingMeetings.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            今後の予定
          </h2>
          <div className="space-y-3">
            {upcomingMeetings.map(meeting => (
              <div
                key={meeting.id}
                className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEditMeeting(meeting)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {format(new Date(meeting.nextMeetingDate), 'yyyy/MM/dd HH:mm')}
                      </p>
                      <p className="text-sm text-gray-600">{meeting.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      前回の決定事項を確認
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {meeting.nextAgenda && (
                  <p className="text-sm text-gray-600 mt-2 ml-8">
                    議題: {meeting.nextAgenda}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">ミーティング記録</h2>
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
          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>新しいミーティング</span>
          </button>
        </div>
      </div>

      {/* ミーティング一覧 */}
      <div className="space-y-4">
        {pastMeetings.length > 0 ? (
          pastMeetings.map(meeting => (
            <div
              key={meeting.id}
              onClick={() => handleEditMeeting(meeting)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{meeting.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(meeting.date), 'yyyy/MM/dd HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{getStaffNames(meeting.staffIds)}</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {meeting.clientName}
                </span>
              </div>

              {meeting.agenda && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">議題:</p>
                  <p className="text-sm text-gray-600 mt-1">{meeting.agenda}</p>
                </div>
              )}

              {meeting.decisions && meeting.decisions.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">決定事項:</p>
                  <ul className="space-y-1">
                    {meeting.decisions.slice(0, 3).map((decision, index) => (
                      <li key={decision.id} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span className="flex-1">{decision.content}</span>
                        {decision.isTaskCreated && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            タスク化済み
                          </span>
                        )}
                      </li>
                    ))}
                    {meeting.decisions.length > 3 && (
                      <li className="text-sm text-gray-500">
                        +{meeting.decisions.length - 3}件
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {meeting.nextMeetingDate && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    次回: {format(new Date(meeting.nextMeetingDate), 'yyyy/MM/dd HH:mm')}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">ミーティング記録がありません</p>
            <p className="text-gray-400 text-sm mt-2">新しいミーティング記録を追加してください</p>
          </div>
        )}
      </div>

      {/* モーダル */}
      {isMeetingModalOpen && (
        <MeetingModal
          meeting={editingMeeting}
          onClose={handleCloseMeetingModal}
        />
      )}
    </div>
  );
};

export default MeetingList;
