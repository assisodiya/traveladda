export type ChartUiLang = "both" | "en" | "hi";

const DEVANAGARI_DIGITS: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

/**
 * Converts Devanagari digits (०-९) into standard ASCII digits (0-9).
 */
export function normalizeRailHindiDigits(input: string): string {
  if (!input) return "";
  return input.replace(/[०-९]/g, (ch) => DEVANAGARI_DIGITS[ch] ?? ch);
}

/**
 * Curated Hindi names for major Indian Railways boarding & charting stations.
 */
export const STATION_CODE_HINDI_NAMES: Record<string, string> = {
  NDLS: "नई दिल्ली",
  DLI: "पुरानी दिल्ली",
  NZM: "हज़रत निज़ामुद्दीन",
  ANVT: "आनंद विहार टर्मिनल",
  DEE: "दिल्ली सराय रोहिल्ला",
  DEC: "दिल्ली कैंट",
  GZB: "गाज़ियाबाद",
  MMCT: "मुंबई सेंट्रल",
  BCT: "मुंबई सेंट्रल",
  CSMT: "छत्रपति शिवाजी महाराज टर्मिनस",
  CSTM: "मुंबई सीएसएमटी",
  BDTS: "बांद्रा टर्मिनस",
  LTT: "लोकमान्य तिलक टर्मिनस",
  DR: "दादर",
  BVI: "बोरीवली",
  KYN: "कल्याण जं.",
  TNA: "ठाणे",
  PNVL: "पनवेल",
  VAPI: "वापी",
  BL: "वलसाड",
  ST: "सूरत",
  BH: "भरूच जं.",
  AKV: "अंकलेश्वर जं.",
  BRC: "वडोदरा जं.",
  ANND: "आणंद जं.",
  ND: "नडियाद जं.",
  ADI: "अहमदाबाद जं.",
  SBIB: "साबरमती",
  RJT: "राजकोट जं.",
  GIMB: "गांधीधाम जं.",
  RTM: "रतलाम जं.",
  NAD: "नागदा जं.",
  KOTA: "कोटा जं.",
  SWM: "सवाई माधोपुर जं.",
  GGC: "गंगापुर सिटी",
  BXN: "बयाना जं.",
  BTE: "भरतपुर जं.",
  MTJ: "मथुरा जं.",
  AGC: "आगरा कैंट",
  AF: "आगरा फोर्ट",
  TDL: "टूंडला जं.",
  ETW: "इटावा जं.",
  CNB: "कानपुर सेंट्रल",
  GOY: "गोविंदपुरी",
  PRYJ: "प्रयागराज जं.",
  ALD: "प्रयागराज (इलाहाबाद)",
  MZP: "मिर्ज़ापुर",
  DDU: "पं. दीन दयाल उपाध्याय जं.",
  MGS: "मुगलसराय (डीडीयू)",
  BSB: "वाराणसी जं.",
  BSBS: "बनारस",
  BXR: "बक्सर",
  ARA: "आरा जं.",
  DNR: "दानापुर",
  PPTA: "पाटलिपुत्र जं.",
  PNBE: "पटना जं.",
  RJPB: "राजेंद्र नगर टर्मिनल",
  GAYA: "गया जं.",
  BJU: "बरौनी जं.",
  SPJ: "समस्तीपुर जं.",
  MFP: "मुज़फ़्फ़रपुर जं.",
  DBG: "दरभंगा जं.",
  CPR: "छपरा जं.",
  SEE: "सोनपुर जं.",
  HJP: "हाजीपुर जं.",
  BGP: "भागलपुर",
  KIR: "कटिहार जं.",
  NJP: "न्यू जलपाईगुड़ी",
  GHY: "गुवाहाटी",
  KYQ: "कामाख्या जं.",
  DBRG: "डिब्रूगढ़",
  LKO: "लखनऊ चारबाग",
  LJN: "लखनऊ जं.",
  ASH: "ऐशबाग",
  AYC: "अयोध्या कैंट",
  AY: "अयोध्या धाम",
  GD: "गोंडा जं.",
  BST: "बस्ती",
  GKP: "गोरखपुर जं.",
  MB: "मुरादाबाद जं.",
  BE: "बरेली जं.",
  SPN: "शाहजहाँपुर",
  HW: "हरिद्वार जं.",
  DDN: "देहरादून",
  RKSH: "ऋषिकेश",
  UMB: "अंबाला कैंट",
  CDG: "चंडीगढ़",
  LDH: "लुधियाना जं.",
  JUC: "जालंधर सिटी",
  BEAS: "ब्यास जं.",
  ASR: "अमृतसर जं.",
  PTKC: "पठानकोट कैंट",
  JAT: "जम्मू तवी",
  SVDK: "श्री माता वैष्णो देवी कटरा",
  JP: "जयपुर जं.",
  AII: "अजमेर जं.",
  JU: "जोधपुर जं.",
  UDZ: "उदयपुर सिटी",
  BKN: "बीकानेर जं.",
  ABR: "आबू रोड",
  FA: "फालना",
  GWL: "ग्वालियर जं.",
  VGLJ: "वीरांगना लक्ष्मीबाई झाँसी",
  JHS: "झाँसी जं.",
  BINA: "बीना जं.",
  BPL: "भोपाल जं.",
  RKMP: "रानी कमलापति",
  ET: "इटारसी जं.",
  INDB: "इंदौर जं.",
  UJN: "उज्जैन जं.",
  JBP: "जबलपुर",
  KTE: "कटनी जं.",
  STA: "सतना जं.",
  REWA: "रीवा",
  NGP: "नागपुर जं.",
  BSL: "भुसावल जं.",
  KNW: "खंडवा जं.",
  MMR: "मनमाड जं.",
  NK: "नासिक रोड",
  PUNE: "पुणे जं.",
  SUR: "सोलापुर",
  MAO: "मडगांव (गोवा)",
  R: "रायपुर जं.",
  BSP: "बिलासपुर जं.",
  DURG: "दुर्ग",
  DHN: "धनबाद जं.",
  GMO: "नेताजी सुभाष चंद्र बोस गोमो",
  BKSC: "बोकारो स्टील सिटी",
  RNC: "राँची जं.",
  HTE: "हटिया",
  TATA: "टाटानगर जं.",
  KGP: "खड़गपुर जं.",
  ASN: "आसनसोल जं.",
  DGR: "दुर्गापुर",
  HWH: "हावड़ा जं.",
  SDAH: "सियालदह",
  KOAA: "कोलकाता",
  BBS: "भुवनेश्वर",
  CTC: "कटक",
  PURI: "पुरी",
  VSKP: "विशाखापत्तनम",
  BZA: "विजयवाड़ा जं.",
  TPTY: "तिरुपति",
  SC: "सिकंदराबाद जं.",
  HYB: "हैदराबाद डेक्कन",
  KCG: "काचीगुडा",
  KZJ: "काज़ीपेट जं.",
  MAS: "एमजीआर चेन्नई सेंट्रल",
  MS: "चेन्नई एग्मोर",
  TBM: "तांबरम",
  CBE: "कोयंबटूर जं.",
  MDU: "मदुरै जं.",
  SBC: "केएसआर बेंगलुरु",
  YPR: "यशवंतपुर जं.",
  SMVB: "एसएमवीटी बेंगलुरु",
  MYS: "मैसूरु जं.",
  ERS: "एर्नाकुलम जं. (कोच्चि)",
  ERN: "एर्नाकुलम टाउन",
  CLT: "कोझिकोड",
  TVC: "तिरुवनंतपुरम सेंट्रल",
};

