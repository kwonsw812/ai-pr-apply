import fetch from "node-fetch";

type Input = {
  diff: string;
  comments: { file: string; line: number | null; body: string }[];
};

export async function generatePatch(input: Input): Promise<string> {
  const prompt = `
You are an AI code assistant.

Rules:
- Output ONLY a unified git diff.
- Modify ONLY files mentioned in review comments.
- If unsafe or unclear, output NO_CHANGES.

PR Diff:
${input.diff}

Review Comments:
${input.comments.map(
    (c) => `- ${c.file}:${c.line ?? "?"} → ${c.body}`
  ).join("\n")}
`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errorText}`);
  }

  const json: any = await res.json();

  if (json.error) {
    throw new Error(`Anthropic API error: ${json.error.message}`);
  }

  if (!json.content || !json.content[0]) {
    throw new Error(`Unexpected API response: ${JSON.stringify(json)}`);
  }

  return json.content[0].text.trim();
}
