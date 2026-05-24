// 人物页 - 人物卡片网格 + 双面翻转 + 关系图
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBookStore } from '../stores/useBookStore';
import CharacterCard from '../components/CharacterCard/CharacterCard';
import RelationGraph from '../components/common/RelationGraph';

function Character() {
  const navigate = useNavigate();
  const { currentBook, loadBooks } = useBookStore();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [showRelationGraph, setShowRelationGraph] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'graph'

  // 模拟数据（实际应从API加载）
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    if (currentBook) {
      // TODO: 从API加载人物数据
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
      timeline: [],
      relations: [],
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

  const handleUpdateCharacter = (updatedCharacter) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c))
    );
    setSelectedCharacter(updatedCharacter);
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

  // 生成关系数据
  const relations = characters.flatMap((char) =>
    (char.relations || []).map((rel) => ({
      sourceId: char.id,
      targetId: rel.targetId,
      type: rel.type,
      chapter: rel.chapter,
    }))
  );

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
            <span className="text-gray-500">/ {currentBook.name}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* 视图切换 */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'card' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                卡片
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'graph' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                关系图
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              + 添加人物
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {viewMode === 'graph' ? (
          // 关系图视图
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              人物关系图
            </h2>
            <RelationGraph
              characters={characters}
              relations={relations}
              onCharacterClick={(char) => {
                setSelectedCharacter(char);
                setViewMode('card');
              }}
            />
          </div>
        ) : (
          // 卡片视图
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 人物卡片列表 */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  人物列表 ({characters.length})
                </h3>
                {characters.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">暂无人物</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {characters.map((char) => (
                      <div
                        key={char.id}
                        onClick={() => setSelectedCharacter(char)}
                        className={`relative p-3 rounded-lg cursor-pointer transition-all group ${
                          selectedCharacter?.id === char.id
                            ? 'bg-primary/10 ring-2 ring-primary'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-lg">
                            {char.avatar || '👤'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-white truncate">
                              {char.name}
                            </p>
                            {char.gender && (
                              <p className="text-xs text-gray-400">
                                {char.gender === 'male' ? '男' : char.gender === 'female' ? '女' : '其他'}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteCharacter(e, char.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 人物详情 */}
            <div className="flex-1">
              {selectedCharacter ? (
                <CharacterCard
                  character={selectedCharacter}
                  onUpdate={handleUpdateCharacter}
                />
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              添加人物
            </h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                姓名
              </label>
              <input
                type="text"
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
                placeholder="输入人物姓名..."
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCharacter}
                disabled={!newCharacterName.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                创建
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCharacterName('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Character;
