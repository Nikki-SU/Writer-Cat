// 情节页网格卡片
import { useState } from 'react';
import ChapterCard from './ChapterCard';
import EmotionCircle from '../common/EmotionCircle';

function PlotGrid({ chapters, plots, onUpdatePlot, onAddPlot }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {chapters.map((chapter, index) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          chapterNumber={index + 1}
          plots={plots[chapter.id] || []}
          onUpdatePlot={onUpdatePlot}
          onAddPlot={onAddPlot}
        />
      ))}
    </div>
  );
}

export default PlotGrid;
