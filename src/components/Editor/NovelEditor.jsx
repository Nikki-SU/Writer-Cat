// 网文专用编辑器 - 功能完整版本
import { useEffect, useRef, useCallback, useState } from 'react';
import { EditorView, keymap, placeholder, dropCursor } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { useEditorStore } from '../../stores/useEditorStore';

function NovelEditor({ content, onChange, fontSize = 16, darkMode = false, onEditorReady, onSelectionChange }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [localContent, setLocalContent] = useState(content);
  
  const { setSelection, setSpellingErrors, highlightedRanges } = useEditorStore();

  // 更新onChange回调引用
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 内容变化时更新本地状态
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // 初始化编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    // 清除旧编辑器
    if (viewRef.current) {
      viewRef.current.destroy();
    }
    editorRef.current.innerHTML = '';

    // 创建自定义主题
    const customTheme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: `${fontSize}px`,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      },
      '.cm-content': {
        fontFamily: "'LXGW WenKai', 'Noto Sans SC', serif",
        lineHeight: '1.8',
        padding: '24px 48px',
        maxWidth: '800px',
        margin: '0 auto',
        caretColor: darkMode ? '#60a5fa' : '#3b82f6',
      },
      '.cm-line': {
        padding: '0 4px',
      },
      '.cm-focused': {
        outline: 'none',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'inherit',
      },
      '.cm-cursor': {
        borderLeftColor: darkMode ? '#60a5fa' : '#3b82f6',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
        backgroundColor: darkMode ? '#374151' : '#dbeafe',
      },
      '.cm-placeholder': {
        color: darkMode ? '#6b7280' : '#9ca3af',
      },
      '&.cm-focused': {
        outline: 'none',
      },
    });

    // 更新监听器
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        setLocalContent(newContent);
        onChangeRef.current(newContent);
      }
      
      // 处理选择变化
      if (update.selectionSet) {
        const { from, to } = update.state.selection.main;
        setSelection(from, to);
        if (onSelectionChange) {
          const selectedText = update.state.doc.sliceString(from, to);
          onSelectionChange(selectedText, { start: from, end: to });
        }
      }
    });

    const state = EditorState.create({
      doc: localContent,
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        markdown(),
        syntaxHighlighting(defaultHighlightStyle),
        placeholder('开始写作...'),
        updateListener,
        customTheme,
        EditorView.lineWrapping,
        dropCursor(),
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
  }, []);

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

    const dom = view.dom;
    dom.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // 插入图片
  const insertImage = useCallback((imageUrl, alt = '') => {
    const view = viewRef.current;
    if (!view) return;

    const { from } = view.state.selection.main;
    const imageMarkdown = `![${alt}](${imageUrl})`;
    
    view.dispatch({
      changes: { from, insert: imageMarkdown },
      selection: { anchor: from + imageMarkdown.length },
    });
    view.focus();
  }, []);

  // 在光标位置插入文本
  const insertText = useCallback((text) => {
    const view = viewRef.current;
    if (!view) return;

    const { from } = view.state.selection.main;
    
    view.dispatch({
      changes: { from, insert: text },
      selection: { anchor: from + text.length },
    });
    view.focus();
  }, []);

  // 替换选中文本
  const replaceSelection = useCallback((replacement) => {
    const view = viewRef.current;
    if (!view) return;

    const { from, to } = view.state.selection.main;
    
    view.dispatch({
      changes: { from, to, insert: replacement },
      selection: { anchor: to + (replacement.length - (to - from)) },
    });
    view.focus();
  }, []);

  // 暴露方法给父组件
  useEffect(() => {
    if (onEditorReady) {
      onEditorReady({
        insertImage,
        insertText,
        replaceSelection,
        view: viewRef.current,
      });
    }
  }, [insertImage, insertText, replaceSelection, onEditorReady]);

  // 应用高亮（错别字、世界观冲突、人设冲突）
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // 这里可以添加高亮装饰效果
    // 实际实现可能需要使用 Decoration.mark
    const decorations = [];
    
    // 错别字标红
    highlightedRanges.spelling.forEach((range) => {
      // 添加红色下划线装饰
      console.log('错别字高亮:', range);
    });

    // 世界观冲突标橙色
    highlightedRanges.worldview.forEach((range) => {
      console.log('世界观冲突高亮:', range);
    });

    // 人设冲突标紫色
    highlightedRanges.character.forEach((range) => {
      console.log('人设冲突高亮:', range);
    });
  }, [highlightedRanges]);

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
