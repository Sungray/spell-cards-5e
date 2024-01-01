const util = require('util');

async function downloadSpellsData() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js specific imports and logic
    const { exec } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    const execAsync = util.promisify(exec);
    const mkdirAsync = util.promisify(fs.mkdir);

    const spellsDir = '/usr/src/app/spells';

    // Ensure the spells directory exists
    if (!fs.existsSync(spellsDir)) {
      await mkdirAsync(spellsDir, { recursive: true });
    }

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
}

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await downloadSpellsData();
    }
}
