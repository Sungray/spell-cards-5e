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
  console.log("Request received for spells API"); // Log that a request has been received

  const spellsDir = path.join('/usr/src/app', 'spells');
  const customSpellsDir = path.join('/usr/src/app', 'custom-spells');
  const spells = [...readSpellsFromDirectory(spellsDir), ...readSpellsFromDirectory(customSpellsDir)];
  
  console.log("Total spells found:", spells.length); // Log total number of spells

  const spellIndex = req.query.index;
  console.log("Requested spell index:", spellIndex); // Log requested spell index

  if (spellIndex) {
    const spell = spells.find(s => s.index === spellIndex);
    if (spell) {
      console.log("Spell found:", spell); // Log found spell
      res.status(200).json(spell);
    } else {
      console.log("Spell not found for index:", spellIndex); // Log if not found
      res.status(404).json({ error: 'Spell not found' });
    }
  } else {
    res.status(200).json({ count: spells.length, results: spells });
  }
}

