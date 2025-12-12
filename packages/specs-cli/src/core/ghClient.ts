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

  private phaseOrder = [
    'Idea/Todo',
    'ADR/Design Review',
    'Plan',
    'Tasks',
    'Implementation',
    'Release',
    'Close',
  ];
  private projectCache: Record<
    string,
    { projectId: string; fieldId?: string; options?: Record<string, string> }
  > = {};

  private repoInfo?: { owner: string; name: string; id?: string };
  private authToken?: string;

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

  async upsertIssue(
    spec: SpecDoc,
    labels: string[] = [],
    links: { adrUrl?: string; wikiUrl?: string } = {}
  ): Promise<number> {
    const title = spec.title ? `Spec: ${spec.title}` : `Spec: ${spec.specId}`;
    const bodyFile = this.createBodyFile(this.buildIssueBody(spec, undefined, undefined, links));

    // Prefer to find by title (stable) and fall back to body search using spec_id.
    const foundByTitle = await this.searchIssuesByTitle(title);
    const search = foundByTitle.length
      ? foundByTitle
      : await this.searchIssues(`spec_id:${spec.specId}`);

    if (search.length > 0) {
      const issueNumber = search[0].number;
      // Preserve existing completion state from current issue body.
      let completedFeatures = new Set<string>();
      let completedPhases = new Set<string>();
      let existingLinks: { adrUrl?: string; wikiUrl?: string } = {};
      try {
        const existingBody = await this.getIssueBody(issueNumber);
        completedFeatures = this.parseCompletedFeatures(existingBody, spec);
        completedPhases = this.parseCompletedPhases(existingBody);
        existingLinks = this.parseLinks(existingBody);
      } catch {
        completedFeatures = new Set<string>();
        completedPhases = new Set<string>();
        existingLinks = {};
      }
      const updatedBodyFile = this.createBodyFile(
        this.buildIssueBody(spec, completedFeatures, completedPhases, {
          adrUrl: links.adrUrl || existingLinks.adrUrl,
          wikiUrl: links.wikiUrl || existingLinks.wikiUrl,
        })
      );
      const labelArg = labels.length ? ` --add-label "${labels.join(',')}"` : '';
      await this.execGh(
        `issue edit ${issueNumber} --title "${title}" --body-file "${updatedBodyFile}"${labelArg}`
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

  buildIssueBody(
    spec: SpecDoc,
    completedFeatures: Set<string> = new Set(),
    completedPhases: Set<string> = new Set(),
    links: { adrUrl?: string; wikiUrl?: string } = {}
  ): string {
    const linkLines: string[] = [];
    if (links.adrUrl) {
      linkLines.push(`- ADR: ${links.adrUrl}`);
    }
    if (links.wikiUrl) {
      linkLines.push(`- Wiki: ${links.wikiUrl}`);
    }
    const linksBlock = linkLines.length ? `Links:\n${linkLines.join('\n')}\n\n` : '';

    const phaseList = this.phaseOrder
      .map((p) => `- [${completedPhases.has(p) ? 'x' : ' '}] ${p}`)
      .join('\n');

    const featureList = spec.features
      .map((f) => {
        const checked = completedFeatures.has(f.id) ? 'x' : ' ';
        const acceptText =
          f.accept && f.accept.length ? ` (accept: ${f.accept.join('; ')})` : '';
        return `- [${checked}] ${f.id}${acceptText}`;
      })
      .join('\n');
    return `Spec ID: ${spec.specId}\nFile: ${spec.filePath}\n\n${linksBlock}Phases:\n${phaseList}\n\nFeatures:\n${featureList}\n`;
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

  async completeAllAndClose(spec: SpecDoc, issueNumber: number): Promise<void> {
    const allFeatures = new Set(spec.features.map((f) => f.id));
    const allPhases = new Set(this.phaseOrder);
    let links: { adrUrl?: string; wikiUrl?: string } = {};
    try {
      const existingBody = await this.getIssueBody(issueNumber);
      links = this.parseLinks(existingBody);
    } catch {
      links = {};
    }
    const body = this.buildIssueBody(spec, allFeatures, allPhases, links);
    await this.updateIssueBody(issueNumber, body);
    await this.closeIssue(issueNumber);
  }

  async getIssueBody(issueNumber: number): Promise<string> {
    return this.execGh(`issue view ${issueNumber} --json body --jq .body`);
  }

  async updateIssueBody(issueNumber: number, body: string): Promise<void> {
    const bodyFile = this.createBodyFile(body);
    await this.execGh(`issue edit ${issueNumber} --body-file "${bodyFile}"`);
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

  private parseCompletedFeatures(body: string, spec: SpecDoc): Set<string> {
    const completed = new Set<string>();
    if (!body) return completed;
    const lines = body.split(/\r?\n/);
    for (const line of lines) {
      if (!line.match(/- \[[xX]\]/)) continue;
      for (const feat of spec.features) {
        if (line.includes(feat.id)) {
          completed.add(feat.id);
        }
      }
    }
    return completed;
  }

  private parseCompletedPhases(body: string): Set<string> {
    const completed = new Set<string>();
    if (!body) return completed;
    const lines = body.split(/\r?\n/);
    for (const line of lines) {
      if (!line.match(/- \[[xX]\]/)) continue;
      for (const phase of this.phaseOrder) {
        if (line.includes(phase)) {
          completed.add(phase);
        }
      }
    }
    return completed;
  }

  private parseLinks(body: string): { adrUrl?: string; wikiUrl?: string } {
    const adrMatch = body.match(/ADR:\s*(https:\/\/github\.com\/[^\s]+)/i);
    const wikiMatch = body.match(/Wiki:\s*(https:\/\/github\.com\/[^\s]+)/i);
    return {
      adrUrl: adrMatch ? adrMatch[1] : undefined,
      wikiUrl: wikiMatch ? wikiMatch[1] : undefined,
    };
  }

  private async getRepoInfo(): Promise<{ owner: string; name: string; id?: string }> {
    if (this.repoInfo) return this.repoInfo;
    try {
      const raw = await this.execGh(
        `repo view --json owner,name,id --jq '{owner:.owner.login,name:.name,id:.id}'`
      );
      const parsed = JSON.parse(raw);
      this.repoInfo = { owner: parsed.owner, name: parsed.name, id: parsed.id };
    } catch (error) {
      // Fall back to git remote parsing
      const remote = fs
        .readFileSync(path.join(this.cwd, '.git', 'config'), 'utf8')
        .split('\n')
        .find((line) => line.includes('github.com'));
      if (remote) {
        const match = remote.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
        if (match) {
          this.repoInfo = { owner: match[1], name: match[2] };
        }
      }
    }
    if (this.repoInfo && !this.repoInfo.id) {
      try {
        const raw = await this.execGh(
          `api graphql -f query='query($owner:String!,$name:String!){repository(owner:$owner,name:$name){id}}' -f owner=${this.repoInfo.owner} -f name=${this.repoInfo.name}`
        );
        const parsed = JSON.parse(raw);
        this.repoInfo.id = parsed?.data?.repository?.id;
      } catch {
        // ignore lookup failures
      }
    }
    if (!this.repoInfo?.owner || !this.repoInfo?.name) {
      throw new Error('Unable to determine repository owner/name for discussions/wiki.');
    }
    return this.repoInfo;
  }

  private slugifyName(input: string): string {
    return input
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async getAuthToken(): Promise<string | undefined> {
    if (this.authToken) return this.authToken;
    if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) {
      this.authToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
      return this.authToken;
    }
    try {
      const token = await this.execGh('auth token');
      this.authToken = token;
      return this.authToken;
    } catch {
      return undefined;
    }
  }

  async ensureAdrDiscussion(spec: SpecDoc): Promise<string> {
    const repo = await this.getRepoInfo();
    const preferredTitle = `ADR: ${spec.specId}`;
    const altTitle = spec.title ? `ADR: ${spec.title}` : preferredTitle;

    const queries = [
      `repo:${repo.owner}/${repo.name} "${preferredTitle}" in:title`,
      `repo:${repo.owner}/${repo.name} "${altTitle}" in:title`,
      `repo:${repo.owner}/${repo.name} "${spec.specId}" in:title`,
    ];

    for (const q of queries) {
      try {
        const rawSearch = await this.execGh(
          `api graphql -f query='query($q:String!){search(query:$q,type:DISCUSSION,first:10){nodes{... on Discussion{number title url}}}}' -f q="${q}"`
        );
        const parsed = JSON.parse(rawSearch);
        const nodes = parsed?.data?.search?.nodes || [];
        const candidates = nodes.filter((n: any) =>
          String(n?.title || '').toLowerCase().includes(spec.specId.toLowerCase())
        );
        if (candidates.length) {
          const chosen = candidates.sort((a: any, b: any) => Number(a.number) - Number(b.number))[0];
          if (chosen?.url) {
            return chosen.url as string;
          }
        }
      } catch {
        // ignore and continue
      }
    }

    const categoriesRaw = await this.execGh(
      `api graphql -f query='query($owner:String!,$name:String!){repository(owner:$owner,name:$name){id discussionCategories(first:20){nodes{id name}}}}' -f owner=${repo.owner} -f name=${repo.name}`
    );
    const categories = JSON.parse(categoriesRaw)?.data?.repository?.discussionCategories?.nodes || [];
    const adrCategory =
      categories.find((c: any) => String(c?.name || '').toLowerCase().includes('adr')) ||
      categories[0];
    if (!adrCategory?.id || !repo.id) {
      throw new Error('Unable to find ADR discussion category or repository id.');
    }

    const body = `ADR for spec ${spec.specId}\n\nSpec file: ${spec.filePath}${
      spec.title ? `\nTitle: ${spec.title}` : ''
    }`;
    const createRaw = await this.execGh(
      `api graphql -f query='mutation($repoId:ID!,$categoryId:ID!,$title:String!,$body:String!){createDiscussion(input:{repositoryId:$repoId,categoryId:$categoryId,title:$title,body:$body}){discussion{url}}}' -f repoId=${repo.id} -f categoryId=${adrCategory.id} -f title="${preferredTitle}" -f body="${body.replace(
        /"/g,
        '\\"'
      )}"`
    );
    const url = JSON.parse(createRaw)?.data?.createDiscussion?.discussion?.url;
    if (!url) {
      throw new Error('Failed to create ADR discussion.');
    }
    return url as string;
  }

  async ensureWikiPage(
    spec: SpecDoc,
    adrUrl?: string,
    issueNumber?: number
  ): Promise<{ url: string }> {
    const repo = await this.getRepoInfo();
    const slug = this.slugifyName(spec.title ? `Spec ${spec.title}` : `Spec ${spec.specId}`);
    const pageName = `${slug || spec.specId}`;
    const wikiUrl = `https://github.com/${repo.owner}/${repo.name}/wiki/${pageName}`;

    const token = await this.getAuthToken();
    const remote = token
      ? `https://x-access-token:${token}@github.com/${repo.owner}/${repo.name}.wiki.git`
      : `https://github.com/${repo.owner}/${repo.name}.wiki.git`;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'specs-wiki-'));
    try {
      await exec(`git clone ${remote} "${tmpDir}"`, { cwd: this.cwd });
    } catch (error: any) {
      throw new Error(`Unable to clone wiki repo: ${error?.stderr || error?.message || error}`);
    }

    const filePath = path.join(tmpDir, `${pageName}.md`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const lines = [
      `# ${spec.title || spec.specId}`,
      '',
      `- Spec ID: ${spec.specId}`,
      `- Spec file: ${spec.filePath}`,
    ];
    if (issueNumber) {
      lines.push(`- Issue: https://github.com/${repo.owner}/${repo.name}/issues/${issueNumber}`);
    }
    if (adrUrl) {
      lines.push(`- ADR: ${adrUrl}`);
    }
    lines.push('', 'Generated by specs sync.');
    fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');

    const status = (await exec(`git status --porcelain`, { cwd: tmpDir })).stdout.trim();
    if (status) {
      try {
        await exec(`git add "${pageName}.md"`, { cwd: tmpDir });
        await exec(
          `git -c user.name="specs-bot" -c user.email="specs@example.com" commit -m "Update wiki for ${spec.specId}"`,
          { cwd: tmpDir }
        );
        await exec(`git push`, { cwd: tmpDir });
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.warn(`Warning: failed to push wiki update for ${spec.specId}: ${error?.stderr || error?.message || error}`);
      }
    }

    return { url: wikiUrl };
  }
}
