/**
 * Secret / PII Leak Detector.
 *
 * Scans arbitrary text for patterns that indicate private keys,
 * seed phrases (BIP39), Ethereum/Bitcoin addresses, API keys, JWTs.
 *
 * Intended for: support-chat sanitizers, clipboard guards, error-log filters.
 */

export type SecretKind =
  | 'bip39_seed_phrase'
  | 'eth_private_key'
  | 'btc_wif_private_key'
  | 'eth_address'
  | 'btc_address'
  | 'api_key_generic'
  | 'jwt'
  | 'aws_access_key';

export interface Finding {
  kind: SecretKind;
  match: string;
  index: number;
  length: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  redacted: string;
}

// Partial BIP39 wordlist — enough to detect seed phrases heuristically.
// A phrase of 12/15/18/21/24 words where >= 75% are in the list is flagged.
const BIP39_WORDS = new Set([
  'abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse',
  'access','accident','account','accuse','achieve','acid','acoustic','acquire','across','act',
  'action','actor','actress','actual','adapt','add','addict','address','adjust','admit',
  'adult','advance','advice','aerobic','affair','afford','afraid','again','age','agent',
  'agree','ahead','aim','air','airport','aisle','alarm','album','alcohol','alert',
  'alien','all','alley','allow','almost','alone','alpha','already','also','alter',
  'always','amateur','amazing','among','amount','amused','analyst','anchor','ancient','anger',
  'angle','angry','animal','ankle','announce','annual','another','answer','antenna','antique',
  'anxiety','any','apart','apology','appear','apple','approve','april','arch','arctic',
  'area','arena','argue','arm','armed','armor','army','around','arrange','arrest',
  'arrive','arrow','art','artefact','artist','artwork','ask','aspect','assault','asset',
  'assist','assume','asthma','athlete','atom','attack','attend','attitude','attract','auction',
  'audit','august','aunt','author','auto','autumn','average','avocado','avoid','awake',
  'aware','away','awesome','awful','awkward','axis','baby','bachelor','bacon','badge',
  'bag','balance','balcony','ball','bamboo','banana','banner','bar','barely','bargain',
  'barrel','base','basic','basket','battle','beach','bean','beauty','because','become',
  'beef','before','begin','behave','behind','believe','below','belt','bench','benefit',
  'best','betray','better','between','beyond','bicycle','bid','bike','bind','biology',
  'bird','birth','bitter','black','blade','blame','blanket','blast','bleak','bless',
  'blind','blood','blossom','blouse','blue','blur','blush','board','boat','body',
  'boil','bomb','bone','bonus','book','boost','border','boring','borrow','boss',
  'bottom','bounce','box','boy','bracket','brain','brand','brass','brave','bread',
  'breeze','brick','bridge','brief','bright','brilliant','bring','brisk','broccoli','broken',
  'bronze','broom','brother','brown','brush','bubble','buddy','budget','buffalo','build',
  'bulb','bulk','bullet','bundle','bunker','burden','burger','burst','bus','business',
  'busy','butter','buyer','buzz','cabbage','cabin','cable','cactus','cage','cake',
  'call','calm','camera','camp','can','canal','cancel','candy','cannon','canoe',
  'canvas','canyon','capable','capital','captain','car','carbon','card','cargo','carpet',
  'carry','cart','case','cash','casino','castle','casual','cat','catalog','catch',
  'category','cattle','caught','cause','caution','cave','ceiling','celery','cement','census',
  'century','cereal','certain','chair','chalk','champion','change','chaos','chapter','charge',
  'chase','chat','cheap','check','cheese','chef','cherry','chest','chicken','chief',
  'child','chimney','choice','choose','chronic','chuckle','chunk','churn','cigar','cinnamon',
  'circle','citizen','city','civil','claim','clap','clarify','claw','clay','clean',
  'clerk','clever','click','client','cliff','climb','clinic','clip','clock','clog',
  'close','cloth','cloud','clown','club','clump','cluster','clutch','coach','coast',
  'coconut','code','coffee','coil','coin','collect','color','column','combine','come',
  'comfort','comic','common','company','concert','conduct','confirm','congress','connect','consider',
  'control','convince','cook','cool','copper','copy','coral','core','corn','correct',
  'cost','cotton','couch','country','couple','course','cousin','cover','coyote','crack',
  'cradle','craft','cram','crane','crash','crater','crawl','crazy','cream','credit',
  'creek','crew','cricket','crime','crisp','critic','crop','cross','crouch','crowd',
  'crucial','cruel','cruise','crumble','crunch','crush','cry','crystal','cube','culture',
  'cup','cupboard','curious','current','curtain','curve','cushion','custom','cute','cycle',
  'dad','damage','damp','dance','danger','daring','dash','daughter','dawn','day',
  'deal','debate','debris','decade','december','decide','decline','decorate','decrease','deer',
  'defense','define','defy','degree','delay','deliver','demand','demise','denial','dentist',
  'deny','depart','depend','deposit','depth','deputy','derive','describe','desert','design',
  'desk','despair','destroy','detail','detect','develop','device','devote','diagram','dial',
  'diamond','diary','dice','diesel','diet','differ','digital','dignity','dilemma','dinner',
  'dinosaur','direct','dirt','disagree','discover','disease','dish','dismiss','disorder','display',
  'distance','divert','divide','divorce','dizzy','doctor','document','dog','doll','dolphin',
]);

