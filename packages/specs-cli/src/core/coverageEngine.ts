import fs from 'fs-extra';
import path from 'path';
import { SpecDoc } from './specParser';

export interface CoverageReportItem {
  specId: string;
  featureId: string;
  status: 'pending' | 'covered';
  notes?: string;
}

export interface CoverageReport {
  generatedAt: string;
  prNumber?: number;
  summary: {
    totalSpecs: number;
    totalFeatures: number;
    coveredFeatures: number;
  };
  items: CoverageReportItem[];
}

export async function runCoverage(specs: SpecDoc[], opts: { prNumber?: number; cwd?: string } = {}): Promise<CoverageReport> {
  const items: CoverageReportItem[] = [];
  for (const spec of specs) {
    for (const feature of spec.features) {
      items.push({
        specId: spec.specId,
        featureId: feature.id,
        status: 'pending',
        notes: 'TODO: LLM-based coverage evaluation',
      });
    }
  }

  const report: CoverageReport = {
    generatedAt: new Date().toISOString(),
    prNumber: opts.prNumber,
    summary: {
      totalSpecs: specs.length,
      totalFeatures: items.length,
      coveredFeatures: items.filter((i) => i.status === 'covered').length,
    },
    items,
  };

  const cwd = opts.cwd || process.cwd();
  const outPath = path.join(cwd, '.specs', 'coverage-report.json');
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeJson(outPath, report, { spaces: 2 });

  // eslint-disable-next-line no-console
  console.log(`Coverage report written to ${outPath}`);
  // eslint-disable-next-line no-console
  console.log(`Total features: ${report.summary.totalFeatures}, covered: ${report.summary.coveredFeatures}`);

  return report;
}
