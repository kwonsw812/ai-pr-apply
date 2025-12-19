import { Octokit } from "@octokit/rest";
import { execa } from "execa";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getPRInfo(prNumber: number) {
const repoEnv = process.env.GITHUB_REPOSITORY;
if (!repoEnv) {
  throw new Error("GITHUB_REPOSITORY is missing");
}
const [owner, repo] = repoEnv.split("/");

  const comments = await octokit.pulls.listReviewComments({
    owner,
    repo,
    pull_number: prNumber,
  });

  const diff = await execa("git", ["diff", "origin/main...HEAD"]);

  return {
    diff: diff.stdout,
    reviewComments: comments.data.map((c) => ({
      file: c.path,
      line: c.line,
      body: c.body,
    })),
  };
}
