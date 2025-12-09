import { SpecDoc } from './specParser';

export interface NextTask {
  spec: SpecDoc;
  featureId: string;
}

export function selectNextTask(specs: SpecDoc[]): NextTask | null {
  if (!specs.length) return null;
  for (const spec of specs) {
    const feature = spec.features.find((f) => !!f.id);
    if (feature) {
      return { spec, featureId: feature.id };
    }
  }
  return null;
}
