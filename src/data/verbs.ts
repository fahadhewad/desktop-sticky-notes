// The 120 most common Spanish verbs, bundled locally (no API). Each verb has its
// present-indicative conjugations and an example sentence with a literal English
// translation. Conjugations are built with small helpers so the regular forms
// (and their accents) are generated correctly; only the irregular bits are
// spelled out by hand.

export interface SpanishVerb {
  infinitive: string
  english: string // primary meaning(s); "/" separates accepted alternatives
  present: string[] // [yo, tú, él/ella, nosotros, vosotros, ellos/ellas]
  example: { es: string; en: string } // en = literal-ish English
}

export const PRONOUNS = ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'] as const

// Regular present indicative.
const reg = (inf: string): string[] => {
  const s = inf.slice(0, -2)
  const e = inf.slice(-2)
  if (e === 'ar') return [s + 'o', s + 'as', s + 'a', s + 'amos', s + 'áis', s + 'an']
  if (e === 'er') return [s + 'o', s + 'es', s + 'e', s + 'emos', s + 'éis', s + 'en']
  return [s + 'o', s + 'es', s + 'e', s + 'imos', s + 'ís', s + 'en']
}

// Stem-changing "boot": override yo/tú/él/ellos; nosotros & vosotros stay regular.
const boot = (inf: string, b: [string, string, string, string]): string[] => {
  const r = reg(inf)
  return [b[0], b[1], b[2], r[3], r[4], b[3]]
}

// Regular except an irregular "yo" form (e.g. hago, pongo, conozco).
const yoIrr = (inf: string, yo: string): string[] => {
  const r = reg(inf)
  return [yo, r[1], r[2], r[3], r[4], r[5]]
}

