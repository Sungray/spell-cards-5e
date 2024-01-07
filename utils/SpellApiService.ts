import { SchoolOfMagic } from "./constants";
import { SpellType, SrdType  } from "./models";

type SrdSpellsReponse = {
  results: SrdType[],
  count: number
}

interface DurationType {
  type: string;
  duration?: {
    amount: number;
    type: string;
  };
  concentration?: boolean; // Add this line
  ends: string[];
}

interface TimeType {
  number: number;
  unit: string;
  condition: string;
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
    const apiUrl = config.USE_LOCAL_FILES === 'true' ? '/api/spells' : `${config.API_URL}api/spells`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  },

  get: async (spellName: string): Promise<SpellType> => {
    const config = await getConfig();
    const apiUrl = config.USE_LOCAL_FILES === 'true'
      ? `/api/spells/${spellName.toLowerCase().replace(/\s+/g, '-')}`
      : `${config.API_URL}api/spells/${spellName}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return config.USE_LOCAL_FILES === 'true' ? SpellApiService.convert5eToolSpell(data) : SpellApiService.convert(data);
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
    const schoolMapping: { [key in SchoolKey]: SchoolOfMagic } = {
      'T': SchoolOfMagic.transmutation,
      'N': SchoolOfMagic.necromancy,
      'C': SchoolOfMagic.conjuration,
      'A': SchoolOfMagic.abjuration,
      'E': SchoolOfMagic.enchantment,
      'V': SchoolOfMagic.evocation,
      'I': SchoolOfMagic.illusion,
      'D': SchoolOfMagic.divination,
    };
    
    const schoolOfMagicLowerCase = (schoolMapping[spellData.school as SchoolKey] || SchoolOfMagic.other).toLowerCase();

  
  
    // Convert range, duration, casting time
    let range = 'Varies';
    if (spellData.range) {
        if (spellData.range.distance) {
            range = `${spellData.range.distance.amount ?? ''} ${spellData.range.distance.type}`;

        } else if (spellData.range.type) {
            range = spellData.range.type; // If the range is a special type like 'Self' or 'Touch'
        }
    }
    
    const { durationString, isConcentration } = parseDuration(spellData.duration);

    const replaceSpecialTags = (text: string): string => {
      // Specifically handle the @scaledamage tag
      text = text.replace(/\{@scaledamage \d+d\d+\|\d+-\d+\|(.*?)\}/g, '$1');
    
      // Replace other {@tag content} patterns
      text = text.replace(/\{@.*? (.*?)\}/g, '$1');
    
      return text;
    };

    const higherLevelDesc = spellData.entriesHigherLevel?.map((e: HigherLevelEntryType) => {
      return e.entries.map(entry => replaceSpecialTags(entry)).join("\n");
    }).join("\n") || '';

  
    const processEntries = (entry: any): string => {
      if (typeof entry === 'object' && entry.type === 'list') {
        return entry.items.map((item: string) => `• ${replaceSpecialTags(item)}`).join("\n");
      }
      else if (typeof entry === 'object' && entry.type === 'entries') {
        return `**${entry.name}**\n${entry.entries.map((subEntry: any) => processEntries(subEntry)).join("\n")}`;
      }
      else if (typeof entry === 'object' && entry.type === 'quote') {
        return `> ${entry.entries.map((subEntry: string) => replaceSpecialTags(subEntry)).join("\n")}\n\n— ${entry.by}`;
      }
      return replaceSpecialTags(entry);
    };
    
    const entries = spellData.entries.map((entry: any) => processEntries(entry)).join("\n");
    
    const castingTime = spellData.time.map((t: TimeType) => {
      let timeString = `${t.number || ''} ${t.unit || ''}`;
      if (t.condition) {
        timeString += `, ${replaceSpecialTags(t.condition)}`;
      }
      return timeString.trim();
    }).join(", ");

    // Handling components
    const parseMaterialComponent = (material: any): string => {
      if (!material) {
        return '';  // Return an empty string if material is undefined or null
      }
      if (typeof material === 'string') {
        return material;
      }
      // Handle the case where material is an object with 'text' and possibly 'cost'
      let materialDescription = material.text || '';
      if (material.hasOwnProperty('cost') && material.cost) {
        const costInGp = material.cost / 100; // Assuming the cost is in cents
        materialDescription += ` (Cost: ${costInGp} gp)`;
      }
      return materialDescription;
    };

    

    const components = {
      verbal: spellData.components.v || false,
      somatic: spellData.components.s || false,
      material: !!spellData.components.m,
      materialDesc: parseMaterialComponent(spellData.components.m)
    };


    const convertedSpell = {
      name: spellData.name,
      level: spellData.level,
      schoolOfMagic: schoolOfMagicLowerCase as SchoolOfMagic,
      desc: entries,
      higherLevelDesc,
      range,
      duration: durationString,
      concentration: isConcentration,
      castingTime,
      ritual: spellData.ritual || false,
      damageAtCharacterLevel: {}, // This needs specific handling
      components,
      descSize: 9
    };
    
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

const parseDuration = (durationArray: DurationType[]) => {
  let isConcentration = false;
  const durationString = durationArray.map(d => {
    if (d.type === 'timed' && d.duration) {
      isConcentration = d.concentration || false;
      return `${d.duration.amount} ${d.duration.type}`;
    }
    return d.type;
  }).join(", ");
  return { durationString, isConcentration };
};

export default SpellApiService;
