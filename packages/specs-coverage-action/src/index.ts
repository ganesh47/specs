import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run() {
  try {
    const pr = core.getInput('pr');
    const args = ['coverage'];
    if (pr) {
      args.push('--pr', pr);
    }

    // Run specs coverage in the workspace
    await exec.exec('specs', args);

    // TODO: Post PR comment using `gh pr comment` with report summary
  } catch (error: any) {
    core.setFailed(error?.message || 'Failed to run specs coverage');
  }
}

run();
