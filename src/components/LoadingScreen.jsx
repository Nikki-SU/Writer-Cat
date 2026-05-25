// 加载画面组件
export default function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-6xl mb-6 animate-bounce">🐱📖</div>
      <div className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
        网文猫
      </div>
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <span className="animate-pulse">加载中</span>
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}
