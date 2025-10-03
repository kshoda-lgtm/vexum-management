import { AlertCircle, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const ErrorNotification = () => {
  const { error, quotaExceeded } = useAppContext();

  if (!error) return null;

  return (
    <div className={`fixed top-4 right-4 max-w-md rounded-lg shadow-lg p-4 z-50 ${
      quotaExceeded ? 'bg-red-50 border-2 border-red-500' : 'bg-yellow-50 border-2 border-yellow-500'
    }`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
          quotaExceeded ? 'text-red-600' : 'text-yellow-600'
        }`} />
        <div className="flex-1">
          <h3 className={`font-bold mb-1 ${
            quotaExceeded ? 'text-red-900' : 'text-yellow-900'
          }`}>
            {quotaExceeded ? '⚠️ 無料枠の上限に達しました' : '⚠️ 同期エラー'}
          </h3>
          <p className={`text-sm ${
            quotaExceeded ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {error}
          </p>
          {quotaExceeded && (
            <div className="mt-2 text-xs text-red-700">
              <p>• データの同期が停止されています</p>
              <p>• ローカルのデータは保持されています</p>
              <p>• Firebaseの無料枠をご確認ください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;
