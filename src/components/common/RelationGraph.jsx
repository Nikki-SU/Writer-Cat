// fix: 人物关系图（规格书要求）
// 1. SVG绘制，环形/力导向布局
// 2. 节点=人物头像+名字，可点击跳转
// 3. 连线=标注关系描述+章节范围（如"师徒(1-50章)"）
// 4. 同一对人物多条关系画多条线，不同颜色/线型区分
// 5. 点击连线显示关系详情
// 6. 点击节点触发回调onNodeClick(characterId)
import { useState, useMemo, useRef, useEffect } from 'react';

const RELATION_COLORS = {
  family: '#E64B35',    // 红色 - 亲属
  friend: '#00A087',    // 绿色 - 朋友
  enemy: '#E64B35',     // 红色 - 敌人
  love: '#F39B7F',      // 橙色 - 爱情
  master: '#4DBBD5',    // 蓝色 - 师徒
  rival: '#8491B4',     // 紫色 - 竞争对手
  colleague: '#3C5488', // 深蓝 - 同事
};

const LINE_STYLES = {
  solid: '',
  dashed: '5,5',
  dotted: '2,2',
};

export default function RelationGraph({
  characters = [],
  relationships = [],
  onNodeClick,
  width = 400,
  height = 400,
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const svgRef = useRef(null);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  // 计算节点位置（环形布局）
  const nodes = useMemo(() => {
    if (characters.length === 0) return [];
    const angleStep = (2 * Math.PI) / characters.length;
    return characters.map((char, i) => ({
      ...char,
      x: centerX + radius * Math.cos(i * angleStep - Math.PI / 2),
      y: centerY + radius * Math.sin(i * angleStep - Math.PI / 2),
      angle: i * angleStep,
    }));
  }, [characters, centerX, centerY, radius]);

  // 构建边数据
  const edges = useMemo(() => {
    return relationships.map((rel, idx) => {
      const sourceNode = nodes.find(n => n.id === rel.char1_id);
      const targetNode = nodes.find(n => n.id === rel.char2_id);
      if (!sourceNode || !targetNode) return null;
      
      // 计算边的中点和角度（用于放置标签）
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2;
      const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
      
      // 同一对节点的多条边需要偏移
      const edgeKey = `${rel.char1_id}-${rel.char2_id}`;
      const samePairEdges = relationships.filter(r => 
        (r.char1_id === rel.char1_id && r.char2_id === rel.char2_id) ||
        (r.char1_id === rel.char2_id && r.char2_id === rel.char1_id)
      );
      const edgeIndex = samePairEdges.indexOf(rel);
      const offset = (edgeIndex - (samePairEdges.length - 1) / 2) * 15;
      
      // 偏移中点和边
      const perpX = -Math.sin(angle) * offset;
      const perpY = Math.cos(angle) * offset;
      
      return {
        ...rel,
        id: idx,
        source: sourceNode,
        target: targetNode,
        midX: midX + perpX,
        midY: midY + perpY,
        angle,
        lineStyle: edgeIndex % 3 === 0 ? 'solid' : edgeIndex % 3 === 1 ? 'dashed' : 'dotted',
        color: RELATION_COLORS[rel.type] || '#8491B4',
      };
    }).filter(Boolean);
  }, [relationships, nodes]);

  // 处理节点点击
  const handleNodeClick = (charId) => {
    if (onNodeClick) {
      onNodeClick(charId);
    }
  };

  // 处理边点击
  const handleEdgeClick = (edge) => {
    setSelectedEdge(selectedEdge?.id === edge.id ? null : edge);
  };

  if (characters.length === 0) {
    return (
      <div className="flex items-center justify-center text-secondary text-sm py-8">
        <div className="text-center">
          <p className="text-3xl mb-2">👥</p>
          <p>添加人物后即可查看关系图</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        {/* 关系连线 */}
        {edges.map((edge) => (
          <g key={edge.id}>
            {/* 鼠标悬停区域（更宽以便点击） */}
            <line
              x1={edge.source.x}
              y1={edge.source.y}
              x2={edge.target.x}
              y2={edge.target.y}
              stroke="transparent"
              strokeWidth="20"
              className="cursor-pointer"
              onClick={() => handleEdgeClick(edge)}
              onMouseEnter={() => setHoveredEdge(edge)}
              onMouseLeave={() => setHoveredEdge(null)}
            />
            {/* 实际连线 */}
            <line
              x1={edge.source.x}
              y1={edge.source.y}
              x2={edge.target.x}
              y2={edge.target.y}
              stroke={selectedEdge?.id === edge.id ? '#4DBBD5' : edge.color}
              strokeWidth={selectedEdge?.id === edge.id ? 2 : 1.5}
              strokeDasharray={LINE_STYLES[edge.lineStyle]}
              opacity={hoveredEdge?.id === edge.id ? 1 : 0.6}
              className="transition-opacity"
            />
          </g>
        ))}

        {/* 边标签 */}
        {edges.map((edge) => (
          (hoveredEdge?.id === edge.id || selectedEdge?.id === edge.id) && (
            <g key={`label-${edge.id}`}>
              <rect
                x={edge.midX - 40}
                y={edge.midY - 10}
                width="80"
                height="20"
                fill="white"
                stroke={edge.color}
                rx="4"
                className="dark:fill-gray-700"
              />
              <text
                x={edge.midX}
                y={edge.midY + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#3C5488"
                className="dark:fill-white pointer-events-none"
              >
                {edge.relation_type}
                {edge.chapter_range && `(${edge.chapter_range})`}
              </text>
            </g>
          )
        ))}

        {/* 人物节点 */}
        {nodes.map((node) => (
          <g
            key={node.id}
            className="cursor-pointer"
            onClick={() => handleNodeClick(node.id)}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* 头像圆圈 */}
            <circle
              cx={node.x}
              cy={node.y}
              r={hoveredNode?.id === node.id ? 28 : 25}
              fill={hoveredNode?.id === node.id ? '#4DBBD5' : '#8491B4'}
              opacity={hoveredNode?.id === node.id ? 1 : 0.8}
              className="transition-all"
            />
            {/* 头像首字 */}
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize="14"
              fill="white"
              fontWeight="bold"
            >
              {node.name?.charAt(0) || '?'}
            </text>
            {/* 名字标签 */}
            <text
              x={node.x}
              y={node.y + 40}
              textAnchor="middle"
              fontSize="11"
              fill="#3C5488"
              className="dark:fill-white font-medium"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>

      {/* 关系详情面板 */}
      {selectedEdge && (
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border p-3 text-xs max-w-[160px]">
          <div className="font-medium text-body dark:text-white mb-1">
            {selectedEdge.source.name} → {selectedEdge.target.name}
          </div>
          <div className="text-secondary">
            <div>关系: {selectedEdge.relation_type}</div>
            {selectedEdge.description && (
              <div className="mt-1 text-gray-600 dark:text-gray-300">
                {selectedEdge.description}
              </div>
            )}
            {selectedEdge.chapter_range && (
              <div className="mt-1">
                章节范围: {selectedEdge.chapter_range}
              </div>
            )}
          </div>
          <button
            onClick={() => setSelectedEdge(null)}
            className="mt-2 text-primary hover:underline"
          >
            关闭
          </button>
        </div>
      )}

      {/* 图例 */}
      <div className="flex flex-wrap gap-2 mt-2 text-xs text-secondary">
        {Object.entries(RELATION_COLORS).slice(0, 4).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <span
              className="w-3 h-0.5 rounded"
              style={{ backgroundColor: color }}
            />
            <span>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
