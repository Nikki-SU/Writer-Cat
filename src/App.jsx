// 主应用组件
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Plot from './pages/Plot';
import Structure from './pages/Structure';
import Character from './pages/Character';
import Writer from './pages/Writer';
import Settings from './pages/Settings';
import { useSettingsStore } from './stores/useSettingsStore';

function App() {
  const { loadSettings, settings } = useSettingsStore();
  
  // 加载设置
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  return (
    <BrowserRouter>
      <div className={`h-full ${settings.darkMode ? 'dark' : ''}`}>
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
      </div>
    </BrowserRouter>
  );
}

export default App;
