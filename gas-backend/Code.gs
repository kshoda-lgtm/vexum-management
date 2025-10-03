/**
 * 進捗管理システム - GASバックエンド
 * スプレッドシートID: 1l2-K33r5qRsM4J_FwtivhiTsH6VhAhcvCzPcgIiHtyc
 */

// スプレッドシートIDを定数として定義
const SPREADSHEET_ID = '1l2-K33r5qRsM4J_FwtivhiTsH6VhAhcvCzPcgIiHtyc';

// シート名の定義
const SHEET_NAMES = {
  STAFF: 'Staff',
  TASKS: 'Tasks',
  MEETINGS: 'Meetings',
  MONTHLY_REPORTS: 'MonthlyReports'
};

/**
 * スプレッドシートを取得
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * シートを取得（存在しない場合は作成）
 */
function getOrCreateSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  return sheet;
}

/**
 * スタッフシートのヘッダーを初期化
 */
function initializeStaffSheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.STAFF);

  if (sheet.getLastRow() === 0) {
    const headers = [
      'id',
      'name',
      'currentClient',
      'assignmentStartDate',
      'assignmentEndDate',
      'contactEmail',
      'contactPhone',
      'profileImage',
      'dailyReportUrl',
      'dailyReportLastUpdated',
      'createdAt',
      'updatedAt'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  return sheet;
}

/**
 * タスクシートのヘッダーを初期化
 */
function initializeTaskSheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.TASKS);

  if (sheet.getLastRow() === 0) {
    const headers = [
      'id',
      'taskName',
      'projectName',
      'clientName',
      'staffId',
      'deadline',
      'completionRate',
      'status',
      'overview',
      'achievements',
      'results',
      'technologies',
      'notes',
      'createdFromMeetingId',
      'reportToMeetingId',
      'createdAt',
      'updatedAt'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  return sheet;
}

/**
 * ミーティングシートのヘッダーを初期化
 */
function initializeMeetingSheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.MEETINGS);

  if (sheet.getLastRow() === 0) {
    const headers = [
      'id',
      'date',
      'title',
      'clientName',
      'staffIds',
      'participants',
      'agenda',
      'decisions',
      'actions',
      'notes',
      'nextMeetingDate',
      'nextAgenda',
      'createdAt',
      'updatedAt'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  return sheet;
}

/**
 * 月次レポートシートのヘッダーを初期化
 */
function initializeMonthlyReportSheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.MONTHLY_REPORTS);

  if (sheet.getLastRow() === 0) {
    const headers = [
      'id',
      'clientName',
      'staffName',
      'year',
      'month',
      'startDate',
      'endDate',
      'tasks',
      'comments',
      'issues',
      'nextMonthPlan',
      'upcomingTasks',
      'generatedAt',
      'imageUrl',
      'createdAt',
      'updatedAt'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  return sheet;
}

/**
 * すべてのシートを初期化
 */
function initializeAllSheets() {
  initializeStaffSheet();
  initializeTaskSheet();
  initializeMeetingSheet();
  initializeMonthlyReportSheet();

  return {
    success: true,
    message: 'All sheets initialized successfully'
  };
}

/**
 * ユニークIDを生成
 */
function generateId() {
  return Utilities.getUuid();
}

/**
 * 現在のタイムスタンプを取得
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// ========================================
// CRUD操作: Staff (スタッフ)
// ========================================

/**
 * スタッフを作成
 */
function createStaff(staffData) {
  const sheet = initializeStaffSheet();
  const id = generateId();
  const timestamp = getCurrentTimestamp();

  const rowData = [
    id,
    staffData.name || '',
    staffData.currentClient || '',
    staffData.assignmentStartDate || '',
    staffData.assignmentEndDate || '',
    staffData.contactEmail || '',
    staffData.contactPhone || '',
    staffData.profileImage || '',
    staffData.dailyReportUrl || '',
    staffData.dailyReportLastUpdated || '',
    timestamp,
    timestamp
  ];

  sheet.appendRow(rowData);

  return {
    success: true,
    data: {
      id: id,
      ...staffData,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };
}

/**
 * すべてのスタッフを取得
 */
function getAllStaff() {
  const sheet = initializeStaffSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: true, data: [] };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  const headers = sheet.getRange(1, 1, 1, 12).getValues()[0];

  const staffList = data.map(row => {
    const staff = {};
    headers.forEach((header, index) => {
      staff[header] = row[index];
    });
    return staff;
  });

  return {
    success: true,
    data: staffList
  };
}

/**
 * IDでスタッフを取得
 */
function getStaffById(staffId) {
  const sheet = initializeStaffSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Staff not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  const headers = sheet.getRange(1, 1, 1, 12).getValues()[0];

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === staffId) {
      const staff = {};
      headers.forEach((header, index) => {
        staff[header] = data[i][index];
      });
      return { success: true, data: staff };
    }
  }

  return { success: false, message: 'Staff not found' };
}

