const API_URL = 'https://script.google.com/macros/s/AKfycbyOPNBNPXbSAFkNxFjrbmZVuWujT5YZTw9PbMflGQ_BP5JM6mbvcwh-AssITbB-sslf/exec';

export const api = {
  // すべての本日のタスクを取得
  getAllDailyTasks: async () => {
    const response = await fetch(`${API_URL}?action=getAllDailyTasks`);
    const data = await response.json();
    return data;
  },

  // タスクを作成
  createDailyTask: async (taskData) => {
    const response = await fetch(`${API_URL}?action=createDailyTask`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    const data = await response.json();
    return data;
  },

  // タスクを更新
  updateDailyTask: async (id, taskData) => {
    const response = await fetch(`${API_URL}?action=updateDailyTask`, {
      method: 'POST',
      body: JSON.stringify({ id, ...taskData }),
    });
    const data = await response.json();
    return data;
  },

  // タスクを削除
  deleteDailyTask: async (id) => {
    const response = await fetch(`${API_URL}?action=deleteDailyTask`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    return data;
  },
};
