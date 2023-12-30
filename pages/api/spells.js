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
        if (spellData.spell && Array.isArray(spellData.spell)) {
          spells.push(...spellData.spell);
        }
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
  const spellsMap = { ...readSpellsFromDirectory(spellsDir), ...readSpellsFromDirectory(customSpellsDir) };

  const { spellName } = req.query;
  if (spellName) {
    const spell = spellsMap[spellName.toLowerCase()];
    if (spell) {
      res.status(200).json(spell);
    } else {
      res.status(404).json({ error: 'Spell not found' });
    }
  } else {
    res.status(200).json(Object.values(spellsMap));
  }
}
