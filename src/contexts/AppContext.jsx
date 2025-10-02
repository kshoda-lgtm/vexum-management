import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

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
    loadData();
    setupRealtimeSubscription();
  }, []);

  // データ読み込み
  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setStaff(data.staff || []);
        setTasks(data.tasks || []);
        setMeetings(data.meetings || []);
        setReports(data.reports || []);
        setShifts(data.shifts || []);
      }
      setLoading(false);
      setError(null);
    } catch (err) {
      handleSupabaseError(err);
    }
  };

  // リアルタイム同期
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('app_data_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'app_data' },
        (payload) => {
          if (payload.new) {
            setStaff(payload.new.staff || []);
            setTasks(payload.new.tasks || []);
            setMeetings(payload.new.meetings || []);
            setReports(payload.new.reports || []);
            setShifts(payload.new.shifts || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Supabaseエラーハンドリング
  const handleSupabaseError = (err) => {
    console.error('Supabase Error:', err);

    if (err.message?.includes('quota') || err.message?.includes('limit')) {
      setQuotaExceeded(true);
      setError('無料枠の上限に達しました。データの同期が一時停止されています。');
    } else {
      setError('データの同期でエラーが発生しました。');
    }
    setLoading(false);
  };

  // Supabaseに保存
  const saveToSupabase = async (key, value) => {
    if (quotaExceeded) {
      alert('無料枠の上限に達したため、データを保存できません。');
      return;
    }

    try {
      const updateData = {
        [key]: value,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('app_data')
        .upsert({ id: 1, ...updateData });

      if (error) throw error;
      setError(null);
    } catch (err) {
      handleSupabaseError(err);
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
    await saveToSupabase('staff', updatedStaff);
    return staffWithMeta;
  };

  const updateStaff = async (id, updates) => {
    const updatedStaff = staff.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    await saveToSupabase('staff', updatedStaff);
  };

  const deleteStaff = async (id) => {
    const updatedStaff = staff.filter(s => s.id !== id);
    await saveToSupabase('staff', updatedStaff);
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
    await saveToSupabase('tasks', updatedTasks);
    return taskWithMeta;
  };

  const updateTask = async (id, updates) => {
    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    await saveToSupabase('tasks', updatedTasks);
  };

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    await saveToSupabase('tasks', updatedTasks);
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
    await saveToSupabase('meetings', updatedMeetings);
    return meetingWithMeta;
  };

  const updateMeeting = async (id, updates) => {
    const updatedMeetings = meetings.map(m =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    await saveToSupabase('meetings', updatedMeetings);
  };

  const deleteMeeting = async (id) => {
    const updatedMeetings = meetings.filter(m => m.id !== id);
    await saveToSupabase('meetings', updatedMeetings);
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
    await saveToSupabase('reports', updatedReports);
    return reportWithMeta;
  };

  const updateReport = async (id, updates) => {
    const updatedReports = reports.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    await saveToSupabase('reports', updatedReports);
  };

  const deleteReport = async (id) => {
    const updatedReports = reports.filter(r => r.id !== id);
    await saveToSupabase('reports', updatedReports);
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
    await saveToSupabase('shifts', updatedShifts);
    return shiftWithMeta;
  };

  const updateShift = async (id, updates) => {
    const updatedShifts = shifts.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    await saveToSupabase('shifts', updatedShifts);
  };

  const deleteShift = async (id) => {
    const updatedShifts = shifts.filter(s => s.id !== id);
    await saveToSupabase('shifts', updatedShifts);
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
