import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Play, RotateCcw, Send, Terminal, XCircle } from 'lucide-react';
import Button from '@/components/Button';
import CodeEditor from '@/components/CodeEditor';
import Console from '@/components/Console';
import Modal from '@/components/Modal';
import useAuth from '@/hooks/useAuth';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getErrorMessage } from '@/services/api';
import { runCode, submitCode } from '@/services/submissionService';
import { cn } from '@/utils/cn';
import { DEFAULT_LANGUAGE, LANGUAGES, getLanguageLabel } from '@/utils/constants';

const IDLE = { status: 'idle', result: null, error: null };

/** Code panel of the problem page: language, Monaco, console, Run and Submit. */
export default function Editor({ problem, onAccepted }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [storedLanguage, setLanguage] = useLocalStorage('algonest-language', DEFAULT_LANGUAGE);
  const language = LANGUAGES.some((item) => item.id === storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
  const starter = problem.starterCode[language] ?? '';
  const [code, setCode] = useLocalStorage(`algonest-code:${problem.slug}:${language}`, starter);

  const [consoleOpen, setConsoleOpen] = useState(true);
  const [run, setRun] = useState(IDLE);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [modal, setModal] = useState(null); // 'result' | 'login' | 'reset' | null
  const requestId = useRef(0);

  const running = run.status === 'running';
  const busy = running || submitting;
  const hasCode = code.trim().length > 0;

  const handleRun = async () => {
    if (busy || !hasCode) return;
    const id = ++requestId.current;
    setConsoleOpen(true);
    setRun({ status: 'running', result: null, error: null });
    try {
      const result = await runCode({ slug: problem.slug, language, code });
      if (id === requestId.current) setRun({ status: 'done', result, error: null });
    } catch (error) {
      if (id === requestId.current) {
        setRun({ status: 'error', result: null, error: getErrorMessage(error, 'Could not run your code.') });
      }
    }
  };

  const handleSubmit = async () => {
    if (busy || !hasCode) return;
    if (!isAuthenticated) {
      setModal('login');
      return;
    }
    const id = ++requestId.current;
    setSubmitting(true);
    try {
      const result = await submitCode({ slug: problem.slug, language, code });
      if (id !== requestId.current) return;
      setSubmission(result);
      setModal('result');
      if (result.status === 'Accepted') onAccepted?.();
    } catch (error) {
      if (id !== requestId.current) return;
      setConsoleOpen(true);
      setRun({ status: 'error', result: null, error: getErrorMessage(error, 'Could not submit your code.') });
    } finally {
      if (id === requestId.current) setSubmitting(false);
    }
  };

  const handleLanguageChange = (event) => {
    requestId.current += 1;
    setSubmitting(false);
    setLanguage(event.target.value);
    setRun(IDLE);
  };

  const handleReset = () => {
    setCode(starter);
    setRun(IDLE);
    setModal(null);
  };

  const accepted = submission?.status === 'Accepted';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="relative">
          <label htmlFor="editor-language" className="sr-only">
            Language
          </label>
          <select
            id="editor-language"
            value={language}
            onChange={handleLanguageChange}
            className="h-8 cursor-pointer appearance-none rounded-md border border-line bg-surface pl-3 pr-8 text-sm transition-colors hover:bg-subtle"
          >
            {LANGUAGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        </div>
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setModal('reset')}>
          Reset
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <CodeEditor language={language} value={code} onChange={setCode} onRun={handleRun} />
      </div>

      {consoleOpen && (
        <Console id="console-panel" state={run.status} result={run.result} error={run.error} samples={problem.examples} />
      )}

      <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          icon={Terminal}
          aria-expanded={consoleOpen}
          aria-controls="console-panel"
          onClick={() => setConsoleOpen((open) => !open)}
        >
          Console
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={Play}
            loading={running}
            disabled={busy || !hasCode}
            title="Run (Ctrl/Cmd + Enter)"
            onClick={handleRun}
          >
            Run
          </Button>
          <Button size="sm" icon={Send} loading={submitting} disabled={busy || !hasCode} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>

      <Modal
        open={modal === 'result' && submission !== null}
        onClose={() => setModal(null)}
        title={
          <span className={cn('inline-flex items-center gap-2', accepted ? 'text-easy' : 'text-hard')}>
            {accepted ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <XCircle className="h-5 w-5" aria-hidden="true" />}
            {submission?.status}
          </span>
        }
        description={
          accepted
            ? 'All test cases passed. This submission is saved to your profile.'
            : `${submission?.passed ?? 0} of ${submission?.total ?? 0} test cases passed. Check your logic and try again.`
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>
              Keep editing
            </Button>
            <Button as={Link} to="/profile">
              View profile
            </Button>
          </>
        }
      >
        {accepted && (
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-line p-3">
              <dt className="text-muted">Runtime</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{submission.runtimeMs} ms</dd>
            </div>
            <div className="rounded-lg border border-line p-3">
              <dt className="text-muted">Memory</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{submission.memoryMb} MB</dd>
            </div>
            <div className="rounded-lg border border-line p-3">
              <dt className="text-muted">Language</dt>
              <dd className="mt-0.5 font-medium">{getLanguageLabel(submission.language)}</dd>
            </div>
          </dl>
        )}
      </Modal>

      <Modal
        open={modal === 'login'}
        onClose={() => setModal(null)}
        title="Log in to submit"
        description="You can run code without an account. Submitting saves your progress, so you need to log in first."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button as={Link} to="/signup" state={{ from: location }} variant="secondary">
              Sign up
            </Button>
            <Button as={Link} to="/login" state={{ from: location }}>
              Log in
            </Button>
          </>
        }
      />

      <Modal
        open={modal === 'reset'}
        onClose={() => setModal(null)}
        title="Reset code?"
        description={`Your ${getLanguageLabel(language)} code for this problem will go back to the starter template.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset}>
              Reset code
            </Button>
          </>
        }
      />
    </div>
  );
}