const PATTERNS: Array<{ kind: SecretKind; regex: RegExp; severity: Finding['severity'] }> = [
  // Ethereum private key: 0x + 64 hex
  { kind: 'eth_private_key', regex: /\b(0x)?[0-9a-fA-F]{64}\b/g, severity: 'critical' },
  // Bitcoin WIF private key: starts with 5, K, or L
  { kind: 'btc_wif_private_key', regex: /\b[5KL][1-9A-HJ-NP-Za-km-z]{50,51}\b/g, severity: 'critical' },
  // Ethereum address
  { kind: 'eth_address', regex: /\b0x[0-9a-fA-F]{40}\b/g, severity: 'medium' },
  // Bitcoin address (P2PKH / P2SH / bech32)
  {
    kind: 'btc_address',
    regex: /\b(bc1[qz][0-9a-z]{20,60}|[13][1-9A-HJ-NP-Za-km-z]{25,34})\b/g,
    severity: 'medium',
  },
  // JWT
  { kind: 'jwt', regex: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, severity: 'high' },
  // AWS access key
  { kind: 'aws_access_key', regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g, severity: 'high' },
  // Generic long API key (sk_live_..., pk_..., ghp_..., etc.)
  {
    kind: 'api_key_generic',
    regex: /\b(sk|pk|ghp|ghs|gho|ghr|xox[bpoas]|AIza)[_-][A-Za-z0-9_-]{20,}\b/g,
    severity: 'high',
  },
];

function redact(s: string): string {
  if (s.length <= 8) return '•'.repeat(s.length);
  return `${s.slice(0, 4)}${'•'.repeat(Math.min(s.length - 8, 20))}${s.slice(-4)}`;
}

function detectSeedPhrase(text: string): Finding[] {
  const findings: Finding[] = [];
  // Normalize whitespace, find runs of 12/15/18/21/24 lowercase words
  const wordRuns = text.matchAll(/\b([a-z]{3,10})(?:\s+[a-z]{3,10}){11,23}\b/g);
  for (const match of wordRuns) {
    const words = match[0].split(/\s+/);
    if (![12, 15, 18, 21, 24].includes(words.length)) continue;
    const hits = words.filter((w) => BIP39_WORDS.has(w)).length;
    if (hits / words.length >= 0.75) {
      findings.push({
        kind: 'bip39_seed_phrase',
        match: match[0],
        index: match.index ?? 0,
        length: match[0].length,
        severity: 'critical',
        redacted: `${words[0]} ${words[1]} ... [${words.length} words]`,
      });
    }
  }
  return findings;
}

export function scanText(text: string): Finding[] {
  const findings: Finding[] = [];

  for (const { kind, regex, severity } of PATTERNS) {
    for (const match of text.matchAll(regex)) {
      findings.push({
        kind,
        match: match[0],
        index: match.index ?? 0,
        length: match[0].length,
        severity,
        redacted: redact(match[0]),
      });
    }
  }
  findings.push(...detectSeedPhrase(text));

  return findings.sort((a, b) => a.index - b.index);
}

/**
 * Replace every detected secret with its redacted form. Safe to log.
 */
export function redactText(text: string): string {
  const findings = scanText(text);
  if (findings.length === 0) return text;

  // Walk from end to keep indices stable
  let out = text;
  for (const f of [...findings].reverse()) {
    out = out.slice(0, f.index) + f.redacted + out.slice(f.index + f.length);
  }
  return out;
}

export function kindLabel(kind: SecretKind): string {
  const labels: Record<SecretKind, string> = {
    bip39_seed_phrase: 'BIP39 Seed Phrase',
    eth_private_key: 'Ethereum Private Key',
    btc_wif_private_key: 'Bitcoin WIF Private Key',
    eth_address: 'Ethereum Address',
    btc_address: 'Bitcoin Address',
    api_key_generic: 'API Key',
    jwt: 'JSON Web Token',
    aws_access_key: 'AWS Access Key',
  };
  return labels[kind];
}
