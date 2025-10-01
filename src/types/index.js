// データモデル定義（仕様書v3に基づく）

/**
 * @typedef {Object} Staff
 * @property {string} id
 * @property {string} name
 * @property {string} currentClient
 * @property {Object} assignmentPeriod
 * @property {Date} assignmentPeriod.start
 * @property {Date|null} assignmentPeriod.end
 * @property {Object} contact
 * @property {string} contact.email
 * @property {string} contact.phone
 * @property {string|null} profileImage
 * @property {string} dailyReportUrl
 * @property {Date|null} dailyReportLastUpdated
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} taskName
 * @property {string} projectName
 * @property {string} clientName
 * @property {string} staffId
 * @property {Date} deadline
 * @property {number} completionRate - 0-100
 * @property {'not_started'|'in_progress'|'completed'|'delayed'} status
 * @property {string} overview - 概要
 * @property {string} achievements - 達成内容
 * @property {string} results - 成果
 * @property {string[]} technologies - 使用技術
 * @property {string} notes - 備考
 * @property {string|null} createdFromMeetingId
 * @property {string|null} reportToMeetingId
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Decision
 * @property {string} id
 * @property {string} content
 * @property {string|null} taskId
 * @property {boolean} isTaskCreated
 */

/**
 * @typedef {Object} Meeting
 * @property {string} id
 * @property {Date} date
 * @property {string} title
 * @property {string} clientName
 * @property {string[]} staffIds
 * @property {string[]} participants
 * @property {string} agenda
 * @property {Decision[]} decisions
 * @property {string} actions
 * @property {string} notes
 * @property {Date|null} nextMeetingDate
 * @property {string} nextAgenda
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} UpcomingTask
 * @property {string} taskName
 * @property {string} details
 */

/**
 * @typedef {Object} ReportTask
 * @property {string} projectName
 * @property {string} overview
 * @property {string} achievements
 * @property {string} results
 * @property {string[]} technologies
 * @property {number} completionRate
 */

/**
 * @typedef {Object} MonthlyReport
 * @property {string} id
 * @property {string} clientName
 * @property {string} staffName
 * @property {number} year
 * @property {number} month
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {ReportTask[]} tasks
 * @property {string} comments - 所感・コメント
 * @property {string} issues - 今後の課題
 * @property {string} nextMonthPlan - 来月の方針
 * @property {UpcomingTask[]} upcomingTasks
 * @property {Date} generatedAt
 * @property {string|null} imageUrl
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Shift
 * @property {string} id
 * @property {string} clientName - クライアント名
 * @property {string} staffId - スタッフID
 * @property {Date} date - 勤務日
 * @property {string} startTime - 出勤時間 (HH:mm形式)
 * @property {string} endTime - 退勤時間 (HH:mm形式)
 * @property {string} notes - 備考
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {}
