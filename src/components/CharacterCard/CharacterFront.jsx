// 人物卡片正面 - 基本信息
function CharacterFront({ character, onFlip, onEditRelation }) {
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
              {character.gender || '未设置'} · {character.age || '?'}岁
            </p>
          </div>
        </div>
        <button
          onClick={onFlip}
          className="text-sm text-primary hover:underline"
        >
          翻到反面 →
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
          {/* TODO: 显示人物关系列表 */}
          <p className="text-sm text-gray-400 italic">暂无关系</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 flex gap-2">
        <button className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
          编辑
        </button>
        <button className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          查看关系图
        </button>
      </div>
    </div>
  );
}

export default CharacterFront;
