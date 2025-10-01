import { useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ChevronLeft, ChevronRight, X, Plus, Camera } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const ShiftSchedule = () => {
  const { shifts, addShift, deleteShift } = useAppContext();
  const [filterClient, setFilterClient] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date()); // 今日の日付
  const [selectedDates, setSelectedDates] = useState([]);
  const [staffName, setStaffName] = useState('');
  const [clientName, setClientName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const calendarRef = useRef(null);

  // クライアント一覧を取得
  const clients = [...new Set(shifts.map(s => s.clientName))].filter(Boolean);

  // カレンダーの日付を生成
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 月の最初の日の曜日を取得
  const startDayOfWeek = monthStart.getDay();

  // 前の月へ
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 次の月へ
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 日付をタップした時
  const handleDateClick = (date) => {
    setSelectedDates(prev => {
      const dateStr = date.toISOString();
      if (prev.some(d => d.toISOString() === dateStr)) {
        // 既に選択されている場合は除外
        return prev.filter(d => d.toISOString() !== dateStr);
      } else {
        // 選択されていない場合は追加
        return [...prev, date];
      }
    });

    // フォームを表示
    if (!showForm) {
      setShowForm(true);
    }
  };

  // シフト一括追加
  const handleAddShifts = () => {
    if (!staffName.trim() || !clientName.trim()) {
      alert('スタッフ名とクライアント名を入力してください');
      return;
    }

    if (selectedDates.length === 0) {
      alert('日付を選択してください');
      return;
    }

    // 選択された全ての日付のシフトを一度に追加
    const addedCount = selectedDates.length;
    const newShifts = selectedDates.map(date => ({
      clientName: clientName.trim(),
      staffId: staffName.trim(),
      date: new Date(date),
      startTime,
      endTime,
      notes
    }));

    // 一括で追加
    newShifts.forEach(shiftData => {
      addShift(shiftData);
    });

    // リセット
    setStaffName('');
    setClientName('');
    setStartTime('09:00');
    setEndTime('18:00');
    setNotes('');
    setSelectedDates([]);
    setShowForm(false);

    // 少し遅延させてからアラート表示（state更新を待つ）
    setTimeout(() => {
      alert(`${addedCount}件のシフトを追加しました`);
    }, 100);
  };

  // 特定の日のシフトを取得（クライアントフィルター適用）
  const getShiftsForDate = (date) => {
    const dateShifts = shifts.filter(shift => isSameDay(new Date(shift.date), date));
    if (filterClient) {
      return dateShifts.filter(shift => shift.clientName === filterClient);
    }
    return dateShifts;
  };

  // 日付が選択されているか確認
  const isDateSelected = (date) => {
    return selectedDates.some(d => isSameDay(d, date));
  };

  // カレンダーのスクリーンショットを撮る
  const handleScreenshot = async () => {
    if (!calendarRef.current) return;

    try {
      // 少し待ってからキャプチャ（レンダリング完了を待つ）
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, // さらに高解像度で撮影
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false, // SVGレンダリングを無効化
        imageTimeout: 0,
        removeContainer: true,
        letterRendering: true
      });

      canvas.toBlob((blob) => {
        const clientText = filterClient || 'すべて';
        const fileName = `シフトスケジュール_${clientText}_${format(currentDate, 'yyyy年M月')}.png`;
        saveAs(blob, fileName);
      });
    } catch (error) {
      console.error('スクリーンショットの取得に失敗しました:', error);
      alert('スクリーンショットの取得に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* カレンダー */}
      <div className="bg-white rounded-lg shadow p-6" ref={calendarRef}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">シフトスケジュール</h2>

          {/* クライアント選択とスクリーンショットボタン */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleScreenshot}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="カレンダーをスクリーンショット"
            >
              <Camera className="w-5 h-5" />
              <span>スクリーンショット</span>
            </button>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">クライアント:</label>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">すべて</option>
                {clients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 月選択 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="text-xl font-bold">
            {format(currentDate, 'yyyy年M月')}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 選択中の日付数を表示 */}
        {selectedDates.length > 0 && (
          <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-700">
              <strong>{selectedDates.length}日</strong> 選択中
              <button
                onClick={() => setSelectedDates([])}
                className="ml-3 text-xs text-primary-600 hover:text-primary-800 underline"
              >
                選択をクリア
              </button>
            </p>
          </div>
        )}

        {/* カレンダー */}
        <div className="grid grid-cols-7 gap-2">
          {/* 曜日ヘッダー */}
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div
              key={day}
              className={`text-center font-semibold py-2 ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}

          {/* 空白セル */}
          {Array.from({ length: startDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square"></div>
          ))}

          {/* 日付セル */}
          {daysInMonth.map(date => {
            const dayShifts = getShiftsForDate(date);
            const isSelected = isDateSelected(date);
            const dayOfWeek = date.getDay();

            return (
              <div
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary-200 border-primary-600 shadow-md ring-2 ring-primary-400'
                    : isToday(date)
                    ? 'bg-blue-50 border-blue-300'
                    : 'border-gray-200 hover:bg-gray-50'
                } ${dayOfWeek === 0 ? 'bg-red-50' : dayOfWeek === 6 ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-semibold ${
                  dayOfWeek === 0 ? 'text-red-600' : dayOfWeek === 6 ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {format(date, 'd')}
                </div>
                {dayShifts.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayShifts.slice(0, 2).map(shift => (
                      <div
                        key={shift.id}
                        className="text-xs bg-primary-500 text-white px-1 py-0.5 rounded truncate"
                        title={`${shift.staffId} ${shift.startTime}-${shift.endTime}`}
                      >
                        {shift.staffId}
                      </div>
                    ))}
                    {dayShifts.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayShifts.length - 2}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* シフト一括登録フォーム */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              シフト一括登録 {selectedDates.length > 0 && `(${selectedDates.length}日)`}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedDates([]);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 選択された日付一覧 */}
          {selectedDates.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">選択された日付:</p>
              <div className="flex flex-wrap gap-2">
                {selectedDates.sort((a, b) => a - b).map(date => (
                  <span
                    key={date.toISOString()}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded"
                  >
                    {format(date, 'M/d')}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDates(prev => prev.filter(d => !isSameDay(d, date)));
                      }}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クライアント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="株式会社〇〇"
                list="client-list"
              />
              <datalist id="client-list">
                {clients.map(client => (
                  <option key={client} value={client} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                スタッフ名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="山田太郎"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出勤時間
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                退勤時間
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="リモート勤務など"
            />
          </div>

          <button
            onClick={handleAddShifts}
            disabled={selectedDates.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>選択した{selectedDates.length}日にシフトを追加</span>
          </button>

          {/* 登録済みシフト一覧（選択中の日付） */}
          {selectedDates.length === 1 && getShiftsForDate(selectedDates[0]).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3">
                {format(selectedDates[0], 'M月d日')} の登録済みシフト
              </h4>
              <div className="space-y-2">
                {getShiftsForDate(selectedDates[0]).map(shift => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{shift.staffId}</p>
                      <p className="text-sm text-gray-600">
                        {shift.clientName} | {shift.startTime} 〜 {shift.endTime}
                        {shift.notes && ` | ${shift.notes}`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('このシフトを削除しますか?')) {
                          deleteShift(shift.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftSchedule;
