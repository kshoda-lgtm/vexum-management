// LocalStorage管理ユーティリティ

const STORAGE_KEYS = {
  STAFF: 'progress_management_staff',
  TASKS: 'progress_management_tasks',
  MEETINGS: 'progress_management_meetings',
  REPORTS: 'progress_management_reports',
  SHIFTS: 'progress_management_shifts',
  LAST_BACKUP: 'progress_management_last_backup'
};

/**
 * LocalStorageからデータを取得
 * @param {string} key
 * @returns {any}
 */
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);

    // Date型のフィールドを復元
    return parseJSONDates(parsed);
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return null;
  }
};

/**
 * LocalStorageにデータを保存
 * @param {string} key
 * @param {any} value
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    throw error;
  }
};

/**
 * LocalStorageからデータを削除
 * @param {string} key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
  }
};

/**
 * 全データを取得
 * @returns {Object}
 */
export const getAllData = () => {
  return {
    staff: getFromStorage(STORAGE_KEYS.STAFF) || [],
    tasks: getFromStorage(STORAGE_KEYS.TASKS) || [],
    meetings: getFromStorage(STORAGE_KEYS.MEETINGS) || [],
    reports: getFromStorage(STORAGE_KEYS.REPORTS) || [],
    shifts: getFromStorage(STORAGE_KEYS.SHIFTS) || []
  };
};

/**
 * 全データを保存
 * @param {Object} data
 */
export const saveAllData = (data) => {
  if (data.staff) saveToStorage(STORAGE_KEYS.STAFF, data.staff);
  if (data.tasks) saveToStorage(STORAGE_KEYS.TASKS, data.tasks);
  if (data.meetings) saveToStorage(STORAGE_KEYS.MEETINGS, data.meetings);
  if (data.reports) saveToStorage(STORAGE_KEYS.REPORTS, data.reports);
  if (data.shifts) saveToStorage(STORAGE_KEYS.SHIFTS, data.shifts);
};

/**
 * JSONデータ内のDate文字列をDateオブジェクトに変換
 * @param {any} obj
 * @returns {any}
 */
const parseJSONDates = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(parseJSONDates);
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // Date型のフィールド名を検出
      if (typeof value === 'string' && isISODateString(value)) {
        result[key] = new Date(value);
      } else {
        result[key] = parseJSONDates(value);
      }
    }
    return result;
  }

  return obj;
};

/**
 * ISO8601形式の日付文字列かチェック
 * @param {string} str
 * @returns {boolean}
 */
const isISODateString = (str) => {
  if (typeof str !== 'string') return false;

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return isoDateRegex.test(str);
};

/**
 * データのエクスポート（JSON文字列）
 * @returns {string}
 */
export const exportData = () => {
  const data = getAllData();
  return JSON.stringify(data, null, 2);
};

/**
 * データのインポート
 * @param {string} jsonString
 * @returns {boolean}
 */
export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    // データの妥当性チェック
    if (!data.staff || !data.tasks || !data.meetings || !data.reports) {
      throw new Error('Invalid data format');
    }

    saveAllData(data);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

/**
 * 最終バックアップ日時を記録
 */
export const updateLastBackupTime = () => {
  saveToStorage(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
};

/**
 * 最終バックアップ日時を取得
 * @returns {Date|null}
 */
export const getLastBackupTime = () => {
  const timestamp = getFromStorage(STORAGE_KEYS.LAST_BACKUP);
  return timestamp ? new Date(timestamp) : null;
};

export { STORAGE_KEYS };
