import { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const Memo = () => {
  const [memos, setMemos] = useState([]);
  const [newMemoContent, setNewMemoContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  // LocalStorageからメモを読み込み
  useEffect(() => {
    const savedMemos = localStorage.getItem('skecheck_memos');
    if (savedMemos) {
      setMemos(JSON.parse(savedMemos));
    }
  }, []);

  // メモをLocalStorageに保存
  const saveMemos = (updatedMemos) => {
    localStorage.setItem('skecheck_memos', JSON.stringify(updatedMemos));
    setMemos(updatedMemos);
  };

  // メモを追加
  const handleAddMemo = () => {
    if (!newMemoContent.trim()) return;

    const newMemo = {
      id: Date.now().toString(),
      content: newMemoContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedMemos = [newMemo, ...memos];
    saveMemos(updatedMemos);
    setNewMemoContent('');
  };

  // メモを削除
  const handleDeleteMemo = (id) => {
    if (!confirm('このメモを削除しますか？')) return;
    const updatedMemos = memos.filter(m => m.id !== id);
    saveMemos(updatedMemos);
  };

  // メモを編集開始
  const handleStartEdit = (memo) => {
    setEditingId(memo.id);
    setEditingContent(memo.content);
  };

  // メモを編集保存
  const handleSaveEdit = () => {
    if (!editingContent.trim()) return;

    const updatedMemos = memos.map(m =>
      m.id === editingId
        ? { ...m, content: editingContent.trim(), updatedAt: new Date().toISOString() }
        : m
    );
    saveMemos(updatedMemos);
    setEditingId(null);
    setEditingContent('');
  };

  // メモを編集キャンセル
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <StickyNote className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">メモ</h2>
        </div>

        {/* メモ追加フォーム */}
        <div className="mb-6">
          <textarea
            value={newMemoContent}
            onChange={(e) => setNewMemoContent(e.target.value)}
            placeholder="新しいメモを入力..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleAddMemo();
              }
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">Ctrl + Enter で追加</p>
            <button
              onClick={handleAddMemo}
              disabled={!newMemoContent.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>メモを追加</span>
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            保存されているメモ: <span className="font-semibold text-gray-800">{memos.length}件</span>
          </p>
        </div>
      </div>

      {/* メモ一覧 */}
      {memos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {editingId === memo.id ? (
                // 編集モード
                <>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-3"
                    rows={6}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>保存</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>キャンセル</span>
                    </button>
                  </div>
                </>
              ) : (
                // 表示モード
                <>
                  <div className="mb-3">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {memo.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-yellow-200">
                    <div className="text-xs text-gray-500">
                      {new Date(memo.createdAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(memo)}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-yellow-100 rounded transition-colors"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMemo(memo.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-yellow-100 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">メモがありません</p>
          <p className="text-gray-400 text-sm mt-2">上のフォームから新しいメモを追加してください</p>
        </div>
      )}
    </div>
  );
};

export default Memo;
