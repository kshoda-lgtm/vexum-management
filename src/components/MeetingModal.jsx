import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const MeetingModal = ({ meeting, onClose }) => {
  const { staff, addMeeting, updateMeeting, deleteMeeting, addTask } = useAppContext();
  const isEditing = !!meeting;

  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    title: '',
    clientName: '',
    staffIds: [],
    participants: [],
    agenda: '',
    decisions: [],
    actions: '',
    notes: '',
    nextMeetingDate: '',
    nextAgenda: ''
  });

  const [participantInput, setParticipantInput] = useState('');
  const [decisionInput, setDecisionInput] = useState('');

  useEffect(() => {
    if (meeting) {
      setFormData({
        ...meeting,
        date: format(new Date(meeting.date), "yyyy-MM-dd'T'HH:mm"),
        nextMeetingDate: meeting.nextMeetingDate
          ? format(new Date(meeting.nextMeetingDate), "yyyy-MM-dd'T'HH:mm")
          : ''
      });
    }
  }, [meeting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStaffChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setFormData(prev => ({ ...prev, staffIds: selectedOptions }));
  };

  const handleAddParticipant = () => {
    if (participantInput.trim()) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, participantInput.trim()]
      }));
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (index) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const handleAddDecision = () => {
    if (decisionInput.trim()) {
      const newDecision = {
        id: `decision-${Date.now()}`,
        content: decisionInput.trim(),
        taskId: null,
        isTaskCreated: false
      };
      setFormData(prev => ({
        ...prev,
        decisions: [...prev.decisions, newDecision]
      }));
      setDecisionInput('');
    }
  };

  const handleRemoveDecision = (index) => {
    setFormData(prev => ({
      ...prev,
      decisions: prev.decisions.filter((_, i) => i !== index)
    }));
  };

  const handleToggleTaskCreation = (index) => {
    setFormData(prev => ({
      ...prev,
      decisions: prev.decisions.map((decision, i) => {
        if (i === index) {
          return { ...decision, isTaskCreated: !decision.isTaskCreated };
        }
        return decision;
      })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const meetingData = {
      ...formData,
      date: new Date(formData.date),
      nextMeetingDate: formData.nextMeetingDate ? new Date(formData.nextMeetingDate) : null
    };

    let savedMeeting;
    if (isEditing) {
      updateMeeting(meeting.id, meetingData);
      savedMeeting = { ...meeting, ...meetingData };
    } else {
      savedMeeting = addMeeting(meetingData);
    }

    // タスク化フラグが立っている決定事項をタスクとして作成
    formData.decisions.forEach((decision) => {
      if (decision.isTaskCreated && !decision.taskId) {
        const newTask = addTask({
          taskName: decision.content,
          projectName: formData.title,
          clientName: formData.clientName,
          staffId: formData.staffIds[0] || '',
          deadline: formData.nextMeetingDate || new Date(),
          completionRate: 0,
          status: 'not_started',
          overview: `ミーティング「${formData.title}」で決定`,
          achievements: '',
          results: '',
          technologies: [],
          notes: '',
          createdFromMeetingId: savedMeeting.id,
          reportToMeetingId: null
        });

        // 決定事項にタスクIDを紐付け
        decision.taskId = newTask.id;
      }
    });

    onClose();
  };

  const handleDelete = () => {
    if (confirm('このミーティング記録を削除してもよろしいですか?')) {
      deleteMeeting(meeting.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'ミーティング記録編集' : '新しいミーティング記録'}
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
                  ミーティング日時 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ミーティング名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="クライアントA 定例MTG"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                参加スタッフ（複数選択可）
              </label>
              <select
                multiple
                value={formData.staffIds}
                onChange={handleStaffChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
              >
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Ctrlキーを押しながらクリックで複数選択</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                参加者（クライアント側含む）
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipant();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="参加者名を入力"
                />
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {formData.participants.map((participant, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {participant}
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ミーティング内容 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">ミーティング内容</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                議題
              </label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="何を話したか"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                決定事項
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={decisionInput}
                  onChange={(e) => setDecisionInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDecision();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="決定事項を入力"
                />
                <button
                  type="button"
                  onClick={handleAddDecision}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.decisions.map((decision, index) => (
                  <div
                    key={decision.id}
                    className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{decision.content}</p>
                      <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={decision.isTaskCreated}
                          onChange={() => handleToggleTaskCreation(index)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span>タスク化する</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDecision(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                次回までのアクション
              </label>
              <textarea
                name="actions"
                value={formData.actions}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="次回までに実施すること"
              />
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

          {/* 次回予定 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">次回予定</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                次回ミーティング日時
              </label>
              <input
                type="datetime-local"
                name="nextMeetingDate"
                value={formData.nextMeetingDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                次回の議題・話すこと
              </label>
              <textarea
                name="nextAgenda"
                value={formData.nextAgenda}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="次回話す内容"
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

export default MeetingModal;
