import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { concertProgrammes } from "../data/site";
import { PageContainer } from "../layout/PageContainer";
import { resolvePublicAssetPath } from "../utils/assets";
import { reachYandexMetrikaGoal } from "../utils/yandexMetrika";

type EventItem = (typeof concertProgrammes)[number];

const concertStartTime = "19:30";
const queryKeyByConcertId = {
  "2026-05-10-peletcis-24-kaprisa": "10may",
  "2026-05-13-v-ischezayushem-gorode": "13may",
  "2026-05-19-opensoundquartet": "19may",
  "2026-05-20-opensoundorchestra": "20may",
} as const;
const concertIdByQueryKey = {
  "10may": "2026-05-10-peletcis-24-kaprisa",
  "13may": "2026-05-13-v-ischezayushem-gorode",
  "19may": "2026-05-19-opensoundquartet",
  "20may": "2026-05-20-opensoundorchestra",
} as const;
const scrollOffsetPx = 104;
const initialRevealDelayMs = 220;
const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "short" });

function buildEventDate(dateLabel: string) {
  const dayMatch = dateLabel.match(/\d{1,2}/);
  const day = dayMatch ? Number(dayMatch[0]) : 1;
  const date = new Date(Date.UTC(2026, 4, day));

  return {
    dayNumber: String(day).padStart(2, "0"),
    weekday: weekdayFormatter.format(date).replace(".", "").toUpperCase(),
    month: monthFormatter.format(date).replace(".", "").toUpperCase(),
  };
}

