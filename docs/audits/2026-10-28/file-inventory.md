# Аудит ассетов и лишних файлов

Срез файлов 28 октября 2026. Код, зависимости, изображения и видео не изменялись. Созданы только материалы аудита в `.tmp-audit/full-audit-2026-10-28/`. Значения `.env.local` не открывались. Инструкции `AGENTS.md` в корне, родительских каталогах и исходниках не найдены.

## Главные выводы

1. **Отложено до установки финального видео по указанию владельца.** Текущее видео не входит в задачи исправления. `LogoVideoHero.tsx:3–4,67,87–88` создаёт одновременно два `<video preload="auto">`: `herovidv2.mp4` 4 289 464 B и `herovidmob.mp4` 3 989 181 B, суммарно 8 278 645 B (7,90 MiB). Второе видео не является альтернативой для смартфона: оно нужно второй части композиции и также загружается. `poster` и статического fallback нет; ошибка/блокировка воспроизведения проглатывается `.catch(() => {})` на строке 33. Код скрывает фон до готовности обоих видео через `data-video-ready`. Рекомендация: оптимизированные короткие фрагменты с профилями под размеры композиции, постер, независимая готовность частей, сценарий ошибки. **Фактический объём сетевой загрузки и вид при ошибке уточнять по браузерному замеру; полный размер файлов не равен автоматически переданным байтам.** Плюс: видео ставятся на паузу при reduced motion, уходе из viewport и скрытой вкладке.
2. **P1 — убрать мегабайты из критических шрифтов.** `src/app/styles/globals.css:10–32`: Cormorant Garamond TTF 1 195 560 B, EB Garamond TTF 851 176 B, Manrope TTF 165 420 B. Сумма трёх — 2 212 156 B (2,11 MiB). Публикуется также Roboto Flex 1 787 292 B, но его единственная CSS-декларация находится в недостижимом сейчас `DesktopHomeHero.css:1–7`. Переход на WOFF2 с реально нужными символами кириллицы/латиницы, начертаниями и метриками fallback; загружать только нужные на странице семейства. `font-display:swap` уже есть. Экономию и фактический набор загруженных шрифтов следует измерить, не обещать фиксированный процент заранее.
3. **P2 — адаптивные варианты изображений вместо одного файла для всех экранов.** Поиск `srcSet|sizes=` в `src` ничего не находит. Пять активных превью трансляций `p12.png`, `p15.png`, `p27.png`, `p28.png`, `p31.png` имеют 950×500 и суммарно 2 771 943 B (2,64 MiB); каждая фотография — PNG размером 483–587 KiB. Ссылки: `FestivalPageLegacy.tsx:25–29,163–171`, `MobileHomeBroadcasts.tsx`. Подготовить несколько размеров WebP/AVIF с визуальной проверкой, `srcset/sizes`, сохранить пропорции и lazy loading для нижних секций. Не требуется переписывать все форматы ради самого формата: часть афиш и медиа уже WebP.
4. **P2 — уменьшить исходные размеры логотипов.** `src/app/data/images.ts:1–3`, `PartnersPage.tsx:31–35,53–59`: `Gnessinlogo.png` 8751×4168 при ограничении показа до 190px по ширине; файл 414 454 B, распакованный RGBA-буфер ~139 MiB. Это теоретический размер полного декодирования, не замер памяти браузера: движок может использовать уменьшенное декодирование. `tarusalogo.png` 2109×746, 1 002 355 B, показ до 330px. Подготовить SVG, если доступен исходный вектор, либо 1x/2x изображения нужной ширины. Простая смена расширения без уменьшения размеров не решает проблему декодирования.
5. **P2 — вынести ненужные публикации из `public`.** `public` содержит 115 файлов, 76 560 515 B (73,01 MiB). По строгому поиску имён 49 tracked ассетов на 56 249 710 B (53,64 MiB) не имеют буквальных ссылок в исходниках/скриптах/index/config. Самый крупный — `public/assets/hero/Vertical1.mp4`, 26 729 964 B (25,49 MiB), далее старые видео/референсы, исходные JPEG рядом с действующими WebP. Всё из `public` копируется в публикацию независимо от импортов. **Это кандидаты на вынос в архив, а не разрешение на удаление:** возможны внешние ссылки, ручное использование и динамические ссылки; исходники дизайна нужно сохранить. Этот объём увеличивает размер публикации, но не означает скачивание всех 73 MiB каждым посетителем.
6. **P2 — остановить добавление локального окружения и диагностик в Git.** `.env.local` отслеживается Git; содержимое не читалось, наличие секрета/утечки не доказано. `.gitignore` не содержит `.env.local`, `*.log`, `*.tsbuildinfo`. В Git есть 5 логов, 2 tsbuildinfo, 3 .bak файла. Для следующего изменения: проверить назначение env переменных, оставить документированный `.env.example`, локальное окружение исключить из tracking. Ротация нужна только если отдельная проверка обнаружит реальные секреты; не приравнивать факт файла к доказанной компрометации.
7. **P2 — убрать неиспользуемые 3D-зависимости после проверки lockfile.** `package.json:20–21,27` содержит `@react-three/drei`, `@react-three/fiber`, `three`; импортов этих пакетов нет ни в одном `src`-модуле. Влияют на install/CI и поверхность обновлений. Нельзя приписывать им мегабайты клиентского JS, если они не импортируются. `npm ls --depth=0` проходит; дополнительно показывает 5 extraneous пакетов `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`. Это повод проверить воспроизводимую установку, не удалять отдельные папки вручную.
8. **P3 — архивировать старые варианты компонентов, сохранив реально используемый legacy.** Статический граф относительных импортов от `src/main.tsx` выявил 24 недостижимых файла (полный список ниже). Текущая главная — `FestivalPageLegacy.tsx`; `composers.legacy.ts`, `performers.legacy.ts`, `personDetails.legacy.ts` реально используются. По слову `legacy` удалять нельзя.

