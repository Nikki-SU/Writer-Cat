// 5色情绪选择器
import { EMOTION_COLORS } from '../../utils/constants';

function ColorPicker({ position, onSelect, onClose }) {
  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-3 animate-fadeIn"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        选择情绪（最多3种）
      </p>
      <div className="flex gap-1">
        {EMOTION_COLORS.map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => onSelect(emotion)}
            className={`w-8 h-8 rounded ${emotion.bgClass} border border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-primary transition-all`}
            title={emotion.name}
          />
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        取消
      </button>
    </div>
  );
}

export default ColorPicker;
