// fix: CodeMirror 6 编辑器
import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import useSettingsStore from '../../stores/useSettingsStore';

export default function Editor({ content, onChange, currentChapter }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const { settings } = useSettingsStore();
  const [isReady, setIsReady] = useState(false);

  // 创建编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        onChange(newContent);
      }
    });

    const theme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: `${settings.font_size}px`,
      },
      '.cm-content': {
        fontFamily: '"LXGW WenKai", "霞鹜文楷", serif',
        lineHeight: '1.8',
        padding: '16px',
      },
      '.cm-line': {
        padding: '0 4px',
      },
      '&.cm-focused': {
        outline: 'none',
      },
    });

    const state = EditorState.create({
      doc: content || '',
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        theme,
        updateListener,
        EditorView.lineWrapping,
        settings.theme === 'dark' ? oneDark : [],
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    setIsReady(true);

    return () => {
      view.destroy();
    };
  }, []);

  // 当章节变化时更新内容
  useEffect(() => {
    if (viewRef.current && content !== undefined) {
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== content) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content || '',
          },
        });
      }
    }
  }, [currentChapter?.id]);

  return (
    <div className="h-full overflow-hidden bg-white">
      {!currentChapter && (
        <div className="h-full flex items-center justify-center text-secondary">
          <div className="text-center">
            <p className="text-4xl mb-4">✏️</p>
            <p>请在左侧选择或创建章节开始写作</p>
          </div>
        </div>
      )}
      <div
        ref={editorRef}
        className={`h-full ${!currentChapter ? 'hidden' : ''}`}
      />
    </div>
  );
}
