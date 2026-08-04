import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";

/* ------------------------------------------------------------------ */
/* Environment hooks                                                    */
/* ------------------------------------------------------------------ */

/** True only after the component has mounted on the client. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

/** Tracks the user's reduced-motion preference, live. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ */
/* Observer telemetry context — the page watching itself               */
/* ------------------------------------------------------------------ */

type Snapshot = {
  activeLabel: string;
  ratio: number;
  inView: boolean;
  impressions: number;
};

type ObserverApi = {
  report: (id: string, label: string, ratio: number, inView: boolean) => void;
  logImpression: (id: string) => void;
  snapshot: Snapshot;
};

const ObserverContext = createContext<ObserverApi | null>(null);

export function useObserver(): ObserverApi {
  const api = useContext(ObserverContext);
  if (!api) {
    throw new Error("useObserver must be used inside <ObserverProvider>");
  }
  return api;
}

const SECTION_THRESHOLDS = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];

export function ObserverProvider({ children }: { children: ReactNode }) {
  const store = useRef(
    new Map<string, { label: string; ratio: number; inView: boolean }>(),
  );
  const logged = useRef(new Set<string>());
  const [snapshot, setSnapshot] = useState<Snapshot>({
    activeLabel: "Hero",
    ratio: 1,
    inView: true,
    impressions: 0,
  });

  const report = useCallback(
    (id: string, label: string, ratio: number, inView: boolean) => {
      store.current.set(id, { label, ratio, inView });
      let best: { label: string; ratio: number; inView: boolean } | null = null;
      for (const value of store.current.values()) {
        if (!best || value.ratio > best.ratio) {
          best = value;
        }
      }
      if (!best) {
        return;
      }
      const winner = best;
      setSnapshot((prev) => {
        if (
          prev.activeLabel === winner.label &&
          prev.inView === winner.inView &&
          Math.abs(prev.ratio - winner.ratio) < 0.02
        ) {
          return prev;
        }
        return {
          ...prev,
          activeLabel: winner.label,
          ratio: winner.ratio,
          inView: winner.inView,
        };
      });
    },
    [],
  );

  const logImpression = useCallback((id: string) => {
    if (logged.current.has(id)) {
      return;
    }
    logged.current.add(id);
    const impressions = logged.current.size;
    setSnapshot((prev) => ({ ...prev, impressions }));
  }, []);

  return (
    <ObserverContext.Provider value={{ report, logImpression, snapshot }}>
      {children}
    </ObserverContext.Provider>
  );
}

/**
 * Registers a section with the telemetry context: reports its live
 * intersection ratio as the reader scrolls. Returns the ref to attach.
 */
export function useSectionSignal(id: string, label: string) {
  const { report } = useObserver();
  const { ref, entry } = useInView({ threshold: SECTION_THRESHOLDS });
  useEffect(() => {
    if (entry) {
      report(id, label, entry.intersectionRatio, entry.isIntersecting);
    }
  }, [entry, id, label, report]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* Reveal — the scroll-triggered entrance, driven by the library       */
/* ------------------------------------------------------------------ */

/**
 * Reveals its children as they scroll into view, using `useInView` itself.
 * The base (server-rendered, no-JS, reduced-motion) state is fully visible —
 * the hidden-until-seen state is only ever applied after hydration, so
 * crawlers and reduced-motion readers lose nothing.
 */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  const hydrated = useHydrated();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.18,
    rootMargin: "0px 0px -12% 0px",
  });
  const animate = hydrated && !reduced;
  const hidden = animate && !inView;
  return (
    <div
      className={className}
      ref={ref}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? `translateY(${y}px)` : "none",
        transition: animate
          ? `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
          : undefined,
        willChange: animate ? "opacity, transform" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Line icons — drawn, single stroke weight                            */
/* ------------------------------------------------------------------ */

const ICON_PATHS: Record<string, ReactNode> = {
  hook: (
    <>
      <path d="M16 5a3 3 0 0 1 3 3v6a5 5 0 0 1-10 0" />
      <path d="M6 8h6" />
    </>
  ),
  feather: (
    <>
      <path d="M19 5a5 5 0 0 0-7 0L6 11a4 4 0 0 0 0 6l1 1a4 4 0 0 0 6 0l6-6a5 5 0 0 0 0-7Z" />
      <path d="M13 7 8 12" />
      <path d="M18 10 6.5 21.5" />
    </>
  ),
  native: (
    <>
      <path d="M9 5H6a1 1 0 0 0-1 1v3" />
      <path d="M15 5h3a1 1 0 0 1 1 1v3" />
      <path d="M19 15v3a1 1 0 0 1-1 1h-3" />
      <path d="M9 19H6a1 1 0 0 1-1-1v-3" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8 15.8 7.2" />
      <path d="M8.2 13.2 15.8 16.8" />
    </>
  ),
  braces: (
    <>
      <path d="M9 4a3 3 0 0 0-3 3v2a2 2 0 0 1-2 2 2 2 0 0 1 2 2v2a3 3 0 0 0 3 3" />
      <path d="M15 4a3 3 0 0 1 3 3v2a2 2 0 0 0 2 2 2 2 0 0 0-2 2v2a3 3 0 0 1-3 3" />
    </>
  ),
  flask: (
    <>
      <path d="M10 3h4" />
      <path d="M11 3v6.5L5.5 18a2 2 0 0 0 1.7 3h9.6a2 2 0 0 0 1.7-3L13 9.5V3" />
      <path d="M8 15h8" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  pulse: (
    <>
      <path d="M3 12h4l2.5-7 5 14L17 12h4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  check: (
    <>
      <path d="m4 12 5 5L20 6" />
    </>
  ),
  github: (
    <path
      d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  npm: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <path d="M7 18v-8h3v6M10 12h1M13 18v-8h4v8M15 10v6" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  className,
  style,
}: {
  name: keyof typeof ICON_PATHS | string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      role="presentation"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      style={style}
      viewBox="0 0 24 24"
      width={size}
    >
      {ICON_PATHS[name] ?? ICON_PATHS.target}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Code rendering — minimal, deliberate token colors on the dark panel */
/* ------------------------------------------------------------------ */

const CODE_COLOR = {
  t: "#d7d4e6", // plain text
  k: "#c4b5fd", // keyword
  f: "#a78bfa", // function / hook
  s: "#8ee7a6", // string
  c: "#948fb0", // comment
  p: "#7cc7ff", // property / jsx attr
} as const;

/** A single token: [kind, value]. */
export type Tk = [kind: keyof typeof CODE_COLOR, value: string];

/** One line of code is a list of tokens. Convenience token builders: */
export const c = {
  t: (v: string): Tk => ["t", v],
  k: (v: string): Tk => ["k", v],
  f: (v: string): Tk => ["f", v],
  s: (v: string): Tk => ["s", v],
  c: (v: string): Tk => ["c", v],
  p: (v: string): Tk => ["p", v],
};

export function Code({
  lines,
  label,
  className,
  style,
}: {
  lines: Tk[][];
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`rio-code ${className ?? ""}`} style={style}>
      {label ? <div className="rio-code__label">{label}</div> : null}
      <pre className="rio-code__pre">
        <code>
          {lines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static, order-stable code lines
            <span className="rio-code__line" key={i}>
              {line.length === 0 ? "​" : null}
              {line.map((token, j) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: static tokens
                  key={j}
                  style={{ color: CODE_COLOR[token[0]] }}
                >
                  {token[1]}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
