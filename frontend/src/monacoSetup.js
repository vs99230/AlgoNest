import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';

/**
 * By default monaco-editor (and @monaco-editor/react) try to fetch their web
 * workers from a CDN at runtime. That fails offline or behind a strict CSP.
 * This makes Vite bundle the one worker we need (the generic editor worker,
 * which is enough for syntax highlighting/basic editing in every language we
 * support) so everything ships in our own build.
 */
self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};
