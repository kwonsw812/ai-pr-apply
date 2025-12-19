import { execSync } from "node:child_process";
import fs from "node:fs";

export async function applyPatchAndCommit(patch: string) {
  try {
    fs.writeFileSync("ai.patch", patch, "utf-8");

    execSync("git apply ai.patch", { stdio: "inherit" });

    // 변경 사항이 있는 경우만 커밋
    const status = execSync("git status --porcelain", {
      encoding: "utf-8",
    });

    if (!status.trim()) {
      return {
        success: false,
        error: "Patch applied but no changes detected",
        patch,
      };
    }

    execSync('git commit -am "fix: apply PR review comments (AI)"', {
      stdio: "inherit",
    });

    execSync("git push", { stdio: "inherit" });

    return { success: true };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message ?? String(e),
      patch,
    };
  }
}