// 关系编辑组件
import { useState } from 'react';
import { RELATION_TYPES } from '../../utils/constants';

function RelationEditor({ character, onClose }) {
  const [targetCharacter, setTargetCharacter] = useState('');
  const [relationType, setRelationType] = useState('');
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(0);

  const handleSave = () => {
    // TODO: 保存关系
    console.log('保存关系:', {
      character,
      target: targetCharacter,
      type: relationType,
      start: startChapter,
      end: endChapter,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          添加人物关系
        </h3>

        <div className="space-y-4">
          {/* 选择对方人物 */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              对方
            </label>
            <select
              value={targetCharacter}
              onChange={(e) => setTargetCharacter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">选择人物</option>
            </select>
          </div>

          {/* 关系类型 */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              关系
            </label>
            <div className="flex flex-wrap gap-2">
              {RELATION_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setRelationType(type)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    relationType === type
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 章节范围 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                开始章节
              </label>
              <input
                type="number"
                value={startChapter}
                onChange={(e) => setStartChapter(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                结束章节
              </label>
              <input
                type="number"
                value={endChapter}
                onChange={(e) => setEndChapter(Number(e.target.value))}
                min={0}
                placeholder="0表示全书"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!targetCharacter || !relationType}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default RelationEditor;