## Объём каталогов

Исключены `node_modules` и `.git`. `.tmp-audit` меняется во время самого аудита; ниже состояние на момент инвентаризации. MiB = 1 048 576 байт.

| Каталог | Файлы | Байты | MiB | Отслеживается Git |
| --- | ---: | ---: | ---: | ---: |
| public | 115 | 76 560 515 | 73,01 | 111 |
| src | 184 | 14 864 057 | 14,18 | 180 |
| Файлы в корне | 55 | 25 280 707 | 24,11 | 55 |
| logos_to_send | 15 | 1 775 233 | 1,69 | 15 |
| tmp_data | 15 | 2 507 005 | 2,39 | 15 |
| tmp_scrape | 7 | 741 649 | 0,71 | 7 |
| dist, существующий до проверки | 240 | 101 522 362 | 96,82 | 0 |
| .tmp-audit, включая ранее созданные материалы | 443 | 117 932 819 | 112,47 | 0 |
| .tmp-build | 7 | 21 747 | 0,02 | 0 |
| .tmp-checkpoints | 10 | 114 672 | 0,11 | 0 |

80 изображений в `src/assets/participants` занимают 13 875 639 B (13,23 MiB). `images.ts:5–8` импортирует все через eager glob. Это включает их в граф ассетов сборки, **но не загружает все фото по сети автоматически**. Семь пар участников совпадают по SHA-256; существующий `dist` уже дедуплицирует ряд из них, поэтому экономию исходников нельзя автоматически переносить на сеть.

## Что можно чистить и что нужно сохранить

### Воспроизводимые файлы

- `dist/` — генерируемая сборка; можно пересоздать. Не удалять, если конкретный запуск preview ещё использует её.
- `.tmp-build/` — временная компиляция служебных скриптов.
- `tsconfig.app.tsbuildinfo`, `tsconfig.node.tsbuildinfo` — кэш TypeScript, ошибочно отслеживается в Git.
- `debug.log`, `vite-5176.log`, `vite-5176.err.log`, `vite-node.log`, `vite-node.err.log` — диагностика, ошибочно отслеживается в Git; сохранить отдельно только если нужна для разбора инцидента.
- Старые воспроизводимые результаты `.tmp-audit/` — скриншоты, JSON, логи. Очищать после сохранения нужной истории; не удалять каталог целиком вместе с текущим отчётом и полезными проверочными скриптами.
- `node_modules/` — устанавливаемые зависимости, не мусор сайта и не часть `dist`. Удаление не улучшит загрузку сайта; не удалялся и в инвентаризацию объёма не входил.

