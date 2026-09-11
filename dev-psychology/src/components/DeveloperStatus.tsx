import { Copy, Check } from "lucide-react";
import { useState } from "react";

import "./DeveloperStatus.css";

interface DeveloperStatusProps {
	flags: number;
	roastNumber: number;
}

function DeveloperStatus({ flags, roastNumber }: DeveloperStatusProps) {
	const [copied, setCopied] = useState(false);
	const stability = Math.max(18, Math.min(94, 92 - flags * 9 - ((roastNumber - 1) % 4) * 3));
	const diagnoses = [
		"You're debugging something.",
		"Your semicolon needs emotional support.",
		"The code is fine. The confidence is not.",
		"One more roast and it becomes a feature.",
	];
	const diagnosis = diagnoses[(roastNumber - 1) % diagnoses.length];

	async function copyStatus() {
		await navigator.clipboard?.writeText(`MENTAL STABILITY: ${stability}%\nDiagnosis: ${diagnosis}`);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1400);
	}

	return (
		<aside className="developer-status" aria-label="Developer status">
			<div className="developer-status-header">
				<div><span className="terminal-dot" /> DEVELOPER STATUS</div>
				<button type="button" className="status-copy" onClick={copyStatus} aria-label="Copy developer status">
					{copied ? <Check size={14} /> : <Copy size={14} />}
				</button>
			</div>

			<div className="stability-row">
				<span>MENTAL STABILITY</span>
				<strong>{stability}%</strong>
			</div>
			<div className="stability-bar" aria-label={`Mental stability ${stability}%`}>
				{Array.from({ length: 20 }, (_, index) => (
					<i key={index} className={index < Math.round(stability / 5) ? "filled" : ""} />
				))}
			</div>

			<div className="telemetry">
				<span>Typing speed <b>↑</b></span>
				<span>Backspaces <b>↑↑↑</b></span>
				<span>Tab switching <b>↑↑</b></span>
				<span>Idle time <b className="down">↓</b></span>
				<span>Errors <b>↑↑↑</b></span>
			</div>

			<div className="status-diagnosis"><span>Diagnosis:</span> {diagnosis}<em>_</em></div>
		</aside>
	);
}

export default DeveloperStatus;