/**
 * Hindi & Hinglish railway keywords mapped to English search tokens.
 */
const HINDI_RAIL_TERM_ALIASES: Array<[string, string]> = [
  // Popular train categories
  ["राजधानी", "rajdhani"],
  ["वंदे भारत", "vande bharat"],
  ["वन्दे भारत", "vande bharat"],
  ["शताब्दी", "shatabdi"],
  ["जन शताब्दी", "jan shatabdi"],
  ["तेजस", "tejas"],
  ["दुरंतो", "duronto"],
  ["दुरन्तो", "duronto"],
  ["गरीब रथ", "garib rath"],
  ["संपर्क क्रांति", "sampark kranti"],
  ["सम्पर्क क्रान्ति", "sampark kranti"],
  ["संपूर्ण क्रांति", "sampoorna kranti"],
  ["सप्त क्रांति", "sapt kranti"],
  ["हमसफर", "humsafar"],
  ["अमृत भारत", "amrit bharat"],
  ["वैशाली", "vaishali"],
  ["श्रमजीवी", "shramjeevi"],
  ["महाबोधि", "mahabodhi"],
  ["विक्रमशिला", "vikramshila"],
  ["पुरुषोत्तम", "purushottam"],
  ["स्वर्ण मंदिर", "golden temple"],
  ["गोल्डन टेंपल", "golden temple"],
  ["सचखंड", "sachkhand"],
  ["पुष्पक", "pushpak"],
  ["मंगला", "mangala"],
  ["गीतांजलि", "gitanjali"],
  ["कोरोमंडल", "coromandel"],
  ["कर्नाटक", "karnataka"],
  ["तमिलनाडु", "tamil nadu"],
  ["केरला", "kerala"],
  ["तेलंगाना", "telangana"],
  ["दक्षिण", "dakshin"],
  ["मालवा", "malwa"],
  ["झेलम", "jhelum"],
  ["आश्रम", "ashram"],
  ["चेतक", "chetak"],
  ["मेवाड़", "mewar"],
  ["ब्रह्मपुत्र", "brahmaputra"],
  ["अवध", "avadh"],
  ["सुपरफास्ट", "sf"],
  ["एक्सप्रेस", "exp"],
  // Major cities & stations (Hindi + Hinglish)
  ["नई दिल्ली", "new delhi ndls"],
  ["पुरानी दिल्ली", "old delhi dli"],
  ["दिल्ली", "delhi ndls dli"],
  ["निजामुद्दीन", "nizamuddin nzm"],
  ["निज़ामुद्दीन", "nizamuddin nzm"],
  ["आनंद विहार", "anand vihar anvt"],
  ["मुंबई", "mumbai mmct csmt bdts ltt"],
  ["मुम्बई", "mumbai mmct csmt bdts ltt"],
  ["बंबई", "mumbai mmct"],
  ["बांद्रा", "bandra bdts"],
  ["बोरीवली", "borivali bvi"],
  ["कल्याण", "kalyan kyn"],
  ["पनवेल", "panvel pnvl"],
  ["सूरत", "surat st"],
  ["वडोदरा", "vadodara brc"],
  ["बड़ौदा", "vadodara brc"],
  ["अहमदाबाद", "ahmedabad adi"],
  ["राजकोट", "rajkot rjt"],
  ["रतलाम", "ratlam rtm"],
  ["कोटा", "kota"],
  ["सवाई माधोपुर", "sawai madhopur swm"],
  ["मथुरा", "mathura mtj"],
  ["आगरा", "agra agc"],
  ["कानपुर", "kanpur cnb"],
  ["लखनऊ", "lucknow lko ljn"],
  ["अयोध्या", "ayodhya ayc ay"],
  ["प्रयागराज", "prayagraj pryj"],
  ["इलाहाबाद", "prayagraj allahabad pryj"],
  ["वाराणसी", "varanasi bsb"],
  ["बनारस", "varanasi banaras bsb bsbs"],
  ["काशी", "varanasi bsb"],
  ["मुगलसराय", "dd upadhyaya ddu mgs"],
  ["दीन दयाल", "dd upadhyaya ddu"],
  ["पटना", "patna pnbe"],
  ["दानापुर", "danapur dnr"],
  ["गया", "gaya"],
  ["गोरखपुर", "gorakhpur gkp"],
  ["छपरा", "chhapra cpr"],
  ["मुजफ्फरपुर", "muzaffarpur mfp"],
  ["मुज़फ़्फ़रपुर", "muzaffarpur mfp"],
  ["दरभंगा", "darbhanga dbg"],
  ["समस्तीपुर", "samastipur spj"],
  ["बरौनी", "barauni bju"],
  ["भागलपुर", "bhagalpur bgp"],
  ["कटिहार", "katihar kir"],
  ["रांची", "ranchi rnc"],
  ["राँची", "ranchi rnc"],
  ["धनबाद", "dhanbad dhn"],
  ["टाटानगर", "tatanagar tata"],
  ["जमशेदपुर", "tatanagar tata"],
  ["हावड़ा", "howrah hwh"],
  ["सियालदह", "sealdah sdah"],
  ["कोलकाता", "kolkata koaa hwh"],
  ["भुवनेश्वर", "bhubaneswar bbs"],
  ["पुरी", "puri"],
  ["विशाखापत्तनम", "visakhapatnam vskp"],
  ["विजयवाड़ा", "vijayawada bza"],
  ["तिरुपति", "tirupati tpty"],
  ["चेन्नई", "chennai mas ms"],
  ["बेंगलुरु", "bengaluru sbc ypr smvb"],
  ["बैंगलोर", "bengaluru sbc ypr"],
  ["मैसूर", "mysuru mys"],
  ["हैदराबाद", "hyderabad sc hyb"],
  ["सिकंदराबाद", "secunderabad sc"],
  ["पुणे", "pune"],
  ["नागपुर", "nagpur ngp"],
  ["भोपाल", "bhopal bpl rkmp"],
  ["रानी कमलापति", "rani kamalapati rkmp"],
  ["इटारसी", "itarsi et"],
  ["इंदौर", "indore indb"],
  ["उज्जैन", "ujjain ujn"],
  ["ग्वालियर", "gwalior gwl"],
  ["झांसी", "jhansi vglj jhs"],
  ["झाँसी", "jhansi vglj jhs"],
  ["जबलपुर", "jabalpur jbp"],
  ["रायपुर", "raipur r"],
  ["बिलासपुर", "bilaspur bsp"],
  ["जयपुर", "jaipur jp"],
  ["अजमेर", "ajmer aii"],
  ["जोधपुर", "jodhpur ju"],
  ["उदयपुर", "udaipur udz"],
  ["बीकानेर", "bikaner bkn"],
  ["चंडीगढ़", "chandigarh cdg"],
  ["अंबाला", "ambala umb"],
  ["लुधियाना", "ludhiana ldh"],
  ["जालंधर", "jalandhar juc"],
  ["अमृतसर", "amritsar asr"],
  ["जम्मू", "jammu jat"],
  ["कटरा", "katra svdk"],
  ["वैष्णो देवी", "vaishno devi svdk"],
  ["हरिद्वार", "haridwar hw"],
  ["देहरादून", "dehradun ddn"],
  ["बरेली", "bareilly be"],
  ["मुरादाबाद", "moradabad mb"],
  ["गुवाहाटी", "guwahati ghy"],
  ["एर्नाकुलम", "ernakulam ers"],
  ["कोच्चि", "ernakulam kochi ers"],
  ["तिरुवनंतपुरम", "thiruvananthapuram tvc"],
  ["गोवा", "madgaon goa mao"],
  // Common Hinglish spellings
  ["dilli", "delhi ndls"],
  ["bambai", "mumbai mmct"],
  ["baroda", "vadodara brc"],
  ["banaras", "varanasi bsb"],
  ["allahabad", "prayagraj pryj"],
  ["bangalore", "bengaluru sbc"],
  ["calcutta", "kolkata hwh"],
  ["madras", "chennai mas"],
  ["trivandrum", "thiruvananthapuram tvc"],
  ["cochin", "ernakulam ers"],
  ["mughalsarai", "dd upadhyaya ddu"],
];

