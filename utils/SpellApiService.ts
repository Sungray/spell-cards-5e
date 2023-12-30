import { SchoolOfMagic } from "./constants";
import { SpellType, SrdType  } from "./models";

type SrdSpellsReponse = {
  results: SrdType[],
  count: number
}

const SpellApiService = {

  getList: async (): Promise<SrdSpellsReponse> => {
    if (process.env.USE_5ETOOLS === 'true') {
      const localSpells = SpellApiService.readLocalSpells();
      // Process local spells data
      return localSpells;
    } else {
      const apiUrlBase = process.env['5E_API'] || 'https://www.dnd5eapi.co/';
      // Ensure that the base URL ends with a slash
      const apiUrl = apiUrlBase.endsWith('/') ? apiUrlBase : `${apiUrlBase}/`;
      const endpoint = 'api/spells';
      const list = await fetch(`${apiUrl}${endpoint}`);
      return list.json();
    }
  },

  readLocalSpells: (): SrdSpellsReponse => {
    let spells = [];
    const spellsDir = path.join(__dirname, 'spells');
    const customSpellsDir = path.join(__dirname, 'custom-spells');
    
    // Read spells from both directories
    spells = spells.concat(SpellApiService.readSpellsFromDirectory(spellsDir));
    spells = spells.concat(SpellApiService.readSpellsFromDirectory(customSpellsDir));
    
    // Process the spells data
    return SpellApiService.convert5eToolSpell(spells);
  },

  readSpellsFromDirectory: (dirPath: string): any[] => {
    let spells = [];
    try {
      const files = fs.readdirSync(dirPath);
  
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(dirPath, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const spellData = JSON.parse(fileContent);
          spells.push(...spellData);
        }
      });
    } catch (err) {
      console.error(`Error reading spells from directory ${dirPath}:`, err);
    }
    return spells;
  },
  
  convertDamagePerLevel: (apiResponse: Record<string, any>): Record<number, string> => {
    if(!apiResponse["damage"] || !apiResponse["damage"]["damage_at_character_level"]) {
      return {};
    }

    const damageAtCharacterLevel: Record<number, string> = {};
    const damageTable = apiResponse["damage"]["damage_at_character_level"];

    Object.keys(damageTable as Record<string, string>).forEach((k) => {
      damageAtCharacterLevel[parseInt(k)] = damageTable[k];
    });
    return damageAtCharacterLevel;
  },
  
  convert: (apiResponse: Record<string, any>): SpellType => {
    const components = {
      verbal: apiResponse["components"].includes('V'),
      somatic: apiResponse["components"].includes('S'),
      material: apiResponse["components"].includes('M'),
      materialDesc: apiResponse["material"] ? apiResponse["material"].replace(/^\.+|\.+$/g, '') : ''
    }
    const damageAtCharacterLevel = SpellApiService.convertDamagePerLevel(apiResponse);
    
    const convertedSpell = {
      name: apiResponse["name"],
      level: apiResponse["level"],
      desc: apiResponse["desc"].join("\n"),
      higherLevelDesc: apiResponse["higher_level"].join("\n"),
      schoolOfMagic: apiResponse["school"]["name"].toLowerCase() as SchoolOfMagic,
      range: apiResponse["range"],
      duration: apiResponse["duration"],
      ritual: apiResponse["ritual"],
      concentration: apiResponse["concentration"],
      castingTime: apiResponse["casting_time"],
      descSize: 9,
      damageAtCharacterLevel,
      components
    };
    return convertedSpell;
  },
  
  get: async (spellName: string): Promise<SpellType> => {
    const data = await fetch('https://www.dnd5eapi.co/api/spells/' + spellName);
    const json = await data.json();
    return SpellApiService.convert(json);
  },

  convert5eToolSpell: (spellData: any): SpellType => {
    // School of Magic mapping
    const schoolMapping = {
      'T': SchoolOfMagic.Transmutation,
      'N': SchoolOfMagic.Necromancy,
      'C': SchoolOfMagic.Conjuration,
      'A': SchoolOfMagic.Abjuration,
      'E': SchoolOfMagic.Enchantment,
      'V': SchoolOfMagic.Evocation,
      'I': SchoolOfMagic.Illusion,
      'D': SchoolOfMagic.Divination,
    };
  
    // Components mapping
    const components = {
      verbal: spellData.components?.v || false,
      somatic: spellData.components?.s || false,
      material: spellData.components?.m || false,
      materialDesc: spellData.components?.m || '' // Adjust if more detail is needed
    };

     // Convert range
    const range = spellData.range.type === 'point' && spellData.range.distance ?
      `${spellData.range.distance.amount || ''} ${spellData.range.distance.type}` : 
      'Varies';
  
    return {
      name: spellData.name,
      level: spellData.level,
      schoolOfMagic: schoolMapping[spellData.school] || SchoolOfMagic.Unknown,
      desc: spellData.entries.join("\n"),
      higherLevelDesc: spellData.entriesHigherLevel?.map(e => e.entries.join("\n")).join("\n") || '',
      range: range,
      duration: spellData.duration.map(d => d.type).join(", "),
      castingTime: spellData.time.map(t => `${t.number} ${t.unit}`).join(", "),
      ritual: spellData.ritual || false,
      concentration: spellData.concentration || false,
      damageAtCharacterLevel: {}, // Needs to be populated based on your data structure
      components: components,
      descSize: 9 // Default value
    };
  },
  
  parseRange: (rangeData: any): string => {
    if (typeof rangeData === 'string') return rangeData;
    if (rangeData.type === 'point') {
      return rangeData.distance.type === 'feet' ? `${rangeData.distance.amount} feet` : 'Self';
    }
    return 'Unknown';
  }
}

export default SpellApiService;
