import { useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Download, Upload, Database, AlertCircle } from 'lucide-react';
import { exportData, importData, updateLastBackupTime, getLastBackupTime } from '../utils/storage';
import { format } from 'date-fns';

const BackupManager = () => {
  const { staff, tasks, meetings, reports } = useAppContext();
  const fileInputRef = useRef(null);
  const [lastBackup, setLastBackup] = useState(getLastBackupTime());

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `進捗管理_バックアップ_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      updateLastBackupTime();
      setLastBackup(new Date());

      alert('バックアップファイルをダウンロードしました！');
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('バックアップに失敗しました。');
    }
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const success = importData(content);
          if (success) {
            alert('データを復元しました。ページを再読み込みします。');
            window.location.reload();
          } else {
            alert('データの復元に失敗しました。ファイル形式を確認してください。');
          }
        }
      } catch (error) {
        console.error('インポートエラー:', error);
        alert('データの復元に失敗しました。');
      }
    };
    reader.readAsText(file);

    // ファイル選択をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    const confirmed = confirm(
      '⚠️ 警告: 現在のデータは上書きされます。\n\n本当にインポートしますか？'
    );
    if (confirmed) {
      fileInputRef.current?.click();
    }
  };

  // データ統計
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const delayedTasks = tasks.filter(t => t.status === 'delayed').length;

  // ストレージ使用量計算（概算）
  const dataSize = new Blob([exportData()]).size;
  const maxSize = 5 * 1024 * 1024; // 5MB
  const usagePercent = Math.min((dataSize / maxSize) * 100, 100);

  return (
    <div className="space-y-6">
      {/* バックアップ情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Database className="w-7 h-7 text-primary-500" />
          データ管理
        </h2>

        {/* 最終バックアップ日時 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">最終バックアップ:</span>
            {lastBackup ? (
              <span className="text-sm text-gray-600">
                {format(lastBackup, 'yyyy年MM月dd日 HH:mm')}
              </span>
            ) : (
              <span className="text-sm text-gray-500">未実施</span>
            )}
          </div>
          {(!lastBackup || (new Date().getTime() - lastBackup.getTime()) > 7 * 24 * 60 * 60 * 1000) && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  バックアップを推奨します
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  定期的なバックアップでデータを保護しましょう（推奨: 週1回）
                </p>
              </div>
            </div>
          )}
        </div>

        {/* バックアップ・復元ボタン */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">データをエクスポート</span>
          </button>

          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span className="font-semibold">データをインポート</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <p className="text-xs text-gray-500 mt-3 text-center">
          ※ JSONファイルでデータをエクスポート・インポートできます
        </p>
      </div>

      {/* データ統計 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">データ統計</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">スタッフ</p>
            <p className="text-2xl font-bold text-blue-800">{staff.length}</p>
            <p className="text-xs text-blue-600">名</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">タスク</p>
            <p className="text-2xl font-bold text-green-800">{totalTasks}</p>
            <p className="text-xs text-green-600">件</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">ミーティング</p>
            <p className="text-2xl font-bold text-purple-800">{meetings.length}</p>
            <p className="text-xs text-purple-600">件</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">レポート</p>
            <p className="text-2xl font-bold text-orange-800">{reports.length}</p>
            <p className="text-xs text-orange-600">件</p>
          </div>
        </div>

        {/* タスクステータス */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">タスクステータス</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">完了</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                  {completedTasks}件
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">進行中</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                  {inProgressTasks}件
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">遅延</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${totalTasks > 0 ? (delayedTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                  {delayedTasks}件
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ストレージ使用状況 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">ストレージ使用状況</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {(dataSize / 1024).toFixed(1)} KB / 5 MB
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            使用率: {usagePercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          バックアップについて
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• データはブラウザのLocalStorageに保存されます</li>
          <li>• ブラウザのキャッシュをクリアするとデータが消失します</li>
          <li>• 定期的にエクスポートしてバックアップを取ることを推奨します</li>
          <li>• エクスポートしたJSONファイルは安全な場所に保管してください</li>
          <li>• インポートすると現在のデータは上書きされます（要注意）</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupManager;
