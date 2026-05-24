// 线索/长伏笔流程图组件
import { useState } from 'react';

const THREAD_TYPES = {
  linear: { icon: '📍', label: '线性' },
  branch: { icon: '🌳', label: '分支' },
  converge: { icon: '🔀', label: '收束' },
};

function ThreadFlow({ thread, nodes = [], onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  if (!thread || nodes.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-400">暂无节点</p>
      </div>
    );
  }

  const typeConfig = THREAD_TYPES[thread.thread_type] || THREAD_TYPES.linear;

  // 简单的水平布局
  const calculatePositions = () => {
    const nodeWidth = 120;
    const nodeHeight = 60;
    const gap = 40;
    const startX = 20;
    const startY = 80;

    return nodes.map((node, index) => {
      // 分支类型：树状布局
      if (thread.thread_type === 'branch') {
        const branchCount = Math.min(nodes.length, 3);
        const branchIndex = index % branchCount;
        const row = Math.floor(index / branchCount);
        return {
          ...node,
          x: startX + row * (nodeWidth + gap * 2) + (branchIndex === 1 ? gap : 0),
          y: startY + branchIndex * (nodeHeight + 20),
        };
      }
      
      // 收束类型：集中布局
      if (thread.thread_type === 'converge') {
        return {
          ...node,
          x: startX + index * (nodeWidth + gap),
          y: startY + (index % 2 === 0 ? 0 : 30),
        };
      }
      
      // 默认线性布局
      return {
        ...node,
        x: startX + index * (nodeWidth + gap),
        y: startY,
      };
    });
  };

  const positions = calculatePositions();

  // 绘制连接线
  const renderConnections = () => {
    return positions.slice(0, -1).map((node, index) => {
      const nextNode = positions[index + 1];
      return (
        <line
          key={`conn-${index}`}
          x1={node.x + 120}
          y1={node.y + 30}
          x2={nextNode.x}
          y2={nextNode.y + 30}
          stroke="#8491B4"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
      );
    });
  };

  return (
    <div className="w-full overflow-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{typeConfig.icon}</span>
        <span className="font-medium text-gray-800 dark:text-white">{thread.name}</span>
        <span className="text-sm text-gray-400">({typeConfig.label})</span>
      </div>
      
      <svg
        width={Math.max(positions.length * 160 + 40, 400)}
        height="200"
        className="bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        {/* 箭头标记 */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#8491B4" />
          </marker>
        </defs>

        {/* 连接线 */}
        {renderConnections()}

        {/* 节点 */}
        {positions.map((node, index) => {
          const isHovered = hoveredNode === node.id;
          const isCompleted = node.completed;

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick?.(node)}
              className="cursor-pointer"
            >
              {/* 节点背景 */}
              <rect
                x={node.x}
                y={node.y}
                width="120"
                height="60"
                rx="8"
                fill={isHovered ? '#4DBBD5' : isCompleted ? '#f0fdf4' : '#ffffff'}
                stroke={isCompleted ? '#22c55e' : '#e5e7eb'}
                strokeWidth="2"
              />
              
              {/* 序号 */}
              <circle
                cx={node.x + 15}
                cy={node.y + 15}
                r="10"
                fill={isCompleted ? '#22c55e' : '#4DBBD5'}
              />
              <text
                x={node.x + 15}
                y={node.y + 19}
                textAnchor="middle"
                fill="white"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
              >
                {index + 1}
              </text>

              {/* 内容 */}
              <text
                x={node.x + 60}
                y={node.y + 25}
                textAnchor="middle"
                className="text-sm fill-gray-700"
                style={{ fontSize: '12px' }}
              >
                {(node.content || '未填写').slice(0, 8)}
              </text>

              {/* 章节信息 */}
              {node.chapter_title && (
                <text
                  x={node.x + 60}
                  y={node.y + 45}
                  textAnchor="middle"
                  className="text-xs fill-gray-400"
                  style={{ fontSize: '10px' }}
                >
                  {node.chapter_title.slice(0, 10)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default ThreadFlow;
