import type { RoastResult } from "../types";

export async function roastCode(
  code: string,
  variation: number,
): Promise<RoastResult> {
  const response = await fetch(
    "http://localhost:8787/api/roast",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        variation,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.error || "Failed to roast code."
    );
  }

  return response.json();
}