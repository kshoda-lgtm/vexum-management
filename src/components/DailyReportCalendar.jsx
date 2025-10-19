import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import DailyReportModal from './DailyReportModal';

const DailyReportCalendar = () => {
  const { dailyEntries, users } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ja });
  const calendarEnd = endOfWeek(monthEnd, { locale: ja });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // 指定日の日報エントリー数を取得
  const getEntriesForDate = (date) => {
    return dailyEntries.filter(entry =>
      isSameDay(new Date(entry.date), date)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">日報カレンダー</h2>

        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold">
              {format(currentMonth, 'yyyy年 M月', { locale: ja })}
            </h3>
            <button
              onClick={handleToday}
              className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
            >
              今日
            </button>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div
              key={day}
              className={`text-center font-semibold py-2 ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const entries = getEntriesForDate(day);
            const hasEntries = entries.length > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square p-2 rounded-lg border-2 transition-all relative
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isToday ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}
                  ${hasEntries ? 'bg-green-50' : ''}
                  hover:bg-gray-100 hover:border-primary-300
                  ${index % 7 === 0 ? 'text-red-600' : index % 7 === 6 ? 'text-blue-600' : 'text-gray-700'}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-sm ${!isCurrentMonth && 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </span>
                  {hasEntries && (
                    <div className="mt-1 flex gap-0.5">
                      {entries.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      ))}
                      {entries.length > 3 && (
                        <span className="text-xs text-green-600 ml-0.5">+</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-500 rounded"></div>
            <span>今日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-gray-200 rounded"></div>
            <span>日報あり</span>
          </div>
        </div>
      </div>

      {/* 日報入力モーダル */}
      {isModalOpen && selectedDate && (
        <DailyReportModal
          date={selectedDate}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};

export default DailyReportCalendar;
