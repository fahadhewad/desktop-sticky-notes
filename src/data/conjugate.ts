// A small Spanish conjugator. Regular verbs need no data at all; irregular ones
// are described by a compact Spec (stem change, irregular yo, strong preterite
// stem, …) and the spelling rules (busqué, cojo, sigo, leyó, construyo, …) are
// applied automatically from the infinitive. Everything runs offline.

export type Tense =
  | 'present'
  | 'progressive'
  | 'preterite'
  | 'imperfect'
  | 'future'
  | 'conditional'
  | 'perfect'
  | 'imperative'
  | 'subjunctive'
  | 'impSubjunctive'

// Forms are always [yo, tú, él/ella/usted, nosotros, vosotros, ellos/ellas/ustedes].
// The imperative has no yo form (''), and its 3rd persons are usted / ustedes.
export type Forms = string[]

export interface Spec {
  stem?: 'ie' | 'ue' | 'i' // stem change in stressed syllables (pienso, puedo, pido)
  acc?: boolean // stressed í / ú in the stem (envío, continúo, reúno, prohíbo)
  like?: string // conjugates like this irregular model with a prefix (mantener → tener)
  yo?: string // irregular present yo (hago, tengo)
  pret?: string // strong preterite stem (tuv → tuve, tuvo)
  fut?: string // irregular future / conditional stem (tendr)
  imp?: string // irregular tú imperative (ten, haz)
  part?: string // irregular past participle (hecho)
  ger?: string // irregular gerund (yendo)
  forms?: Partial<Record<Tense, Forms>> // whole-tense overrides for the truly irregular
  skip?: Tense[] // tenses that don't really exist for this verb (haber has no imperative)
  only3?: boolean // only it / they forms make sense (llueve, me gusta, me duelen)
}

const strip = (s: string) => s.normalize('NFD').replace(/[́]/g, '').normalize('NFC')
const ACCENTED: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' }

// Accent the last i / u of a stem: envi → enví, reun → reún.
function accentWeak(stem: string): string {
  const i = Math.max(stem.lastIndexOf('i'), stem.lastIndexOf('u'))
  return i < 0 ? stem : stem.slice(0, i) + ACCENTED[stem[i]] + stem.slice(i + 1)
}

// Replace the last occurrence of `from` in the stem.
function replaceLast(stem: string, from: string, to: string): string {
  const i = stem.lastIndexOf(from)
  return i < 0 ? stem : stem.slice(0, i) + to + stem.slice(i + from.length)
}

// Stressed stem change: pens → piens, pod → pued, jug → jueg, ped → pid.
function changeStem(stem: string, kind: 'ie' | 'ue' | 'i'): string {
  if (kind === 'ie') return stem.includes('e') ? replaceLast(stem, 'e', 'ie') : replaceLast(stem, 'i', 'ie')
  if (kind === 'ue') return /o[^o]*$/.test(stem) ? replaceLast(stem, 'o', 'ue') : replaceLast(stem, 'u', 'ue')
  return replaceLast(stem, 'e', 'i')
}

// The weaker change -ir stem-changers take in unstressed spots (sintió, durmió).
function weakChange(stem: string, kind: 'ie' | 'ue' | 'i'): string {
  if (kind === 'ue') return replaceLast(stem, 'o', 'u')
  return stem.includes('e') ? replaceLast(stem, 'e', 'i') : stem
}

// -ar stems before an "e" ending: busc → busqu, pag → pagu, empiez → empiec, averigu → averigü.
function beforeE(stem: string): string {
  if (stem.endsWith('gu')) return stem.slice(0, -2) + 'gü'
  if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu'
  if (stem.endsWith('g')) return stem.slice(0, -1) + 'gu'
  if (stem.endsWith('z')) return stem.slice(0, -1) + 'c'
  return stem
}

// -er/-ir stems before an "a"/"o" ending: coj, sig, venz, conozc.
function beforeAO(stem: string, irregularYo: boolean): string {
  if (/gu$/.test(stem)) return stem.slice(0, -2) + 'g'
  if (/g$/.test(stem)) return stem.slice(0, -1) + 'j'
  if (!irregularYo && /[aeiouáéíóú]c$/.test(stem)) return stem.slice(0, -1) + 'zc'
  if (!irregularYo && /c$/.test(stem)) return stem.slice(0, -1) + 'z'
  return stem
}

const HABER = ['he', 'has', 'ha', 'hemos', 'habéis', 'han']
const ESTAR = ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están']

export interface Conjugated {
  forms: Record<Tense, Forms>
  participle: string
  gerund: string
}

