import { useState } from "react";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-icon">⌘</div>
        <span>DEV PSYCHOLOGY</span>
      </div>

      <div className="how-hurts">
        <button
          type="button"
          className="hurts-button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          HOW IT HURTS
          <span className={`arrow ${isOpen ? "open" : ""}`}>⌄</span>
        </button>

        {isOpen && (
          <div className="hurts-menu">
            <p>
              <strong>01</strong> Bad variable names
            </p>
            <p>
              <strong>02</strong> Excessive console.logs
            </p>
            <p>
              <strong>03</strong> Questionable architecture
            </p>
            <p>
              <strong>04</strong> Emotional damage
            </p>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;