/**
 * スタッフを更新
 */
function updateStaff(staffId, staffData) {
  const sheet = initializeStaffSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Staff not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === staffId) {
      const rowNum = i + 2;
      const timestamp = getCurrentTimestamp();

      // 更新するデータを準備
      const currentRow = sheet.getRange(rowNum, 1, 1, 12).getValues()[0];
      const updatedRow = [
        staffId,
        staffData.name !== undefined ? staffData.name : currentRow[1],
        staffData.currentClient !== undefined ? staffData.currentClient : currentRow[2],
        staffData.assignmentStartDate !== undefined ? staffData.assignmentStartDate : currentRow[3],
        staffData.assignmentEndDate !== undefined ? staffData.assignmentEndDate : currentRow[4],
        staffData.contactEmail !== undefined ? staffData.contactEmail : currentRow[5],
        staffData.contactPhone !== undefined ? staffData.contactPhone : currentRow[6],
        staffData.profileImage !== undefined ? staffData.profileImage : currentRow[7],
        staffData.dailyReportUrl !== undefined ? staffData.dailyReportUrl : currentRow[8],
        staffData.dailyReportLastUpdated !== undefined ? staffData.dailyReportLastUpdated : currentRow[9],
        currentRow[10], // createdAt
        timestamp // updatedAt
      ];

      sheet.getRange(rowNum, 1, 1, 12).setValues([updatedRow]);

      return {
        success: true,
        message: 'Staff updated successfully'
      };
    }
  }

  return { success: false, message: 'Staff not found' };
}

/**
 * スタッフを削除
 */
function deleteStaff(staffId) {
  const sheet = initializeStaffSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Staff not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === staffId) {
      sheet.deleteRow(i + 2);
      return {
        success: true,
        message: 'Staff deleted successfully'
      };
    }
  }

  return { success: false, message: 'Staff not found' };
}

// ========================================
// CRUD操作: Task (タスク)
// ========================================

/**
 * タスクを作成
 */
function createTask(taskData) {
  const sheet = initializeTaskSheet();
  const id = generateId();
  const timestamp = getCurrentTimestamp();

  const rowData = [
    id,
    taskData.taskName || '',
    taskData.projectName || '',
    taskData.clientName || '',
    taskData.staffId || '',
    taskData.deadline || '',
    taskData.completionRate || 0,
    taskData.status || 'not_started',
    taskData.overview || '',
    taskData.achievements || '',
    taskData.results || '',
    JSON.stringify(taskData.technologies || []),
    taskData.notes || '',
    taskData.createdFromMeetingId || '',
    taskData.reportToMeetingId || '',
    timestamp,
    timestamp
  ];

  sheet.appendRow(rowData);

  return {
    success: true,
    data: {
      id: id,
      ...taskData,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };
}

/**
 * すべてのタスクを取得
 */
function getAllTasks() {
  const sheet = initializeTaskSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: true, data: [] };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 17).getValues();
  const headers = sheet.getRange(1, 1, 1, 17).getValues()[0];

  const taskList = data.map(row => {
    const task = {};
    headers.forEach((header, index) => {
      if (header === 'technologies') {
        try {
          task[header] = JSON.parse(row[index]);
        } catch (e) {
          task[header] = [];
        }
      } else {
        task[header] = row[index];
      }
    });
    return task;
  });

  return {
    success: true,
    data: taskList
  };
}

/**
 * IDでタスクを取得
 */
function getTaskById(taskId) {
  const sheet = initializeTaskSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Task not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 17).getValues();
  const headers = sheet.getRange(1, 1, 1, 17).getValues()[0];

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === taskId) {
      const task = {};
      headers.forEach((header, index) => {
        if (header === 'technologies') {
          try {
            task[header] = JSON.parse(data[i][index]);
          } catch (e) {
            task[header] = [];
          }
        } else {
          task[header] = data[i][index];
        }
      });
      return { success: true, data: task };
    }
  }

  return { success: false, message: 'Task not found' };
}

