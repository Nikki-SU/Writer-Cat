// 三栏布局
import { Outlet, Link, useLocation } from 'react-router-dom';
import useBookStore from '../stores/useBookStore';

export default function Layout() {
  const location = useLocation();
  const { currentBook, selectBook, books } = useBookStore();

  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/plot', icon: '📊', label: '情节' },
    { path: '/structure', icon: '🔧', label: '结构' },
    { path: '/character', icon: '👤', label: '人物' },
    { path: '/writer', icon: '✏️', label: '写作' },
    { path: '/settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <header className="h-14 bg-white border-b flex items-center px-4 gap-4">
        {/* Logo */}
        <div className="font-bold text-lg text-primary flex items-center gap-2">
          <span>🐱</span>
          <span>网文猫</span>
        </div>

        {/* 导航 */}
        <nav className="flex gap-1 ml-8">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-secondary hover:text-body hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 当前书籍 */}
        {currentBook && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg">
            <span className="text-sm text-secondary">当前:</span>
            <span className="text-sm font-medium text-primary">{currentBook.title}</span>
          </div>
        )}
      </header>

      {/* 内容区域 */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
