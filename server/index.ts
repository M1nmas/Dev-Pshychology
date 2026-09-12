import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), "..", ".env.local") });

const app = express();
const port = Number(process.env.PORT ?? 8787);
const apiKey = process.env.GROQ_API_KEY ?? process.env.OPENAI_API_KEY;
const apiUrl = process.env.AI_API_URL ?? "https://api.groq.com/openai/v1/chat/completions";
const model = process.env.AI_MODEL ?? "openai/gpt-oss-20b";

app.use(cors());
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, configured: Boolean(apiKey) });
});

app.post("/api/roast", async (request, response) => {
  const code = typeof request.body?.code === "string" ? request.body.code.trim() : "";
  const variation = Number.isFinite(Number(request.body?.variation))
    ? Number(request.body.variation)
    : Date.now();
  const roastAngles = [
    "roast it like a late-night comedian",
    "roast it like a dramatic movie critic",
    "roast it like an offended senior developer",
    "roast it like a sports commentator witnessing a spectacular failure",
    "roast it like a medieval town crier announcing bad news",
  ];
  const roastAngle = roastAngles[Math.abs(variation) % roastAngles.length];
  const numberedCode = code
    .split(/\r?\n/)
    .map((line, index) => `${index + 1}: ${line}`)
    .join("\n");
  const issueLines = code
    .split(/\r?\n/)
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => /console\.|\bas\s+any\b|:\s*any\b|TODO|FIXME|catch|throw|==(?!=)|!=(?!=)|\bvar\b|\bundefined\b/i.test(line));
  const issueCatalog = issueLines.length > 0
    ? issueLines.map(({ line, number }) => `line ${number}: ${line.trim()}`).join("\n")
    : "No obvious issue pattern found; choose the most interesting real line.";

  if (!code) {
    response.status(400).json({ error: "Code is required." });
    return;
  }

  if (!apiKey) {
    response.status(503).json({ error: "AI provider is not configured on the server." });
    return;
  }

  try {
    const providerResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content: `You are Dev Psychology AI ROAST MODE: a sharp comedian whose only job is to roast the submitted code. Click variation ${variation} must feel different. Use this style: ${roastAngle}. Return valid JSON only with message, observations, advice, flags, severity. Message must be one cohesive funny paragraph of 55-85 words, with a beginning, middle, and punchline. It must reference one real issue line or token and roast the actual code, not give a code lesson. Change the joke and sentence structure every click; never reuse a template. Observations must be exactly 3 short supporting phrases, and advice one tiny comedic takeaway. Use a few fitting emojis. Do not praise the code, give a neutral diagnosis, or invent problems. Roast the code, never the human. flags is 0-10; severity is low, medium, or high.`,
          },
          { role: "user", content: `ROAST THIS CODE NOW. Select one real bug or suspicious line from the issue catalog, mention its line number, and make the punchline about that exact code.\n\nISSUE CATALOG:\n${issueCatalog}\n\nFULL CODE:\n${numberedCode}` },
        ],
      }),
    });

    const providerData = await providerResponse.json() as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };

    if (!providerResponse.ok) {
      response.status(502).json({ error: providerData.error?.message ?? "AI provider request failed." });
      return;
    }

    const content = providerData.choices?.[0]?.message?.content;
    if (!content) {
      const sourceLines = code.split(/\r?\n/);
      const focusLineIndex = issueLines.length > 0
        ? issueLines[Math.abs(variation) % issueLines.length].number - 1
        : Math.abs(variation) % Math.max(sourceLines.length, 1);
      const focusLine = sourceLines[focusLineIndex]?.trim() ?? code;
      const detectedToken = ["console.log", "as any", "TODO", "FIXME", "catch", "var "]
        .find((token) => focusLine.includes(token)) ?? "this line";
      const sentenceTemplates = [
        `Line ${focusLineIndex + 1} gave ${detectedToken} a microphone, and now the whole codebase has opinions. It is not a feature so much as a tiny theatrical performance where the bug knows all the lines and the developer bought front-row seats. 😂`,
        `${detectedToken} on line ${focusLineIndex + 1} is less a feature and more a cry for snacks. The code walks in wearing confidence, trips over its own logic, then asks production to pretend nothing happened. Honestly, the commitment is impressive. 🍿`,
        `Breaking news: line ${focusLineIndex + 1} has been arrested for excessive ${detectedToken}. Witnesses say it looked suspicious from the beginning, but everyone shipped it anyway, which is a bold strategy for a piece of text with no alibi. 🚨`,
        `I asked line ${focusLineIndex + 1} to explain ${detectedToken}; it asked for a lawyer. The rest of the function immediately changed its status to “away,” leaving this little bug alone to represent the entire team. ⚖️`,
        `Line ${focusLineIndex + 1} treats ${detectedToken} like a personality trait. It has entered the codebase, ignored every social cue, and started rearranging the furniture. Bold, memorable, and absolutely not invited to the next deployment. 🤡`,
        `${detectedToken} just walked onto line ${focusLineIndex + 1} and stole the entire plot. Now the function is performing a dramatic monologue about failure while the return statement quietly updates its résumé. 🎬`,
        `Line ${focusLineIndex + 1} proves that ${detectedToken} can wear a tie and still cause chaos. It looks official, sounds confident, and has the decision-making skills of a printer during a deadline. 👔`,
        `The tiny bug in ${detectedToken} on line ${focusLineIndex + 1} has somehow requested a management position. It already schedules meetings, creates confusion, and contributes absolutely nothing to the sprint. A natural leader, unfortunately. 💀`,
      ];
      response.json({
        message: sentenceTemplates[Math.abs(variation) % sentenceTemplates.length],
        observations: [
          `Line ${focusLineIndex + 1}: bold choice. 🎬`,
          `${detectedToken}: plot twist. 💀`,
          `This line needs adult supervision. 🤡`,
        ],
        advice: `Ask ${detectedToken} to think about what it did. 🩹`,
        flags: 3,
        severity: "medium",
      });
      return;
    }

    const jsonText = content.replace(/```json\s*|```/gi, "").trim();
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");
    let result: {
      message?: unknown;
      observations?: unknown;
      advice?: unknown;
      flags?: unknown;
      severity?: unknown;
    };

    try {
      result = JSON.parse(
        jsonStart >= 0 && jsonEnd > jsonStart
          ? jsonText.slice(jsonStart, jsonEnd + 1)
          : jsonText,
      ) as typeof result;
    } catch {
      result = {
        message: content.replace(/```json\s*|```/gi, "").trim(),
        observations: [
          "The model returned an incomplete structured diagnosis.",
          "The submitted code still reached the AI reviewer.",
          "Try roasting again for a complete report.",
        ],
        advice: "Keep the snippet focused and rerun the review.",
        flags: 0,
        severity: "low",
      };
    }

    if (typeof result.message === "string") {
      const nestedText = result.message.trim();
      if (nestedText.startsWith("{") && nestedText.endsWith("}")) {
        try {
          const nestedResult = JSON.parse(nestedText) as typeof result;
          if (typeof nestedResult.message === "string") {
            result = { ...result, ...nestedResult, message: nestedResult.message };
          }
        } catch {
          // Keep the original message when it is not valid nested JSON.
        }
      }
    }

    const severity = result.severity === "high" || result.severity === "medium" ? result.severity : "low";
    const observations = Array.isArray(result.observations)
      ? result.observations.filter((item): item is string => typeof item === "string").slice(0, 3)
      : [];

    response.json({
      message: typeof result.message === "string" ? result.message : "Your code has entered a period of quiet reflection.",
      observations,
      advice: typeof result.advice === "string" ? result.advice : "Give the smallest suspicious part a name and a test.",
      flags: Math.max(0, Math.min(10, Number(result.flags) || 0)),
      severity,
    });
  } catch (error) {
    console.error("Roast server error:", error);
    response.status(502).json({ error: "The roast service is temporarily unavailable." });
  }
});

const server = app.listen(port, () => {
  console.log(`Roast API listening on http://localhost:${port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the existing server or change PORT in .env.local.`);
  } else {
    console.error("Roast API failed to start:", error);
  }

  process.exitCode = 1;
});
