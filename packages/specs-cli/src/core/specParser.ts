import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { SpecsConfig } from './config';

export interface SpecFeature {
  id: string;
  accept?: string[];
}

export interface SpecDoc {
  specId: string;
  title?: string;
  features: SpecFeature[];
  body: string;
  filePath: string;
}

function normalizeFeatures(raw: unknown, fallbackId: string): SpecFeature[] {
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        if (typeof entry === 'string') {
          return { id: entry, accept: [] };
        }
        if (entry && typeof entry === 'object') {
          const obj = entry as Record<string, unknown>;
          return {
            id: String(obj.id || fallbackId),
            accept: Array.isArray(obj.accept)
              ? obj.accept.map((a) => String(a))
              : obj.accept
              ? [String(obj.accept)]
              : [],
          };
        }
        return null;
      })
      .filter(Boolean) as SpecFeature[];
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    return [
      {
        id: String(obj.id || fallbackId),
        accept: Array.isArray(obj.accept)
          ? obj.accept.map((a) => String(a))
          : obj.accept
          ? [String(obj.accept)]
          : [],
      },
    ];
  }
  return [
    {
      id: fallbackId,
      accept: [],
    },
  ];
}

export async function parseSpecFile(filePath: string): Promise<SpecDoc> {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;
  const specId = String(data.spec_id || data.id || path.basename(filePath, path.extname(filePath)));
  const title = data.title ? String(data.title) : undefined;
  const features = normalizeFeatures(data.features, specId);

  return {
    specId,
    title,
    features,
    body: parsed.content.trim(),
    filePath,
  };
}

export async function loadSpecs(config: SpecsConfig, cwd = process.cwd()): Promise<SpecDoc[]> {
  const patterns = config.specs?.paths?.length ? config.specs.paths : ['specs/**/*.md'];
  const files = await glob(patterns, { cwd, absolute: true, nodir: true, dot: false });
  const specs: SpecDoc[] = [];
  for (const file of files) {
    try {
      const spec = await parseSpecFile(file);
      specs.push(spec);
    } catch (err) {
      // Keep parsing moving even if one file fails.
      // eslint-disable-next-line no-console
      console.error(`Failed to parse spec file ${file}:`, err);
    }
  }
  return specs;
}
