/**
 * 進捗管理システム - APIクライアント
 * GAS Web Appと通信するためのクライアントライブラリ
 */

class ProgressManagementAPI {
  /**
   * @param {string} baseUrl - GAS Web AppのデプロイURL
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * GETリクエストを送信
   * @param {string} action - アクション名
   * @param {object} params - クエリパラメータ
   */
  async get(action, params = {}) {
    const url = new URL(this.baseUrl);
    url.searchParams.append('action', action);

    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * POSTリクエストを送信
   * @param {string} action - アクション名
   * @param {object} data - 送信するデータ
   */
  async post(action, data) {
    const url = `${this.baseUrl}?action=${action}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        redirect: 'follow'
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ========================================
  // Staff API
  // ========================================

  /**
   * 全スタッフを取得
   */
  async getAllStaff() {
    return await this.get('getAllStaff');
  }

  /**
   * IDでスタッフを取得
   * @param {string} id - スタッフID
   */
  async getStaffById(id) {
    return await this.get('getStaffById', { id });
  }

  /**
   * スタッフを作成
   * @param {object} staffData - スタッフデータ
   */
  async createStaff(staffData) {
    return await this.post('createStaff', staffData);
  }

  /**
   * スタッフを更新
   * @param {string} id - スタッフID
   * @param {object} staffData - 更新するスタッフデータ
   */
  async updateStaff(id, staffData) {
    return await this.post('updateStaff', { id, ...staffData });
  }

  /**
   * スタッフを削除
   * @param {string} id - スタッフID
   */
  async deleteStaff(id) {
    return await this.post('deleteStaff', { id });
  }

  // ========================================
  // Task API
  // ========================================

  /**
   * 全タスクを取得
   */
  async getAllTasks() {
    return await this.get('getAllTasks');
  }

  /**
   * IDでタスクを取得
   * @param {string} id - タスクID
   */
  async getTaskById(id) {
    return await this.get('getTaskById', { id });
  }

  /**
   * タスクを作成
   * @param {object} taskData - タスクデータ
   */
  async createTask(taskData) {
    return await this.post('createTask', taskData);
  }

  /**
   * タスクを更新
   * @param {string} id - タスクID
   * @param {object} taskData - 更新するタスクデータ
   */
  async updateTask(id, taskData) {
    return await this.post('updateTask', { id, ...taskData });
  }

  /**
   * タスクを削除
   * @param {string} id - タスクID
   */
  async deleteTask(id) {
    return await this.post('deleteTask', { id });
  }

  // ========================================
  // Meeting API
  // ========================================

  /**
   * 全ミーティングを取得
   */
  async getAllMeetings() {
    return await this.get('getAllMeetings');
  }

  /**
   * IDでミーティングを取得
   * @param {string} id - ミーティングID
   */
  async getMeetingById(id) {
    return await this.get('getMeetingById', { id });
  }

  /**
   * ミーティングを作成
   * @param {object} meetingData - ミーティングデータ
   */
  async createMeeting(meetingData) {
    return await this.post('createMeeting', meetingData);
  }

  /**
   * ミーティングを更新
   * @param {string} id - ミーティングID
   * @param {object} meetingData - 更新するミーティングデータ
   */
  async updateMeeting(id, meetingData) {
    return await this.post('updateMeeting', { id, ...meetingData });
  }

  /**
   * ミーティングを削除
   * @param {string} id - ミーティングID
   */
  async deleteMeeting(id) {
    return await this.post('deleteMeeting', { id });
  }

  // ========================================
  // MonthlyReport API
  // ========================================

  /**
   * 全月次レポートを取得
   */
  async getAllMonthlyReports() {
    return await this.get('getAllMonthlyReports');
  }

  /**
   * IDで月次レポートを取得
   * @param {string} id - 月次レポートID
   */
  async getMonthlyReportById(id) {
    return await this.get('getMonthlyReportById', { id });
  }

  /**
   * 月次レポートを作成
   * @param {object} reportData - 月次レポートデータ
   */
  async createMonthlyReport(reportData) {
    return await this.post('createMonthlyReport', reportData);
  }

  /**
   * 月次レポートを更新
   * @param {string} id - 月次レポートID
   * @param {object} reportData - 更新する月次レポートデータ
   */
  async updateMonthlyReport(id, reportData) {
    return await this.post('updateMonthlyReport', { id, ...reportData });
  }

  /**
   * 月次レポートを削除
   * @param {string} id - 月次レポートID
   */
  async deleteMonthlyReport(id) {
    return await this.post('deleteMonthlyReport', { id });
  }

  // ========================================
  // その他
  // ========================================

  /**
   * すべてのシートを初期化
   */
  async initializeAllSheets() {
    return await this.get('initializeAllSheets');
  }
}

// 使用例
// const api = new ProgressManagementAPI('https://script.google.com/macros/s/XXXXX/exec');
// const result = await api.getAllStaff();

// Export for ES6 modules
export default ProgressManagementAPI;