const DEVANAGARI_CONSONANTS: Record<string, string> = {
  क: "k",
  ख: "kh",
  ग: "g",
  घ: "gh",
  ङ: "n",
  च: "ch",
  छ: "chh",
  ज: "j",
  झ: "jh",
  ञ: "n",
  ट: "t",
  ठ: "th",
  ड: "d",
  ढ: "dh",
  ण: "n",
  त: "t",
  थ: "th",
  द: "d",
  ध: "dh",
  न: "n",
  प: "p",
  फ: "ph",
  ब: "b",
  भ: "bh",
  म: "m",
  य: "y",
  र: "r",
  ल: "l",
  व: "v",
  श: "sh",
  ष: "sh",
  स: "s",
  ह: "h",
  क़: "q",
  ख़: "kh",
  ग़: "gh",
  ज़: "z",
  ड़: "r",
  ढ़: "rh",
  फ़: "f",
};

const DEVANAGARI_VOWELS: Record<string, string> = {
  अ: "a",
  आ: "a",
  इ: "i",
  ई: "i",
  उ: "u",
  ऊ: "u",
  ऋ: "ri",
  ए: "e",
  ऐ: "ai",
  ओ: "o",
  औ: "au",
};

const DEVANAGARI_MATRAS: Record<string, string> = {
  "ा": "a",
  "ि": "i",
  "ी": "i",
  "ु": "u",
  "ू": "u",
  "ृ": "ri",
  "े": "e",
  "ै": "ai",
  "ो": "o",
  "ौ": "au",
  "ॉ": "o",
  "ॅ": "e",
};

