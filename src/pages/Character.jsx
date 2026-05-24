// 人物页
import { Link } from 'react-router-dom';
import { useBookStore } from '../stores/useBookStore';
import { useEffect, useState } from 'react';
import CharacterCard from '../components/CharacterCard/CharacterCard';

function Character() {
  const { currentBook, loadBooks } = useBookStore();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // TODO: 从API加载人物数据
  useEffect(() => {
    if (currentBook) {
      setCharacters([]);
      setSelectedCharacter(null);
    }
  }, [currentBook]);

  const handleAddCharacter = async () => {
    if (!newCharacterName.trim()) return;
    const newChar = {
      id: Date.now().toString(),
      name: newCharacterName.trim(),
      avatar: '',
      gender: '',
      age: 0,
      intro: '',
      personality: '',
      appearance: '',
    };
    setCharacters((prev) => [...prev, newChar]);
    setNewCharacterName('');
    setShowAddModal(false);
    setSelectedCharacter(newChar);
  };

  const handleDeleteCharacter = (e, characterId) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个人物吗？')) {
      setCharacters((prev) => prev.filter((c) => c.id !== characterId));
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(null);
      }
    }
  };

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">请先选择一本书</p>
          <Link to="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">人物</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            + 添加人物
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {characters.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">还没有人物</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              添加第一个人物
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 人物卡片列表 */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => setSelectedCharacter(char)}
                      className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                        selectedCharacter?.id === char.id
                          ? 'bg-primary/10 ring-2 ring-primary'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-2xl">
                        {char.avatar || '👤'}
                      </div>
                      <p className="text-center font-medium text-gray-800 dark:text-white truncate">
                        {char.name}
                      </p>
                      <button
                        onClick={(e) => handleDeleteCharacter(e, char.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 人物详情 */}
            <div className="flex-1">
              {selectedCharacter ? (
                <CharacterCard character={selectedCharacter} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    点击左侧人物卡片查看详情
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 添加人物弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              添加人物
            </h3>
            <input
              type="text"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              placeholder="输入人物姓名"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddCharacter()}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCharacterName('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleAddCharacter}
                disabled={!newCharacterName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Character;
