import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function commentResult(prNumber: number, body: string) {
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split("/");

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body,
  });
}
