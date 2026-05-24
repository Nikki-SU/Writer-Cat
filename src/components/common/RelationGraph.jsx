// 人物关系图组件
import { useEffect, useRef, useState } from 'react';

function RelationGraph({ characters = [], relations = [], onCharacterClick }) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // 简单的力导向布局
  const calculateLayout = () => {
    const nodes = characters.map((char, index) => {
      const angle = (2 * Math.PI * index) / characters.length;
      const radius = 200;
      return {
        id: char.id,
        name: char.name,
        avatar: char.avatar || '👤',
        x: 300 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
      };
    });

    return nodes;
  };

  const nodes = calculateLayout();

  // 绘制关系线
  const renderLines = () => {
    return relations.map((relation, index) => {
      const sourceNode = nodes.find((n) => n.id === relation.sourceId);
      const targetNode = nodes.find((n) => n.id === relation.targetId);

      if (!sourceNode || !targetNode) return null;

      // 计算中点
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2;

      // 如果有多条关系，做偏移
      const sameRelations = relations.filter(
        (r) =>
          (r.sourceId === relation.sourceId && r.targetId === relation.targetId) ||
          (r.sourceId === relation.targetId && r.targetId === relation.sourceId)
      );
      const relationIndex = sameRelations.indexOf(relation);
      const offset = (relationIndex - (sameRelations.length - 1) / 2) * 20;

      return (
        <g key={`line-${index}`}>
          {/* 关系线 */}
          <line
            x1={sourceNode.x}
            y1={sourceNode.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke="#8491B4"
            strokeWidth="2"
            strokeDasharray={relation.type === '潜在' ? '5,5' : ''}
          />
          {/* 关系标签 */}
          <text
            x={midX}
            y={midY - 5 + offset}
            textAnchor="middle"
            className="text-xs fill-gray-600"
            style={{ fontSize: '10px' }}
          >
            {relation.type}
          </text>
          {relation.chapter && (
            <text
              x={midX}
              y={midY + 8 + offset}
              textAnchor="middle"
              className="text-xs fill-gray-400"
              style={{ fontSize: '9px' }}
            >
              {relation.chapter}
            </text>
          )}
        </g>
      );
    });
  };

  // 绘制节点
  const renderNodes = () => {
    return nodes.map((node) => {
      const isSelected = selectedNode === node.id;
      const character = characters.find((c) => c.id === node.id);

      return (
        <g
          key={node.id}
          onClick={() => {
            setSelectedNode(node.id);
            if (onCharacterClick) {
              onCharacterClick(character);
            }
          }}
          className="cursor-pointer"
        >
          {/* 节点圆圈 */}
          <circle
            cx={node.x}
            cy={node.y}
            r="30"
            fill={isSelected ? '#4DBBD5' : '#f8fafc'}
            stroke={isSelected ? '#4DBBD5' : '#d1d5db'}
            strokeWidth="2"
          />
          {/* 头像/图标 */}
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            style={{ fontSize: '20px' }}
          >
            {node.avatar}
          </text>
          {/* 名字 */}
          <text
            x={node.x}
            y={node.y + 50}
            textAnchor="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            {node.name}
          </text>
        </g>
      );
    });
  };

  if (characters.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-400">暂无人物关系</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <svg
        ref={svgRef}
        width="600"
        height="400"
        viewBox="0 0 600 400"
        className="bg-white dark:bg-gray-800 rounded-lg"
      >
        {renderLines()}
        {renderNodes()}
      </svg>
    </div>
  );
}

export default RelationGraph;
