import type { CodeAnalysis, RoastResult } from "../types";

const patterns = [
  {
    key: "variable",
    regex: /\b(var|let|const)\s+[a-zA-Z_$][\w$]*/g,
  },
  {
    key: "error",
    regex: /\b(try|catch|throw|Error)\b/g,
  },
  {
    key: "console",
    regex: /\bconsole\.(log|error|warn|debug)\s*\(/g,
  },
  {
    key: "todo",
    regex: /\bTODO\b|\bFIXME\b/gi,
  },
  {
    key: "any",
    regex: /:\s*any\b|\bas\s+any\b/g,
  },
  {
    key: "comment",
    regex: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
  },
];

const fallbackRoasts: RoastResult[] = [
  {
    message:
      "Your code is technically alive, but emotionally it has already resigned.",
    flags: 2,
    severity: "low",
    observations: ["The code is running, but its intent is unclear.", "A few names or branches deserve a closer look.", "There is room for a small cleanup win."],
    advice: "Name the behavior clearly and add one test before expanding the feature.",
  },
  {
    message:
      "I've seen cleaner code written on a napkin five minutes before a deadline.",
    flags: 4,
    severity: "medium",
    observations: ["Several patterns are competing for attention.", "The next developer may need archaeology tools.", "The behavior should be split into smaller decisions."],
    advice: "Extract one focused helper and cover the edge case it owns.",
  },
  {
    message:
      "This code has so many red flags that even the debugger is considering therapy.",
    flags: 6,
    severity: "medium",
    observations: ["Multiple code smells were detected.", "The current shape makes failures harder to isolate.", "Future changes are likely to add more uncertainty."],
    advice: "Deal with the highest-impact smell first, then rerun the review.",
  },
  {
    message:
      "Congratulations. You have created a problem that future-you will blame on past-you.",
    flags: 8,
    severity: "high",
    observations: ["The snippet has a high concentration of risk signals.", "Several responsibilities appear tangled together.", "A small change could have surprising side effects."],
    advice: "Pause feature work and write a focused test around the current behavior.",
  },
];

function countMatches(code: string, regex: RegExp): number {
  const flags = regex.flags.includes("g")
    ? regex.flags
    : `${regex.flags}g`;

  const globalRegex = new RegExp(regex.source, flags);

  return code.match(globalRegex)?.length ?? 0;
}

function calculateSeverity(
  flags: number
): CodeAnalysis["severity"] {
  if (flags >= 7) {
    return "high";
  }

  if (flags >= 4) {
    return "medium";
  }

  return "low";
}

function getRandomFallback(variation = Date.now()): RoastResult {
  const index = Math.abs(Math.trunc(variation)) % fallbackRoasts.length;

  return fallbackRoasts[index];
}

export function analyzeCode(code: string): CodeAnalysis {
  if (!code.trim()) {
    return {
      flags: 0,
      patterns: [],
      severity: "low",
    };
  }

  const detectedPatterns: string[] = [];

  for (const pattern of patterns) {
    if (countMatches(code, pattern.regex) > 0) {
      detectedPatterns.push(pattern.key);
    }
  }

  const flags = detectedPatterns.reduce(
    (total, patternKey) => {
      const detected = patterns.find(
        (item) => item.key === patternKey
      );

      if (!detected) {
        return total;
      }

      return (
        total +
        Math.min(
          countMatches(code, detected.regex),
          3
        )
      );
    },
    0
  );

  return {
    flags,
    patterns: detectedPatterns,
    severity: calculateSeverity(flags),
  };
}

/*
 * Local fallback roast.
 *
 * The actual application now uses the OpenAI API through
 * roastCode() in src/utils/api.ts.
 *
 * This function is kept as a fallback in case another
 * component still uses getRoast().
 */
export function getRoast(code: string, variation = Date.now()): RoastResult {
  if (!code.trim()) {
    return {
      message:
        "There is no code here. Even your editor gave up.",
      flags: 0,
      severity: "low",
      observations: ["No code was submitted.", "The editor is waiting for a hypothesis.", "Blank canvases are hard to roast."],
      advice: "Stare at the empty editor until it develops a personality. 🧘",
    };
  }

  const analysis = analyzeCode(code);

  const priorityPatterns = [
    "any",
    "error",
    "console",
    "todo",
    "variable",
    "comment",
  ];

  const detectedKey = priorityPatterns.find((key) =>
    analysis.patterns.includes(key)
  );
  const sourceLines = code.split(/\r?\n/);
  const issueLines = sourceLines
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => /console\.|\bas\s+any\b|:\s*any\b|TODO|FIXME|catch|throw|==(?!=)|!=(?!=)|\bvar\b|\bundefined\b/i.test(line));
  const selectedIssue = issueLines.length > 0
    ? issueLines[Math.abs(variation) % issueLines.length]
    : { line: sourceLines.find((line) => line.trim()) ?? "this snippet", number: sourceLines.findIndex((line) => line.trim()) + 1 };
  const firstLine = selectedIssue.line.trim();
  const lineNumber = selectedIssue.number;

  const fallback = getRandomFallback(variation);

  if (detectedKey) {
    const roastStyles = [
      "like a group project nobody attended",
      "like a pizza delivered without the pizza",
      "like a meeting that should have been an email",
      "like a bug wearing a tiny developer hat",
      "like a README written by a fortune cookie",
      "like production code held together by vibes",
      "like a rubber duck filing a formal complaint",
      "like a keyboard having its villain arc",
    ];
    const roastStyle = roastStyles[Math.abs(variation) % roastStyles.length];

    return {
      message: `Line ${lineNumber} makes ${detectedKey} look ${roastStyle}. 😂`,
      flags: Math.max(fallback.flags, analysis.flags),
      severity: analysis.severity,
      observations: [
        `Line ${lineNumber}: bold choice. 🚩`,
        `${detectedKey}: plot twist. 💀`,
        `Today it is ${roastStyle}. 🤡`,
      ],
      advice: `Ask ${detectedKey} to think about what it did. 🩹`,
    };
  }

  return {
    ...fallback,
    flags: Math.max(fallback.flags, analysis.flags),
    severity: analysis.severity,
    observations: [
      `Line ${lineNumber} starts with “${firstLine.slice(0, 42)}” and somehow survives. 🧠`,
      "No obvious smell found, which feels suspiciously well organized. 🚩",
      "The snippet is readable enough to become someone else’s problem. 🤡",
    ],
    advice: `Circle line ${lineNumber} dramatically and call the review complete. ✨`,
  };
}