#!/usr/bin/env node
// Quick availability check for spec-kit prompts/templates.
// Verifies we can fetch key files from github/spec-kit on the configured branch.
const https = require('https');

const REPO = process.env.SPEC_KIT_REPO || 'github/spec-kit';
const REF = process.env.SPEC_KIT_REF || 'main';
const PATHS = [
  'spec-driven.md',
  'templates/spec-template.md',
  'templates/plan-template.md',
  'templates/tasks-template.md',
];

function fetchPath(p) {
  const url = `https://raw.githubusercontent.com/${REPO}/${REF}/${p}`;
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed ${url} -> ${res.statusCode}`));
          res.resume();
          return;
        }
        res.resume();
        resolve();
      })
      .on('error', reject);
  });
}

(async () => {
  for (const p of PATHS) {
    await fetchPath(p);
    // eslint-disable-next-line no-console
    console.log(`ok: ${p}`);
  }
  // eslint-disable-next-line no-console
  console.log('spec-kit template availability check passed');
})().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('spec-kit check failed:', err.message || err);
  process.exit(1);
});
