import fs from 'fs';
import { SpecDoc } from './specParser';

export interface NextTask {
  spec: SpecDoc;
  featureId: string;
}

export function selectNextTask(specs: SpecDoc[]): NextTask | null {
  if (!specs.length) return null;
  const sorted = [...specs].sort((a, b) => {
    try {
      const aTime = fs.statSync(a.filePath).mtimeMs;
      const bTime = fs.statSync(b.filePath).mtimeMs;
      return bTime - aTime;
    } catch (err) {
      // Fall back to original order if stat fails for either file.
      return 0;
    }
  });

  for (const spec of sorted) {
    const feature = spec.features.find((f) => !!f.id);
    if (feature) {
      return { spec, featureId: feature.id };
    }
  }
  return null;
}
