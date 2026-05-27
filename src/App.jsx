// 主应用入口
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useSettingsStore from './stores/useSettingsStore';
import WelcomeWizard from './components/WelcomeWizard';
import Layout from './components/Layout';
import Home from './pages/Home';
import Plot from './pages/Plot';
import Structure from './pages/Structure';
import Character from './pages/Character';
import Writer from './pages/Writer';
import Settings from './pages/Settings';

function App() {
  const { settings, loadSettings } = useSettingsStore();
  
  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  // 首次启动引导
  if (settings.first_launch) {
    return <WelcomeWizard />;
  }

  return (
    <BrowserRouter>
      <div className={settings.theme === 'dark' ? 'dark' : ''}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="plot" element={<Plot />} />
            <Route path="structure" element={<Structure />} />
            <Route path="character" element={<Character />} />
            <Route path="writer" element={<Writer />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
