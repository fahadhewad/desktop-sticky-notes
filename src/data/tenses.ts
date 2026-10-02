// Short lessons for each tense the trainer teaches, in the order a learner
// usually meets them. Conjugation tables in the lesson view are generated from
// ./conjugate.ts, so the content here is only the explanation.

import type { Tense } from './conjugate'

export interface TenseLesson {
  id: Tense
  name: string
  spanish: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  summary: string
  uses: { text: string; es: string; en: string }[] // when to use it, each with an example
  formation: string
  endings?: { label: string; forms: string[] }[] // endings table, one column per verb group
  irregulars: string
  tip?: string
  examples: { es: string; en: string }[]
  keyVerbs: string[] // irregular verbs worth learning first in this tense
}

export const TENSES: TenseLesson[] = [
  {
    id: 'present',
    name: 'Present',
    spanish: 'Presente',
    level: 'Beginner',
    summary: 'What happens now, habits, facts and near plans.',
    uses: [
      { text: 'Something happening now', es: 'Como una manzana.', en: 'I eat / am eating an apple.' },
      { text: 'Habits and routines', es: 'Trabajo los lunes.', en: 'I work on Mondays.' },
      { text: 'Facts and general truths', es: 'El agua hierve a cien grados.', en: 'Water boils at a hundred degrees.' },
      { text: 'Fixed plans in the near future', es: 'Mañana viajo a Madrid.', en: "Tomorrow I'm travelling to Madrid." },
    ],
    formation: 'Drop the -ar, -er or -ir from the infinitive and add the ending for the person.',
    endings: [
      { label: '-ar', forms: ['-o', '-as', '-a', '-amos', '-áis', '-an'] },
      { label: '-er', forms: ['-o', '-es', '-e', '-emos', '-éis', '-en'] },
      { label: '-ir', forms: ['-o', '-es', '-e', '-imos', '-ís', '-en'] },
    ],
    irregulars:
      'Stem-changing verbs change in every form except nosotros and vosotros (pienso, puedo, pido, but pensamos). Some verbs are only irregular in the yo form (hago, tengo, salgo, conozco), and a few are irregular throughout (soy, estoy, voy, he).',
    examples: [
      { es: 'Vivo en Londres.', en: 'I live in London.' },
      { es: 'Ella habla tres idiomas.', en: 'She speaks three languages.' },
      { es: '¿Qué haces los sábados?', en: 'What do you do on Saturdays?' },
    ],
    keyVerbs: ['ser', 'estar', 'ir', 'tener', 'hacer', 'poder', 'querer', 'decir'],
  },
  {
    id: 'progressive',
    name: 'Present progressive',
    spanish: 'Presente continuo',
    level: 'Beginner',
    summary: 'What is happening right at this moment.',
    uses: [
      { text: 'An action in progress right now', es: 'Estoy leyendo un libro.', en: 'I am reading a book.' },
      { text: 'A temporary situation', es: 'Estamos trabajando mucho estos días.', en: 'We are working a lot these days.' },
    ],
    formation:
      'Use estar in the present (estoy, estás, está, estamos, estáis, están) plus the gerund: -ar verbs take -ando, -er and -ir verbs take -iendo.',
    endings: [
      { label: '-ar', forms: ['estoy -ando', 'estás -ando', 'está -ando', 'estamos -ando', 'estáis -ando', 'están -ando'] },
      { label: '-er / -ir', forms: ['estoy -iendo', 'estás -iendo', 'está -iendo', 'estamos -iendo', 'estáis -iendo', 'están -iendo'] },
    ],
    irregulars:
      '-ir stem changers also change in the gerund (durmiendo, pidiendo, sintiendo, diciendo). When the stem ends in a vowel the ending is -yendo (leyendo, oyendo, cayendo, construyendo). Also: ir → yendo, poder → pudiendo.',
    tip: 'Spanish uses this less than English. For habits and plans, the simple present is usually better: Trabajo los lunes, not Estoy trabajando los lunes.',
    examples: [
      { es: 'Estoy cocinando la cena.', en: "I'm cooking dinner." },
      { es: '¿Qué estás haciendo?', en: 'What are you doing?' },
      { es: 'Están viendo una película.', en: "They're watching a film." },
    ],
    keyVerbs: ['decir', 'dormir', 'pedir', 'leer', 'ir', 'oír'],
  },
  {
    id: 'preterite',
    name: 'Preterite',
    spanish: 'Pretérito indefinido',
    level: 'Intermediate',
    summary: 'Finished actions at a specific point in the past.',
    uses: [
      { text: 'A completed, one-off action', es: 'Ayer comí paella.', en: 'Yesterday I ate paella.' },
      { text: 'An action with a clear beginning and end', es: 'Viví en Roma dos años.', en: 'I lived in Rome for two years.' },
      { text: 'A sequence of events', es: 'Llegué, cené y salí.', en: 'I arrived, had dinner and went out.' },
      { text: 'Something that interrupts a background action', es: 'Leía cuando sonó el teléfono.', en: 'I was reading when the phone rang.' },
    ],
    formation: 'Drop the -ar, -er or -ir and add the preterite ending. -er and -ir verbs share the same endings.',
    endings: [
      { label: '-ar', forms: ['-é', '-aste', '-ó', '-amos', '-asteis', '-aron'] },
      { label: '-er / -ir', forms: ['-í', '-iste', '-ió', '-imos', '-isteis', '-ieron'] },
      { label: 'irregular stem', forms: ['-e', '-iste', '-o', '-imos', '-isteis', '-ieron'] },
    ],
    irregulars:
      'Many common verbs use a special stem with unstressed endings: tuve, estuve, anduve, hice, puse, pude, supe, quise, vine. Stems ending in j drop the i in ellos (dijeron, trajeron, condujeron). Ser and ir share the same forms (fui, fue, fueron). -ir stem changers change only in él and ellos (pidió, durmieron). Watch the spelling in yo: busqué, llegué, empecé.',
    tip: 'The preterite tells you what happened. The imperfect sets the scene around it.',
    examples: [
      { es: 'Ayer fui al cine.', en: 'Yesterday I went to the cinema.' },
      { es: '¿Qué hiciste el fin de semana?', en: 'What did you do at the weekend?' },
      { es: 'Ellos llegaron tarde.', en: 'They arrived late.' },
    ],
    keyVerbs: ['ser', 'ir', 'estar', 'tener', 'hacer', 'decir', 'poder', 'venir'],
  },
  {
    id: 'imperfect',
    name: 'Imperfect',
    spanish: 'Pretérito imperfecto',
    level: 'Intermediate',
    summary: 'Habits, descriptions and background in the past.',
    uses: [
      { text: 'What used to happen', es: 'De niño jugaba al fútbol.', en: 'As a child I used to play football.' },
      { text: 'Descriptions and background', es: 'Hacía sol y la casa era grande.', en: 'It was sunny and the house was big.' },
      { text: 'An ongoing action that got interrupted', es: 'Dormía cuando llamaste.', en: 'I was sleeping when you called.' },
      { text: 'Time and age in the past', es: 'Eran las tres y tenía diez años.', en: 'It was three o’clock and I was ten.' },
    ],
    formation: 'Drop the -ar, -er or -ir and add the ending. -er and -ir verbs share the same endings.',
    endings: [
      { label: '-ar', forms: ['-aba', '-abas', '-aba', '-ábamos', '-abais', '-aban'] },
      { label: '-er / -ir', forms: ['-ía', '-ías', '-ía', '-íamos', '-íais', '-ían'] },
    ],
    irregulars: 'The easiest past tense: only three verbs are irregular, ser (era), ir (iba) and ver (veía), and there are no stem changes.',
    tip: 'If you could say "used to" or "was …ing" in English, you probably want the imperfect.',
    examples: [
      { es: 'Cuando era pequeño, vivía en el campo.', en: 'When I was little, I lived in the countryside.' },
      { es: 'Siempre íbamos a la playa en verano.', en: 'We always used to go to the beach in summer.' },
      { es: 'Llovía mucho.', en: 'It was raining a lot.' },
    ],
    keyVerbs: ['ser', 'ir', 'ver'],
  },
  {
    id: 'future',
    name: 'Future',
    spanish: 'Futuro simple',
    level: 'Intermediate',
    summary: 'What will happen, and guesses about the present.',
    uses: [
      { text: 'Future events and predictions', es: 'Mañana lloverá.', en: 'Tomorrow it will rain.' },
      { text: 'Promises', es: 'Te llamaré esta noche.', en: 'I will call you tonight.' },
      { text: 'Guessing about the present', es: '¿Dónde estará Ana?', en: 'I wonder where Ana is.' },
    ],
    formation: 'Add the ending to the whole infinitive. The endings are the same for -ar, -er and -ir verbs.',
    endings: [{ label: 'all verbs', forms: ['-é', '-ás', '-á', '-emos', '-éis', '-án'] }],
    irregulars:
      'About a dozen common verbs use a shortened stem with the same endings: tendr-, vendr-, pondr-, saldr-, valdr-, podr-, sabr-, cabr-, habr-, querr-, dir-, har- (and their compounds, like mantendré).',
    tip: 'In everyday speech, ir a + infinitive is very common for plans: Voy a comer.',
    examples: [
      { es: 'El año que viene viajaré a México.', en: 'Next year I will travel to Mexico.' },
      { es: '¿Vendrás a la fiesta?', en: 'Will you come to the party?' },
      { es: 'Lo haremos mañana.', en: 'We will do it tomorrow.' },
    ],
    keyVerbs: ['tener', 'hacer', 'decir', 'poder', 'salir', 'venir', 'poner', 'saber'],
  },
  {
    id: 'conditional',
    name: 'Conditional',
    spanish: 'Condicional',
    level: 'Intermediate',
    summary: 'What would happen.',
    uses: [
      { text: 'Hypothetical situations', es: 'Con más dinero, compraría una casa.', en: 'With more money, I would buy a house.' },
      { text: 'Polite requests', es: '¿Podrías ayudarme?', en: 'Could you help me?' },
      { text: 'Advice', es: 'Yo que tú, estudiaría más.', en: 'If I were you, I would study more.' },
      { text: 'The future seen from the past', es: 'Dijo que vendría.', en: 'He said he would come.' },
    ],
    formation: 'Add the ending to the whole infinitive, just like the future. The endings are the same for every verb.',
    endings: [{ label: 'all verbs', forms: ['-ía', '-ías', '-ía', '-íamos', '-íais', '-ían'] }],
    irregulars: 'It uses exactly the same shortened stems as the future: tendría, haría, diría, podría, saldría, vendría, sabría, querría.',
    examples: [
      { es: 'Me gustaría un café.', en: 'I would like a coffee.' },
      { es: '¿Qué harías tú?', en: 'What would you do?' },
      { es: 'Sería genial.', en: 'It would be great.' },
    ],
    keyVerbs: ['tener', 'hacer', 'decir', 'poder', 'querer', 'saber'],
  },
  {
    id: 'perfect',
    name: 'Present perfect',
    spanish: 'Pretérito perfecto',
    level: 'Intermediate',
    summary: 'What has happened, recently or up to now.',
    uses: [
      { text: 'The recent past (today, this week)', es: 'Hoy he comido pasta.', en: 'Today I have eaten pasta.' },
      { text: 'Life experiences', es: '¿Has estado en Japón?', en: 'Have you been to Japan?' },
      { text: 'Things not done yet', es: 'Todavía no he terminado.', en: "I haven't finished yet." },
    ],
    formation:
      'Use haber in the present (he, has, ha, hemos, habéis, han) plus the past participle: -ar verbs take -ado, -er and -ir verbs take -ido.',
    endings: [
      { label: '-ar', forms: ['he -ado', 'has -ado', 'ha -ado', 'hemos -ado', 'habéis -ado', 'han -ado'] },
      { label: '-er / -ir', forms: ['he -ido', 'has -ido', 'ha -ido', 'hemos -ido', 'habéis -ido', 'han -ido'] },
    ],
    irregulars:
      'Learn these participles by heart: hecho (hacer), dicho (decir), visto (ver), puesto (poner), escrito (escribir), vuelto (volver), abierto (abrir), roto (romper), muerto (morir), cubierto (cubrir), resuelto (resolver).',
    tip: 'In much of Latin America the preterite is used instead: Hoy comí pasta.',
    examples: [
      { es: 'He perdido las llaves.', en: 'I have lost the keys.' },
      { es: '¿Has visto mis llaves?', en: 'Have you seen my keys?' },
      { es: 'Nunca hemos ido a París.', en: 'We have never been to Paris.' },
    ],
    keyVerbs: ['hacer', 'decir', 'ver', 'poner', 'escribir', 'volver', 'abrir', 'romper'],
  },
  {
    id: 'imperative',
    name: 'Imperative',
    spanish: 'Imperativo',
    level: 'Intermediate',
    summary: 'Commands, instructions and invitations.',
    uses: [
      { text: 'Instructions', es: 'Gira a la derecha.', en: 'Turn right.' },
      { text: 'Advice', es: 'Bebe más agua.', en: 'Drink more water.' },
      { text: 'Invitations', es: 'Pasa y come algo.', en: 'Come in and eat something.' },
    ],
    formation:
      'Tú uses the él form of the present (habla, come, vive). Usted, nosotros and ustedes borrow the present subjunctive (hable, hablemos, hablen). Vosotros swaps the final -r of the infinitive for -d (hablad, comed, vivid).',
    endings: [
      { label: '-ar', forms: ['', '-a', '-e', '-emos', '-ad', '-en'] },
      { label: '-er', forms: ['', '-e', '-a', '-amos', '-ed', '-an'] },
      { label: '-ir', forms: ['', '-e', '-a', '-amos', '-id', '-an'] },
    ],
    irregulars: 'Eight short tú commands to memorise: di (decir), haz (hacer), ve (ir), pon (poner), sal (salir), sé (ser), ten (tener), ven (venir).',
    tip: 'Negative commands always use the subjunctive: no hables, no comas, no vengan.',
    examples: [
      { es: 'Abre la ventana, por favor.', en: 'Open the window, please.' },
      { es: 'Hablen más despacio.', en: 'Speak more slowly (you all).' },
      { es: '¡Vamos a la playa!', en: "Let's go to the beach!" },
    ],
    keyVerbs: ['decir', 'hacer', 'ir', 'poner', 'salir', 'ser', 'tener', 'venir'],
  },
  {
    id: 'subjunctive',
    name: 'Present subjunctive',
    spanish: 'Presente de subjuntivo',
    level: 'Advanced',
    summary: 'Wishes, doubts, feelings and requests.',
    uses: [
      { text: 'Wanting or asking someone else to do something', es: 'Quiero que vengas.', en: 'I want you to come.' },
      { text: 'Emotions about something', es: 'Me alegra que estés aquí.', en: "I'm glad you're here." },
      { text: 'Doubt and denial', es: 'No creo que llueva.', en: "I don't think it will rain." },
      { text: 'Future time after cuando', es: 'Cuando llegues, llámame.', en: 'When you arrive, call me.' },
      { text: 'After ojalá, para que, es importante que…', es: 'Ojalá haga sol.', en: 'Hopefully it will be sunny.' },
    ],
    formation:
      'Take the yo form of the present, drop the -o and add the "opposite" endings: -ar verbs use e endings, -er and -ir verbs use a endings.',
    endings: [
      { label: '-ar', forms: ['-e', '-es', '-e', '-emos', '-éis', '-en'] },
      { label: '-er / -ir', forms: ['-a', '-as', '-a', '-amos', '-áis', '-an'] },
    ],
    irregulars:
      'Because it starts from the yo form, irregular yo forms carry over (tengo → tenga, hago → haga, conozco → conozca). Only six verbs break the rule: ser (sea), estar (esté), ir (vaya), haber (haya), saber (sepa), dar (dé).',
    tip: 'The usual trigger is "que" after a verb of wanting, feeling or doubting, with a different subject: Quiero que (tú) vengas.',
    examples: [
      { es: 'Espero que tengas un buen día.', en: 'I hope you have a good day.' },
      { es: 'Es importante que estudies.', en: "It's important that you study." },
      { es: 'Te lo digo para que lo sepas.', en: "I'm telling you so that you know." },
    ],
    keyVerbs: ['ser', 'estar', 'ir', 'haber', 'saber', 'dar', 'tener', 'hacer'],
  },
  {
    id: 'impSubjunctive',
    name: 'Imperfect subjunctive',
    spanish: 'Imperfecto de subjuntivo',
    level: 'Advanced',
    summary: 'The subjunctive for the past, and for "if" clauses.',
    uses: [
      { text: 'Past wishes and requests', es: 'Quería que vinieras.', en: 'I wanted you to come.' },
      { text: 'Unlikely "if" clauses (with the conditional)', es: 'Si tuviera dinero, viajaría.', en: 'If I had money, I would travel.' },
      { text: 'Very polite requests', es: 'Quisiera un café.', en: 'I would like a coffee.' },
    ],
    formation:
      'Take the ellos form of the preterite, drop -ron and add -ra, -ras, -ra, -ramos, -rais, -ran. Nosotros gets an accent on the vowel before the ending (habláramos, comiéramos).',
    endings: [{ label: 'all verbs', forms: ['-ra', '-ras', '-ra', '-ramos', '-rais', '-ran'] }],
    irregulars:
      'Every preterite irregularity carries over: tuvieron → tuviera, fueron → fuera, dijeron → dijera, pidieron → pidiera, durmieron → durmiera.',
    tip: 'There is also a -se form (hablase, comiese), common in Spain. It means exactly the same, and practice accepts it too.',
    examples: [
      { es: 'Si fuera rico, compraría una isla.', en: 'If I were rich, I would buy an island.' },
      { es: 'Me pidió que lo ayudara.', en: 'He asked me to help him.' },
      { es: 'Ojalá pudiera ir.', en: 'I wish I could go.' },
    ],
    keyVerbs: ['ser', 'tener', 'hacer', 'decir', 'poder', 'estar'],
  },
]

export const tenseById = (id: Tense) => TENSES.find((t) => t.id === id)!