### Архивировать после проверки назначения

- Корневые `.bak`, визуальные референсы, старые логотипы, оригиналы фото и видео. Это материалы проекта, а не автоматически бесполезный мусор.
- `logos_to_send/`, `logos_to_send.zip`: пакеты для отправки партнёрам; не импортируются приложением, можно хранить вне рабочего дерева разработки, сохранив исходные материалы.
- `tmp_scrape/` — ранее выгруженные HTML/JS; прямых импортов из приложения нет. Сохранить как данные происхождения контента, если нужны.
- `.tmp-checkpoints/` — контрольные снимки; не объявлять безопасно удаляемыми, пока не проверено, что они не содержат единственные копии важных правок.
- `scripts/shrink_logo.py:3`, `scripts/shrink_logo_more.py:3`: разовые утилиты с абсолютными путями на старый каталог памяти, не включены в npm scripts. Архивировать либо привести к аргументам командной строки, если их намерены использовать снова.
- `public/assets/hero/content.docx`, `README.md`, дизайнерские референсы: публикуются вместе с сайтом, хотя не являются пользовательским контентом. Перенести рабочие материалы за пределы `public` после проверки внешних ссылок.

### Сохранять как действующие данные

- `tmp_data/bios_raw.md`, `composers_bios.md`, `ensembles_raw.md` — входные данные `scripts/build-bios.ts:9–12`; README прямо указывает их назначение.
- `tmp_data/niko_refs/15ddc20161b9c42c54840f6fcfe544f5.png`, `ef1e9f3848ad26bbb2044d6aa988f5dd.png`, `8e7dd019db22adc310b92256bb57513b.png` импортируются `AboutFestivalPage.tsx:4–6`. Папка называется временной, но участвует в production.
- `tmp_data/niko_performers_compare.json` используется служебными скриптами синхронизации.
- `FestivalPageLegacy.tsx`, `*.legacy.ts` данных — действующие импорты.
- `herovidv2.mp4`, `herovidmob.mp4`, `tarusalogo.png`, `Gnessinlogo.png`, `Ile_theleme_logo_black.png` в корне — реальные импорты, удалять нельзя до замены путей и ассетов.
- Четыре untracked изображения `heroforintronew.png`, `intro1w.png`, `intro2w.png`, `intro3w.png` и новые intro компоненты — текущая незавершённая работа пользователя; не включены в список мусора.
- `package-lock.json`, конфиги, лицензии шрифтов и verification HTML — сохранять. Не удалять лицензию вместе с оптимизацией шрифта.

## Метод и ограничения

Проверены размеры, SHA-256 дублей, размеры изображений через Pillow, статические импорты, буквальные упоминания имён файлов, tracking Git и `npm ls`. Ничего не удалялось, build не запускался этим агентом. Граф импортов — простой статический анализ относительно `src/main.tsx`; сам по себе не доказывает отсутствие вызова файла внешним инструментом. Список неупомянутых имён — список кандидатов для проверки, не команда удаления. Полные машинные данные: [asset-inventory.json](evidence/asset-inventory.json), [asset-dimensions.json](evidence/asset-dimensions.json), [asset-import-graph.json](evidence/asset-import-graph.json).


## Полный список недостижимых исходников

- src/app/components/hero/DesktopHomeHero.css
- src/app/components/hero/DesktopHomeHero.tsx
- src/app/components/hero/HeroConcertSelector.tsx
- src/app/components/hero/HeroLoadingTransition.tsx
- src/app/components/hero/HomeHero.tsx
- src/app/components/hero/HomeHeroPlaceholder.tsx
- src/app/components/hero/MobileHomeHero.css
- src/app/components/hero/MobileHomeHero.tsx
- src/app/components/hero/ReferenceHomeHero.css
- src/app/components/hero/ReferenceHomeHero.tsx
- src/app/components/hero/VideoHomeHero.css
- src/app/components/hero/VideoHomeHero.tsx
- src/app/components/sections/FestivalIntro.tsx
- src/app/components/sections/ParticipantsPreview.tsx
- src/app/components/sections/PartnersPreview.tsx
- src/app/components/sections/SelectedPosters.tsx
- src/app/components/ui/LinkArrow.tsx
- src/app/components/ui/SectionTitle.tsx
- src/app/data/concerts.ts
- src/app/data/featured.ts
- src/app/data/heroComposers.ts
- src/app/data/heroSoloists.ts
- src/app/data/site.ts
- src/app/pages/FestivalPage.tsx

