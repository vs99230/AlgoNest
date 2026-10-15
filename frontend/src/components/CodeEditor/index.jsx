import { useRef } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';
// This version of monaco-editor bundles all basic languages into one contribution
// file (they can't be imported individually), so editor.main.js pulls all of them
// in. It's still a one-time, locally-bundled cost with no runtime CDN dependency.
import * as monaco from 'monaco-editor/editor/editor.main.js';
import Loader from '@/components/Loader';
import { getLanguage } from '@/utils/constants';

const THEMES = {
  light: {
    base: 'vs',
    colors: {
      'editor.background': '#FFFFFF',
      'editor.lineHighlightBackground': '#F5F6F8',
      'editorGutter.background': '#FFFFFF',
      'editorLineNumber.foreground': '#98A2B3',
      'editorLineNumber.activeForeground': '#475467',
      'editor.selectionBackground': '#DAD6FA',
    },
  },
  dark: {
    base: 'vs-dark',
    colors: {
      'editor.background': '#0F172A',
      'editor.lineHighlightBackground': '#1E293B',
      'editorGutter.background': '#0F172A',
      'editorLineNumber.foreground': '#64748B',
      'editorLineNumber.activeForeground': '#F1F5F9',
      'editor.selectionBackground': '#1E3A5F',
    },
  },
};

const TAB_SIZE = { javascript: 2, python: 4, cpp: 4, java: 4 };

// Use the locally bundled monaco-editor package instead of fetching it from a CDN.
loader.config({ monaco });

function defineThemes(monaco) {
  Object.entries(THEMES).forEach(([name, { base, colors }]) => {
    monaco.editor.defineTheme(`algonest-${name}`, { base, inherit: true, rules: [], colors });
  });
}

/** Monaco wrapper. Ctrl/Cmd + Enter triggers `onRun`. */
export default function CodeEditor({ language, value, onChange, onRun }) {
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  const handleMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current?.());
  };

  return (
    <MonacoEditor
      height="100%"
      language={getLanguage(language)?.monaco ?? 'plaintext'}
      path={`solution.${language}`}
      value={value}
      theme="algonest-dark"
      beforeMount={defineThemes}
      onMount={handleMount}
      onChange={(next) => onChange(next ?? '')}
      loading={<Loader label="Loading editor" />}
      options={{
        ariaLabel: 'Code editor',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: TAB_SIZE[language] ?? 4,
        insertSpaces: true,
        lineNumbersMinChars: 3,
        padding: { top: 12, bottom: 12 },
        overviewRulerLanes: 0,
        renderLineHighlight: 'line',
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