// Resolve `like` (mantener → tener) into a full spec with the prefix applied.
function resolve(inf: string, spec: Spec, models: Record<string, Spec>): Spec {
  if (!spec.like) return spec
  const model = models[spec.like]
  const prefix = inf.slice(0, inf.length - spec.like.length)
  const p = (s?: string) => (s === undefined ? undefined : prefix + s)
  // ten → mantén, pon → propón, ven → prevén: a one-syllable tú form ending
  // in n gains an accent once it has a prefix.
  const imp = model.imp && /^[^aeiou]*[aeiou]n$/.test(model.imp) ? prefix + model.imp.replace(/([aeiou])n$/, (_, v) => ACCENTED[v] + 'n') : p(model.imp)
  const forms: Spec['forms'] = {}
  for (const [t, f] of Object.entries(model.forms ?? {})) forms[t as Tense] = f.map((x) => (x ? prefix + x : x))
  return { ...model, ...spec, like: undefined, yo: p(model.yo), pret: p(model.pret), fut: p(model.fut), imp, part: p(model.part), ger: p(model.ger), forms }
}

export function conjugate(infinitive: string, rawSpec: Spec, models: Record<string, Spec>): Conjugated {
  const spec = resolve(infinitive, rawSpec, models)
  const inf = infinitive
  const plain = strip(inf) // oír → oir, reír → reir
  const ending = plain.slice(-2) as 'ar' | 'er' | 'ir'
  const stem = plain.slice(0, -2)
  const isAr = ending === 'ar'
  const isIr = ending === 'ir'
  const ducir = inf.endsWith('ducir')
  // A stem ending in a pronounced vowel (le-er, ca-er, o-ír, constru-ir), but
  // not the silent u of gu / qu (seguir).
  const vowelStem = !isAr && (/[aeo]$/.test(stem) || /[^gq]u$/.test(stem))
  const uir = isIr && /[^gq]u$/.test(stem)
  const o = spec.forms ?? {}

  // ---------------- present ----------------
  const stressed = (s: string) => {
    let r = spec.stem ? changeStem(s, spec.stem) : s
    if (spec.acc) r = accentWeak(r)
    return r
  }
  const presentEndings = isAr
    ? ['o', 'as', 'a', 'amos', 'áis', 'an']
    : ending === 'er'
      ? ['o', 'es', 'e', 'emos', 'éis', 'en']
      : ['o', 'es', 'e', 'imos', 'ís', 'en']
  const present =
    o.present ??
    presentEndings.map((e, i) => {
      const isStressed = i < 3 || i === 5
      let s = isStressed ? stressed(stem) : stem
      if (uir && isStressed) s += 'y'
      if (i === 0) {
        if (spec.yo) return spec.yo
        if (!isAr) s = beforeAO(s, false)
      }
      return s + e
    })

  // ---------------- preterite ----------------
  let preterite: Forms
  const strong = spec.pret ?? (ducir ? stem.slice(0, -1) + 'j' : undefined)
  if (o.preterite) preterite = o.preterite
  else if (strong) {
    const j = strong.endsWith('j')
    preterite = [
      strong + 'e',
      strong + 'iste',
      (strong.endsWith('c') ? strong.slice(0, -1) + 'z' : strong) + 'o',
      strong + 'imos',
      strong + 'isteis',
      strong + (j ? 'eron' : 'ieron'),
    ]
  } else if (isAr) {
    preterite = [beforeE(stem) + 'é', stem + 'aste', stem + 'ó', stem + 'amos', stem + 'asteis', stem + 'aron']
  } else {
    const weak = isIr && spec.stem ? weakChange(stem, spec.stem) : stem
    if (vowelStem && !uir) {
      preterite = [stem + 'í', stem + 'íste', stem + 'yó', stem + 'ímos', stem + 'ísteis', stem + 'yeron']
    } else if (uir) {
      preterite = [stem + 'í', stem + 'iste', stem + 'yó', stem + 'imos', stem + 'isteis', stem + 'yeron']
    } else {
      preterite = [stem + 'í', stem + 'iste', weak + 'ió', stem + 'imos', stem + 'isteis', weak + 'ieron']
    }
  }

  // ---------------- imperfect ----------------
  const imperfect =
    o.imperfect ??
    (isAr
      ? ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'].map((e) => stem + e)
      : ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'].map((e) => stem + e))

  // ---------------- future / conditional ----------------
  const futStem = spec.fut ?? plain
  const future = o.future ?? ['é', 'ás', 'á', 'emos', 'éis', 'án'].map((e) => futStem + e)
  const conditional = o.conditional ?? ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'].map((e) => futStem + e)

  // ---------------- participle / gerund ----------------
  const participle =
    spec.part ?? (isAr ? stem + 'ado' : vowelStem && !uir ? stem + 'ído' : stem + 'ido')
  const gerund =
    spec.ger ??
    (isAr
      ? stem + 'ando'
      : vowelStem
        ? stem + 'yendo'
        : (isIr && spec.stem ? weakChange(stem, spec.stem) : stem) + 'iendo')

  // ---------------- present subjunctive ----------------
  let subjunctive: Forms
  if (o.subjunctive) subjunctive = o.subjunctive
  else {
    const yoStem = present[0].replace(/o$/, '')
    // nosotros / vosotros: stem-changing -ar/-er verbs go back to the plain
    // stem (pensemos), -ir ones take the weak change (sintamos, durmamos),
    // accent-shifting ones drop the accent (enviemos); everyone else keeps
    // the yo stem (tengamos, conozcamos, pidamos).
    let usStem = yoStem
    if (!spec.yo && !o.present) {
      if (spec.stem === 'ie' || spec.stem === 'ue') usStem = isIr ? weakChange(stem, spec.stem) : stem
      else if (spec.acc) usStem = stem
      if (!isAr && usStem !== yoStem) usStem = beforeAO(usStem, false)
    }
    const ends = isAr ? ['e', 'es', 'e', 'emos', 'éis', 'en'] : ['a', 'as', 'a', 'amos', 'áis', 'an']
    subjunctive = ends.map((e, i) => {
      const s = i === 3 || i === 4 ? usStem : yoStem
      return (isAr ? beforeE(s) : s) + e
    })
  }

  // ---------------- imperfect subjunctive (from preterite ellos) ----------------
  const impBase = preterite[5].replace(/ron$/, '')
  const impStressed = impBase.replace(/([aeiou])$/, (v) => ACCENTED[v])
  const impSubjunctive =
    o.impSubjunctive ?? [impBase + 'ra', impBase + 'ras', impBase + 'ra', impStressed + 'ramos', impBase + 'rais', impBase + 'ran']

  // ---------------- imperative (affirmative) ----------------
  const imperative = spec.skip?.includes('imperative')
    ? ['', '', '', '', '', '']
    : o.imperative ?? [
        '',
        spec.imp ?? present[2],
        subjunctive[2],
        subjunctive[3],
        inf.slice(0, -1) + 'd',
        subjunctive[5],
      ]

  return {
    forms: {
      present,
      progressive: ESTAR.map((e) => `${e} ${gerund}`),
      preterite,
      imperfect,
      future,
      conditional,
      perfect: HABER.map((h) => `${h} ${participle}`),
      imperative,
      subjunctive,
      impSubjunctive,
    },
    participle,
    gerund,
  }
}

// Plain-language notes on what's irregular about a verb, plus the overall
// regular / irregular label. Spelling-only changes (busqué, cojo, sigo) keep a
// verb "regular".
export function describe(inf: string, rawSpec: Spec, models: Record<string, Spec>, c: Conjugated): { regular: boolean; notes: string[] } {
  const spec = resolve(inf, rawSpec, models)
  const plain = strip(inf)
  const stem = plain.slice(0, -2)
  const isAr = plain.endsWith('ar')
  const notes: string[] = []
  let regular = true
  const f = c.forms
  const irregular = (note: string) => {
    regular = false
    notes.push(note)
  }

  // huir only overrides forms for accent spelling (hui, huis), so it isn't "highly" irregular.
  if (spec.forms && (spec.forms.present || spec.forms.preterite) && !plain.endsWith('uir')) irregular('Highly irregular')
  if (spec.stem) {
    const label = spec.stem === 'ie' ? (stem.includes('e') ? 'e→ie' : 'i→ie') : spec.stem === 'ue' ? (/o/.test(stem) ? 'o→ue' : 'u→ue') : 'e→i'
    irregular(`Stem change ${label} (${f.present[2]})`)
  }
  if (spec.acc) irregular(`Accent shift (${f.present[0]})`)
  if (!spec.forms?.present) {
    if (spec.yo) irregular(`Irregular yo (${spec.yo})`)
    else if (/[aeiou]c[ei]r$/.test(plain)) irregular(`Irregular yo (${f.present[0]})`)
  }
  if (!isAr && /[^gq]uir$/.test(plain)) irregular(`Adds y (${f.present[0]})`)
  if (!spec.forms?.preterite && (spec.pret || plain.endsWith('ducir'))) irregular(`Irregular preterite (${f.preterite[0]})`)
  if (!isAr && /[aeo](er|ir)$/.test(plain) && !spec.pret && !spec.forms?.preterite) irregular(`y in preterite (${f.preterite[2]})`)
  if (spec.fut) irregular(`Irregular future (${f.future[0]})`)
  if (spec.part) irregular(`Irregular participle (${c.participle})`)

  if (regular) {
    if (isAr && /(c|g|z|gu)ar$/.test(plain)) notes.push(`Spelling change (${f.preterite[0]})`)
    else if (!isAr && /(g|gu|c)(er|ir)$/.test(plain)) notes.push(`Spelling change (${f.present[0]})`)
  }
  return { regular, notes }
}