const HINDI_STOP_WORDS =
  /\b(का|की|के|में|से|को|पर|कब|कितने|बजे|बनता|बनेगा|है|चार्ट|टाइम|समय|ट्रेन|गाड़ी|गाडी|नंबर|संख्या|chart|time|kab|banta|baje|train)\b/gi;

/**
 * Lightweight phonetic transliteration from Devanagari to Latin so any Indian
 * station or train typed in Hindi script (e.g., "भरूच", "वलसाड", "वापी") can match
 * English station names.
 */
export function transliterateDevanagariToLatin(input: string): string {
  const text = normalizeRailHindiDigits(input).normalize("NFC");
  if (!/[\u0900-\u097F]/.test(text)) {
    return text.toLowerCase();
  }

  const chars = Array.from(text);
  let out = "";

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1] ?? "";

    // Handle nukta combinations (e.g., ज़, ड़, फ़)
    if (next === "़" && DEVANAGARI_CONSONANTS[ch + next]) {
      const base = DEVANAGARI_CONSONANTS[ch + next];
      const afterNukta = chars[i + 2] ?? "";
      i += 1;
      if (afterNukta === "्") {
        out += base;
        i += 1;
      } else if (DEVANAGARI_MATRAS[afterNukta]) {
        out += base + DEVANAGARI_MATRAS[afterNukta];
        i += 1;
      } else {
        const isWordEnd = !afterNukta || /\s|[.,/-]/.test(afterNukta);
        out += isWordEnd ? base : `${base}a`;
      }
      continue;
    }

    if (DEVANAGARI_VOWELS[ch]) {
      out += DEVANAGARI_VOWELS[ch];
      continue;
    }

    if (DEVANAGARI_CONSONANTS[ch]) {
      const base = DEVANAGARI_CONSONANTS[ch];
      if (next === "्") {
        out += base;
        i += 1;
      } else if (DEVANAGARI_MATRAS[next]) {
        out += base + DEVANAGARI_MATRAS[next];
        i += 1;
      } else {
        const isWordEnd = !next || /\s|[.,/-]/.test(next);
        out += isWordEnd ? base : `${base}a`;
      }
      continue;
    }

    if (ch === "ं" || ch === "ँ") {
      out += "n";
      continue;
    }
    if (ch === "ः") {
      out += "h";
      continue;
    }
    if (DEVANAGARI_MATRAS[ch]) {
      out += DEVANAGARI_MATRAS[ch];
      continue;
    }
    if (ch === "्" || ch === "़") {
      continue;
    }

    out += ch.toLowerCase();
  }

  return out.replace(/\s+/g, " ").trim();
}

