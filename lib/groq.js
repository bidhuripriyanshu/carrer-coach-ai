export const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function getApiKey() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  return process.env.GROQ_API_KEY;
}

export async function generateText(prompt, options = {}) {
  const body = {
    model: options.model ?? GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(
      `Groq API error (${response.status}): ${errorBody || response.statusText}`
    );
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

export function cleanJsonResponse(text) {
  let cleaned = (text ?? "").trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
  }

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : cleaned;
}

export function parseJsonResponse(text, label = "AI response") {
  const candidates = [
    cleanJsonResponse(text),
    (text ?? "").trim(),
  ];

  let lastError;
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `Failed to parse ${label}: ${lastError?.message ?? "invalid JSON"}`
  );
}

export function isRateLimitError(error) {
  const msg = error?.message ?? "";
  return (
    msg.includes("429") ||
    msg.includes("rate_limit") ||
    msg.includes("quota") ||
    error?.status === 429
  );
}