/**
 * タスクを更新
 */
function updateTask(taskId, taskData) {
  const sheet = initializeTaskSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Task not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === taskId) {
      const rowNum = i + 2;
      const timestamp = getCurrentTimestamp();

      const currentRow = sheet.getRange(rowNum, 1, 1, 17).getValues()[0];
      const updatedRow = [
        taskId,
        taskData.taskName !== undefined ? taskData.taskName : currentRow[1],
        taskData.projectName !== undefined ? taskData.projectName : currentRow[2],
        taskData.clientName !== undefined ? taskData.clientName : currentRow[3],
        taskData.staffId !== undefined ? taskData.staffId : currentRow[4],
        taskData.deadline !== undefined ? taskData.deadline : currentRow[5],
        taskData.completionRate !== undefined ? taskData.completionRate : currentRow[6],
        taskData.status !== undefined ? taskData.status : currentRow[7],
        taskData.overview !== undefined ? taskData.overview : currentRow[8],
        taskData.achievements !== undefined ? taskData.achievements : currentRow[9],
        taskData.results !== undefined ? taskData.results : currentRow[10],
        taskData.technologies !== undefined ? JSON.stringify(taskData.technologies) : currentRow[11],
        taskData.notes !== undefined ? taskData.notes : currentRow[12],
        taskData.createdFromMeetingId !== undefined ? taskData.createdFromMeetingId : currentRow[13],
        taskData.reportToMeetingId !== undefined ? taskData.reportToMeetingId : currentRow[14],
        currentRow[15], // createdAt
        timestamp // updatedAt
      ];

      sheet.getRange(rowNum, 1, 1, 17).setValues([updatedRow]);

      return {
        success: true,
        message: 'Task updated successfully'
      };
    }
  }

  return { success: false, message: 'Task not found' };
}

/**
 * タスクを削除
 */
function deleteTask(taskId) {
  const sheet = initializeTaskSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Task not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === taskId) {
      sheet.deleteRow(i + 2);
      return {
        success: true,
        message: 'Task deleted successfully'
      };
    }
  }

  return { success: false, message: 'Task not found' };
}

// ========================================
// CRUD操作: Meeting (ミーティング)
// ========================================

/**
 * ミーティングを作成
 */
function createMeeting(meetingData) {
  const sheet = initializeMeetingSheet();
  const id = generateId();
  const timestamp = getCurrentTimestamp();

  const rowData = [
    id,
    meetingData.date || '',
    meetingData.title || '',
    meetingData.clientName || '',
    JSON.stringify(meetingData.staffIds || []),
    JSON.stringify(meetingData.participants || []),
    meetingData.agenda || '',
    JSON.stringify(meetingData.decisions || []),
    meetingData.actions || '',
    meetingData.notes || '',
    meetingData.nextMeetingDate || '',
    meetingData.nextAgenda || '',
    timestamp,
    timestamp
  ];

  sheet.appendRow(rowData);

  return {
    success: true,
    data: {
      id: id,
      ...meetingData,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };
}

/**
 * すべてのミーティングを取得
 */
function getAllMeetings() {
  const sheet = initializeMeetingSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: true, data: [] };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  const headers = sheet.getRange(1, 1, 1, 14).getValues()[0];

  const meetingList = data.map(row => {
    const meeting = {};
    headers.forEach((header, index) => {
      if (['staffIds', 'participants', 'decisions'].includes(header)) {
        try {
          meeting[header] = JSON.parse(row[index]);
        } catch (e) {
          meeting[header] = [];
        }
      } else {
        meeting[header] = row[index];
      }
    });
    return meeting;
  });

  return {
    success: true,
    data: meetingList
  };
}

/**
 * IDでミーティングを取得
 */
function getMeetingById(meetingId) {
  const sheet = initializeMeetingSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Meeting not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  const headers = sheet.getRange(1, 1, 1, 14).getValues()[0];

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === meetingId) {
      const meeting = {};
      headers.forEach((header, index) => {
        if (['staffIds', 'participants', 'decisions'].includes(header)) {
          try {
            meeting[header] = JSON.parse(data[i][index]);
          } catch (e) {
            meeting[header] = [];
          }
        } else {
          meeting[header] = data[i][index];
        }
      });
      return { success: true, data: meeting };
    }
  }

  return { success: false, message: 'Meeting not found' };
}

/**
 * ミーティングを更新
 */