/**
 * Converts a Hindi, Hinglish, or English user search query into a clean English
 * upstream/catalog search string + alternate search tokens.
 */
export function normalizeBilingualRailQuery(rawInput: string): {
  primaryQuery: string;
  tokens: string[];
  digits: string;
} {
  const withAsciiDigits = normalizeRailHindiDigits(rawInput || "").trim();
  const digits = withAsciiDigits.replace(/\D/g, "").slice(0, 5);

  if (digits.length >= 3) {
    return {
      primaryQuery: digits,
      tokens: [digits],
      digits,
    };
  }

  const cleaned = withAsciiDigits
    .replace(HINDI_STOP_WORDS, " ")
    .replace(/\s+/g, " ")
    .trim();

  const target = cleaned || withAsciiDigits;
  const lower = target.toLowerCase();
  const matchedTokens = new Set<string>();

  if (lower) {
    matchedTokens.add(lower);
  }

  for (const [alias, englishTarget] of HINDI_RAIL_TERM_ALIASES) {
    if (lower.includes(alias.toLowerCase())) {
      for (const part of englishTarget.split(/\s+/)) {
        if (part.trim()) matchedTokens.add(part.trim().toLowerCase());
      }
      // Prefer full phrase for train categories like "vande bharat" or "new delhi"
      const firstPhrase = englishTarget.split(/\s+/).slice(0, 2).join(" ");
      if (firstPhrase) matchedTokens.add(firstPhrase.toLowerCase());
    }
  }

  if (/[\u0900-\u097F]/.test(target)) {
    const translit = transliterateDevanagariToLatin(target);
    if (translit) {
      matchedTokens.add(translit);
      // Also support v <-> w phonetic variation common in Indian station names
      if (translit.includes("v")) {
        matchedTokens.add(translit.replace(/v/g, "w"));
      }
    }
  }

  const tokenArray = Array.from(matchedTokens).filter(Boolean);
  // Pick the best ASCII token for upstream API calls
  const bestAscii =
    tokenArray.find((t) => /^[a-z0-9\s-]+$/i.test(t) && t.length >= 2) ||
    withAsciiDigits;

  return {
    primaryQuery: bestAscii,
    tokens: tokenArray,
    digits,
  };
}

