import { exec as cpExec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { SpecDoc } from './specParser';

const exec = promisify(cpExec);

export class GhClient {
  constructor(private cwd: string = process.cwd()) {}

  private async execGh(args: string): Promise<string> {
    try {
      const { stdout } = await exec(`gh ${args}`, { cwd: this.cwd });
      return stdout.trim();
    } catch (error: any) {
      const stderr = error?.stderr || error?.message || 'Unknown error';
      throw new Error(`GitHub CLI error: ${stderr}`);
    }
  }

  async ensureAuth(): Promise<void> {
    try {
      await this.execGh('auth status -t');
    } catch (error) {
      throw new Error('GitHub CLI not authenticated. Run `gh auth login` to continue.');
    }
  }

  async upsertIssue(spec: SpecDoc, labels: string[] = []): Promise<number> {
    const title = spec.title ? `Spec: ${spec.title}` : `Spec: ${spec.specId}`;
    const body = this.formatIssueBody(spec);
    const bodyFile = this.createBodyFile(body);

    // Prefer to find by title (stable) and fall back to body search using spec_id.
    const foundByTitle = await this.searchIssuesByTitle(title);
    const search = foundByTitle.length ? foundByTitle : await this.searchIssues(`spec_id:${spec.specId}`);

    if (search.length > 0) {
      const issueNumber = search[0].number;
      const labelArg = labels.length ? ` --add-label "${labels.join(',')}"` : '';
      await this.execGh(
        `issue edit ${issueNumber} --title "${title}" --body-file "${bodyFile}"${labelArg}`
      );
      return issueNumber;
    }

    const labelArg = labels.length ? ` --label "${labels.join(',')}"` : '';
    const output = await this.execGh(
      `issue create --title "${title}" --body-file "${bodyFile}"${labelArg}`
    );
    const match = output.match(/#(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  async addToProject(projectName: string, issueNumber: number): Promise<void> {
    if (!projectName) return;
    try {
      await this.execGh(`project item-add --project "${projectName}" --issue ${issueNumber}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Unable to add issue #${issueNumber} to project ${projectName}: ${String(error)}`);
    }
  }

  async viewPr(pr: string | number): Promise<string> {
    return this.execGh(`pr view ${pr} --json number,title,headRefName,baseRefName,state`);
  }

  async commentOnPr(pr: string | number, body: string): Promise<void> {
    await this.execGh(`pr comment ${pr} --body "${body}"`);
  }

  private async searchIssues(query: string): Promise<{ number: number; title: string }[]> {
    const raw = await this.execGh(`issue list --search "${query}" --json number,title --limit 1`);
    try {
      return JSON.parse(raw) as { number: number; title: string }[];
    } catch (error) {
      return [];
    }
  }

  private async searchIssuesByTitle(title: string): Promise<{ number: number; title: string }[]> {
    const raw = await this.execGh(
      `issue list --state all --search "\\"${title}\\" in:title" --json number,title --limit 1`
    );
    try {
      return JSON.parse(raw) as { number: number; title: string }[];
    } catch (error) {
      return [];
    }
  }

  private formatIssueBody(spec: SpecDoc): string {
    const featureList = spec.features
      .map((f) => `- [ ] ${f.id}${f.accept && f.accept.length ? ` (accept: ${f.accept.join('; ')})` : ''}`)
      .join('\n');
    return `Spec ID: ${spec.specId}\nFile: ${spec.filePath}\n\nFeatures:\n${featureList}\n`;
  }

  private createBodyFile(body: string): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'specs-'));
    const filePath = path.join(dir, 'issue-body.md');
    fs.writeFileSync(filePath, body, 'utf8');
    return filePath;
  }
}
