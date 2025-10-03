import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const TaskCard = ({ task, onEdit }) => {
  // 進捗状況の色を決定
  const getProgressColor = () => {
    if (task.status === 'completed' || task.completionRate >= 70) {
      return 'bg-green-500';
    } else if (task.completionRate >= 30) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  // ステータスアイコンと色
  const getStatusInfo = () => {
    if (task.status === 'completed') {
      return { icon: CheckCircle, color: 'text-green-500', label: '完了' };
    } else if (task.status === 'delayed') {
      return { icon: AlertCircle, color: 'text-red-500', label: '遅延' };
    } else if (task.status === 'in_progress') {
      return { icon: Clock, color: 'text-yellow-500', label: '進行中' };
    } else {
      return { icon: Clock, color: 'text-gray-400', label: '未着手' };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // 期限が過ぎているかチェック
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isValidDeadline = deadlineDate && !isNaN(deadlineDate.getTime());
  const isOverdue = isValidDeadline && deadlineDate < new Date() && task.status !== 'completed';

  return (
    <div
      onClick={onEdit}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-lg">{task.taskName}</h4>
          <p className="text-sm text-gray-600 mt-1">{task.projectName}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">進捗</span>
          <span className="text-sm font-semibold text-gray-700">
            {task.completionRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${task.completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* 期限 */}
      {isValidDeadline && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">期限:</span>
          <span
            className={`text-sm font-medium ${
              isOverdue ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            {format(deadlineDate, 'yyyy/MM/dd')}
            {isOverdue && ' (期限超過)'}
          </span>
        </div>
      )}

      {/* 概要（ある場合） */}
      {task.overview && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {task.overview}
        </p>
      )}

      {/* 使用技術 */}
      {task.technologies && task.technologies.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {task.technologies.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
            >
              {tech}
            </span>
          ))}
          {task.technologies.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{task.technologies.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
