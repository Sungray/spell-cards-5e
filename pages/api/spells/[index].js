import fs from 'fs';
import path from 'path';

// Function to read spells from a directory
const readSpellsFromDirectory = (dirPath) => {
  let spells = [];
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      if (file.startsWith('spells-') && file.endsWith('.json')) {
        const filePath = path.join(dirPath, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const spellData = JSON.parse(fileContents);
        if (spellData.spell && Array.isArray(spellData.spell)) {
          spellData.spell.forEach(spell => {
            const index = spell.name.toLowerCase().replace(/\s+/g, '-');
            spells.push({
              ...spell,
              index: index,
              url: `/api/spells/${index}`
            });
          });
        }
      }
    });
  } catch (err) {
    console.error(`Error reading spells from directory ${dirPath}:`, err);
  }
  return spells;
};

// API handler function
export default function handler(req, res) {
  // Directory paths
  const spellsDir = path.join('/usr/src/app', 'spells');
  const customSpellsDir = path.join('/usr/src/app', 'custom-spells');

  // Read spells
  let spells = [];

  if (process.env.USE_DOWNLOADED_FOLDER === 'true') {
    spells = [...spells, ...readSpellsFromDirectory(spellsDir)];
  }
  spells = [...spells, ...readSpellsFromDirectory(customSpellsDir)];

  // Get the spell index from the URL
  const { index } = req.query;

  // Find the spell by index
  const spell = spells.find(s => s.index === index);

  if (spell) {
    res.status(200).json(spell);
  } else {
    res.status(404).json({ error: 'Spell not found' });
  }
}
