// 主应用组件
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Plot from './pages/Plot';
import Structure from './pages/Structure';
import Character from './pages/Character';
import Writer from './pages/Writer';
import Settings from './pages/Settings';
import { useSettingsStore } from './stores/useSettingsStore';
import WelcomeWizard from './components/WelcomeWizard';
import LoadingScreen from './components/LoadingScreen';
import * as ollamaApi from './api/ollama';

function App() {
  const { loadSettings, settings } = useSettingsStore();
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 加载设置
  useEffect(() => {
    const initApp = async () => {
      await loadSettings();
      try {
        // 检测是否首次启动
        const firstLaunch = await ollamaApi.isFirstLaunch();
        if (firstLaunch) {
          setShowWizard(true);
        }
      } catch (e) {
        // 如果检测失败（比如Tauri未就绪），默认不显示引导
        console.error('首次启动检测失败:', e);
      }
      setLoading(false);
    };
    initApp();
  }, [loadSettings]);
  
  // 引导完成
  const handleWizardComplete = async () => {
    try {
      await ollamaApi.completeFirstLaunch();
    } catch (e) {
      console.error('完成首次引导失败:', e);
    }
    setShowWizard(false);
  };
  
  // 加载中显示
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <BrowserRouter>
      <div className={`h-full ${settings.darkMode ? 'dark' : ''}`}>
        {/* 首次启动引导 */}
        {showWizard && <WelcomeWizard onComplete={handleWizardComplete} />}
        
        {/* 主路由 */}
        {!showWizard && (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plot" element={<Plot />} />
            <Route path="/structure" element={<Structure />} />
            <Route path="/character" element={<Character />} />
            <Route path="/writer" element={<Writer />} />
            <Route path="/writer/:chapterId" element={<Writer />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
