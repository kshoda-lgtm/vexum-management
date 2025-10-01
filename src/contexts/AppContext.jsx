import { createContext, useContext, useState, useEffect } from 'react';
import { getAllData, saveToStorage, STORAGE_KEYS } from '../utils/storage';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [staff, setStaff] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [reports, setReports] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 初期データ読み込み
  useEffect(() => {
    const data = getAllData();
    setStaff(data.staff || []);
    setTasks(data.tasks || []);
    setMeetings(data.meetings || []);
    setReports(data.reports || []);
    setShifts(data.shifts || []);
    setLoading(false);
  }, []);

  // スタッフ管理
  const addStaff = (newStaff) => {
    const staffWithMeta = {
      ...newStaff,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedStaff = [...staff, staffWithMeta];
    setStaff(updatedStaff);
    saveToStorage(STORAGE_KEYS.STAFF, updatedStaff);
    return staffWithMeta;
  };

  const updateStaff = (id, updates) => {
    const updatedStaff = staff.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    );
    setStaff(updatedStaff);
    saveToStorage(STORAGE_KEYS.STAFF, updatedStaff);
  };

  const deleteStaff = (id) => {
    const updatedStaff = staff.filter(s => s.id !== id);
    setStaff(updatedStaff);
    saveToStorage(STORAGE_KEYS.STAFF, updatedStaff);
  };

  // タスク管理
  const addTask = (newTask) => {
    const taskWithMeta = {
      ...newTask,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedTasks = [...tasks, taskWithMeta];
    setTasks(updatedTasks);
    saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
    return taskWithMeta;
  };

  const updateTask = (id, updates) => {
    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    );
    setTasks(updatedTasks);
    saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
  };

  // ミーティング管理
  const addMeeting = (newMeeting) => {
    const meetingWithMeta = {
      ...newMeeting,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedMeetings = [...meetings, meetingWithMeta];
    setMeetings(updatedMeetings);
    saveToStorage(STORAGE_KEYS.MEETINGS, updatedMeetings);
    return meetingWithMeta;
  };

  const updateMeeting = (id, updates) => {
    const updatedMeetings = meetings.map(m =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
    );
    setMeetings(updatedMeetings);
    saveToStorage(STORAGE_KEYS.MEETINGS, updatedMeetings);
  };

  const deleteMeeting = (id) => {
    const updatedMeetings = meetings.filter(m => m.id !== id);
    setMeetings(updatedMeetings);
    saveToStorage(STORAGE_KEYS.MEETINGS, updatedMeetings);
  };

  // 月次レポート管理
  const addReport = (newReport) => {
    const reportWithMeta = {
      ...newReport,
      id: generateId(),
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedReports = [...reports, reportWithMeta];
    setReports(updatedReports);
    saveToStorage(STORAGE_KEYS.REPORTS, updatedReports);
    return reportWithMeta;
  };

  const updateReport = (id, updates) => {
    const updatedReports = reports.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
    );
    setReports(updatedReports);
    saveToStorage(STORAGE_KEYS.REPORTS, updatedReports);
  };

  const deleteReport = (id) => {
    const updatedReports = reports.filter(r => r.id !== id);
    setReports(updatedReports);
    saveToStorage(STORAGE_KEYS.REPORTS, updatedReports);
  };

  // シフト管理
  const addShift = (newShift) => {
    const shiftWithMeta = {
      ...newShift,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setShifts(prevShifts => {
      const updatedShifts = [...prevShifts, shiftWithMeta];
      saveToStorage(STORAGE_KEYS.SHIFTS, updatedShifts);
      return updatedShifts;
    });
    return shiftWithMeta;
  };

  const updateShift = (id, updates) => {
    const updatedShifts = shifts.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    );
    setShifts(updatedShifts);
    saveToStorage(STORAGE_KEYS.SHIFTS, updatedShifts);
  };

  const deleteShift = (id) => {
    const updatedShifts = shifts.filter(s => s.id !== id);
    setShifts(updatedShifts);
    saveToStorage(STORAGE_KEYS.SHIFTS, updatedShifts);
  };

  const value = {
    // State
    staff,
    tasks,
    meetings,
    reports,
    shifts,
    loading,

    // Staff actions
    addStaff,
    updateStaff,
    deleteStaff,

    // Task actions
    addTask,
    updateTask,
    deleteTask,

    // Meeting actions
    addMeeting,
    updateMeeting,
    deleteMeeting,

    // Report actions
    addReport,
    updateReport,
    deleteReport,

    // Shift actions
    addShift,
    updateShift,
    deleteShift
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ID生成ヘルパー
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
