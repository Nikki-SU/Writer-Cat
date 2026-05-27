// 人物页 - 双面卡片 + 关系图
import { useEffect, useState } from 'react';
import useBookStore from '../stores/useBookStore';
import { characterApi } from '../api/character';
import CharacterCard from '../components/CharacterCard/CharacterCard';
import RelationGraph from '../components/common/RelationGraph';

export default function Character() {
  const { currentBook } = useBookStore();
  const [characters, setCharacters] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');

  useEffect(() => {
    if (currentBook) {
      loadCharacters();
    }
  }, [currentBook]);

  const loadCharacters = async () => {
    try {
      const chars = await characterApi.getCharacters(currentBook.id);
      setCharacters(chars);
    } catch (e) {
      console.error('加载人物失败:', e);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const char = await characterApi.createCharacter({
        book_id: currentBook.id,
        name: newName.trim(),
        nickname: newNickname.trim() || null,
      });
      setCharacters([...characters, char]);
      setShowCreate(false);
      setNewName('');
      setNewNickname('');
    } catch (e) {
      console.error('创建人物失败:', e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除该人物？')) return;
    try {
      await characterApi.deleteCharacter(id);
      setCharacters(characters.filter(c => c.id !== id));
      if (selectedChar?.id === id) setSelectedChar(null);
    } catch (e) {
      console.error('删除人物失败:', e);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-body">人物管理</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          + 添加人物
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* 人物卡片区域 */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {characters.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                isSelected={selectedChar?.id === char.id}
                onClick={() => setSelectedChar(char)}
                onDelete={() => handleDelete(char.id)}
              />
            ))}
          </div>

          {characters.length === 0 && (
            <div className="text-center py-16 text-secondary">
              <p className="text-4xl mb-4">👤</p>
              <p>还没有人物，点击上方按钮添加</p>
            </div>
          )}
        </div>

        {/* 关系图区域 */}
        {characters.length > 1 && (
          <div className="w-80 border-l pl-4 overflow-auto">
            <h3 className="font-bold mb-2">人物关系图</h3>
            <RelationGraph characters={characters} relationships={relationships} />
          </div>
        )}
      </div>

      {/* 新建人物弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">添加人物</h2>
            <input
              type="text"
              placeholder="姓名"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <input
              type="text"
              placeholder="别名/绰号（可选）"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-secondary">
                取消
              </button>
              <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded-lg">
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
