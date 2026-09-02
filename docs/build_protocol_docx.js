const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, convertInchesToTwip,
} = require('docx');

const INK = '1B1B1F';
const MUTED = '5A5F6A';
const ACCENT = '2E6F2E';
const HEADBG = 'E8EAED';
const ZEBRA = 'F5F6F8';
const MONO = 'Consolas';
const BODY = 'Calibri';

const PAGE_W = 12240, PAGE_H = 15840, MARGIN = 1080;
const CONTENT_W = PAGE_W - MARGIN * 2; // 10080

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, line: 276 },
  alignment: opts.align,
  children: [new TextRun({
    text, font: opts.font ?? BODY, size: opts.size ?? 21,
    bold: opts.bold, italics: opts.italics,
    color: opts.color ?? INK,
  })],
  ...(opts.border ? { border: opts.border } : {}),
});

const rich = (runs, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, line: 276 },
  children: runs.map(r => new TextRun({
    text: r.t, font: r.mono ? MONO : BODY, size: r.mono ? 19 : 21,
    bold: r.b, italics: r.i, color: r.c ?? INK,
  })),
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 180 },
  children: [new TextRun({ text, font: BODY, size: 30, bold: true, color: INK })],
});
const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 140 },
  children: [new TextRun({ text, font: BODY, size: 24, bold: true, color: ACCENT })],
});

const bullet = (text, opts = {}) => new Paragraph({
  numbering: { reference: 'dash', level: 0 },
  spacing: { after: 80, line: 276 },
  children: [new TextRun({ text, font: opts.mono ? MONO : BODY, size: opts.mono ? 19 : 21, color: INK })],
});
const numItem = (text) => new Paragraph({
  numbering: { reference: 'steps', level: 0 },
  spacing: { after: 80, line: 276 },
  children: [new TextRun({ text, font: BODY, size: 21, color: INK })],
});

function cell(text, { widthDxa, bold, mono, bg, size }) {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    shading: bg ? { type: ShadingType.CLEAR, fill: bg, color: 'auto' } : undefined,
    margins: { top: 80, bottom: 80, left: 110, right: 110 },
    children: String(text).split('\n').map((line, i) => new Paragraph({
      spacing: { after: 0, line: 252 },
      children: [new TextRun({
        text: line, bold, font: mono ? MONO : BODY,
        size: size ?? (mono ? 18 : 20), color: INK,
      })],
    })),
  });
}

function table(headers, rows, widths, monoCols = []) {
  const border = { style: BorderStyle.SINGLE, size: 2, color: 'C9CDD4' };
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    borders: { top: border, bottom: border, left: border, right: border,
               insideHorizontal: border, insideVertical: border },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => cell(h, { widthDxa: widths[i], bold: true, bg: HEADBG })),
      }),
      ...rows.map((r, ri) => new TableRow({
        children: r.map((c, i) => cell(c, {
          widthDxa: widths[i],
          mono: monoCols.includes(i),
          bg: ri % 2 ? ZEBRA : undefined,
        })),
      })),
    ],
  });
}

