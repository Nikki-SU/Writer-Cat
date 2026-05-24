// 检索框组件
import { useState } from 'react';

function SearchBox({ 
  value, 
  onChange, 
  placeholder = '搜索...', 
  onSearch,
  className = '' 
}) {
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`w-full pl-9 pr-4 py-2 border rounded-lg transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
          focused
            ? 'border-primary ring-1 ring-primary'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBox;
