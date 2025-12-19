import { commentResult } from "./comment.js";
import { getPRInfo } from "./github.js";
import { generatePatch } from "./llm.js";
import { applyPatchAndCommit } from "./patch.js";

function truncate(text: string, limit = 60000) {
  return text.length > limit
    ? text.slice(0, limit) + "\n\n⚠️ Diff truncated"
    : text;
}

async function main() {
  console.log("ENV CHECK", {
  PR_NUMBER: process.env.PR_NUMBER,
  GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ? "SET" : "MISSING",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "SET" : "MISSING",
});
  const prNumber = Number(process.env.PR_NUMBER);
  if (!prNumber) throw new Error("PR_NUMBER missing");

  const pr = await getPRInfo(prNumber);

  const patch = await generatePatch({
    diff: pr.diff,
    comments: pr.reviewComments,
  });

  if (patch === "NO_CHANGES") {
    await commentResult(prNumber, "⚠️ AI decided no safe changes could be made.");
    return;
  }

  const result = await applyPatchAndCommit(patch);

  if (result.success) {
    await commentResult(
      prNumber,
      "✅ **AI changes applied**\n\nPatch was successfully applied and pushed."
    );
  } else {
    await commentResult(
      prNumber,
      truncate(`⚠️ **AI could not apply the patch automatically**
The following diff addresses the review comments,
but requires manual application:

\`\`\`diff
${result.patch}
\`\`\`

**Error**
\`${result.error}\``)
    );
  }
}

main().catch((e) => {
  console.error("UNCAUGHT ERROR", e instanceof Error ? e.stack : JSON.stringify(e));
  process.exit(1);
});
