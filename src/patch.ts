import { execa } from "execa";
import fs from "fs/promises";

export async function applyPatchAndCommit(patch: string) {
  try {
    await fs.writeFile("ai.patch", patch);
    await execa("git", ["apply", "ai.patch"]);
    await execa("git", ["commit", "-am", "fix: apply PR review comments (AI)"]);
    await execa("git", ["push"]);
    return { success: true };
  } catch (e: any) {
    return {
      success: false,
      error: e.stderr || e.message,
      patch,
    };
  }
}
