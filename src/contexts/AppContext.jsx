import { createContext, useContext, useState, useEffect } from 'react';
import ProgressManagementAPI from '../utils/api-client';
import { API_CONFIG } from '../config/api';

const AppContext = createContext();

// APIクライアントのインスタンスを作成
const api = new ProgressManagementAPI(API_CONFIG.BASE_URL);

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
  const [shifts, setShifts] = useState([]); // GAS APIにはないが互換性のため保持
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初期データ読み込み
  useEffect(() => {
    loadData();
  }, []);

  // データ読み込み
  const loadData = async () => {
    try {
      setLoading(true);

      // 並列で全データを取得
      const [staffRes, tasksRes, meetingsRes, reportsRes] = await Promise.all([
        api.getAllStaff(),
        api.getAllTasks(),
        api.getAllMeetings(),
        api.getAllMonthlyReports()
      ]);

      if (staffRes.success) setStaff(staffRes.data || []);
      if (tasksRes.success) setTasks(tasksRes.data || []);
      if (meetingsRes.success) setMeetings(meetingsRes.data || []);
      if (reportsRes.success) setReports(reportsRes.data || []);

      setError(null);
    } catch (err) {
      console.error('Data loading error:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // エラーハンドリング
  const handleError = (err, operation = 'この操作') => {
    console.error(`${operation} Error:`, err);
    setError(`${operation}でエラーが発生しました`);
  };

  // ========================================
  // スタッフ管理
  // ========================================

  const addStaff = async (newStaff) => {
    try {
      const result = await api.createStaff(newStaff);
      if (result.success) {
        setStaff([...staff, result.data]);
        setError(null);
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'スタッフの追加');
      throw err;
    }
  };

  const updateStaff = async (id, updates) => {
    try {
      const result = await api.updateStaff(id, updates);
      if (result.success) {
        // ローカル状態を更新
        const updatedData = await api.getStaffById(id);
        if (updatedData.success) {
          setStaff(staff.map(s => s.id === id ? updatedData.data : s));
        }
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'スタッフの更新');
      throw err;
    }
  };

  const deleteStaff = async (id) => {
    try {
      const result = await api.deleteStaff(id);
      if (result.success) {
        setStaff(staff.filter(s => s.id !== id));
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'スタッフの削除');
      throw err;
    }
  };

  // ========================================
  // タスク管理
  // ========================================

  const addTask = async (newTask) => {
    try {
      const result = await api.createTask(newTask);
      if (result.success) {
        setTasks([...tasks, result.data]);
        setError(null);
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'タスクの追加');
      throw err;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const result = await api.updateTask(id, updates);
      if (result.success) {
        // ローカル状態を更新
        const updatedData = await api.getTaskById(id);
        if (updatedData.success) {
          setTasks(tasks.map(t => t.id === id ? updatedData.data : t));
        }
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'タスクの更新');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      const result = await api.deleteTask(id);
      if (result.success) {
        setTasks(tasks.filter(t => t.id !== id));
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'タスクの削除');
      throw err;
    }
  };

  // ========================================
  // ミーティング管理
  // ========================================

  const addMeeting = async (newMeeting) => {
    try {
      const result = await api.createMeeting(newMeeting);
      if (result.success) {
        setMeetings([...meetings, result.data]);
        setError(null);
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'ミーティングの追加');
      throw err;
    }
  };

  const updateMeeting = async (id, updates) => {
    try {
      const result = await api.updateMeeting(id, updates);
      if (result.success) {
        // ローカル状態を更新
        const updatedData = await api.getMeetingById(id);
        if (updatedData.success) {
          setMeetings(meetings.map(m => m.id === id ? updatedData.data : m));
        }
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'ミーティングの更新');
      throw err;
    }
  };

  const deleteMeeting = async (id) => {
    try {
      const result = await api.deleteMeeting(id);
      if (result.success) {
        setMeetings(meetings.filter(m => m.id !== id));
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'ミーティングの削除');
      throw err;
    }
  };

  // ========================================
  // 月次レポート管理
  // ========================================

  const addReport = async (newReport) => {
    try {
      const result = await api.createMonthlyReport(newReport);
      if (result.success) {
        setReports([...reports, result.data]);
        setError(null);
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'レポートの追加');
      throw err;
    }
  };

  const updateReport = async (id, updates) => {
    try {
      const result = await api.updateMonthlyReport(id, updates);
      if (result.success) {
        // ローカル状態を更新
        const updatedData = await api.getMonthlyReportById(id);
        if (updatedData.success) {
          setReports(reports.map(r => r.id === id ? updatedData.data : r));
        }
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'レポートの更新');
      throw err;
    }
  };

  const deleteReport = async (id) => {
    try {
      const result = await api.deleteMonthlyReport(id);
      if (result.success) {
        setReports(reports.filter(r => r.id !== id));
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      handleError(err, 'レポートの削除');
      throw err;
    }
  };

  // ========================================
  // シフト管理（互換性のため残す）
  // ========================================

  const addShift = async (newShift) => {
    const shiftWithMeta = {
      ...newShift,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setShifts([...shifts, shiftWithMeta]);
    return shiftWithMeta;
  };

  const updateShift = async (id, updates) => {
    setShifts(shifts.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    ));
  };

  const deleteShift = async (id) => {
    setShifts(shifts.filter(s => s.id !== id));
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
    deleteShift,

    // Utility
    reloadData: loadData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ID生成ヘルパー
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
