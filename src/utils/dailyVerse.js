/**
 * Offline daily Bible verse rotation curated verbatim from bundled RVR1960 JSONs.
 * Rotates deterministically per local calendar day with zero external or JSON imports.
 */

const BOOK_KEY_BY_TITLE = {
  Salmos: 'salmos',
  Juan: 'juan',
  Filipenses: 'filipenses',
  Josué: 'josue',
  Isaías: 'isaias',
  Proverbios: 'proverbios',
  Mateo: 'mateo',
  Jeremías: 'jeremias',
  Romanos: 'romanos',
  Lamentaciones: 'lamentaciones',
  '2 Timoteo': '2_timoteo',
  Hebreos: 'hebreos',
  Santiago: 'santiago',
  Gálatas: 'galatas',
  Efesios: 'efesios',
  '1 Corintios': '1_corintios',
  '1 Juan': '1_juan',
};

const DAILY_VERSES = [
  {
    ref: 'Salmos 133:3',
    text: 'Como el rocío de Hermón, Que desciende sobre los montes de Sion; Porque allí envía Jehová bendición, Y vida eterna.',
  },
  {
    ref: 'Salmos 119:105',
    text: 'Lámpara es a mis pies tu palabra, Y lumbrera a mi camino.',
  },
  {
    ref: 'Juan 3:16',
    text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
  },
  {
    ref: 'Filipenses 4:13',
    text: 'Todo lo puedo en Cristo que me fortalece.',
  },
  {
    ref: 'Josué 1:9',
    text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
  },
  {
    ref: 'Isaías 41:10',
    text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.',
  },
  {
    ref: 'Salmos 23:1',
    text: 'Jehová es mi pastor; nada me faltará.',
  },
  {
    ref: 'Salmos 46:1',
    text: 'Dios es nuestro amparo y fortaleza, Nuestro pronto auxilio en las tribulaciones.',
  },
  {
    ref: 'Proverbios 3:5',
    text: 'Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia.',
  },
  {
    ref: 'Proverbios 3:6',
    text: 'Reconócelo en todos tus caminos, Y él enderezará tus veredas.',
  },
  {
    ref: 'Mateo 11:28',
    text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
  },
  {
    ref: 'Mateo 6:33',
    text: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.',
  },
  {
    ref: 'Jeremías 33:3',
    text: 'Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.',
  },
  {
    ref: 'Jeremías 29:11',
    text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
  },
  {
    ref: 'Romanos 8:28',
    text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
  },
  {
    ref: 'Romanos 15:13',
    text: 'Y el Dios de esperanza os llene de todo gozo y paz en el creer, para que abundéis en esperanza por el poder del Espíritu Santo.',
  },
  {
    ref: 'Salmos 27:1',
    text: 'Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?',
  },
  {
    ref: 'Salmos 118:24',
    text: 'Este es el día que hizo Jehová; Nos gozaremos y alegraremos en él.',
  },
  {
    ref: 'Salmos 121:1',
    text: 'Alzaré mis ojos a los montes; ¿De dónde vendrá mi socorro?',
  },
  {
    ref: 'Salmos 121:2',
    text: 'Mi socorro viene de Jehová, Que hizo los cielos y la tierra.',
  },
  {
    ref: 'Salmos 37:4',
    text: 'Deléitate asimismo en Jehová, Y él te concederá las peticiones de tu corazón.',
  },
  {
    ref: 'Isaías 26:3',
    text: 'Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera; porque en ti ha confiado.',
  },
  {
    ref: 'Lamentaciones 3:22',
    text: 'Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias.',
  },
  {
    ref: 'Lamentaciones 3:23',
    text: 'Nuevas son cada mañana; grande es tu fidelidad.',
  },
  {
    ref: 'Juan 8:12',
    text: 'Otra vez Jesús les habló, diciendo: Yo soy la luz del mundo; el que me sigue, no andará en tinieblas, sino que tendrá la luz de la vida.',
  },
  {
    ref: 'Juan 14:6',
    text: 'Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.',
  },
  {
    ref: 'Juan 14:27',
    text: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.',
  },
  {
    ref: 'Juan 16:33',
    text: 'Estas cosas os he hablado para que en mí tengáis paz. En el mundo tendréis aflicción; pero confiad, yo he vencido al mundo.',
  },
  {
    ref: 'Filipenses 4:6',
    text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.',
  },
  {
    ref: 'Filipenses 4:7',
    text: 'Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.',
  },
  {
    ref: 'Filipenses 4:19',
    text: 'Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.',
  },
  {
    ref: '2 Timoteo 1:7',
    text: 'Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.',
  },
  {
    ref: 'Hebreos 11:1',
    text: 'Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.',
  },
  {
    ref: 'Hebreos 13:8',
    text: 'Jesucristo es el mismo ayer, y hoy, y por los siglos.',
  },
  {
    ref: 'Salmos 56:3',
    text: 'En el día que temo, Yo en ti confío.',
  },
  {
    ref: 'Santiago 1:5',
    text: 'Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.',
  },
  {
    ref: 'Gálatas 6:9',
    text: 'No nos cansemos, pues, de hacer bien; porque a su tiempo segaremos, si no desmayamos.',
  },
  {
    ref: 'Efesios 6:10',
    text: 'Por lo demás, hermanos míos, fortaleceos en el Señor, y en el poder de su fuerza.',
  },
  {
    ref: '1 Corintios 16:14',
    text: 'Todas vuestras cosas sean hechas con amor.',
  },
  {
    ref: 'Proverbios 16:3',
    text: 'Encomienda a Jehová tus obras, Y tus pensamientos serán afirmados.',
  },
  {
    ref: 'Proverbios 18:10',
    text: 'Torre fuerte es el nombre de Jehová; A él correrá el justo, y será levantado.',
  },
  {
    ref: 'Salmos 100:5',
    text: 'Porque Jehová es bueno; para siempre es su misericordia, Y su verdad por todas las generaciones.',
  },
  {
    ref: 'Salmos 145:18',
    text: 'Cercano está Jehová a todos los que le invocan, A todos los que le invocan de veras.',
  },
  {
    ref: 'Salmos 34:8',
    text: 'Gustad, y ved que es bueno Jehová; Dichoso el hombre que confía en él.',
  },
  {
    ref: 'Mateo 5:14',
    text: 'Vosotros sois la luz del mundo; una ciudad asentada sobre un monte no se puede esconder.',
  },
  {
    ref: 'Proverbios 4:23',
    text: 'Sobre toda cosa guardada, guarda tu corazón; Porque de él mana la vida.',
  },
  {
    ref: '1 Juan 4:19',
    text: 'Nosotros le amamos a él, porque él nos amó primero.',
  },
];

const MS_PER_DAY = 86_400_000;

export function getDailyVerse(date = new Date()) {
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = Math.floor(utcMidnight / MS_PER_DAY);
  const idx = ((dayNumber % DAILY_VERSES.length) + DAILY_VERSES.length) % DAILY_VERSES.length;
  const entry = DAILY_VERSES[idx];
  const match = entry.ref.match(/^(.+)\s+(\d+):(\d+)$/);
  const book = match ? BOOK_KEY_BY_TITLE[match[1]] || '' : '';
  return {
    ...entry,
    book,
    chapter: match ? Number(match[2]) : 1,
    verse: match ? Number(match[3]) : 1,
  };
}

