/** Turns `code` spans in plain strings into <code> elements (no innerHTML). */
export function renderInline(text) {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[0.85em]">
        {part}
      </code>
    ) : (
      part
    ),
  );
}
