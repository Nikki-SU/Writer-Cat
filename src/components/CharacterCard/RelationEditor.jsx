// 关系编辑器
import { useState, useEffect } from 'react';
import { RELATION_TYPES } from '../../utils/constants';

function RelationEditor({ character, onClose, onUpdate }) {
  const [relations, setRelations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRelation, setNewRelation] = useState({
    name: '',
    type: '',
    chapter: '',
  });

  useEffect(() => {
    setRelations(character.relations || []);
  }, [character.id]);

  const handleAddRelation = () => {
    if (!newRelation.name.trim() || !newRelation.type) return;
    const relation = { ...newRelation };
    const updated = [...relations, relation];
    setRelations(updated);
    if (onUpdate) {
      onUpdate({ relations: updated });
    }
    setNewRelation({ name: '', type: '', chapter: '' });
    setShowAddForm(false);
  };

  const handleDeleteRelation = (index) => {
    const updated = relations.filter((_, i) => i !== index);
    setRelations(updated);
    if (onUpdate) {
      onUpdate({ relations: updated });
    }
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border dark:border-gray-600" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            {character.name} - 人物关系
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        {/* 关系列表 */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {relations.map((rel, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <span className="font-medium text-gray-800 dark:text-white">
                  {rel.name}
                </span>
                <span className="mx-2 text-gray-400">-</span>
                <span className="text-gray-600 dark:text-gray-400">{rel.type}</span>
                {rel.chapter && (
                  <span className="ml-2 text-xs text-gray-400">({rel.chapter})</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteRelation(index)}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                删除
              </button>
            </div>
          ))}
          {relations.length === 0 && !showAddForm && (
            <p className="text-center text-gray-400 py-4">暂无关系</p>
          )}
        </div>

        {/* 添加表单 */}
        {showAddForm ? (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
            <input
              type="text"
              value={newRelation.name}
              onChange={(e) => setNewRelation({ ...newRelation, name: e.target.value })}
              placeholder="对方姓名"
              className="w-full px-3 py-2 text-sm border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
            <select
              value={newRelation.type}
              onChange={(e) => setNewRelation({ ...newRelation, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            >
              <option value="">选择关系类型</option>
              {RELATION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="text"
              value={newRelation.chapter}
              onChange={(e) => setNewRelation({ ...newRelation, chapter: e.target.value })}
              placeholder="章节（可选）"
              className="w-full px-3 py-2 text-sm border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddRelation}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
              >
                添加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mt-4 px-4 py-2 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-primary hover:text-primary"
          >
            + 添加关系
          </button>
        )}
      </div>
    </div>
  );
}

export default RelationEditor;
