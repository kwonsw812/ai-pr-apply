import { Octokit } from "@octokit/rest";
import { execSync } from "node:child_process";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getPRInfo(prNumber: number) {
  const repoEnv = process.env.GITHUB_REPOSITORY;
  if (!repoEnv) {
    throw new Error("GITHUB_REPOSITORY is missing");
  }

  const [owner, repo] = repoEnv.split("/");

  // ✅ PR review comments
  const comments = await octokit.pulls.listReviewComments({
    owner,
    repo,
    pull_number: prNumber,
  });

  // ✅ diff는 함수 안에서 실행 (중요)
  const diff = execSync("git diff origin/main...HEAD", {
    encoding: "utf-8",
  });

  return {
    diff,
    reviewComments: comments.data.map((c) => ({
      file: c.path,
      line: c.line,
      body: c.body,
    })),
  };
}