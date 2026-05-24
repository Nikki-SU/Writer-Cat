// 网文专用编辑器 - 基于CodeMirror 6
// 核心要求：输入响应 ≤16ms，自动保存500ms防抖
import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

function NovelEditor({ content, onChange, fontSize = 16, darkMode = false, onEditorReady }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  
  // 更新onChange回调引用
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 初始化编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        onChangeRef.current(newContent);
      }
    });

    // 主题配置
    const theme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: `${fontSize}px`,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      },
      '.cm-content': {
        fontFamily: "'LXGW WenKai', serif",
        lineHeight: '1.8',
        padding: '16px 24px',
        maxWidth: '800px',
        margin: '0 auto',
      },
      '.cm-line': {
        padding: '0 4px',
      },
      '.cm-focused': {
        outline: 'none',
      },
      '.cm-scroller': {
        overflow: 'auto',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: darkMode ? '#60a5fa' : '#3b82f6',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: darkMode ? '#374151' : '#dbeafe',
      },
      '.cm-placeholder': {
        color: darkMode ? '#6b7280' : '#9ca3af',
      },
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        markdown(),
        syntaxHighlighting(defaultHighlightStyle),
        placeholder('开始写作...'),
        updateListener,
        theme,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // 通知父组件编辑器已就绪
    if (onEditorReady) {
      onEditorReady(view);
    }

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // 只在挂载时执行一次

  // 更新内容（外部传入时）
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== content) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: content,
        },
      });
    }
  }, [content]);

  // 更新字体大小
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: EditorView.theme({
        '&': { fontSize: `${fontSize}px` },
      }).of([]),
    });
  }, [fontSize]);

  // 更新主题
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // 重新创建带新主题的编辑器
    // 注意：这里简化处理，实际项目中可能需要更复杂的主题切换逻辑
  }, [darkMode]);

  return (
    <div className="flex-1 overflow-hidden">
      <div
        ref={editorRef}
        className="h-full"
      />
    </div>
  );
}

export default NovelEditor;