const doc = new Document({
  creator: 'master_project_v1',
  title: 'Протокол мастера — что идёт на компы зон и панель',
  description: 'OSC-контракт инсталляции DEEPTECHNIGHT',
  numbering: {
    config: [
      { reference: 'dash', levels: [{ level: 0, format: LevelFormat.BULLET, text: '—',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.2) } } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: PAGE_H },
                          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    children: [
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Протокол мастера', font: BODY, size: 44, bold: true, color: INK })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 6 } },
        children: [new TextRun({ text: 'Что идёт на компы зон и тач-панель', font: BODY, size: 26, color: MUTED })],
      }),
      p('Спека для тех, кто пишет зонные серверы и тач-панель. Всё через OSC поверх UDP.'),
      rich([
        { t: 'Проект: ' }, { t: 'master_project_v1', mono: true },
        { t: '   ·   Сверено с кодом мастера 31.08.2026, коммит ' }, { t: '9962b91', mono: true },
      ], { after: 60 }),
      rich([
        { t: 'Машиночитаемая пара к этому документу — ' }, { t: 'protocol.json', mono: true },
        { t: ' в корне проекта. Цифры в нём (IP, порты, границы зон, лимиты) подтягиваются прямо из живого проекта кнопкой ' },
        { t: 'ЭКСПОРТ JSON', b: true }, { t: ' в пульте, поэтому не расходятся с тем, что мастер реально шлёт.' },
      ], { after: 60 }),
      rich([
        { t: 'Источник истины — код: ' }, { t: 'show_control/ext_showcontrol', mono: true },
        { t: ' (логика) и ' }, { t: 'osc_dispatch/ext_oscdispatch', mono: true },
        { t: ' (отправка). При расхождении верен код.' },
      ], { after: 240 }),

      h1('1. Кто с кем говорит'),
      table(
        ['Откуда', 'Куда', 'Порт', 'Что'],
        [
          ['Мастер 10.10.10.10', 'Зона 1 — 10.10.10.11', '6000', 'часы, команды, позиции, состав группы'],
          ['Мастер', 'Зона 2 — 10.10.10.12', '6000', 'то же'],
          ['Мастер', 'Зона 3 — 10.10.10.13', '6000', 'то же'],
          ['Мастер', 'Зона 4 — 10.10.10.14', '6000', 'то же'],
          ['Мастер', 'Тач-панель — 10.10.10.15', '6003', 'разрешение пускать новую группу'],
          ['Зона N', 'Мастер — 10.10.10.10', '6002', 'звуковые триггеры, выход промпта из зоны'],
          ['Тач-панель', 'Мастер — 10.10.10.10', '6001', 'сессии и выбранные промпты'],
          ['BlackTrax 10.10.10.16', 'Мастер', '24002', 'RTTrPM (не OSC, штатный BlackTrax CHOP)'],
        ],
        [2400, 2900, 1000, 3780], [0, 1, 2]),
      p(''),
      rich([
        { t: 'Адреса и порты зон правятся в таблице ' }, { t: 'osc_dispatch/slaves', mono: true },
        { t: ' — она же пересобирает отправители. Порты приёма — пары ' }, { t: 'Panelport', mono: true },
        { t: ' (6001) и ' }, { t: 'Zonesport', mono: true }, { t: ' (6002) на ' },
        { t: 'show_control', mono: true }, { t: '.' },
      ], { after: 160 }),

      h1('2. Геометрия тоннеля'),
      rich([
        { t: 'Тоннель 15 × 3 м, четыре равные зоны. ' },
        { t: 'Движение справа налево', b: true },
        { t: ': гости входят при больших x, зона 1 — вход справа, зона 4 — выход слева.' },
      ]),
      table(
        ['Зона', 'x вдоль, м', 'y поперёк, м', 'Роль'],
        [
          ['1', '11.25 – 15.00', '0 – 3', 'вход'],
          ['2', '7.50 – 11.25', '0 – 3', ''],
          ['3', '3.75 – 7.50', '0 – 3', ''],
          ['4', '0.00 – 3.75', '0 – 3', 'выход'],
        ],
        [1400, 3200, 2800, 2680], [1, 2]),
      p(''),
      rich([
        { t: 'Правка: пары ' }, { t: 'Tunnellength', mono: true }, { t: ' / ' }, { t: 'Tunnelwidth', mono: true },
        { t: ' + пульс ' }, { t: 'Equalsplit', mono: true },
        { t: ' пересобирают таблицу поровну. Зоны не обязаны быть равными — границы правятся руками в ' },
        { t: 'zones_table', mono: true }, { t: ' (это источник истины).' },
      ], { after: 160 }),

      h1('3. Сессии, гости и промпты'),
      rich([
        { t: 'В тоннеле одновременно до двух групп: первая в зоне 3, вторая уже заходит. Промпт привязан к гостю 1…3 ' },
        { t: 'внутри группы', b: true },
        { t: ', а трекинг знает только физический ID бикона — поэтому мастер держит привязку бикон → (номер сессии, гость) и ставит ' },
        { t: 'номер сессии в адрес', b: true }, { t: ' сообщений.' },
      ]),
      bullet('Номер сессии — сквозной счётчик мастера: для людей, логов и адресации.'),
      bullet('uuid — приходит с панели, для машинной сверки.'),
      bullet('Гость — 1…3 внутри своей группы. Бикон — физический BlackTrax ID 1…12.'),
      p(''),
      p('Режимы привязки бикона к гостю (переключаются кнопкой ПРИВЯЗКА в пульте):', { after: 100 }),
      table(
        ['Режим', 'Как назначается гость'],
        [
          ['auto', 'Первый вошедший в зону входа — гость 1, второй — гость 2 и т.д. Порядок перепутали — кнопки СВАП в пульте.'],
          ['pool', 'Биконы закреплены за слотами (таблица beacon_pools: A = 1,2,3; B = 4,5,6), слоты чередуются между группами. Гость = позиция бикона в своём пуле.'],
          ['manual', 'Оператор назначает вручную в пульте.'],
        ],
        [1700, 8380], [0]),
      p(''),
      rich([
        { t: 'Сессия закрывается сама, когда все её биконы вне зон дольше ' }, { t: 'Exitgrace', mono: true },
        { t: ' (8 с): биконы освобождаются, зонам уходит ' }, { t: '/show/session/end', mono: true }, { t: '.' },
      ], { after: 160 }),

      h1('4. Мастер → зонам'),
      h2('4.1. Общие для всех зон'),
      table(
        ['Адрес', 'Аргументы', 'Когда'],
        [
          ['/show/clock', 'seconds : float', '30 раз в секунду (Posrate)'],
          ['/show/state', 'state : string —\nstandby / running / finished', 'при смене состояния шоу'],
          ['/show/reset', '1', 'оператор нажал СБРОС ВСЕГО'],
          ['/show/finish', '1', 'оператор нажал FINISH'],
          ['/show/ping', '1', 'проверка связи (Testsend)'],
          ['/show/session/start', 'num : int\nuuid : string\nguests : int', 'группа зарегистрирована;\nповторяется при каждой правке привязок'],
          ['/show/session/prompt', 'num, guest, beacon,\npromptid, topicid : int\ntext : string', 'по одному на каждого гостя,\nследом за session/start'],
          ['/show/session/end', 'num : int', 'группа вышла из тоннеля'],
        ],
        [3100, 3400, 3580], [0, 1]),
      p(''),
      p('Если гость ещё не привязан к бикону, его строка придёт позже — при следующей рассылке состава.', { after: 160 }),

      h2('4.2. Персонально зоне N'),
      table(
        ['Адрес', 'Аргументы', 'Когда'],
        [
          ['/zoneN/start', 'guestCount : int\np1, p2, p3 : int\nforce : 0 / 1', 'запуск сцены — всё пачкой'],
          ['/zoneN/restart', 'те же аргументы', 'перезапуск с начала'],
          ['/zoneN/reset', '1\nforce : 0 / 1', 'сброс зоны в исходное'],
          ['/zoneN/count', 'n : int', 'гостей сейчас в зоне, 30 Гц'],
          ['/zoneN/guest/<idx>/pos', 'zx_rel : float\nzy_rel : float', 'поток трекинга, 30 Гц\n(только пока зона идёт)'],
          ['/zoneN/anchor', 'guestCount : int\nt1, t2, t3 : str', 'итог зоны 3, переданный дальше'],
          ['/zoneN/prompt/enter', 'uuid : string\nguest : int\ny_rel : float', 'промпт въезжает из соседней зоны\n(ретрансляция мастером)'],
        ],
        [3900, 2700, 3480], [0, 1]),
      p(''),
      p('Принудительный режим:', { bold: true, after: 100 }),
      rich([
        { t: 'У команд ' }, { t: 'start', mono: true }, { t: ', ' }, { t: 'restart', mono: true },
        { t: ' и ' }, { t: 'reset', mono: true }, { t: ' последним аргументом идёт флаг ' },
        { t: 'force', mono: true }, { t: '.' },
      ], { after: 60 }),
      bullet('force = 0 — штатно: зона запускается по своей логике, ждёт гостя, уважает свои блокировки.'),
      bullet('force = 1 — зона обязана немедленно прервать что делает и выполнить команду с нуля, игнорируя внутренние блокировки и отсутствие сессии.'),
      p(''),
      rich([
        { t: 'Включается тумблером ' }, { t: 'ПРИНУДИТЕЛЬНО', b: true },
        { t: ' в пульте (пара ' }, { t: 'Forcemode', mono: true },
        { t: '), тогда все команды зонам уходят с force = 1. Кнопки ' },
        { t: 'ВСЕ: СТАРТ / РЕСТАРТ / СБРОС', b: true },
        { t: ' шлют команду каждой зоне из таблицы slaves. Из кода: ' },
        { t: 'StartZone(2, force=True)', mono: true }, { t: ', ' },
        { t: "AllZones('restart', force=True)", mono: true }, { t: '.' },
      ], { after: 160 }),
      p('Про позиции — главное:', { bold: true, after: 100 }),
      bullet('zx_rel, zy_rel — 0…1 внутри своей зоны; для сцены обычно нужны именно они.'),
      bullet('zx_abs, zy_abs — метры от угла зоны.'),
      bullet('x, y — метры тоннеля целиком (0…15 вдоль, 0…3 поперёк).'),
      bullet('beacon — физический ID, для отладки.'),
      p(''),
      rich([
        { t: 'Номер сессии и номер гостя стоят ' }, { t: 'в адресе', b: true },
        { t: ', а не в аргументах: пока в тоннеле две группы, «guest 2» без сессии двусмысленен. Гость, от которого нет пакетов дольше 0.5 с, считается ушедшим.' },
      ], { after: 160 }),

      h2('4.3. Мастер → тач-панели'),
      table(
        ['Адрес', 'Аргументы', 'Смысл'],
        [['/panel/gate', '0 / 1', '1 — можно пускать новую группу к выбору промпта']],
        [2600, 1800, 5680], [0, 1]),
      p(''),
      rich([
        { t: 'Гейт открывается, когда зоны из ' }, { t: 'Gatezones', mono: true },
        { t: ' (по умолчанию 1 и 2) пусты дольше ' }, { t: 'Gatehold', mono: true },
        { t: ' (4 с) и групп в тоннеле меньше ' }, { t: 'Maxactive', mono: true },
        { t: ' (2). Закрывается мгновенно. Приём на стороне панели ещё не реализован — это её TODO.' },
      ], { after: 160 }),

      h1('5. Зоны → мастеру (порт 6002)'),
      table(
        ['Адрес', 'Аргументы', 'Что делает мастер'],
        [
          ['/zoneN/ping', '1', 'держит лампочку «зона на связи»; нет ping дольше 6 с — гаснет'],
          ['/zoneN/session/start', '—', 'сцена реально пошла: мастер начинает слать позиции'],
          ['/zoneN/session/end', '—', 'останавливает поток и запускает зону N+1 тем же составом'],
          ['/zone3/anchor', 'guestCount : int\nt1, t2, t3 : str', 'токены гостей: лог + передача дальше'],
          ['/zoneN/sound/<триггер>', 'любые', 'кладёт в sound_engine: лог, дальше — звук'],
          ['/zoneN/prompt/exit', 'uuid : string\nguest : int\ny_rel : float', 'ретранслирует зоне N+1 как prompt/enter'],
        ],
        [2600, 2200, 5280], [0, 1]),
      p(''),
      p('prompt/exit — момент, когда промпт уходит из кадра зоны; следующая зона подхватывает его, чтобы он «въехал из соседней зоны». Из зоны 4 промпт никуда не ретранслируется.', { after: 160 }),

      h1('6. Тач-панель → мастеру (порт 6001)'),
      p('Контракт панели (проект YS_prompt_panel, не меняется):', { after: 100 }),
      table(
        ['Адрес', 'Аргументы'],
        [
          ['/panel/session/guests', 'uuid : string, N : int'],
          ['/panel/guest/<K>/prompt', 'uuid : string, guest : int, promptid : int, topicid : int, text : string'],
          ['/panel/session/start', 'uuid : string, N : int, promptid1…3 : int'],
          ['/panel/session/end', 'uuid : string'],
          ['/panel/session/abort', 'uuid : string'],
          ['/panel/screen', 'n : int (мастер игнорирует)'],
        ],
        [3400, 6680], [0, 1]),
      p(''),
      p('/panel/session/start — момент, когда мастер заводит группу в реестр и присваивает ей номер.', { after: 160 }),

      h1('7. Порядок событий одной группы'),
      numItem('Панель: /panel/session/guests → /panel/guest/K/prompt (по каждому) → /panel/session/start.'),
      numItem('Мастер выдаёт номер сессии, рассылает зонам /show/session/start и /show/session/prompt на каждого гостя; при включённом Autostartzone1 шлёт /zone1/start.'),
      numItem('Гости входят в зону 1 — мастер привязывает биконы к гостям и повторяет рассылку состава (теперь с beacon).'),
      numItem('Пока группа идёт: /zoneN/session/<num>/guest/<idx>/pos 30 Гц и /zoneN/count, /show/clock фоном.'),
      numItem('Переходы между зонами: зона шлёт /zoneN/prompt/exit → мастер шлёт /zone{N+1}/prompt/enter.'),
      numItem('Все биконы группы вне зон дольше Exitgrace (8 с) → /show/session/end, биконы освобождаются.'),

      h1('8. Что должна делать зона (минимум)'),
      bullet('Слушать UDP 6000, отвечать на /zoneN/start, /restart, /reset.'),
      bullet('Уважать флаг force: при force = 1 прерывать текущее состояние и стартовать с нуля, не дожидаясь гостя и не проверяя свои блокировки.'),
      bullet('Держать словарь «номер сессии → {гость → промпт}» из /show/session/*; чистить по session/end.'),
      bullet('Рисовать гостей по /zoneN/session/<num>/guest/<idx>/pos, беря zx_rel и zy_rel.'),
      bullet('Слать /zoneN/sound/<триггер> на 10.10.10.10:6002 для звука.'),
      bullet('На выходе промпта из кадра слать /zoneN/prompt/exit, чтобы он появился в следующей зоне.'),
      p(''),
      rich([
        { t: 'Проверка связи без мастера: любой OSC-монитор на своём порту. В проекте мастера для этого есть ' },
        { t: 'osc_monitor', mono: true }, { t: ' — направь нужную зону в ' }, { t: 'slaves', mono: true },
        { t: ' на ' }, { t: '127.0.0.1:11002', mono: true }, { t: ' и увидишь весь её трафик.' },
      ], { after: 160 }),

      h1('9. Чего ещё нет'),
      bullet('ArtNet и свет (artgate 2.0.0.14, artnet spi 2.0.0.12) — мастером не управляются.'),
      bullet('Сенсоры 10.10.10.17–19 и гравёры 10.10.10.20–21 ходят через зону 4 мимо мастера.'),
      bullet('Приём /panel/gate на стороне тач-панели.'),
      bullet('Проигрывание звука на Soundcard 6ch: роутинг триггеров готов, аудио — нет.'),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(process.argv[2], buf);
  console.log('written', process.argv[2], buf.length, 'bytes');
});
