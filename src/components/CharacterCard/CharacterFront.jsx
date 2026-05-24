// 人物卡片正面 - 基本信息
import { useState } from 'react';
import { GENDER_OPTIONS } from '../../utils/constants';

function CharacterFront({ character, onFlip, onEditRelation, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: character.name || '',
    avatar: character.avatar || '',
    gender: character.gender || '',
    age: character.age || 0,
    intro: character.intro || '',
    personality: character.personality || '',
    appearance: character.appearance || '',
  });

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editForm);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: character.name || '',
      avatar: character.avatar || '',
      gender: character.gender || '',
      age: character.age || 0,
      intro: character.intro || '',
      personality: character.personality || '',
      appearance: character.appearance || '',
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-full">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">编辑人物</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">姓名</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">性别</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">未设置</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">年龄</label>
              <input
                type="number"
                value={editForm.age || ''}
                onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">简介</label>
            <textarea
              value={editForm.intro}
              onChange={(e) => setEditForm({ ...editForm, intro: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">性格</label>
            <textarea
              value={editForm.personality}
              onChange={(e) => setEditForm({ ...editForm, personality: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">外貌</label>
            <textarea
              value={editForm.appearance}
              onChange={(e) => setEditForm({ ...editForm, appearance: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            保存
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-4xl">
            {character.avatar || '👤'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {character.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {character.gender === 'male' ? '男' : character.gender === 'female' ? '女' : '未设置'} · {character.age || '?'}岁
            </p>
          </div>
        </div>
        <button
          onClick={onFlip}
          className="text-sm text-primary hover:underline"
        >
          反面 →
        </button>
      </div>

      {/* 基本信息 */}
      <div className="space-y-4">
        {character.intro && (
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              简介
            </h3>
            <p className="text-gray-800 dark:text-gray-200">{character.intro}</p>
          </div>
        )}

        {character.personality && (
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              性格
            </h3>
            <p className="text-gray-800 dark:text-gray-200">{character.personality}</p>
          </div>
        )}

        {character.appearance && (
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              外貌
            </h3>
            <p className="text-gray-800 dark:text-gray-200">{character.appearance}</p>
          </div>
        )}
      </div>

      {/* 人物关系 */}
      <div className="mt-6 pt-6 border-t dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            ── 人物关系 ──
          </h3>
          <button
            onClick={onEditRelation}
            className="text-xs text-primary hover:underline"
          >
            + 添加关系
          </button>
        </div>
        <div className="space-y-2">
          {(character.relations || []).length > 0 ? (
            character.relations.map((rel, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{rel.name}</span>
                <span className="mx-2">-</span>
                <span>{rel.type}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">暂无关系</p>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
        >
          编辑
        </button>
        <button className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          关系图
        </button>
      </div>
    </div>
  );
}

export default CharacterFront;
