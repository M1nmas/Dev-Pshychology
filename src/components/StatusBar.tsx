interface StatusBarProps {
  flags: number;
  language?: string;
}

function StatusBar({
  flags,
  language = "JS",
}: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="therapist-status">
        <span className="status-dot" />
        <span>Therapist is in session</span>
      </div>

      <div className="code-status">
        <span>{flags} red flags</span>
        <span>•</span>
        <span>{language}</span>
      </div>
    </div>
  );
}

export default StatusBar;