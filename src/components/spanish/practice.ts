// Question selection and answer checking for Spanish practice. Questions come
// from a shuffled deck of verbs, so a verb only comes back once every other
// verb in the pool has had a turn, and the same question is never asked twice
// in a row. Missed questions return a few questions later.

import type { Tense } from '../../data/conjugate'
import { conjugationOf, hasTense, type SpanishVerb } from '../../data/verbs'
import type { PracticeMode } from '../../types'
import type { Dialect } from '../../data/dialects'

export type Question =
  | { kind: 'meaning'; verb: SpanishVerb; dir: 'es-en' | 'en-es' }
  | { kind: 'conjugate'; verb: SpanishVerb; tense: Tense; person: number }

export const ALL_TENSES: Tense[] = [
  'present',
  'progressive',
  'preterite',
  'imperfect',
  'future',
  'conditional',
  'perfect',
  'imperative',
  'subjunctive',
  'impSubjunctive',
]

const key = (q?: Question) =>
  !q ? '' : q.kind === 'meaning' ? `m:${q.verb.infinitive}:${q.dir}` : `c:${q.verb.infinitive}:${q.tense}:${q.person}`

// Tenses worth drilling for a verb (no imperative for llover, haber…).
export function tensesFor(verb: SpanishVerb): Tense[] {
  return ALL_TENSES.filter((t) => hasTense(verb, t) && !(t === 'imperative' && verb.spec.only3))
}

// Which persons to ask about: it / they for gustar-type verbs, no yo in
// commands, and no vosotros in Latin American Spanish.
export function personsFor(verb: SpanishVerb, tense: Tense, dialect: Dialect = 'spain'): number[] {
  if (verb.spec.only3) return [2, 5]
  const all = tense === 'imperative' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5]
  return dialect === 'latam' ? all.filter((p) => p !== 4) : all
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Random pick that avoids `avoid` whenever there's another option.
function pick<T>(options: T[], avoid?: T): T {
  const rest = options.length > 1 ? options.filter((o) => o !== avoid) : options
  return rest[Math.floor(Math.random() * rest.length)]
}

// Verbs that can be asked in this mode.
export function usableVerbs(pool: SpanishVerb[], mode: PracticeMode): SpanishVerb[] {
  if (mode === 'basics' || mode === 'meaning' || mode === 'all') return pool
  return pool.filter((v) => tensesFor(v).includes(mode))
}

export class QuestionDeck {
  private order: SpanishVerb[] = []
  private retry: { q: Question; wait: number }[] = []
  private last?: Question
  private lastWasRetry = false

  constructor(
    private readonly pool: SpanishVerb[],
    private readonly mode: PracticeMode,
    private readonly dialect: Dialect = 'spain',
  ) {}

  get size() {
    return this.pool.length
  }

  next(): Question | null {
    if (!this.pool.length) return null
    // Never the same verb twice in a row, unless it's the only one.
    const fresh = (verb: SpanishVerb) => this.pool.length < 2 || verb !== this.last?.verb

    this.retry.forEach((r) => r.wait--)
    const due = this.retry.findIndex((r) => r.wait <= 0 && fresh(r.q.verb) && key(r.q) !== key(this.last))
    if (due >= 0) return this.remember(this.retry.splice(due, 1)[0].q, true)

    if (!this.order.length) this.order = shuffle(this.pool)
    let i = this.order.findIndex(fresh)
    if (i < 0) {
      // Only the last verb is left in this round: start the next round early
      // and save it for later.
      this.order.push(...shuffle(this.pool.filter((v) => v !== this.order[0])))
      i = this.order.findIndex(fresh)
    }
    return this.remember(this.build(this.order.splice(i, 1)[0]))
  }

  // Ask a missed question again after three others (once, so a run of
  // misses can't trap you on the same few questions).
  missed(q: Question) {
    if (this.lastWasRetry && key(q) === key(this.last)) return
    if (!this.retry.some((r) => key(r.q) === key(q))) this.retry.push({ q, wait: 3 })
  }

  private remember(q: Question, isRetry = false) {
    this.last = q
    this.lastWasRetry = isRetry
    return q
  }

  private build(verb: SpanishVerb): Question {
    const last = this.last
    const lastDir = last?.kind === 'meaning' ? last.dir : undefined
    const meaning = (): Question => ({
      kind: 'meaning',
      verb,
      // Flip direction when the same verb comes straight back (tiny pools).
      dir: last?.verb === verb && lastDir ? (lastDir === 'es-en' ? 'en-es' : 'es-en') : pick(['es-en', 'en-es'] as const),
    })
    const conjugate = (tense: Tense): Question => {
      const lastPerson = last?.kind === 'conjugate' && last.verb === verb && last.tense === tense ? last.person : undefined
      return { kind: 'conjugate', verb, tense, person: pick(personsFor(verb, tense, this.dialect), lastPerson) }
    }
    const lastTense = last?.kind === 'conjugate' ? last.tense : undefined

    switch (this.mode) {
      case 'meaning':
        return meaning()
      case 'basics':
        return Math.random() < 0.4 ? meaning() : conjugate('present')
      case 'all':
        return Math.random() < 0.15 ? meaning() : conjugate(pick(tensesFor(verb), lastTense))
      default:
        return conjugate(this.mode)
    }
  }
}

// ---------------- answer checking ----------------

const norm = (s: string) =>
  s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[¿?¡!.,;:"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
// Accent-insensitive (also ñ → n), so answers typed without a Spanish keyboard count.
const bare = (s: string) => norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '')

const PRONOUN_WORDS =
  /^(yo|tú|tu|él|el|ella|usted|ud|nosotros|nosotras|vosotros|vosotras|ellos|ellas|ustedes|uds)\s+/

export interface Result {
  ok: boolean
  exact: boolean // typed with all the right accents
  expected: string
}

export function expectedAnswer(q: Question): string {
  if (q.kind === 'meaning') return q.dir === 'es-en' ? q.verb.english : q.verb.infinitive
  return conjugationOf(q.verb).forms[q.tense][q.person]
}

// Other forms that are also right: the -se imperfect subjunctive, and vayamos.
function alternatives(q: Question, expected: string): string[] {
  if (q.kind !== 'conjugate') return []
  if (q.tense === 'impSubjunctive') return [expected.replace(/ra(mos|is|s|n)?$/, 'se$1')]
  if (q.tense === 'imperative' && q.verb.infinitive === 'ir' && q.person === 3) return ['vayamos']
  return []
}

// Accept any listed meaning, with or without "to", ignoring parentheticals.
function meanings(verb: SpanishVerb): string[] {
  return verb.english
    .split('/')
    .map((p) => bare(p.replace(/\(.*?\)/g, '')).replace(/^to\s+/, '').trim())
    .filter(Boolean)
}

export function checkAnswer(q: Question, answer: string): Result {
  const expected = expectedAnswer(q)
  if (q.kind === 'meaning') {
    if (q.dir === 'es-en') {
      const a = bare(answer).replace(/^to\s+/, '')
      return { ok: !!a && meanings(q.verb).includes(a), exact: true, expected }
    }
    const ok = bare(answer) === bare(expected)
    return { ok, exact: norm(answer) === norm(expected), expected }
  }
  const typed = norm(answer).replace(PRONOUN_WORDS, '')
  const accepted = [expected, ...alternatives(q, expected)]
  const ok = !!typed && accepted.some((a) => bare(a) === bare(typed))
  return { ok, exact: accepted.some((a) => norm(a) === typed), expected }
}
