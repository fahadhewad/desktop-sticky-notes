// Spain vs Latin American Spanish. The verb forms are the same; the big
// difference is "you all": Spain uses vosotros (informal) and ustedes
// (formal), Latin America uses ustedes for both, which takes the ellos form.
// A few everyday words differ too.

export type Dialect = 'spain' | 'latam'

export const DIALECT_LABEL: Record<Dialect, string> = { spain: 'Spain', latam: 'Latin America' }

// Subject pronouns in the order every conjugation array uses
// [yo, tú, él, nosotros, vosotros, ellos]. An empty label hides that person.
export const PRONOUN_LABELS: Record<Dialect, readonly string[]> = {
  spain: ['yo', 'tú', 'él / ella', 'nosotros', 'vosotros', 'ellos / ellas'],
  latam: ['yo', 'tú', 'él / ella / usted', 'nosotros', '', 'ellos / ustedes'],
}
export const IMPERATIVE_LABELS: Record<Dialect, readonly string[]> = {
  spain: ['', 'tú', 'usted', 'nosotros', 'vosotros', 'ustedes'],
  latam: ['', 'tú', 'usted', 'nosotros', '', 'ustedes'],
}

export const LESSON_NOTE: Record<Dialect, string | null> = {
  spain: null,
  latam:
    'Latin America doesn’t use vosotros. For “you all”, use ustedes, which always takes the ellos form (ustedes hablan, ustedes comieron), so the tables here leave vosotros out.',
}

// Words used differently on each side of the Atlantic.
export const WORD_NOTES: Record<string, Partial<Record<Dialect, string>>> = {
  coger: { latam: 'Careful: vulgar in much of Latin America. Use tomar or agarrar instead.' },
  conducir: { latam: 'Most of Latin America says manejar for driving.' },
  manejar: { spain: 'In Spain, conducir is the usual word for driving.' },
  enfadar: { latam: 'Latin America usually says enojar.' },
  enojar: { spain: 'Spain usually says enfadar.' },
  extrañar: { spain: 'Spain often says echar de menos.' },
  alquilar: { latam: 'In Mexico, rentar is common too.' },
  charlar: { latam: 'In Mexico, platicar is common.' },
  tirar: { latam: 'Botar is also common for throwing things away.' },
}

// Example sentences that use Spain-only words get a Latin American version.
export const LATAM_EXAMPLES: Record<string, { es: string; en: string }> = {
  usar: { es: 'Uso la computadora.', en: 'I use the computer.' },
  cargar: { es: 'Cargo el celular.', en: 'I charge the cellphone.' },
  prohibir: { es: 'Prohíbo los celulares en clase.', en: 'I ban the cellphones in class.' },
  alquilar: { es: 'Alquilo un departamento.', en: 'I rent an apartment.' },
  buscar: { es: 'Busco mis lentes.', en: 'I look-for my glasses.' },
  manejar: { es: 'Manejo un carro viejo.', en: 'I drive a car old.' },
  funcionar: { es: 'El carro no funciona.', en: 'The car doesn’t work.' },
  ahorrar: { es: 'Ahorro para un carro.', en: 'I save for a car.' },
  robar: { es: 'Roban un carro.', en: 'They-steal a car.' },
  chocar: { es: 'El carro choca contra un árbol.', en: 'The car crashes against a tree.' },
  consumir: { es: 'El carro consume poca gasolina.', en: 'The car consumes little gas.' },
  producir: { es: 'La fábrica produce carros.', en: 'The factory produces cars.' },
  fabricar: { es: 'La empresa fabrica carros.', en: 'The company makes cars.' },
  valer: { es: 'Vale diez dólares.', en: '(It) is-worth ten dollars.' },
  jugar: { es: 'Juego fútbol.', en: 'I play football.' },
}
