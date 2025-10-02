import { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { database } from '../firebase';

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
  const [error, setError] = useState(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // 初期データ読み込み + リアルタイム同期
  useEffect(() => {
    const dataRef = ref(database, 'appData');

    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        const data = snapshot.val() || {};
        setStaff(data.staff || []);
        setTasks(data.tasks || []);
        setMeetings(data.meetings || []);
        setReports(data.reports || []);
        setShifts(data.shifts || []);
        setLoading(false);
        setError(null);
      } catch (err) {
        handleFirebaseError(err);
      }
    }, (err) => {
      handleFirebaseError(err);
    });

    return () => unsubscribe();
  }, []);

  // Firebaseエラーハンドリング
  const handleFirebaseError = (err) => {
    console.error('Firebase Error:', err);

    if (err.code === 'PERMISSION_DENIED' || err.message?.includes('quota')) {
      setQuotaExceeded(true);
      setError('無料枠の上限に達しました。データの同期が一時停止されています。');
    } else {
      setError('データの同期でエラーが発生しました。');
    }
    setLoading(false);
  };

  // Firebaseに保存
  const saveToFirebase = async (key, value) => {
    if (quotaExceeded) {
      alert('無料枠の上限に達したため、データを保存できません。');
      return;
    }

    try {
      const dataRef = ref(database, `appData/${key}`);
      await set(dataRef, value);
      setError(null);
    } catch (err) {
      handleFirebaseError(err);
      throw err;
    }
  };

  // スタッフ管理
  const addStaff = async (newStaff) => {
    const staffWithMeta = {
      ...newStaff,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedStaff = [...staff, staffWithMeta];
    await saveToFirebase('staff', updatedStaff);
    return staffWithMeta;
  };

  const updateStaff = async (id, updates) => {
    const updatedStaff = staff.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    await saveToFirebase('staff', updatedStaff);
  };

  const deleteStaff = async (id) => {
    const updatedStaff = staff.filter(s => s.id !== id);
    await saveToFirebase('staff', updatedStaff);
  };

  // タスク管理
  const addTask = async (newTask) => {
    const taskWithMeta = {
      ...newTask,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedTasks = [...tasks, taskWithMeta];
    await saveToFirebase('tasks', updatedTasks);
    return taskWithMeta;
  };

  const updateTask = async (id, updates) => {
    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    await saveToFirebase('tasks', updatedTasks);
  };

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    await saveToFirebase('tasks', updatedTasks);
  };

  // ミーティング管理
  const addMeeting = async (newMeeting) => {
    const meetingWithMeta = {
      ...newMeeting,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedMeetings = [...meetings, meetingWithMeta];
    await saveToFirebase('meetings', updatedMeetings);
    return meetingWithMeta;
  };

  const updateMeeting = async (id, updates) => {
    const updatedMeetings = meetings.map(m =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    await saveToFirebase('meetings', updatedMeetings);
  };

  const deleteMeeting = async (id) => {
    const updatedMeetings = meetings.filter(m => m.id !== id);
    await saveToFirebase('meetings', updatedMeetings);
  };

  // 月次レポート管理
  const addReport = async (newReport) => {
    const reportWithMeta = {
      ...newReport,
      id: generateId(),
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedReports = [...reports, reportWithMeta];
    await saveToFirebase('reports', updatedReports);
    return reportWithMeta;
  };

  const updateReport = async (id, updates) => {
    const updatedReports = reports.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    await saveToFirebase('reports', updatedReports);
  };

  const deleteReport = async (id) => {
    const updatedReports = reports.filter(r => r.id !== id);
    await saveToFirebase('reports', updatedReports);
  };

  // シフト管理
  const addShift = async (newShift) => {
    const shiftWithMeta = {
      ...newShift,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedShifts = [...shifts, shiftWithMeta];
    await saveToFirebase('shifts', updatedShifts);
    return shiftWithMeta;
  };

  const updateShift = async (id, updates) => {
    const updatedShifts = shifts.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    await saveToFirebase('shifts', updatedShifts);
  };

  const deleteShift = async (id) => {
    const updatedShifts = shifts.filter(s => s.id !== id);
    await saveToFirebase('shifts', updatedShifts);
  };

  const value = {
    // State
    staff,
    tasks,
    meetings,
    reports,
    shifts,
    loading,
    error,
    quotaExceeded,

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
