# HANDOFF — откуда что взялось (31.08.2026)

## Исходник

Тестовый проект стороннего подрядчика `BlackTrax_System_TD2025_Final.5.toe`
(лежит в `26_08_Yandex_content/untitled folder/`, собирался под Windows).
Это были **тесты для сверки**, не продакшн — забирали из него знание, не код.

Что в нём было:

- `blacktrax_diagnostic` — приёмник RTTrPM (штатный BlackTrax CHOP, UDP 24002)
  + разложение потока по биконам/типам/каналам (~900 сгенерированных Select'ов).
- `blacktrax_recorder` — запись потока в `.bclip/.csv/.json/.mp4`
  (файлы в `recordings/test_1`, `recordings/test_3`).
- `blacktrax_projection` — 3 ортовида комнаты 4×3×3.5 м, преобразование осей.
- `mcp_webserver_base` — служебный мост автора, сломан, не переносился.

## Проблемы исходника (почему не копировали как есть)

1. **Приёмник самоуничтожался**: `BLACKTRAX_STARTUP` удалял BlackTrax CHOP перед
   каждым сохранением и пересоздавал его при старте из внешнего скрипта по пути
   `C:\Users\Asus\...\blacktrax_touchdesigner_diagnostic_builder.py`. Скрипта нет →
   проект на другой машине открывается без приёмника (OUT_ALL пустой, ошибки).
2. Абсолютные виндовые пути в recorder/startup.
3. ~900 сгенерированных нод разложения — избыточно для мастера.

## Что взято в master_project_v1

- Схема каналов BlackTrax CHOP (`beaconN:tracked/tx/ty/tz/rx..az` + 3 LED,
  slot 0-based, точный ID через mapping-таблицу `blacktrax_beacon`).
- Настройки сети площадки: сервер 192.168.1.9, приёмник :24002 UDP Unicast,
  outputformat=fromtable, 12 биконов, ID 1..12.
- Оси: у BlackTrax CHOP `ty` — высота; плоскость пола — `tx`/`tz`
  (в проекции автора: BT X→TD X, BT Y→TD −Z, BT Z→TD Y).
- Записи тестов — скопированы в `recordings/` и используются для плейбека.
- Сами компоненты сохранены в `reference_tox/` как референс.

## Что собрано заново (чисто, без наследия)

- `bt_input`: статичный BlackTrax CHOP (ничего не удаляется при сохранении),
  все настройки — custom-пары на компоненте, bind в обе стороны;
  плейбек `.bclip` через fileinCHOP → lookup с лупом; переключатель live/playback.
- `zones`: scriptCHOP-пересчёт в зонные величины (см. agents_md внутри).
- Заготовки `show_control` и `osc_dispatch` с записками, что в них должно жить
  (по спеке мастера: тайминг, сессии, команды, рассылка слейвам, промты-uuid).

## Проверено 31.08

Плейбек `recordings/test_1/blacktrax_test_20260826_113948.bclip` (сессия с
биконом ID 4): `OUT_ALL` 518 каналов, `guest4:tracked=1`, координаты идут,
зона и относительные 0..1 считаются, счётчики зон работают. Ошибок в проекте 0.

## Следующие шаги

1. Вписать реальную геометрию зон в `zones/zones_table` (после калибровки Origin/Invert).
2. Логика `show_control`: часы шоу, сессии, команды, перекрытие групп.
3. `osc_dispatch`: таблица слейвов ip:port, структура сообщений (совместимо с
   `osc_zone.tox`, см. `26_08_Yandex_content/osc_zone_HANDOFF.md`).
4. Связка с тач-панелью `YS_prompt_panel` (промт string+uuid, старт сессии).
