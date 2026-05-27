// 首页 - 书籍选择
import { useEffect, useState } from 'react';
import useBookStore from '../stores/useBookStore';
import useSettingsStore from '../stores/useSettingsStore';

export default function Home() {
  const { books, currentBook, loadBooks, selectBook, createBook, deleteBook } = useBookStore();
  const { settings } = useSettingsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const book = await createBook(newTitle.trim(), newDesc.trim() || null);
      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
      selectBook(book);
    } catch (e) {
      console.error('创建失败:', e);
    }
  };

  const handleDelete = async (e, book) => {
    e.stopPropagation();
    if (!confirm(`确定删除《${book.title}》？此操作不可恢复！`)) return;
    try {
      await deleteBook(book.id);
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-body">我的书籍</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          + 新建书籍
        </button>
      </div>

      {/* 新建弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">新建书籍</h2>
            <input
              type="text"
              placeholder="书名"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <textarea
              placeholder="简介（可选）"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-secondary hover:text-body transition"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 书籍列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => selectBook(book)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              currentBook?.id === book.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-body">{book.title}</h3>
                {book.description && (
                  <p className="text-sm text-secondary mt-1 line-clamp-2">
                    {book.description}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => handleDelete(e, book)}
                className="text-secondary hover:text-error transition"
                title="删除"
              >
                🗑️
              </button>
            </div>
            <div className="mt-3 text-xs text-secondary">
              创建于 {new Date(book.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-16 text-secondary">
          <p className="text-4xl mb-4">📚</p>
          <p>还没有书籍，点击上方按钮创建第一本吧！</p>
        </div>
      )}
    </div>
  );
}
