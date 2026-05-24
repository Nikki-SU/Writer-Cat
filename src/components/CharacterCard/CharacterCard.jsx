// 人物卡片（双面翻转）
import { useState } from 'react';
import CharacterFront from './CharacterFront';
import CharacterBack from './CharacterBack';
import RelationEditor from './RelationEditor';

function CharacterCard({ character }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRelationEditor, setShowRelationEditor] = useState(false);

  if (!character) return null;

  return (
    <div className="card-flip-container w-full">
      <div className={`card-flip ${isFlipped ? 'flipped' : ''}`}>
        {/* 正面 */}
        <div className="card-front">
          <CharacterFront
            character={character}
            onFlip={() => setIsFlipped(true)}
            onEditRelation={() => setShowRelationEditor(true)}
          />
        </div>

        {/* 反面 */}
        <div className="card-back absolute inset-0">
          <CharacterBack
            character={character}
            onFlip={() => setIsFlipped(false)}
          />
        </div>
      </div>

      {/* 关系编辑弹窗 */}
      {showRelationEditor && (
        <RelationEditor
          character={character}
          onClose={() => setShowRelationEditor(false)}
        />
      )}
    </div>
  );
}

export default CharacterCard;
