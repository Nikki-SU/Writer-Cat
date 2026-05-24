// 首页
import { Link, useNavigate } from 'react-router-dom';
import { useBookStore } from '../stores/useBookStore';
import { useEffect, useState } from 'react';

function Home() {
  const navigate = useNavigate();
  const { books, currentBook, loadBooks, selectBook, createBook, deleteBook } = useBookStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleCreateBook = async () => {
    if (!newBookName.trim()) return;
    try {
      const book = await createBook(newBookName.trim());
      setNewBookName('');
      setShowCreateModal(false);
      // 选择新创建的书籍并进入写作页
      await selectBook(book.id);
      navigate('/writer');
    } catch (error) {
      console.error('创建书籍失败:', error);
    }
  };

  const handleDeleteBook = async (e, bookId) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这本书吗？此操作不可恢复。')) {
      await deleteBook(bookId);
    }
  };

  const handleSelectBook = async (bookId) => {
    await selectBook(bookId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐱📖</span>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">网文猫</h1>
          </div>
          {currentBook && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-300">
                当前: {currentBook.name}
              </span>
              <select
                className="px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={currentBook.id}
                onChange={(e) => handleSelectBook(e.target.value)}
              >
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 功能入口卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/plot"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">情节</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">情节-情绪图</p>
              </div>
            </div>
          </Link>

          <Link
            to="/structure"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">结构</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">伏笔 + 世界观</p>
              </div>
            </div>
          </Link>

          <Link
            to="/character"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">人物</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">人物卡片 + 关系图</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 写作按钮 */}
        {currentBook && (
          <div className="mb-8">
            <button
              onClick={() => navigate('/writer')}
              className="w-full bg-primary hover:bg-primary/90 text-white text-lg font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
            >
              <span className="text-2xl">✍️</span>
              开始写作
            </button>
          </div>
        )}

        {/* 书籍列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">我的书籍</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              + 新建书籍
            </button>
          </div>

          {books.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">还没有书籍</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                创建第一本书
              </button>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelectBook(book.id)}
                >
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{book.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {book.total_words || 0} 字 · {book.chapters?.length || 0} 章
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteBook(e, book.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 创建书籍弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              新建书籍
            </h3>
            <input
              type="text"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              placeholder="输入书籍名称"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBook()}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBookName('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleCreateBook}
                disabled={!newBookName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
