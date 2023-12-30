import { SchoolOfMagic } from "./constants";
import { SpellType, SrdType  } from "./models";

type SrdSpellsReponse = {
  results: SrdType[],
  count: number
}

const SpellApiService = {

  getList: async (): Promise<SrdSpellsResponse> => {
    const apiUrl = process.env.USE_5ETOOLS === 'true' ? 'http://localhost:3000/api/spells' : `${process.env['5E_API'] || 'https://www.dnd5eapi.co/'}api/spells`;
    const list = await fetch(apiUrl);
    return list.json();
  },

  get: async (spellName: string): Promise<SpellType> => {
    const apiUrl = process.env.USE_5ETOOLS === 'true' 
      ? `http://localhost:3000/api/spells?spellName=${encodeURIComponent(spellName)}` 
      : `https://www.dnd5eapi.co/api/spells/${spellName}`;
    const data = await fetch(apiUrl);
    const json = await data.json();
    return process.env.USE_5ETOOLS === 'true' ? SpellApiService.convert5eToolSpell(json) : SpellApiService.convert(json);
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
  
    // Components mapping
    const components = {
      verbal: spellData.components?.v ?? false,
      somatic: spellData.components?.s ?? false,
      material: !!spellData.components?.m,
      materialDesc: spellData.components?.m ?? ''
    };
  
    // Convert range
    const range = spellData.range?.type === 'point' && spellData.range.distance ?
      `${spellData.range.distance.amount ?? ''} ${spellData.range.distance.type}` : 
      'Varies';
  
    return {
      name: spellData.name || 'Unknown Name',
      level: spellData.level || 0,
      schoolOfMagic: (schoolMapping as Record<string, SchoolOfMagic>)[spellData.school as string] || SchoolOfMagic.other,
      desc: spellData.entries?.join("\n") || '',
      higherLevelDesc: spellData.entriesHigherLevel?.map((e: { entries: string[] }) => e.entries.join("\n")).join("\n") || '',
      range: range,
      duration: spellData.duration?.map((d: { type: string }) => d.type).join(", ") || '',
      castingTime: spellData.time?.map((t: { number: string; unit: string }) => `${t.number} ${t.unit}`).join(", ") || '',
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
