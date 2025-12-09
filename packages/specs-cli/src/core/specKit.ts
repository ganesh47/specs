import { exec as cpExec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { SpecsConfig } from './config';

const exec = promisify(cpExec);

export interface SpecKitConfig {
  repo: string;
  ref: string;
  templates: string[];
}

const defaultSpecKitConfig: SpecKitConfig = {
  repo: 'github/spec-kit',
  ref: 'main',
  templates: [
    'templates/spec-template.md',
    'templates/plan-template.md',
    'templates/tasks-template.md',
    'spec-driven.md',
  ],
};

export function getSpecKitConfig(config: SpecsConfig): SpecKitConfig {
  const cfg = (config as any).specKit || {};
  return {
    repo: cfg.repo || defaultSpecKitConfig.repo,
    ref: cfg.ref || defaultSpecKitConfig.ref,
    templates: cfg.templates || defaultSpecKitConfig.templates,
  };
}

export async function fetchSpecKitTemplates(config: SpecsConfig, destDir: string): Promise<void> {
  const sk = getSpecKitConfig(config);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  for (const tmpl of sk.templates) {
    const url = `https://raw.githubusercontent.com/${sk.repo}/${sk.ref}/${tmpl}`;
    const fileName = path.basename(tmpl);
    const outPath = path.join(destDir, fileName);
    try {
      const { stdout } = await exec(`curl -sSfL ${url}`);
      fs.writeFileSync(outPath, stdout, 'utf8');
      // eslint-disable-next-line no-console
      console.log(`Fetched spec-kit template: ${tmpl} -> ${outPath}`);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to fetch template ${tmpl}: ${error?.message || error}`);
      throw error;
    }
  }
}