function updateMeeting(meetingId, meetingData) {
  const sheet = initializeMeetingSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Meeting not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === meetingId) {
      const rowNum = i + 2;
      const timestamp = getCurrentTimestamp();

      const currentRow = sheet.getRange(rowNum, 1, 1, 14).getValues()[0];
      const updatedRow = [
        meetingId,
        meetingData.date !== undefined ? meetingData.date : currentRow[1],
        meetingData.title !== undefined ? meetingData.title : currentRow[2],
        meetingData.clientName !== undefined ? meetingData.clientName : currentRow[3],
        meetingData.staffIds !== undefined ? JSON.stringify(meetingData.staffIds) : currentRow[4],
        meetingData.participants !== undefined ? JSON.stringify(meetingData.participants) : currentRow[5],
        meetingData.agenda !== undefined ? meetingData.agenda : currentRow[6],
        meetingData.decisions !== undefined ? JSON.stringify(meetingData.decisions) : currentRow[7],
        meetingData.actions !== undefined ? meetingData.actions : currentRow[8],
        meetingData.notes !== undefined ? meetingData.notes : currentRow[9],
        meetingData.nextMeetingDate !== undefined ? meetingData.nextMeetingDate : currentRow[10],
        meetingData.nextAgenda !== undefined ? meetingData.nextAgenda : currentRow[11],
        currentRow[12], // createdAt
        timestamp // updatedAt
      ];

      sheet.getRange(rowNum, 1, 1, 14).setValues([updatedRow]);

      return {
        success: true,
        message: 'Meeting updated successfully'
      };
    }
  }

  return { success: false, message: 'Meeting not found' };
}

/**
 * ミーティングを削除
 */
function deleteMeeting(meetingId) {
  const sheet = initializeMeetingSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Meeting not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === meetingId) {
      sheet.deleteRow(i + 2);
      return {
        success: true,
        message: 'Meeting deleted successfully'
      };
    }
  }

  return { success: false, message: 'Meeting not found' };
}

// ========================================
// CRUD操作: MonthlyReport (月次レポート)
// ========================================

/**
 * 月次レポートを作成
 */
function createMonthlyReport(reportData) {
  const sheet = initializeMonthlyReportSheet();
  const id = generateId();
  const timestamp = getCurrentTimestamp();

  const rowData = [
    id,
    reportData.clientName || '',
    reportData.staffName || '',
    reportData.year || new Date().getFullYear(),
    reportData.month || new Date().getMonth() + 1,
    reportData.startDate || '',
    reportData.endDate || '',
    JSON.stringify(reportData.tasks || []),
    reportData.comments || '',
    reportData.issues || '',
    reportData.nextMonthPlan || '',
    JSON.stringify(reportData.upcomingTasks || []),
    reportData.generatedAt || timestamp,
    reportData.imageUrl || '',
    timestamp,
    timestamp
  ];

  sheet.appendRow(rowData);

  return {
    success: true,
    data: {
      id: id,
      ...reportData,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };
}

/**
 * すべての月次レポートを取得
 */
function getAllMonthlyReports() {
  const sheet = initializeMonthlyReportSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: true, data: [] };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  const headers = sheet.getRange(1, 1, 1, 16).getValues()[0];

  const reportList = data.map(row => {
    const report = {};
    headers.forEach((header, index) => {
      if (['tasks', 'upcomingTasks'].includes(header)) {
        try {
          report[header] = JSON.parse(row[index]);
        } catch (e) {
          report[header] = [];
        }
      } else {
        report[header] = row[index];
      }
    });
    return report;
  });

  return {
    success: true,
    data: reportList
  };
}

/**
 * IDで月次レポートを取得
 */
function getMonthlyReportById(reportId) {
  const sheet = initializeMonthlyReportSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Report not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  const headers = sheet.getRange(1, 1, 1, 16).getValues()[0];

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === reportId) {
      const report = {};
      headers.forEach((header, index) => {
        if (['tasks', 'upcomingTasks'].includes(header)) {
          try {
            report[header] = JSON.parse(data[i][index]);
          } catch (e) {
            report[header] = [];
          }
        } else {
          report[header] = data[i][index];
        }
      });
      return { success: true, data: report };
    }
  }

  return { success: false, message: 'Report not found' };
}

/**
 * 月次レポートを更新
 */
