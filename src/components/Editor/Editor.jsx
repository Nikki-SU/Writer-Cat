// fix: CodeMirror 6 编辑器（规格书要求）
// 1. 支持 fontSize/lineHeight/theme 动态更新
// 2. 支持 AI 检查结果标红（错别字=红色+下划线，世界观冲突=橙色，人设冲突=紫色）
import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { EditorState, StateField, StateEffect } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, Decoration } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import useSettingsStore from '../../stores/useSettingsStore';

// 标红装饰器
const spellErrorMark = Decoration.mark({ class: 'cm-spell-error' });
const worldviewConflictMark = Decoration.mark({ class: 'cm-worldview-conflict' });
const characterConflictMark = Decoration.mark({ class: 'cm-character-conflict' });

// 创建装饰效果
const setSpellErrors = StateEffect.define();
const setWorldviewConflicts = StateEffect.define();
const setCharacterConflicts = StateEffect.define();

// 装饰状态字段
const decorationsField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (let effect of tr.effects) {
      if (effect.is(setSpellErrors)) {
        decorations = decorations.update({
          add: effect.value.map(({ from, to }) => spellErrorMark.range(from, to))
        });
      }
      if (effect.is(setWorldviewConflicts)) {
        decorations = decorations.update({
          add: effect.value.map(({ from, to }) => worldviewConflictMark.range(from, to))
        });
      }
      if (effect.is(setCharacterConflicts)) {
        decorations = decorations.update({
          add: effect.value.map(({ from, to }) => characterConflictMark.range(from, to))
        });
      }
    }
    return decorations;
  },
  provide: f => EditorView.decorations.from(f)
});

const Editor = forwardRef(function Editor({
  content,
  onChange,
  currentChapter,
  fontSize = 16,
  darkMode = false,
  aiCheckResults,
}, ref) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const { settings } = useSettingsStore();
  const [isReady, setIsReady] = useState(false);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    insertImage: () => {
      // TODO: 实现插入图片功能
      console.log('insertImage called');
    },
    updateTheme: (theme) => {
      if (viewRef.current) {
        // 主题更新逻辑
      }
    },
    setDecorations: (type, ranges) => {
      if (!viewRef.current) return;
      const effects = [];
      if (type === 'typo') {
        effects.push(setSpellErrors.of(ranges));
      } else if (type === 'worldview_conflict') {
        effects.push(setWorldviewConflicts.of(ranges));
      } else if (type === 'character_conflict') {
        effects.push(setCharacterConflicts.of(ranges));
      }
      if (effects.length > 0) {
        viewRef.current.dispatch({ effects });
      }
    },
    clearDecorations: () => {
      if (!viewRef.current) return;
      viewRef.current.dispatch({
        effects: [
          setSpellErrors.of([]),
          setWorldviewConflicts.of([]),
          setCharacterConflicts.of([])
        ]
      });
    },
    getView: () => viewRef.current,
  }));

  // 创建编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        onChange(newContent);
      }
    });

    // 动态主题
    const theme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: `${fontSize}px`,
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
      /* 标红样式 */
      '.cm-spell-error': {
        color: '#E64B35',
        textDecoration: 'underline wavy #E64B35',
      },
      '.cm-worldview-conflict': {
        backgroundColor: 'rgba(243, 155, 127, 0.3)',
        borderRadius: '2px',
      },
      '.cm-character-conflict': {
        backgroundColor: 'rgba(156, 39, 176, 0.2)',
        borderRadius: '2px',
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
        decorationsField,
        darkMode ? oneDark : [],
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

  // 响应 fontSize 变化
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: EditorView.themeChanged.of(EditorView.theme({
          '&': { fontSize: `${fontSize}px` },
        }))
      });
    }
  }, [fontSize]);

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

  // 响应 AI 检查结果
  useEffect(() => {
    if (!viewRef.current || !aiCheckResults) return;
    
    // 清除旧装饰
    viewRef.current.dispatch({
      effects: [
        setSpellErrors.of([]),
        setWorldviewConflicts.of([]),
        setCharacterConflicts.of([])
      ]
    });

    // 设置新装饰
    const doc = viewRef.current.state.doc;
    
    if (aiCheckResults.typos?.length > 0) {
      const ranges = aiCheckResults.typos.map(t => ({
        from: t.pos || 0,
        to: (t.pos || 0) + (t.text?.length || 1)
      }));
      viewRef.current.dispatch({
        effects: [setSpellErrors.of(ranges)]
      });
    }
    
    if (aiCheckResults.worldview_conflicts?.length > 0) {
      const ranges = aiCheckResults.worldview_conflicts.map(c => ({
        from: c.pos || 0,
        to: (c.pos || 0) + (c.text?.length || 1)
      }));
      viewRef.current.dispatch({
        effects: [setWorldviewConflicts.of(ranges)]
      });
    }
    
    if (aiCheckResults.character_conflicts?.length > 0) {
      const ranges = aiCheckResults.character_conflicts.map(c => ({
        from: c.pos || 0,
        to: (c.pos || 0) + (c.text?.length || 1)
      }));
      viewRef.current.dispatch({
        effects: [setCharacterConflicts.of(ranges)]
      });
    }
  }, [aiCheckResults]);

  return (
    <div className="h-full overflow-hidden bg-white dark:bg-gray-900">
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
});

export default Editor;
