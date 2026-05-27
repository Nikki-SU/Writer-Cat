// 情绪圆环组件
// 5色情绪：深蓝(1)→浅蓝(2)→白(3)→浅红(4)→深红(5)
const EMOTION_COLORS = {
  1: '#1A237E', // 深蓝-平静
  2: '#64B5F6', // 浅蓝-愉悦
  3: '#FFFFFF', // 白-一般
  4: '#EF9A9A', // 浅红-紧张
  5: '#B71C1C', // 深红-激烈
};

export default function EmotionCircle({ expected, actual, size = 60 }) {
  // 计算颜色（基于实际情绪）
  const actualColor = EMOTION_COLORS[actual] || '#FFFFFF';
  const borderColor = actual <= 2 ? '#1A237E' : actual >= 4 ? '#B71C1C' : '#8491B4';

  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        border: `3px solid ${borderColor}`,
        background: actualColor,
      }}
    >
      {/* 三段指示器 */}
      <div className="absolute inset-0 flex flex-col">
        {/* 上段 - 字数达标 */}
        <div
          className="flex-1"
          style={{
            background: expected >= actual ? 'rgba(0, 160, 135, 0.3)' : 'rgba(230, 75, 53, 0.3)',
          }}
        />
        {/* 中段 - 预计情绪 */}
        <div className="h-1/3 flex items-center justify-center">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: EMOTION_COLORS[expected] }}
          />
        </div>
        {/* 下段 - 实际情绪 */}
        <div className="h-1/3 flex items-center justify-center">
          <div
            className="w-2 h-2 rounded-full border border-gray-400"
            style={{ backgroundColor: actualColor }}
          />
        </div>
      </div>
    </div>
  );
}
