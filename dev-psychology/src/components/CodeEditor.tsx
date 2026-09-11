import type { ChangeEvent } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

function CodeEditor({ code, onChange }: CodeEditorProps) {
  const lines = code.split("\n");

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-top">
        <div className="window-controls">
          <span className="control red" />
          <span className="control yellow" />
          <span className="control green" />
        </div>

        <div className="file-name">
          <span className="file-icon">JS</span>
          <span>my_magnum_opus.js</span>
        </div>

        <button
          type="button"
          className="settings-icon"
          aria-label="Editor settings"
        >
          ⚙
        </button>
      </div>

      <div className="editor-body">
        <div className="line-numbers" aria-hidden="true">
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>

        <textarea
          className="code-input"
          value={code}
          onChange={handleChange}
          spellCheck={false}
          aria-label="Code editor"
          placeholder="Paste your JavaScript code here..."
        />
      </div>

      <div className="status-bar">
        <div className="therapist-status">
          <span className="status-dot" />
          <span>THERAPIST ONLINE</span>
        </div>

        <div className="code-status">
          <span>UTF-8</span>
          <span>•</span>
          <span>JavaScript</span>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;