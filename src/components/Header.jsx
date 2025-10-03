import { useState } from 'react';
import { BarChart3, Calendar, Save, FileText, Users, UserCog, CalendarClock, ListOrdered, StickyNote, CheckSquare, Menu, X } from 'lucide-react';

const Header = ({ currentView, setCurrentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'staff', icon: UserCog, label: 'スタッフ' },
    { id: 'schedule', icon: Calendar, label: 'スケジュール' },
    { id: 'meetings', icon: Users, label: 'MTG記録' },
    { id: 'report', icon: FileText, label: '月次レポート' },
    { id: 'shift-schedule', icon: CalendarClock, label: 'シフトスケジュール' },
    { id: 'task-timeline', icon: ListOrdered, label: 'タスクタイムライン' },
    { id: 'today-tasks', icon: CheckSquare, label: '本日のタスク' },
    { id: 'memo', icon: StickyNote, label: 'メモ' },
    { id: 'backup', icon: Save, label: 'バックアップ' },
  ];

  const handleMenuClick = (viewId) => {
    setCurrentView(viewId);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-dark-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-500" />
            <h1 className="text-xl md:text-2xl font-bold">skecheck</h1>
          </div>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex gap-2">
            <button
              onClick={() => setCurrentView('staff')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'staff'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <UserCog className="w-5 h-5" />
              <span>スタッフ</span>
            </button>

            <button
              onClick={() => setCurrentView('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'schedule'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>スケジュール</span>
            </button>

            <button
              onClick={() => setCurrentView('meetings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'meetings'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>MTG記録</span>
            </button>

            <button
              onClick={() => setCurrentView('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'report'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>月次レポート</span>
            </button>

            <button
              onClick={() => setCurrentView('shift-schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'shift-schedule'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <CalendarClock className="w-5 h-5" />
              <span>シフトスケジュール</span>
            </button>

            <button
              onClick={() => setCurrentView('task-timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'task-timeline'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <ListOrdered className="w-5 h-5" />
              <span>タスクタイムライン</span>
            </button>

            <button
              onClick={() => setCurrentView('today-tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'today-tasks'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>本日のタスク</span>
            </button>

            <button
              onClick={() => setCurrentView('memo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'memo'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <StickyNote className="w-5 h-5" />
              <span>メモ</span>
            </button>

            <button
              onClick={() => setCurrentView('backup')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'backup'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>バックアップ</span>
            </button>
          </nav>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 border-t border-dark-700 pt-4">
            <div className="grid grid-cols-2 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
