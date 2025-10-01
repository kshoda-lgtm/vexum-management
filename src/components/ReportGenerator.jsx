import { useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Download, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const ReportGenerator = () => {
  const { staff, tasks, addReport } = useAppContext();
  const reportRef = useRef(null);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientName: '',
    staffName: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    comments: '',
    issues: '',
    nextMonthPlan: '',
    upcomingTasks: []
  });

  const [upcomingTaskInput, setUpcomingTaskInput] = useState({
    taskName: '',
    details: ''
  });

  // 選択された期間のタスクを取得
  const getTasksForPeriod = () => {
    const startDate = new Date(formData.year, formData.month - 1, 1);
    const endDate = new Date(formData.year, formData.month, 0, 23, 59, 59);

    const selectedStaff = staff.find(s => s.name === formData.staffName);
    if (!selectedStaff) return [];

    return tasks.filter(task => {
      if (task.staffId !== selectedStaff.id) return false;
      if (task.clientName !== formData.clientName) return false;

      const taskDate = new Date(task.updatedAt || task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUpcomingTask = () => {
    if (upcomingTaskInput.taskName.trim()) {
      setFormData(prev => ({
        ...prev,
        upcomingTasks: [...prev.upcomingTasks, { ...upcomingTaskInput }]
      }));
      setUpcomingTaskInput({ taskName: '', details: '' });
    }
  };

  const handleRemoveUpcomingTask = (index) => {
    setFormData(prev => ({
      ...prev,
      upcomingTasks: prev.upcomingTasks.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateImage = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1080,
        windowWidth: 1080
      });

      canvas.toBlob((blob) => {
        const fileName = `${formData.clientName}_月次報告_${formData.year}-${String(formData.month).padStart(2, '0')}.png`;
        saveAs(blob, fileName);

        // レポートを保存
        const reportTasks = getTasksForPeriod();
        addReport({
          clientName: formData.clientName,
          staffName: formData.staffName,
          year: formData.year,
          month: formData.month,
          startDate: new Date(formData.year, formData.month - 1, 1),
          endDate: new Date(formData.year, formData.month, 0),
          tasks: reportTasks.map(task => ({
            projectName: task.projectName,
            overview: task.overview,
            achievements: task.achievements,
            results: task.results,
            technologies: task.technologies,
            completionRate: task.completionRate
          })),
          comments: formData.comments,
          issues: formData.issues,
          nextMonthPlan: formData.nextMonthPlan,
          upcomingTasks: formData.upcomingTasks,
          imageUrl: null
        });

        alert('レポート画像を生成しました！');
      });
    } catch (error) {
      console.error('画像生成エラー:', error);
      alert('画像の生成に失敗しました。');
    }
  };

  const clients = [...new Set(tasks.map(t => t.clientName))];
  const reportTasks = step >= 2 ? getTasksForPeriod() : [];
  const groupedTasks = reportTasks.reduce((acc, task) => {
    if (!acc[task.projectName]) {
      acc[task.projectName] = [];
    }
    acc[task.projectName].push(task);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">月次レポート作成</h2>

        {/* ステップ1: 基本情報 */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">ステップ1: 基本情報</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  クライアント <span className="text-red-500">*</span>
                </label>
                <select
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {clients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者 <span className="text-red-500">*</span>
                </label>
                <select
                  name="staffName"
                  value={formData.staffName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  if (!formData.clientName || !formData.staffName) {
                    alert('クライアントと担当者を選択してください');
                    return;
                  }
                  setStep(2);
                }}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {/* ステップ2: 手動入力 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">ステップ2: 手動入力項目</h3>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← 戻る
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✅ 達成事項は自動的に取得されます（{reportTasks.length}件のタスク）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所感・コメント
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="データ収集は順調に進んでいます。&#10;クライアント様からのフィードバックも良好です。"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                今後の課題
              </label>
              <textarea
                name="issues"
                value={formData.issues}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="- データ品質の改善が必要&#10;- APIのレスポンス速度向上"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                来月の方針
              </label>
              <textarea
                name="nextMonthPlan"
                value={formData.nextMonthPlan}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="モデルの本番環境への導入を進めます。"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                今後の業務予定
              </label>
              <div className="space-y-3 mb-3">
                {formData.upcomingTasks.map((task, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{task.taskName}</p>
                        <p className="text-sm text-gray-600 mt-1">{task.details}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveUpcomingTask(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={upcomingTaskInput.taskName}
                  onChange={(e) => setUpcomingTaskInput(prev => ({ ...prev, taskName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="タスク名"
                />
                <input
                  type="text"
                  value={upcomingTaskInput.details}
                  onChange={(e) => setUpcomingTaskInput(prev => ({ ...prev, details: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="詳細"
                />
                <button
                  onClick={handleAddUpcomingTask}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  業務を追加
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <Eye className="w-5 h-5" />
                プレビュー
              </button>
            </div>
          </div>
        )}

        {/* ステップ3: プレビュー */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">ステップ3: プレビュー</h3>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← 編集に戻る
              </button>
            </div>

            <div className="flex justify-center">
              <div
                ref={reportRef}
                className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-lg"
                style={{ width: '1080px' }}
              >
                {/* レポート内容 */}
                <div className="space-y-6">
                  <div className="text-center border-b-2 border-gray-300 pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">📊 月次業務報告書</h1>
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-semibold">期間:</span>{' '}
                      {formData.year}年{formData.month}月1日 - {formData.year}年{formData.month}月
                      {new Date(formData.year, formData.month, 0).getDate()}日
                    </p>
                    <p>
                      <span className="font-semibold">クライアント:</span> {formData.clientName}
                    </p>
                    <p>
                      <span className="font-semibold">担当者:</span> {formData.staffName}
                    </p>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">【達成事項】</h2>
                    <div className="space-y-6">
                      {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                        <div key={projectName} className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-800">■ {projectName}</h3>
                          {projectTasks.map((task, index) => (
                            <div key={index} className="ml-4 space-y-1 text-sm">
                              {task.overview && (
                                <p>
                                  <span className="font-semibold">概要:</span> {task.overview}
                                </p>
                              )}
                              {task.achievements && (
                                <div>
                                  <span className="font-semibold">達成内容:</span>
                                  <pre className="whitespace-pre-wrap ml-4 text-gray-700">{task.achievements}</pre>
                                </div>
                              )}
                              {task.results && (
                                <p>
                                  <span className="font-semibold">成果:</span> {task.results}
                                </p>
                              )}
                              {task.technologies && task.technologies.length > 0 && (
                                <p>
                                  <span className="font-semibold">使用技術:</span>{' '}
                                  {task.technologies.join(', ')}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">達成度:</span>
                                <div className="flex-1 max-w-[200px] bg-gray-200 rounded-full h-4">
                                  <div
                                    className="bg-primary-500 h-4 rounded-full"
                                    style={{ width: `${task.completionRate}%` }}
                                  ></div>
                                </div>
                                <span className="font-semibold">{task.completionRate}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.comments && (
                    <div className="border-t-2 border-gray-300 pt-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">【所感・コメント】</h2>
                      <pre className="whitespace-pre-wrap text-gray-700">{formData.comments}</pre>
                    </div>
                  )}

                  {formData.issues && (
                    <div className="border-t-2 border-gray-300 pt-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">【今後の課題】</h2>
                      <pre className="whitespace-pre-wrap text-gray-700">{formData.issues}</pre>
                    </div>
                  )}

                  {formData.nextMonthPlan && (
                    <div className="border-t-2 border-gray-300 pt-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">【来月の方針】</h2>
                      <pre className="whitespace-pre-wrap text-gray-700">{formData.nextMonthPlan}</pre>
                    </div>
                  )}

                  {formData.upcomingTasks.length > 0 && (
                    <div className="border-t-2 border-gray-300 pt-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">【今後の業務予定】</h2>
                      <div className="space-y-2">
                        {formData.upcomingTasks.map((task, index) => (
                          <div key={index}>
                            <p className="font-semibold text-gray-800">■ {task.taskName}</p>
                            <p className="ml-4 text-gray-700">{task.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t-2 border-gray-300 pt-4 text-right text-sm text-gray-600">
                    {new Date().getFullYear()}年{new Date().getMonth() + 1}月{new Date().getDate()}日作成
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={handleGenerateImage}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-lg"
              >
                <Download className="w-6 h-6" />
                画像を生成してダウンロード
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
