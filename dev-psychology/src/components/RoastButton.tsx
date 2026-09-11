interface RoastButtonProps {
  onRoast: () => void;
  disabled?: boolean;
}

function RoastButton({
  onRoast,
  disabled = false,
}: RoastButtonProps) {
  return (
    <button
      type="button"
      className="roast-button"
      onClick={onRoast}
      disabled={disabled}
      aria-label="Roast my code"
    >
      <span>🔥</span>
      <span>{disabled ? "THERAPIST IS THINKING..." : "ROAST MY CODE"}</span>
    </button>
  );
}

export default RoastButton;