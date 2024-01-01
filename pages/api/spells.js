import fs from 'fs';
import path from 'path';

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

export default function handler(req, res) {
  const spellsDir = path.join('/usr/src/app', 'spells');
  const customSpellsDir = path.join('/usr/src/app', 'custom-spells');
  
  let spells = [];

  if (process.env.USE_DOWNLOADED_FOLDER === 'true') {
    spells = [...spells, ...readSpellsFromDirectory(spellsDir)];
  }
  spells = [...spells, ...readSpellsFromDirectory(customSpellsDir)];

  // Format the response to include count and results
  const formattedResponse = {
    count: spells.length,
    results: spells
  };

  const spellIndex = req.query.index;
  if (spellIndex) {
    const spell = spells.find(s => s.index === spellIndex);
    if (spell) {
      res.status(200).json(spell);
    } else {
      res.status(404).json({ error: 'Spell not found' });
    }
  } else {
    res.status(200).json(formattedResponse);
  }
}