function updateMonthlyReport(reportId, reportData) {
  const sheet = initializeMonthlyReportSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Report not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === reportId) {
      const rowNum = i + 2;
      const timestamp = getCurrentTimestamp();

      const currentRow = sheet.getRange(rowNum, 1, 1, 16).getValues()[0];
      const updatedRow = [
        reportId,
        reportData.clientName !== undefined ? reportData.clientName : currentRow[1],
        reportData.staffName !== undefined ? reportData.staffName : currentRow[2],
        reportData.year !== undefined ? reportData.year : currentRow[3],
        reportData.month !== undefined ? reportData.month : currentRow[4],
        reportData.startDate !== undefined ? reportData.startDate : currentRow[5],
        reportData.endDate !== undefined ? reportData.endDate : currentRow[6],
        reportData.tasks !== undefined ? JSON.stringify(reportData.tasks) : currentRow[7],
        reportData.comments !== undefined ? reportData.comments : currentRow[8],
        reportData.issues !== undefined ? reportData.issues : currentRow[9],
        reportData.nextMonthPlan !== undefined ? reportData.nextMonthPlan : currentRow[10],
        reportData.upcomingTasks !== undefined ? JSON.stringify(reportData.upcomingTasks) : currentRow[11],
        reportData.generatedAt !== undefined ? reportData.generatedAt : currentRow[12],
        reportData.imageUrl !== undefined ? reportData.imageUrl : currentRow[13],
        currentRow[14], // createdAt
        timestamp // updatedAt
      ];

      sheet.getRange(rowNum, 1, 1, 16).setValues([updatedRow]);

      return {
        success: true,
        message: 'Report updated successfully'
      };
    }
  }

  return { success: false, message: 'Report not found' };
}

/**
 * 月次レポートを削除
 */
function deleteMonthlyReport(reportId) {
  const sheet = initializeMonthlyReportSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'Report not found' };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === reportId) {
      sheet.deleteRow(i + 2);
      return {
        success: true,
        message: 'Report deleted successfully'
      };
    }
  }

  return { success: false, message: 'Report not found' };
}

// ========================================
// Web App エンドポイント
// ========================================

/**
 * GETリクエストの処理
 */
function doGet(e) {
  const action = e.parameter.action;
  const id = e.parameter.id;

  let result;

  try {
    switch(action) {
      // Staff
      case 'getAllStaff':
        result = getAllStaff();
        break;
      case 'getStaffById':
        result = getStaffById(id);
        break;

      // Task
      case 'getAllTasks':
        result = getAllTasks();
        break;
      case 'getTaskById':
        result = getTaskById(id);
        break;

      // Meeting
      case 'getAllMeetings':
        result = getAllMeetings();
        break;
      case 'getMeetingById':
        result = getMeetingById(id);
        break;

      // MonthlyReport
      case 'getAllMonthlyReports':
        result = getAllMonthlyReports();
        break;
      case 'getMonthlyReportById':
        result = getMonthlyReportById(id);
        break;

      // Initialize
      case 'initializeAllSheets':
        result = initializeAllSheets();
        break;

      default:
        result = {
          success: false,
          message: 'Invalid action'
        };
    }
  } catch (error) {
    result = {
      success: false,
      message: error.toString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POSTリクエストの処理
 */
function doPost(e) {
  const action = e.parameter.action;

  let requestData;
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid JSON data'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  let result;

  try {
    switch(action) {
      // Staff
      case 'createStaff':
        result = createStaff(requestData);
        break;
      case 'updateStaff':
        result = updateStaff(requestData.id, requestData);
        break;
      case 'deleteStaff':
        result = deleteStaff(requestData.id);
        break;

      // Task
      case 'createTask':
        result = createTask(requestData);
        break;
      case 'updateTask':
        result = updateTask(requestData.id, requestData);
        break;
      case 'deleteTask':
        result = deleteTask(requestData.id);
        break;

      // Meeting
      case 'createMeeting':
        result = createMeeting(requestData);
        break;
      case 'updateMeeting':
        result = updateMeeting(requestData.id, requestData);
        break;
      case 'deleteMeeting':
        result = deleteMeeting(requestData.id);
        break;

      // MonthlyReport
      case 'createMonthlyReport':
        result = createMonthlyReport(requestData);
        break;
      case 'updateMonthlyReport':
        result = updateMonthlyReport(requestData.id, requestData);
        break;
      case 'deleteMonthlyReport':
        result = deleteMonthlyReport(requestData.id);
        break;

      default:
        result = {
          success: false,
          message: 'Invalid action'
        };
    }
  } catch (error) {
    result = {
      success: false,
      message: error.toString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
