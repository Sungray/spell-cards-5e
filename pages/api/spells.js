import fs from 'fs';
import path from 'path';

const readSpellsFromDirectory = (dirPath) => {
  let spells = [];
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(dirPath, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const spellData = JSON.parse(fileContents);
        spells.push(...spellData);
      }
    });
  } catch (err) {
    console.error(`Error reading spells from directory ${dirPath}:`, err);
  }
  return spells;
};

export default function handler(req, res) {
  const spellsDir = path.join('/usr/src/app', 'spells');
  const customSpellsDir = path.join('/usr/src/app', 'custom-spells');
  let spells = readSpellsFromDirectory(spellsDir);
  spells = spells.concat(readSpellsFromDirectory(customSpellsDir));
  res.status(200).json(spells);
}
