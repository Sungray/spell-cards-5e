// In downloadSpellsData.ts
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

async function downloadSpellsData() {
  const repoUrl = process.env.JSON_REPO;
  if (!repoUrl) {
    console.log('JSON_REPO environment variable is not set. Skipping download.');
    return;
  }

  try {
    await execAsync(`git clone --depth 1 --filter=blob:none --sparse ${repoUrl} /tmp/spells-repo`);
    await execAsync('cd /tmp/spells-repo && git sparse-checkout init --cone');
    await execAsync('cd /tmp/spells-repo && git sparse-checkout set data/spells');
    await execAsync('find /tmp/spells-repo/data/spells -type f -name "*.json" -exec mv {} /usr/src/app/spells/ \\;');
    await execAsync('rm -rf /tmp/spells-repo');
  } catch (error) {
    console.error('Failed to download spells data:', error);
  }
}

export default downloadSpellsData;