export const VERBS: SpanishVerb[] = [
  { infinitive: 'ser', english: 'to be (permanent)', present: ['soy', 'eres', 'es', 'somos', 'sois', 'son'], example: { es: 'Yo soy estudiante.', en: 'I am (a) student.' } },
  { infinitive: 'estar', english: 'to be (state)', present: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'], example: { es: 'Estoy cansado.', en: 'I am tired.' } },
  { infinitive: 'tener', english: 'to have', present: boot('tener', ['tengo', 'tienes', 'tiene', 'tienen']), example: { es: 'Tengo dos hermanos.', en: 'I have two brothers.' } },
  { infinitive: 'hacer', english: 'to do / to make', present: yoIrr('hacer', 'hago'), example: { es: 'Hago la tarea.', en: 'I do the homework.' } },
  { infinitive: 'poder', english: 'to be able / can', present: boot('poder', ['puedo', 'puedes', 'puede', 'pueden']), example: { es: 'Puedo ayudarte.', en: 'I can help-you.' } },
  { infinitive: 'decir', english: 'to say / to tell', present: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'], example: { es: 'Digo la verdad.', en: 'I tell the truth.' } },
  { infinitive: 'ir', english: 'to go', present: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'], example: { es: 'Voy al mercado.', en: 'I go to-the market.' } },
  { infinitive: 'ver', english: 'to see / to watch', present: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'], example: { es: 'Veo la televisión.', en: 'I watch the television.' } },
  { infinitive: 'dar', english: 'to give', present: ['doy', 'das', 'da', 'damos', 'dais', 'dan'], example: { es: 'Te doy un regalo.', en: 'To-you I-give a gift.' } },
  { infinitive: 'saber', english: 'to know (facts)', present: yoIrr('saber', 'sé'), example: { es: 'Sé la respuesta.', en: 'I know the answer.' } },
  { infinitive: 'querer', english: 'to want / to love', present: boot('querer', ['quiero', 'quieres', 'quiere', 'quieren']), example: { es: 'Quiero un café.', en: 'I want a coffee.' } },
  { infinitive: 'llegar', english: 'to arrive', present: reg('llegar'), example: { es: 'Llego tarde.', en: 'I arrive late.' } },
  { infinitive: 'pasar', english: 'to pass / to happen', present: reg('pasar'), example: { es: 'Paso por tu casa.', en: 'I pass by your house.' } },
  { infinitive: 'deber', english: 'to must / to owe', present: reg('deber'), example: { es: 'Debo estudiar.', en: 'I must study.' } },
  { infinitive: 'poner', english: 'to put / to place', present: yoIrr('poner', 'pongo'), example: { es: 'Pongo la mesa.', en: 'I set the table.' } },
  { infinitive: 'parecer', english: 'to seem', present: yoIrr('parecer', 'parezco'), example: { es: 'Pareces cansado.', en: 'You seem tired.' } },
  { infinitive: 'quedar', english: 'to stay / to remain', present: reg('quedar'), example: { es: 'Quedo en casa.', en: 'I stay at home.' } },
  { infinitive: 'creer', english: 'to believe / to think', present: reg('creer'), example: { es: 'Creo en ti.', en: 'I believe in you.' } },
  { infinitive: 'hablar', english: 'to speak / to talk', present: reg('hablar'), example: { es: 'Hablo español.', en: 'I speak Spanish.' } },
  { infinitive: 'llevar', english: 'to carry / to wear', present: reg('llevar'), example: { es: 'Llevo una maleta.', en: 'I carry a suitcase.' } },
  { infinitive: 'dejar', english: 'to leave / to let', present: reg('dejar'), example: { es: 'Dejo las llaves aquí.', en: 'I leave the keys here.' } },
  { infinitive: 'seguir', english: 'to follow / to continue', present: boot('seguir', ['sigo', 'sigues', 'sigue', 'siguen']), example: { es: 'Sigo el camino.', en: 'I follow the path.' } },
  { infinitive: 'encontrar', english: 'to find', present: boot('encontrar', ['encuentro', 'encuentras', 'encuentra', 'encuentran']), example: { es: 'Encuentro mi libro.', en: 'I find my book.' } },
  { infinitive: 'llamar', english: 'to call', present: reg('llamar'), example: { es: 'Llamo a mi madre.', en: 'I call (to) my mother.' } },
  { infinitive: 'venir', english: 'to come', present: boot('venir', ['vengo', 'vienes', 'viene', 'vienen']), example: { es: 'Vengo de Madrid.', en: 'I come from Madrid.' } },
  { infinitive: 'pensar', english: 'to think', present: boot('pensar', ['pienso', 'piensas', 'piensa', 'piensan']), example: { es: 'Pienso en ti.', en: 'I think about you.' } },
  { infinitive: 'salir', english: 'to leave / to go out', present: yoIrr('salir', 'salgo'), example: { es: 'Salgo de casa.', en: 'I leave (from) home.' } },
  { infinitive: 'volver', english: 'to return / to come back', present: boot('volver', ['vuelvo', 'vuelves', 'vuelve', 'vuelven']), example: { es: 'Vuelvo a casa.', en: 'I return home.' } },
  { infinitive: 'tomar', english: 'to take / to drink', present: reg('tomar'), example: { es: 'Tomo un café.', en: 'I drink a coffee.' } },
  { infinitive: 'conocer', english: 'to know (people/places)', present: yoIrr('conocer', 'conozco'), example: { es: 'Conozco la ciudad.', en: 'I know the city.' } },
  { infinitive: 'vivir', english: 'to live', present: reg('vivir'), example: { es: 'Vivo en España.', en: 'I live in Spain.' } },
  { infinitive: 'sentir', english: 'to feel', present: boot('sentir', ['siento', 'sientes', 'siente', 'sienten']), example: { es: 'Siento frío.', en: 'I feel cold.' } },
  { infinitive: 'tratar', english: 'to try / to treat', present: reg('tratar'), example: { es: 'Trato de aprender.', en: 'I try to learn.' } },
  { infinitive: 'mirar', english: 'to look / to watch', present: reg('mirar'), example: { es: 'Miro la luna.', en: 'I look-at the moon.' } },
  { infinitive: 'contar', english: 'to count / to tell', present: boot('contar', ['cuento', 'cuentas', 'cuenta', 'cuentan']), example: { es: 'Cuento hasta diez.', en: 'I count to ten.' } },
  { infinitive: 'empezar', english: 'to begin / to start', present: boot('empezar', ['empiezo', 'empiezas', 'empieza', 'empiezan']), example: { es: 'Empiezo a trabajar.', en: 'I begin to work.' } },
  { infinitive: 'esperar', english: 'to wait / to hope', present: reg('esperar'), example: { es: 'Espero el autobús.', en: 'I wait-for the bus.' } },
  { infinitive: 'buscar', english: 'to look for / to search', present: reg('buscar'), example: { es: 'Busco mis gafas.', en: 'I look-for my glasses.' } },
  { infinitive: 'existir', english: 'to exist', present: reg('existir'), example: { es: 'Existe un problema.', en: 'A problem exists.' } },
  { infinitive: 'entrar', english: 'to enter / to go in', present: reg('entrar'), example: { es: 'Entro en la casa.', en: 'I enter (in) the house.' } },
  { infinitive: 'trabajar', english: 'to work', present: reg('trabajar'), example: { es: 'Trabajo en una oficina.', en: 'I work in an office.' } },
  { infinitive: 'escribir', english: 'to write', present: reg('escribir'), example: { es: 'Escribo una carta.', en: 'I write a letter.' } },
  { infinitive: 'perder', english: 'to lose / to miss', present: boot('perder', ['pierdo', 'pierdes', 'pierde', 'pierden']), example: { es: 'Pierdo el tren.', en: 'I miss the train.' } },
  { infinitive: 'producir', english: 'to produce', present: yoIrr('producir', 'produzco'), example: { es: 'La fábrica produce coches.', en: 'The factory produces cars.' } },
  { infinitive: 'ocurrir', english: 'to occur / to happen', present: reg('ocurrir'), example: { es: '¿Qué ocurre?', en: 'What occurs / happens?' } },
  { infinitive: 'entender', english: 'to understand', present: boot('entender', ['entiendo', 'entiendes', 'entiende', 'entienden']), example: { es: 'Entiendo la lección.', en: 'I understand the lesson.' } },
  { infinitive: 'pedir', english: 'to ask for / to order', present: boot('pedir', ['pido', 'pides', 'pide', 'piden']), example: { es: 'Pido la cuenta.', en: 'I ask-for the bill.' } },
  { infinitive: 'recibir', english: 'to receive', present: reg('recibir'), example: { es: 'Recibo un correo.', en: 'I receive an email.' } },
  { infinitive: 'recordar', english: 'to remember', present: boot('recordar', ['recuerdo', 'recuerdas', 'recuerda', 'recuerdan']), example: { es: 'Recuerdo tu nombre.', en: 'I remember your name.' } },
  { infinitive: 'terminar', english: 'to finish / to end', present: reg('terminar'), example: { es: 'Termino el trabajo.', en: 'I finish the work.' } },
  { infinitive: 'permitir', english: 'to allow / to permit', present: reg('permitir'), example: { es: 'Te permito salir.', en: 'To-you I-allow to-leave.' } },
  { infinitive: 'aparecer', english: 'to appear', present: yoIrr('aparecer', 'aparezco'), example: { es: 'Apareces en la foto.', en: 'You appear in the photo.' } },
  { infinitive: 'conseguir', english: 'to get / to achieve', present: boot('conseguir', ['consigo', 'consigues', 'consigue', 'consiguen']), example: { es: 'Consigo un trabajo.', en: 'I get a job.' } },
  { infinitive: 'comenzar', english: 'to begin / to start', present: boot('comenzar', ['comienzo', 'comienzas', 'comienza', 'comienzan']), example: { es: 'Comienzo la clase.', en: 'I begin the class.' } },
  { infinitive: 'servir', english: 'to serve', present: boot('servir', ['sirvo', 'sirves', 'sirve', 'sirven']), example: { es: 'Sirvo la comida.', en: 'I serve the food.' } },
  { infinitive: 'sacar', english: 'to take out / to get', present: reg('sacar'), example: { es: 'Saco la basura.', en: 'I take-out the trash.' } },
  { infinitive: 'necesitar', english: 'to need', present: reg('necesitar'), example: { es: 'Necesito ayuda.', en: 'I need help.' } },
  { infinitive: 'mantener', english: 'to maintain / to keep', present: boot('mantener', ['mantengo', 'mantienes', 'mantiene', 'mantienen']), example: { es: 'Mantengo la calma.', en: 'I keep (the) calm.' } },
  { infinitive: 'resultar', english: 'to turn out / to result', present: reg('resultar'), example: { es: 'Resulta difícil.', en: 'It turns-out difficult.' } },
  { infinitive: 'leer', english: 'to read', present: reg('leer'), example: { es: 'Leo un libro.', en: 'I read a book.' } },
  { infinitive: 'caer', english: 'to fall', present: yoIrr('caer', 'caigo'), example: { es: 'Caigo al suelo.', en: 'I fall to-the floor.' } },
  { infinitive: 'cambiar', english: 'to change', present: reg('cambiar'), example: { es: 'Cambio de opinión.', en: 'I change (my) opinion.' } },
  { infinitive: 'presentar', english: 'to present / to introduce', present: reg('presentar'), example: { es: 'Te presento a Ana.', en: 'To-you I-introduce Ana.' } },
  { infinitive: 'crear', english: 'to create', present: reg('crear'), example: { es: 'Creo una empresa.', en: 'I create a company.' } },
  { infinitive: 'abrir', english: 'to open', present: reg('abrir'), example: { es: 'Abro la puerta.', en: 'I open the door.' } },
  { infinitive: 'considerar', english: 'to consider', present: reg('considerar'), example: { es: 'Considero la idea.', en: 'I consider the idea.' } },
  { infinitive: 'oír', english: 'to hear', present: ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'], example: { es: 'Oigo música.', en: 'I hear music.' } },
  { infinitive: 'acabar', english: 'to finish / to end up', present: reg('acabar'), example: { es: 'Acabo el examen.', en: 'I finish the exam.' } },
  { infinitive: 'convertir', english: 'to convert / to turn into', present: boot('convertir', ['convierto', 'conviertes', 'convierte', 'convierten']), example: { es: 'Convierto euros a dólares.', en: 'I convert euros to dollars.' } },
  { infinitive: 'ganar', english: 'to win / to earn', present: reg('ganar'), example: { es: 'Gano el partido.', en: 'I win the match.' } },
  { infinitive: 'formar', english: 'to form', present: reg('formar'), example: { es: 'Formo parte del equipo.', en: 'I form part of-the team.' } },
  { infinitive: 'traer', english: 'to bring', present: yoIrr('traer', 'traigo'), example: { es: 'Traigo el postre.', en: 'I bring the dessert.' } },
  { infinitive: 'partir', english: 'to leave / to split', present: reg('partir'), example: { es: 'Parto el pan.', en: 'I split the bread.' } },
  { infinitive: 'morir', english: 'to die', present: boot('morir', ['muero', 'mueres', 'muere', 'mueren']), example: { es: 'La planta muere.', en: 'The plant dies.' } },
  { infinitive: 'aceptar', english: 'to accept', present: reg('aceptar'), example: { es: 'Acepto la oferta.', en: 'I accept the offer.' } },
  { infinitive: 'realizar', english: 'to carry out / to achieve', present: reg('realizar'), example: { es: 'Realizo un proyecto.', en: 'I carry-out a project.' } },
  { infinitive: 'suponer', english: 'to suppose', present: yoIrr('suponer', 'supongo'), example: { es: 'Supongo que sí.', en: 'I suppose (that) yes.' } },
  { infinitive: 'comprender', english: 'to understand', present: reg('comprender'), example: { es: 'Comprendo el problema.', en: 'I understand the problem.' } },
  { infinitive: 'lograr', english: 'to achieve / to manage', present: reg('lograr'), example: { es: 'Logro mi objetivo.', en: 'I achieve my goal.' } },
  { infinitive: 'explicar', english: 'to explain', present: reg('explicar'), example: { es: 'Explico la regla.', en: 'I explain the rule.' } },
  { infinitive: 'preguntar', english: 'to ask', present: reg('preguntar'), example: { es: 'Pregunto la hora.', en: 'I ask (for) the time.' } },
  { infinitive: 'tocar', english: 'to touch / to play (music)', present: reg('tocar'), example: { es: 'Toco la guitarra.', en: 'I play the guitar.' } },
  { infinitive: 'reconocer', english: 'to recognize', present: yoIrr('reconocer', 'reconozco'), example: { es: 'Reconozco tu voz.', en: 'I recognize your voice.' } },
  { infinitive: 'estudiar', english: 'to study', present: reg('estudiar'), example: { es: 'Estudio medicina.', en: 'I study medicine.' } },
  { infinitive: 'alcanzar', english: 'to reach', present: reg('alcanzar'), example: { es: 'Alcanzo la cima.', en: 'I reach the summit.' } },
  { infinitive: 'nacer', english: 'to be born', present: yoIrr('nacer', 'nazco'), example: { es: 'Nace un bebé.', en: 'A baby is-born.' } },
  { infinitive: 'dirigir', english: 'to direct / to lead', present: yoIrr('dirigir', 'dirijo'), example: { es: 'Dirijo la empresa.', en: 'I run the company.' } },
  { infinitive: 'correr', english: 'to run', present: reg('correr'), example: { es: 'Corro en el parque.', en: 'I run in the park.' } },
  { infinitive: 'utilizar', english: 'to use', present: reg('utilizar'), example: { es: 'Utilizo una herramienta.', en: 'I use a tool.' } },
  { infinitive: 'pagar', english: 'to pay', present: reg('pagar'), example: { es: 'Pago la cuenta.', en: 'I pay the bill.' } },
  { infinitive: 'ayudar', english: 'to help', present: reg('ayudar'), example: { es: 'Ayudo a mi amigo.', en: 'I help my friend.' } },
  { infinitive: 'gustar', english: 'to like (lit. to please)', present: reg('gustar'), example: { es: 'Me gusta el café.', en: 'To-me pleases the coffee.' } },
  { infinitive: 'jugar', english: 'to play (games)', present: boot('jugar', ['juego', 'juegas', 'juega', 'juegan']), example: { es: 'Juego al fútbol.', en: 'I play football.' } },
  { infinitive: 'escuchar', english: 'to listen', present: reg('escuchar'), example: { es: 'Escucho música.', en: 'I listen-to music.' } },
  { infinitive: 'cumplir', english: 'to fulfill / to comply', present: reg('cumplir'), example: { es: 'Cumplo mi promesa.', en: 'I fulfill my promise.' } },
  { infinitive: 'ofrecer', english: 'to offer', present: yoIrr('ofrecer', 'ofrezco'), example: { es: 'Ofrezco mi ayuda.', en: 'I offer my help.' } },
  { infinitive: 'descubrir', english: 'to discover', present: reg('descubrir'), example: { es: 'Descubro un secreto.', en: 'I discover a secret.' } },
  { infinitive: 'levantar', english: 'to lift / to raise', present: reg('levantar'), example: { es: 'Levanto la mano.', en: 'I raise (my) hand.' } },
  { infinitive: 'intentar', english: 'to try / to attempt', present: reg('intentar'), example: { es: 'Intento abrirlo.', en: 'I try to-open-it.' } },
  { infinitive: 'usar', english: 'to use', present: reg('usar'), example: { es: 'Uso el ordenador.', en: 'I use the computer.' } },
  { infinitive: 'decidir', english: 'to decide', present: reg('decidir'), example: { es: 'Decido quedarme.', en: 'I decide to-stay.' } },
  { infinitive: 'repetir', english: 'to repeat', present: boot('repetir', ['repito', 'repites', 'repite', 'repiten']), example: { es: 'Repito la frase.', en: 'I repeat the sentence.' } },
  { infinitive: 'olvidar', english: 'to forget', present: reg('olvidar'), example: { es: 'Olvido las llaves.', en: 'I forget the keys.' } },
  { infinitive: 'comer', english: 'to eat', present: reg('comer'), example: { es: 'Como una manzana.', en: 'I eat an apple.' } },
  { infinitive: 'beber', english: 'to drink', present: reg('beber'), example: { es: 'Bebo agua.', en: 'I drink water.' } },
  { infinitive: 'comprar', english: 'to buy', present: reg('comprar'), example: { es: 'Compro pan.', en: 'I buy bread.' } },
  { infinitive: 'subir', english: 'to go up / to climb', present: reg('subir'), example: { es: 'Subo las escaleras.', en: 'I go-up the stairs.' } },
  { infinitive: 'bajar', english: 'to go down / to lower', present: reg('bajar'), example: { es: 'Bajo la música.', en: 'I lower the music.' } },
  { infinitive: 'enviar', english: 'to send', present: ['envío', 'envías', 'envía', 'enviamos', 'enviáis', 'envían'], example: { es: 'Envío un mensaje.', en: 'I send a message.' } },
  { infinitive: 'viajar', english: 'to travel', present: reg('viajar'), example: { es: 'Viajo a México.', en: 'I travel to Mexico.' } },
  { infinitive: 'cantar', english: 'to sing', present: reg('cantar'), example: { es: 'Canto una canción.', en: 'I sing a song.' } },
  { infinitive: 'bailar', english: 'to dance', present: reg('bailar'), example: { es: 'Bailo salsa.', en: 'I dance salsa.' } },
  { infinitive: 'cocinar', english: 'to cook', present: reg('cocinar'), example: { es: 'Cocino la cena.', en: 'I cook the dinner.' } },
  { infinitive: 'dormir', english: 'to sleep', present: boot('dormir', ['duermo', 'duermes', 'duerme', 'duermen']), example: { es: 'Duermo ocho horas.', en: 'I sleep eight hours.' } },
  { infinitive: 'despertar', english: 'to wake up', present: boot('despertar', ['despierto', 'despiertas', 'despierta', 'despiertan']), example: { es: 'Despierto temprano.', en: 'I wake-up early.' } },
  { infinitive: 'preferir', english: 'to prefer', present: boot('preferir', ['prefiero', 'prefieres', 'prefiere', 'prefieren']), example: { es: 'Prefiero el té.', en: 'I prefer tea.' } },
  { infinitive: 'abrazar', english: 'to hug', present: reg('abrazar'), example: { es: 'Abrazo a mi amiga.', en: 'I hug my friend.' } },
  { infinitive: 'enseñar', english: 'to teach / to show', present: reg('enseñar'), example: { es: 'Enseño inglés.', en: 'I teach English.' } },
  { infinitive: 'limpiar', english: 'to clean', present: reg('limpiar'), example: { es: 'Limpio la cocina.', en: 'I clean the kitchen.' } },
  { infinitive: 'caminar', english: 'to walk', present: reg('caminar'), example: { es: 'Camino al trabajo.', en: 'I walk to work.' } },
]
