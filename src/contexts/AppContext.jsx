import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { initializeSupabase } from '../utils/initSupabase';

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
        .eq('id', 1)
        .single();

      if (error && error.code === 'PGRST116') {
        // データが存在しない場合は初期化
        console.log('初期データを作成します...');
        const initResult = await initializeSupabase();
        if (initResult.success) {
          // 再度データを読み込む
          const { data: newData } = await supabase
            .from('app_data')
            .select('*')
            .eq('id', 1)
            .single();

          if (newData) {
            setStaff(newData.staff || []);
            setTasks(newData.tasks || []);
            setMeetings(newData.meetings || []);
            setReports(newData.reports || []);
            setShifts(newData.shifts || []);
          }
        }
      } else if (error) {
        throw error;
      } else if (data) {
        setStaff(data.staff || []);
        setTasks(data.tasks || []);
        setMeetings(data.meetings || []);
        setReports(data.reports || []);
        setShifts(data.shifts || []);
      }
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Data loading error:', err);
      setError('データの読み込みに失敗しました');
      setLoading(false);
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

  // Supabaseに保存
  const saveToSupabase = async (key, value) => {
    try {
      // 現在の全データを取得
      const { data: currentData } = await supabase
        .from('app_data')
        .select('*')
        .eq('id', 1)
        .single();

      // 更新するデータを準備
      const updateData = {
        id: 1,
        staff: key === 'staff' ? value : (currentData?.staff || []),
        tasks: key === 'tasks' ? value : (currentData?.tasks || []),
        meetings: key === 'meetings' ? value : (currentData?.meetings || []),
        reports: key === 'reports' ? value : (currentData?.reports || []),
        shifts: key === 'shifts' ? value : (currentData?.shifts || []),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('app_data')
        .upsert(updateData);

      if (error) throw error;
      setError(null);
    } catch (err) {
      console.error('Save error:', err);
      setError('データの保存に失敗しました');
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
