// 人物关系图（简易版）
import { useMemo } from 'react';

export default function RelationGraph({ characters, relationships }) {
  // 计算节点位置（简单环形布局）
  const nodes = useMemo(() => {
    const angleStep = (2 * Math.PI) / Math.max(characters.length, 1);
    return characters.map((char, i) => ({
      ...char,
      x: 50 + 40 * Math.cos(i * angleStep - Math.PI / 2),
      y: 50 + 40 * Math.sin(i * angleStep - Math.PI / 2),
    }));
  }, [characters]);

  if (characters.length === 0) {
    return (
      <div className="text-center text-secondary text-sm py-4">
        添加人物后即可查看关系图
      </div>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full aspect-square">
      {/* 连接线 */}
      {relationships.map((rel, i) => {
        const char1 = nodes.find((n) => n.id === rel.char1_id);
        const char2 = nodes.find((n) => n.id === rel.char2_id);
        if (!char1 || !char2) return null;
        return (
          <line
            key={i}
            x1={char1.x}
            y1={char1.y}
            x2={char2.x}
            y2={char2.y}
            stroke="#8491B4"
            strokeWidth="0.5"
          />
        );
      })}

      {/* 节点 */}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r="8"
            fill="#4DBBD5"
            opacity="0.8"
          />
          <text
            x={node.x}
            y={node.y + 12}
            textAnchor="middle"
            fontSize="4"
            fill="#3C5488"
          >
            {node.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
