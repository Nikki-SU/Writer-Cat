// 书目列表
import useBookStore from '../../stores/useBookStore';
import { useState } from 'react';

function BookList() {
  const { books, currentBook, selectBook } = useBookStore();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = async (bookId) => {
    setIsSelecting(true);
    await selectBook(bookId);
    setIsSelecting(false);
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          📖 书目
        </span>
      </div>
      <select
        value={currentBook?.id || ''}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={isSelecting}
        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        {books.length === 0 ? (
          <option value="">请先创建书籍</option>
        ) : (
          books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

export default BookList;
