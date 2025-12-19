import { getPRInfo } from "./github.js";
import { generatePatch } from "./llm.js";
import { applyPatchAndCommit } from "./patch.js";
import { commentResult } from "./comment.js";

function truncate(text: string, limit = 60000) {
  return text.length > limit
    ? text.slice(0, limit) + "\n\n⚠️ Diff truncated"
    : text;
}

async function main() {
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
  console.error(e);
  process.exit(1);
});
