import { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import StaffList from './components/StaffList';
import ScheduleList from './components/ScheduleList';
import MeetingList from './components/MeetingList';
import ReportGenerator from './components/ReportGenerator';
import BackupManager from './components/BackupManager';
import ShiftSchedule from './components/ShiftSchedule';
import TaskTimeline from './components/TaskTimeline';
import TodayTasks from './components/TodayTasks';
import Memo from './components/Memo';
import Header from './components/Header';
import ErrorNotification from './components/ErrorNotification';

function App() {
  const [currentView, setCurrentView] = useState('today-tasks');

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <ErrorNotification />
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        <main className="container mx-auto px-4 py-6">
          {currentView === 'staff' && <StaffList />}
          {currentView === 'schedule' && <ScheduleList />}
          {currentView === 'meetings' && <MeetingList />}
          {currentView === 'report' && <ReportGenerator />}
          {currentView === 'shift-schedule' && <ShiftSchedule />}
          {currentView === 'task-timeline' && <TaskTimeline />}
          {currentView === 'today-tasks' && <TodayTasks />}
          {currentView === 'memo' && <Memo />}
          {currentView === 'backup' && <BackupManager />}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