## Полный список кандидатов в public без буквальных ссылок

| Файл | Размер KiB |
| --- | ---: |
| public/assets/hero/Vertical1.mp4 | 26103.5 |
| public/assets/hero/PIanohero1c.webm | 2916.4 |
| public/assets/hero/violin.png | 1910.2 |
| public/assets/hero/ref4.png | 1618.5 |
| public/assets/hero/piano.png | 1475.8 |
| public/assets/external/heroafisha/BerezovkiBedited.png | 1474.5 |
| public/assets/external/heroafisha/39e4c798_noroot.png | 1454.3 |
| public/assets/hero/heroref3.png | 1397.3 |
| public/assets/hero/heroback1.png | 1381.9 |
| public/heroreffinal.png | 1375.6 |
| public/assets/hero/heroref1.png | 1367.4 |
| public/OGImage3.png | 1318.1 |
| public/assets/external/heroafisha/chamberconcerthero.jpg | 1283.8 |
| public/assets/hero/ref1mobhero.png | 1267.4 |
| public/assets/hero/translref.png | 1203.3 |
| public/2026ref.png | 1026.1 |
| public/assets/external/heroafisha/c31dbe0b_61afb70ee5afd7e2710b.jpg | 782.3 |
| public/assets/external/heroafisha/cd0d075c_db39c27515a4605ed73c.jpg | 441.1 |
| public/assets/external/heroafisha/d6c06a4b_50d42752bd6c38e0c9da.jpeg | 399.8 |
| public/assets/external/heroafisha/f4a26f9e_9ba87e7e7bb322482d4d.jpeg | 396.3 |
| public/assets/external/heroafisha/6ff3de26_6b1b5d1bd1f856318444.png | 382.2 |
| public/assets/external/BerezovkiBcolor.jpg | 374.7 |
| public/assets/academies/sergey-akhunov.jpeg | 362.5 |
| public/assets/external/heroafisha/5f68f703_5ef851e0c6992bfd3e44.jpg | 359.8 |
| public/assets/external/heroafisha/7ab9274d_01b3902154153c814c24.jpeg | 352.3 |
| public/assets/external/heroafisha/aca5621a_6362729948f1e85335ac.jpg | 303.4 |
| public/favver.png | 255.5 |
| public/assets/external/1ce0f2e5_-5451686574358728414.jpg | 223.4 |
| public/assets/external/heroafisha/a9da4c31_IMG_20260303_105903_.jpg | 223.4 |
| public/assets/external/heroafisha/48f5939f_IMG-20251121-WA0020.jpg | 206.2 |
| public/assets/external/heroafisha/bfd7db6d_50a0894752382d8d9b1a.jpg | 169.3 |
| public/Logo_Lidery2024.png | 166.8 |
| public/assets/external/ed37e6cf_3356cca21f4277bd7192.jpg | 153.7 |
| public/assets/external/heroafisha/finalconcert.jpg | 153.7 |
| public/assets/external/heroafisha/BerezovkiBedited (1).webp | 147.8 |
| public/assets/external/BerezovskiB.jpg | 75.2 |
| public/liderylogo.pdf | 72.6 |
| public/revizorlogo.png | 69.6 |
| public/assets/external/heroafisha/6c7af7d8_0c98a711c715d8f20ff7.jpg | 67.9 |
| public/assets/hero/newlogoru.jpg | 58.5 |
| public/assets/external/heroafisha/7ab9274d_01b3902154153c814c24.webp | 48.1 |
| public/muzonlinelogo.jpg | 31.4 |
| public/assets/external/heroafisha/BerezovkiBedited.webp | 25.2 |
| public/assets/partners/niko-logo.png | 21.9 |
| public/LogoV3main2.0menu.svg | 11.8 |
| public/LogoV5finalbig.svg | 11.3 |
| public/festlogo.svg | 5.6 |
| public/logo-header.png | 3.5 |
| public/logo-header.svg | 0.6 |

