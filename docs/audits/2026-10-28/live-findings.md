# Production, зависимости и стандарты

Дата проверки: 28 октября 2026. Исходники, package.json и lockfile не изменялись; выполнялись только запросы и запись результатов аудита.

## Публичный сервер

Проверены запросы к `/`, `/festival`, `/afisha`, `/participants`, `/audit-missing-page-20261028`, `/robots.txt`, `/sitemap.xml`. В песочнице соединения получили EACCES, при повторе вне песочницы — таймаут 10 секунд. Результат: `live-probe.json`. Это ограничение доступа из данной среды, **не доказательство недоступности сайта для посетителей**. HTTP-статусы, compression, Cache-Control, security headers, TLS и совпадение опубликованной версии с текущим рабочим деревом не подтверждены. Web-инструмент получил title главной «Композиторы XXI века», но не содержимое React-страницы. Повторные запросы остановлены.

## npm audit

`npm audit --json --fetch-timeout=20000 --fetch-retries=0` завершился с полноценным отчетом: **7 пакетов с advisory, 6 high и 1 moderate, critical 0**. Код 1 является штатным результатом найденных предупреждений. У всех семи `fixAvailable: true`; автоматические исправления не запускались. Полные первичные сведения и ссылки: `live-npm-audit.json`.

| Пакет | Установлено | npm severity | Где используется и применимость |
|---|---|---|---|
| fflate | 0.8.2 и 0.6.10 | moderate | Транзитивно через drei → maath/@types/three и three-stdlib. Ошибка бесконечного цикла разбора некорректного ZIP64. Прямое использование распаковки пользовательского ZIP в src не найдено; публичная эксплуатация не доказана. |
| nanoid | 3.3.11 | high | Транзитивно через Vite → PostCSS. Риски некорректных размеров генератора относятся к инструментам сборки; пути от внешнего посетителя сайта к этому API не обнаружено. |
| postcss | 8.5.9 | high | Сборка CSS через Vite. Advisory касаются обработки недоверенных CSS/source maps и вывода CSS. Для текущего статического сайта серверный exploit не доказан. |
| react-router | 7.14.0 | high | Рабочая клиентская библиотека. Часть advisory относится к Framework/SSR/RSC и не подходит архитектуре createBrowserRouter. Навигационные advisory потенциально требуют недоверенных URL; фактический путь эксплуатации не установлен. |
| react-router-dom | 7.14.0 | high | Перенос предупреждения от react-router, **не отдельная независимая уязвимость приложения**. |
| source-map-js | 1.2.1 | high | Транзитивно через Tailwind/PostCSS, обработка source maps во время разработки/сборки. Риск DoS при недоверенных source maps. |
| vite | 8.0.8 | high | Dev server / инструменты сборки. Advisory включают Windows launch-editor и доступ к файлам. Статический dist не запускает Vite, поэтому предупреждение не означает уязвимый production-сервер. |

Источники версий: `package-lock.json:1133,1627,1722,1788,1810,1924,2022,2150`; проверено `npm ls ... --all`. Удаление неиспользуемой three-цепочки, если подтвердится другим аудитом, может убрать fflate без обновления ненужных библиотек.

Рекомендуемый приоритет P2: плановое обновление затронутых зависимостей и повторная проверка сборки/навигации. Если dev server открыт внешней сети, приоритет проверки его обновления повышается. Не называть это семью эксплуатируемыми уязвимостями production.

Для React Router RCE GHSA-49rj-9fvp-4h2h официальный maintainer прямо исключает Data Mode (`createBrowserRouter`), который используется в `src/app/router.tsx:271`. [Advisory maintainer](https://github.com/remix-run/react-router/security/advisories/GHSA-49rj-9fvp-4h2h). Для open redirect требуются передаваемые навигации недоверенные пути. [Advisory maintainer](https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6).

## Robots и sitemap

- `public/robots.txt` существует, разрешает обход и указывает правильный HTTPS sitemap. Это положительный результат, удалять файл нельзя.
- `public/sitemap.xml` существует: 10 основных маршрутов совпадают с router, 15 `?concert=` соответствуют карте `src/app/pages/AfishaPage.tsx:13–45`. Битых значений в этой сверке не найдено.
- **P2, подтвержденное противоречие canonical/sitemap:** 15 концертных URL включены в sitemap как отдельные документы, но `src/app/router.tsx:72–75` назначает всем `/afisha` и его query-вариантам canonical `/afisha`; метаданные зависят только от pathname. Нужно выбрать модель: индивидуальные индексируемые концерты с собственными title/description/canonical, либо только `/afisha` в sitemap, если query — состояние интерфейса. Не менять это без решения о нужной индексации.
- **P2, улучшение охвата:** sitemap не включает персональные маршруты `/participants/composers/:slug`, `/participants/soloists/:slug`, `/participants/ensembles/:slug`, которые существуют в router и допускают индексацию. Они могут индексироваться по ссылкам и без sitemap, поэтому это не блокировка индексации. Генерировать sitemap из того же набора актуальных slug, если важен поиск по именам.
- `/hero2`, `/hero3`, `/festival-lab` отсутствуют в sitemap, соответствующий runtime noindex прописан в router. `/intro-test` также отсутствует и находится вне RootLayout; актуальная повторная проверка `IntroTestPage.tsx:29–33` подтверждает отдельный вызов applyPageMeta с `noindex, nofollow`. Ошибку отсутствия noindex не фиксировать. Для всех этих страниц HTML до выполнения JS всё ещё содержит общий robots index из index.html.

## Проверенные первичные ориентиры 2026

- LCP ≤2,5 секунды, INP ≤200 мс, CLS ≤0,1, оценка по 75-му перцентилю реальных визитов с разделением mobile/desktop. Один быстрый localhost-запуск не подтверждает прохождение Core Web Vitals. [web.dev](https://web.dev/articles/vitals).
- WCAG 2.2 AA: минимум 24×24 CSS px для целей, с исключениями для достаточных интервалов, текстовых inline-ссылок и эквивалентных контролов. Удобная рекомендация 44–48 px — не тот же самый нормативный минимум. [W3C Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- Reflow без двухмерной прокрутки для обычного контента при ширине 320 CSS px; увеличение текста должно оставаться возможным. [W3C Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow).
- JavaScript SEO требует проверки отрендеренного содержимого и статусов; Google исполняет JavaScript, поэтому CSR не равно «сайт не индексируется». Для публичных контентных страниц HTML с содержимым уменьшает зависимость от рендеринга и помогает ботам социальных превью. [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- Для хешированных статических ассетов обычно подходит длительный cache с immutable, HTML должен позволять получить актуальную версию. Фактические live headers этого сайта здесь не проверены. [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching).
