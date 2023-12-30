import { SchoolOfMagic } from "./constants";
import { SpellType, SrdType  } from "./models";

type SrdSpellsReponse = {
  results: SrdType[],
  count: number
}

interface DurationType {
  type: string;
  // Add other properties of duration objects if there are any
}

interface TimeType {
  number: number;
  unit: string;
}

interface HigherLevelEntryType {
  entries: string[];
}


const getConfig = async () => {
  const response = await fetch('/api/config');
  return response.json();
};

const SpellApiService = {

  getList: async (): Promise<SrdSpellsReponse> => {
    const config = await getConfig();
    const apiUrl = config.USE_5ETOOLS === 'true' ? '/api/spells' : '${config.API_URL}api/spells';
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log("API Response for getList:", data);  // Log the response data
    return data;
  },

  get: async (spellName: string): Promise<SpellType> => {
    const config = await getConfig();
    const apiUrl = config.USE_5ETOOLS === 'true'
      ? '/api/spells/${spellName}'
      : '${config.API_URL}api/spells/${spellName}';
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log("API Response for get:", data);  // Log the response data
    return config.USE_5ETOOLS === 'true' ? SpellApiService.convert5eToolSpell(data) : SpellApiService.convert(data);
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

  convert5eToolSpell(spellData: any): SpellType {

    // Define a type for the keys in schoolMapping
    type SchoolKey = 'T' | 'N' | 'C' | 'A' | 'E' | 'V' | 'I' | 'D';
    
    // School of Magic mapping
    const schoolMapping = {
      'T': SchoolOfMagic.transmutation,
      'N': SchoolOfMagic.necromancy,
      'C': SchoolOfMagic.conjuration,
      'A': SchoolOfMagic.abjuration,
      'E': SchoolOfMagic.enchantment,
      'V': SchoolOfMagic.evocation,
      'I': SchoolOfMagic.illusion,
      'D': SchoolOfMagic.divination,
    };
    
    // Use type assertion when accessing schoolMapping
    const schoolOfMagic = schoolMapping[spellData.school as SchoolKey] || SchoolOfMagic.other;
  
    // Handling components
    const components = {
      verbal: spellData.components.v || false,
      somatic: spellData.components.s || false,
      material: spellData.components.m ? true : false,
      materialDesc: spellData.components.m || ''
    };
  
    // Convert range, duration, casting time
    let range = 'Varies';
    if (spellData.range) {
        if (spellData.range.distance) {
            range = `${spellData.range.distance.amount ?? ''} ${spellData.range.distance.type}`;

        } else if (spellData.range.type) {
            range = spellData.range.type; // If the range is a special type like 'Self' or 'Touch'
        }
    }
    
    const duration = spellData.duration.map((d: DurationType) => d.type).join(", ");
    const castingTime = spellData.time.map((t: TimeType) => '${t.number} ${t.unit}').join(", ");
    const higherLevelDesc = spellData.entriesHigherLevel?.map((e: HigherLevelEntryType) => e.entries.join("\n")).join("\n") || '';

    console.log("Converting spell:", spellData.name);
    console.log("School of Magic:", schoolOfMagic);
    console.log("Components:", components);
    console.log("Range:", range);
    console.log("Duration:", duration);
    console.log("Casting Time:", castingTime);
    console.log("Higher Level Description:", higherLevelDesc);

    const convertedSpell = {
      name: spellData.name,
      level: spellData.level,
      schoolOfMagic,
      desc: spellData.entries.join("\n"),
      higherLevelDesc,
      range,
      duration,
      castingTime,
      ritual: spellData.ritual || false,
      concentration: spellData.concentration || false,
      damageAtCharacterLevel: {}, // This needs specific handling
      components,
      descSize: 9
    };

    console.log("Converted Spell:", convertedSpell);
    return convertedSpell;

  },
  
  parseRange: (rangeData: any): string => {
    if (typeof rangeData === 'string') return rangeData;
    if (rangeData.type === 'point') {
      return rangeData.distance.type === 'feet' ? '${rangeData.distance.amount} feet' : 'Self';
    }
    return 'Unknown';
  }
}

export default SpellApiService;