## Группы точных дублей

Обнаружено 25 групп, избыточные копии занимают 5028602 B (4,80 MiB) в исходном дереве. Копии в dist/.tmp сюда не включены. Копии в пакетах для отправки могут быть намеренными.

- OGimage3.png = public/OGImage3.png; потенциально лишние копии 1349701 B.
- Ogimagenew.png = public/Ogimagenew.png; потенциально лишние копии 905825 B.
- src/assets/participants/peletsis.png = src/assets/participants/PeletsisG.png; потенциально лишние копии 804760 B.
- Gnessinlogo.png = logos_to_send/partners/gnessin-logo.png; потенциально лишние копии 414454 B.
- public/assets/external/1ce0f2e5_-5451686574358728414.jpg = public/assets/external/heroafisha/a9da4c31_IMG_20260303_105903_.jpg; потенциально лишние копии 228757 B.
- Ile_theleme_logo_black.png = logos_to_send/partners/ile-theleme-logo-black.png; потенциально лишние копии 183622 B.
- src/assets/participants/desyatnikov2.jpg = src/assets/participants/DesyatnikovL.jpg; потенциально лишние копии 158119 B.
- public/assets/external/ed37e6cf_3356cca21f4277bd7192.jpg = public/assets/external/heroafisha/finalconcert.jpg; потенциально лишние копии 157343 B.
- logos_to_send/partners/music-online-logo.png = public/assets/partners/music-online-logo.png; потенциально лишние копии 153960 B.
- lifestylelogo.png = logos_to_send/partners/lifestyle-logo.png = public/assets/partners/lifestyle-logo.png; потенциально лишние копии 128206 B.
- MyagkovaAcademy.jpg = public/assets/academies/myagkova-academy.jpg; потенциально лишние копии 117915 B.
- logos_to_send/partners/leaders-building-russia.png = public/assets/partners/leaders-building-russia.png; потенциально лишние копии 102096 B.
- src/assets/participants/Akhunov.jpeg = src/assets/participants/AkhunovS.jpeg; потенциально лишние копии 79267 B.
- src/assets/participants/2401_aleksandr-chajk.jpg = src/assets/participants/ChaikovskiiA.jpg; потенциально лишние копии 75629 B.
- logos_to_send/partners/revizor-logo.png = public/assets/partners/revizor-logo.png; потенциально лишние копии 46345 B.
- src/assets/participants/tursunov.jpg = src/assets/participants/TursunovP.jpg; потенциально лишние копии 42035 B.
- src/assets/participants/martynov.jpg = src/assets/participants/MartynovV.jpg; потенциально лишние копии 30486 B.
- FestLogo2.svg = logos_to_send/festival/festival-logo-full.svg = logos_to_send/partners/festival-logo-full.svg = public/festlogo.svg; потенциально лишние копии 17169 B.
- logos_to_send/partners/belcanto-logo.png = public/assets/partners/belcantologo.png; потенциально лишние копии 11904 B.
- festlogov2.gif = public/festlogov2.gif; потенциально лишние копии 5684 B.
- logos_to_send/partners/niko-logo.svg = public/assets/external/c20f321a__.svg; потенциально лишние копии 5255 B.
- FestLogoNowords.svg = logos_to_send/festival/festival-logo-mark.svg = public/festlogonowords.svg; потенциально лишние копии 3684 B.
- logos_to_send/festival/festival-logo-topword.svg = public/festlogo-topword.svg; потенциально лишние копии 2551 B.
- logos_to_send/partners/orpheus-logo.svg = public/orpheus-logo.svg; потенциально лишние копии 2430 B.
- logos_to_send/festival/festival-logo-bottomword.svg = public/festlogo-bottomword.svg; потенциально лишние копии 1405 B.
