import { useState } from 'react';
import { BarChart3, Calendar, Save, FileText, UserCog, CalendarClock, ListOrdered, StickyNote, Menu, X, ClipboardList } from 'lucide-react';

const Header = ({ currentView, setCurrentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'daily-report', icon: FileText, label: '日報' },
    { id: 'weekly-dashboard', icon: ClipboardList, label: '週報' },
    { id: 'staff', icon: UserCog, label: 'スタッフ' },
    { id: 'schedule', icon: Calendar, label: 'スケジュール' },
    { id: 'shift-schedule', icon: CalendarClock, label: 'シフト' },
    { id: 'task-timeline', icon: ListOrdered, label: 'タイムライン' },
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
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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
