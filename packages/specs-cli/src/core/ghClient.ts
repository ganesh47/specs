import { exec as cpExec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { SpecDoc } from './specParser';

const exec = promisify(cpExec);

type ProjectConfig = {
  project_name?: string;
  project_owner?: string;
  project_number?: number;
  status_field?: string;
  status_backlog?: string;
  status_in_progress?: string;
  status_done?: string;
};

export class GhClient {
  constructor(private cwd: string = process.cwd()) {}

  private projectCache: Record<
    string,
    { projectId: string; fieldId?: string; options?: Record<string, string> }
  > = {};

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
    const match = output.match(/#(\\d+)/);
    return match ? Number(match[1]) : 0;
  }

  async addToProject(
    projectCfg: ProjectConfig,
    issueNumber: number,
    opts: { stage?: 'backlog' | 'in_progress' | 'done' } = {}
  ): Promise<void> {
    const { project_owner, project_number, project_name } = projectCfg;
    const stage = opts.stage || 'backlog';

    // Prefer Projects (v2) via owner + number if available.
    if (project_owner && project_number) {
      try {
        const issueUrl = await this.execGh(`issue view ${issueNumber} --json url --jq .url`);
        const addOutput = await this.execGh(
          `project item-add ${project_number} --owner ${project_owner} --url ${issueUrl} --format=json`
        );
        let itemId: string | undefined;
        try {
          const parsed = JSON.parse(addOutput);
          itemId = parsed.id || parsed.item?.id;
        } catch {
          // ignore parse errors; fall back silently
        }
        if (itemId) {
          const optionName =
            stage === 'in_progress'
              ? projectCfg.status_in_progress || 'In Progress'
              : stage === 'done'
              ? projectCfg.status_done || 'Done'
              : projectCfg.status_backlog || 'Backlog';
          await this.setProjectStatus({
            owner: project_owner,
            number: project_number,
            itemId,
            fieldName: projectCfg.status_field || 'Status',
            optionName,
          });
        }
        return;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `Unable to add issue #${issueNumber} to project ${project_number}: ${String(error)}`
        );
        return;
      }
    }

    // Fallback: classic project by name (best effort).
    if (project_name) {
      try {
        await this.execGh(`project item-add "${project_name}" --issue ${issueNumber}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `Unable to add issue #${issueNumber} to project ${project_name}: ${String(error)}`
        );
      }
    }
  }

  async viewPr(pr: string | number): Promise<string> {
    return this.execGh(`pr view ${pr} --json number,title,headRefName,baseRefName,state`);
  }

  async commentOnPr(pr: string | number, body: string): Promise<void> {
    await this.execGh(`pr comment ${pr} --body "${body}"`);
  }

  async closeIssue(issueNumber: number): Promise<void> {
    await this.execGh(`issue close ${issueNumber}`);
  }

  async getPrStatus(pr: string | number): Promise<{
    state: string;
    checksPendingOrFailing: number;
    merged: boolean;
  }> {
    const raw = await this.execGh(
      `pr view ${pr} --json state,mergeStateStatus,statusCheckRollup --jq '{state:.state, merge:.mergeStateStatus, checks: (.statusCheckRollup // [])}'`
    );
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
    const checks = Array.isArray(parsed.checks) ? parsed.checks : [];
    const pendingOrFailing = checks.filter(
      (c: any) => c?.conclusion !== 'SUCCESS' && c?.conclusion !== 'NEUTRAL'
    ).length;
    return {
      state: parsed.state || 'UNKNOWN',
      checksPendingOrFailing: pendingOrFailing,
      merged: parsed.state === 'MERGED',
    };
  }

  async mergePr(pr: string | number): Promise<void> {
    await this.execGh(`pr merge ${pr} --merge`);
  }

  private async searchIssues(query: string): Promise<{ number: number; title: string }[]> {
    const raw = await this.execGh(`issue list --search "${query}" --json number,title --limit 1`);
    try {
      return JSON.parse(raw) as { number: number; title: string }[];
    } catch (error) {
      return [];
    }
  }

  async searchIssuesByTitle(title: string): Promise<{ number: number; title: string }[]> {
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

  private async setProjectStatus(args: {
    owner: string;
    number: number;
    itemId: string;
    fieldName: string;
    optionName: string;
  }): Promise<void> {
    try {
      const meta = await this.getProjectField(args.owner, args.number, args.fieldName);
      if (!meta?.projectId || !meta.fieldId || !meta.options || !Object.keys(meta.options).length) {
        return;
      }
      const optionId =
        meta.options[args.optionName] ||
        meta.options['Todo'] ||
        meta.options['Backlog'] ||
        Object.values(meta.options)[0];
      if (!optionId) return;

      const mutation =
        'mutation($project:ID!,$item:ID!,$field:ID!,$option:String!){updateProjectV2ItemFieldValue(input:{projectId:$project,itemId:$item,fieldId:$field,value:{singleSelectOptionId:$option}}){projectV2Item{id}}}';
      await this.execGh(
        `api graphql -f query='${mutation}' -f project=${meta.projectId} -f item=${args.itemId} -f field=${meta.fieldId} -f option=${optionId}`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Unable to set project status: ${String(error)}`);
    }
  }

  private async getProjectField(
    owner: string,
    number: number,
    fieldName: string
  ): Promise<{ projectId: string; fieldId?: string; options?: Record<string, string> }> {
    const cacheKey = `${owner}#${number}#${fieldName}`;
    if (this.projectCache[cacheKey]) return this.projectCache[cacheKey];

    const raw = await this.execGh(
      `api graphql -f query='query($owner:String!,$number:Int!){user(login:$owner){projectV2(number:$number){id fields(first:50){nodes{... on ProjectV2SingleSelectField{id name options{id name}}}}}}}' -f owner=${owner} -F number=${number}`
    );

    const parsed = JSON.parse(raw);
    const project = parsed?.data?.user?.projectV2;
    const nodes = project?.fields?.nodes || [];
    const field = nodes.find((n: any) => n?.name === fieldName);
    const options = field?.options?.reduce((acc: Record<string, string>, opt: any) => {
      acc[opt.name] = opt.id;
      return acc;
    }, {});
    const result = {
      projectId: project?.id,
      fieldId: field?.id,
      options,
    };
    this.projectCache[cacheKey] = result;
    return result;
  }
}
