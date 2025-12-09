import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface SpecsConfig {
  specs: {
    paths: string[];
    format?: string;
  };
  github?: {
    project_name?: string;
    project_owner?: string;
    project_number?: number;
    status_field?: string;
    status_backlog?: string;
    status_in_progress?: string;
    status_done?: string;
    issue_labels?: string[];
  };
  codex?: {
    context_paths?: string[];
  };
}

const defaultConfig: SpecsConfig = {
  specs: {
    paths: ['specs/**/*.md'],
    format: 'markdown+yaml',
  },
  github: {
    project_name: undefined,
    project_owner: undefined,
    project_number: undefined,
    status_field: 'Status',
    status_backlog: 'Backlog',
    status_in_progress: 'In Progress',
    status_done: 'Done',
    issue_labels: ['spec'],
  },
  codex: {
    context_paths: ['src', 'tests'],
  },
};

export function loadConfig(cwd = process.cwd()): SpecsConfig {
  const configPath = path.join(cwd, '.specs.yml');
  if (!fs.existsSync(configPath)) {
    return defaultConfig;
  }
  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = (yaml.load(raw) || {}) as Partial<SpecsConfig>;
  return {
    ...defaultConfig,
    ...parsed,
    specs: {
      ...defaultConfig.specs,
      ...(parsed.specs || {}),
    },
    github: {
      ...defaultConfig.github,
      ...(parsed.github || {}),
    },
    codex: {
      ...defaultConfig.codex,
      ...(parsed.codex || {}),
    },
  };
}
