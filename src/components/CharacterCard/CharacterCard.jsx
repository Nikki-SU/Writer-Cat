// 人物卡片（双面翻转）
import { useState } from 'react';
import CharacterFront from './CharacterFront';
import CharacterBack from './CharacterBack';
import RelationEditor from './RelationEditor';

function CharacterCard({ character, onUpdate }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRelationEditor, setShowRelationEditor] = useState(false);
  const [localCharacter, setLocalCharacter] = useState(character);

  if (!character) return null;

  // 更新本地状态
  const handleUpdate = (updates) => {
    const updated = { ...localCharacter, ...updates };
    setLocalCharacter(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  return (
    <div className="card-flip-container w-full">
      <div className={`card-flip ${isFlipped ? 'flipped' : ''}`} style={{ perspective: '1000px' }}>
        {/* 正面 */}
        <div className="card-front" style={{ backfaceVisibility: 'hidden' }}>
          <CharacterFront
            character={localCharacter}
            onFlip={() => setIsFlipped(true)}
            onEditRelation={() => setShowRelationEditor(true)}
            onUpdate={handleUpdate}
          />
        </div>

        {/* 反面 */}
        <div className="card-back" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', top: 0, left: 0, right: 0 }}>
          <CharacterBack
            character={localCharacter}
            onFlip={() => setIsFlipped(false)}
            onUpdate={handleUpdate}
          />
        </div>
      </div>

      {/* 关系编辑弹窗 */}
      {showRelationEditor && (
        <RelationEditor
          character={localCharacter}
          onClose={() => setShowRelationEditor(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default CharacterCard;
