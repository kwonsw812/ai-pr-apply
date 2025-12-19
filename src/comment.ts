import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function commentResult(prNumber: number, body: string) {
const repoEnv = process.env.GITHUB_REPOSITORY;
if (!repoEnv) {
  throw new Error("GITHUB_REPOSITORY is missing");
}
const [owner, repo] = repoEnv.split("/");

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body,
  });
}