function EventAccordion({
  event,
  isOpen,
  onToggle,
  containerRef,
  shouldAnimateOnMount,
}: {
  event: EventItem;
  isOpen: boolean;
  onToggle: () => void;
  containerRef: (node: HTMLElement | null) => void;
  shouldAnimateOnMount: boolean;
}) {
  const dateParts = useMemo(() => buildEventDate(event.date), [event.date]);
  const keepPosterInColor = event.id === "2026-05-13-v-ischezayushem-gorode";
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      setContentHeight(element.scrollHeight);
    };

    updateHeight();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updateHeight()) : null;

    resizeObserver?.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [event.id]);

  function handleTicketClick() {
    reachYandexMetrikaGoal("niko_ticket_click", {
      concertId: event.id,
      concertTitle: event.title,
      destination: event.ticketLink,
    });
  }

  return (
    <article
      ref={containerRef}
      className="group scroll-mt-28 py-10 sm:py-12"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <div className="relative shrink-0 md:w-[100px]">
          <div className="pr-6 md:pr-8">
            <div className="flex items-start justify-between gap-2">
              <p className="font-editorial-serif text-3xl font-normal tracking-[-0.04em] text-neutral-900 sm:text-4xl">
                {dateParts.dayNumber}
              </p>
              <p className="font-editorial-sans pt-1 translate-x-3 text-[0.7rem] uppercase tracking-[0.14em] text-neutral-500 sm:text-xs">
                {concertStartTime}
              </p>
            </div>
            <p className="font-editorial-sans mt-2 text-xs uppercase tracking-[0.14em] text-neutral-500">
              {dateParts.weekday} / {dateParts.month}
            </p>
          </div>
          <div className="absolute right-0 top-0 hidden h-full w-px bg-black/8 md:block" />
        </div>

        <div className="min-w-0 flex-1 md:pl-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
            <div className="min-w-0 flex-1 space-y-4">
              <h2 className="font-editorial-serif max-w-3xl text-[1.45rem] font-normal leading-[1.35] tracking-[-0.01em] text-neutral-900 sm:text-[1.62rem]">
                {event.title}
              </h2>

              <p className="font-editorial-serif max-w-3xl text-base leading-7 text-neutral-600">
                {event.description}
              </p>

              <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-label={
                  isOpen
                    ? "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443"
                    : "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443"
                }
                className="inline-flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors duration-200 ease-out hover:text-neutral-900"
              >
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.24, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ChevronDown size={20} strokeWidth={1.4} />
                </motion.span>
              </button>
            </div>

            <div className="pr-2 pt-1 text-left md:min-w-[120px] md:text-right">
              {event.ticketLink ? (
                <a
                  href={event.ticketLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleTicketClick}
                  aria-label={
                    "\u041A\u0443\u043F\u0438\u0442\u044C \u0431\u0438\u043B\u0435\u0442\u044B \u043D\u0430 \u043A\u043E\u043D\u0446\u0435\u0440\u0442"
                  }
                  className="font-editorial-sans relative inline-flex px-1 py-[1px] text-[13px] font-normal uppercase tracking-[0.12em] text-neutral-500 transition-all duration-150 ease-out hover:px-3 hover:py-[2px] hover:text-neutral-900 before:pointer-events-none before:absolute before:bottom-[3px] before:left-0 before:top-[3px] before:w-0 before:border-l before:border-neutral-800 before:opacity-0 before:transition-opacity before:duration-150 before:ease-out hover:before:opacity-100 after:pointer-events-none after:absolute after:bottom-[3px] after:right-0 after:top-[3px] after:w-0 after:border-r after:border-neutral-800 after:opacity-0 after:transition-opacity after:duration-150 after:ease-out hover:after:opacity-100"
                >
                  {"\u0411\u0418\u041B\u0415\u0422\u042B"}
                </a>
              ) : null}
            </div>
          </div>

          <motion.div
            initial={shouldAnimateOnMount ? { height: 0, opacity: 0 } : false}
            animate={{
              height: isOpen ? contentHeight : 0,
              opacity: isOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <div className="mt-6 border-t border-black/10 pt-6 md:mt-7 md:pt-7">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-x-10">
                  <div className="grid gap-8 md:grid-cols-2 md:gap-x-10">
                    <div>
                      <p className="font-editorial-sans mb-4 text-xs uppercase tracking-[0.14em] text-neutral-400">
                        {"\u041F\u0420\u041E\u0413\u0420\u0410\u041C\u041C\u0410"}
                      </p>
                      <div className="font-editorial-serif space-y-3 text-base leading-8 text-neutral-800">
                        {event.programme.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-editorial-sans mb-4 text-xs uppercase tracking-[0.14em] text-neutral-400">
                        {"\u0418\u0421\u041F\u041E\u041B\u041D\u0418\u0422\u0415\u041B\u0418"}
                      </p>
                      <div className="font-editorial-serif space-y-2 text-[1.04rem] leading-7 text-neutral-800">
                        {event.performers.map((item, index) =>
                          item.trim() === "" ? (
                            <div
                              key={`${event.id}-performer-gap-${index}`}
                              aria-hidden="true"
                              className="h-4"
                            />
                          ) : (
                            <p key={`${event.id}-performer-${index}`}>{item}</p>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="order-first xl:order-last xl:justify-self-end xl:pt-2">
                    <img
                      src={resolvePublicAssetPath(event.image)}
                      alt=""
                      aria-hidden="true"
                      className={[
                        "aspect-[4/3] h-auto w-full object-cover object-center xl:w-[340px]",
                        keepPosterInColor ? "" : "grayscale",
                      ].join(" ")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </article>
  );
}

export function AfishaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openEventKeys, setOpenEventKeys] = useState<string[]>([]);
  const eventRefs = useRef<Record<string, HTMLElement | null>>({});
  const initialSyncDoneRef = useRef(false);
  const lastTrackedConcertGoalRef = useRef<string | null>(null);
  const initialConcertQuery = searchParams.get("concert");
  const initialDeepLinkedEventKeyRef = useRef<string | null>(
    initialConcertQuery && Object.prototype.hasOwnProperty.call(concertIdByQueryKey, initialConcertQuery)
      ? concertIdByQueryKey[initialConcertQuery as keyof typeof concertIdByQueryKey]
      : null,
  );
  const skipNextAutoScrollRef = useRef(Boolean(initialDeepLinkedEventKeyRef.current));
  const initialPositionReadyRef = useRef(!initialDeepLinkedEventKeyRef.current);
  const [isInitialPositionReady, setIsInitialPositionReady] = useState(initialPositionReadyRef.current);

  useEffect(() => {
    const queryKey = searchParams.get("concert");
    const targetEventKey =
      queryKey && Object.prototype.hasOwnProperty.call(concertIdByQueryKey, queryKey)
        ? concertIdByQueryKey[queryKey as keyof typeof concertIdByQueryKey]
        : null;

    if (!initialSyncDoneRef.current) {
      initialSyncDoneRef.current = true;
      setOpenEventKeys(targetEventKey ? [targetEventKey] : []);
      return;
    }

    if (targetEventKey) {
      setOpenEventKeys((current) =>
        current.includes(targetEventKey) ? current : [...current, targetEventKey],
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const queryKey = searchParams.get("concert");
    const targetEventKey =
      queryKey && Object.prototype.hasOwnProperty.call(concertIdByQueryKey, queryKey)
        ? concertIdByQueryKey[queryKey as keyof typeof concertIdByQueryKey]
        : null;

    if (!targetEventKey || lastTrackedConcertGoalRef.current === targetEventKey) {
      return;
    }

    const concert = concertProgrammes.find((item) => item.id === targetEventKey);
    if (!concert) {
      return;
    }

    lastTrackedConcertGoalRef.current = targetEventKey;
    reachYandexMetrikaGoal("afisha_concert_view", {
      concertId: concert.id,
      concertQueryKey: queryKey,
      concertTitle: concert.title,
      concertDate: concert.date,
    });
  }, [searchParams]);

  useEffect(() => {
    const latestOpenedEventKey = openEventKeys[openEventKeys.length - 1];
    if (!latestOpenedEventKey) {
      return;
    }

    if (skipNextAutoScrollRef.current) {
      skipNextAutoScrollRef.current = false;
      return;
    }

    const target = eventRefs.current[latestOpenedEventKey];
    if (!target) {
      return;
    }

    const timer = window.setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - scrollOffsetPx;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, 60);

    return () => {
      window.clearTimeout(timer);
    };
  }, [openEventKeys]);

  useLayoutEffect(() => {
    const initialDeepLinkedEventKey = initialDeepLinkedEventKeyRef.current;
    if (!initialDeepLinkedEventKey || initialPositionReadyRef.current) {
      return;
    }

    if (!openEventKeys.includes(initialDeepLinkedEventKey)) {
      return;
    }

    const target = eventRefs.current[initialDeepLinkedEventKey];
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const top = window.scrollY + rect.top - scrollOffsetPx;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });

    initialPositionReadyRef.current = true;
    skipNextAutoScrollRef.current = false;

    const timer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        setIsInitialPositionReady(true);
      });
    }, initialRevealDelayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [openEventKeys]);

  function updateConcertQuery(nextEventKey: string | null) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextEventKey && Object.prototype.hasOwnProperty.call(queryKeyByConcertId, nextEventKey)) {
      nextParams.set("concert", queryKeyByConcertId[nextEventKey as keyof typeof queryKeyByConcertId]);
    } else {
      nextParams.delete("concert");
    }

    setSearchParams(nextParams, { replace: true });
  }

  function handleToggle(eventKey: string) {
    setOpenEventKeys((current) => {
      const isOpen = current.includes(eventKey);
      const nextEventKeys = isOpen ? current.filter((key) => key !== eventKey) : [...current, eventKey];
      const latestOpenedEventKey = nextEventKeys[nextEventKeys.length - 1] ?? null;

      updateConcertQuery(latestOpenedEventKey);
      return nextEventKeys;
    });
  }

  return (
    <motion.section
      initial={
        initialDeepLinkedEventKeyRef.current
          ? { opacity: 0, y: 16 }
          : false
      }
      animate={isInitialPositionReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="pb-20 pt-32 sm:pb-24 sm:pt-36"
    >
      <PageContainer className="space-y-7 sm:space-y-8">
        <div>
          <p className="font-editorial-serif text-[1.9rem] leading-[0.95] font-normal tracking-[0.08em] lowercase text-neutral-900 sm:text-[2.2rem] lg:text-[2.5rem]">
            {"\u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0444\u0435\u0441\u0442\u0438\u0432\u0430\u043B\u044F"}
          </p>
        </div>

        <div className="divide-y divide-black/8">
          {concertProgrammes.map((concert) => (
            <EventAccordion
              key={concert.id}
              event={concert}
              isOpen={openEventKeys.includes(concert.id)}
              onToggle={() => handleToggle(concert.id)}
              shouldAnimateOnMount={initialDeepLinkedEventKeyRef.current === concert.id}
              containerRef={(node) => {
                eventRefs.current[concert.id] = node;
              }}
            />
          ))}
        </div>
      </PageContainer>
    </motion.section>
  );
}