export function getStationHindiName(stationCode: string): string | null {
  if (!stationCode) return null;
  return STATION_CODE_HINDI_NAMES[stationCode.trim().toUpperCase()] ?? null;
}

export function matchesBilingualStation(
  station: {
    stationCode: string;
    stationName: string;
    sequence?: number;
    chartRemoteStation?: string;
    chartRemoteStationName?: string;
  },
  rawFilter: string
): boolean {
  const trimmed = normalizeRailHindiDigits(rawFilter || "").trim();
  if (!trimmed) return true;

  const codeUpper = station.stationCode.toUpperCase();
  const hindiName = getStationHindiName(codeUpper) || "";
  const remoteCodeUpper = (station.chartRemoteStation || "").toUpperCase();
  const remoteHindiName = remoteCodeUpper
    ? getStationHindiName(remoteCodeUpper) || ""
    : "";

  const haystack = [
    station.stationCode,
    station.stationName,
    hindiName,
    station.sequence ? String(station.sequence) : "",
    station.chartRemoteStation || "",
    station.chartRemoteStationName || "",
    remoteHindiName,
  ]
    .join(" ")
    .toLowerCase();

  if (haystack.includes(trimmed.toLowerCase())) {
    return true;
  }

  const { tokens } = normalizeBilingualRailQuery(trimmed);
  return tokens.some((tok) => tok.length >= 2 && haystack.includes(tok));
}

export function formatChartDayLabelHi(dayLabel: string): string {
  const lower = (dayLabel || "").toLowerCase();
  if (lower.includes("same day")) return "उसी दिन (दिन 1)";
  if (lower.includes("previous") || lower.includes("-1"))
    return "पिछली रात (-1 दिन)";
  if (lower.includes("+1")) return "अगले दिन (+1 दिन)";
  if (lower.includes("+2")) return "तीसरे दिन (+2 दिन)";
  return dayLabel;
}
