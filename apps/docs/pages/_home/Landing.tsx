import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useOnInView } from "react-intersection-observer";
import ObserverDemo from "../../islands/ObserverDemo";
import {
  Code,
  c,
  Icon,
  ObserverProvider,
  Reveal,
  type Tk,
  useObserver,
  usePrefersReducedMotion,
  useSectionSignal,
} from "./primitives";

export const client = "load";

const REPO = "https://github.com/thebuilder/react-intersection-observer";
const NPM = "https://www.npmjs.com/package/react-intersection-observer";
const DOCS = "/overview";

/* ================================================================== */
/* Root                                                                */
/* ================================================================== */

export default function Landing() {
  return (
    <ObserverProvider>
      <div className="rio-home">
        <Hero />
        <RevealBand />
        <ApiScrollspy />
        <ImpressionStrip />
        <Playground />
        <ClosingCta />
        <Hud />
      </div>
    </ObserverProvider>
  );
}

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

function Hero() {
  const ref = useSectionSignal("hero", "Hero");
  return (
    <header className="rio-section rio-hero" ref={ref}>
      <div className="rio-hero__grid">
        <div className="rio-hero__copy">
          <h1 className="rio-h1">
            Know the moment an element meets the viewport.
          </h1>
          <p className="rio-lead">
            A tiny, fully-typed React adapter for the Intersection Observer API.
            Reveal on scroll, lazy-load, track impressions, and build infinite
            lists with one hook and about a kilobyte.
          </p>

          <InstallCommand />

          <div className="rio-cta">
            <a className="rio-btn rio-btn--primary" href={DOCS}>
              Read the docs
              <Icon name="arrow" size={18} />
            </a>
            <a
              className="rio-btn rio-btn--ghost"
              href={REPO}
              rel="noreferrer"
              target="_blank"
            >
              <Icon name="github" size={18} />
              GitHub
            </a>
          </div>

          <ul className="rio-meta">
            <li className="rio-chip">v11</li>
            <li className="rio-chip">MIT</li>
            <li className="rio-chip">TypeScript</li>
            <li className="rio-chip">~1&nbsp;kB gzipped</li>
            <li className="rio-chip">React 17+</li>
          </ul>
        </div>

        <div className="rio-hero__visual">
          <Instrument />
        </div>
      </div>

      <div className="rio-scrollcue" aria-hidden="true">
        <span>Scroll to watch this page observe itself</span>
        <Icon name="arrow" size={16} style={{ transform: "rotate(90deg)" }} />
      </div>
    </header>
  );
}

const PMS = [
  { id: "npm", cmd: "npm i react-intersection-observer" },
  { id: "pnpm", cmd: "pnpm add react-intersection-observer" },
  { id: "yarn", cmd: "yarn add react-intersection-observer" },
  { id: "bun", cmd: "bun add react-intersection-observer" },
] as const;

function InstallCommand() {
  const [pm, setPm] = useState(0);
  const [copied, setCopied] = useState(false);
  const command = PMS[pm].cmd;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }, [command]);

  return (
    <div className="rio-install">
      <div
        className="rio-install__tabs"
        role="tablist"
        aria-label="Package manager"
      >
        {PMS.map((entry, i) => (
          <button
            aria-selected={pm === i}
            className="rio-install__tab"
            data-active={pm === i}
            key={entry.id}
            onClick={() => setPm(i)}
            role="tab"
            type="button"
          >
            {entry.id}
          </button>
        ))}
      </div>
      <div className="rio-install__row">
        <code className="rio-install__cmd">
          <span className="rio-install__prompt">$</span> {command}
        </code>
        <button
          aria-label={copied ? "Copied" : "Copy install command"}
          className="rio-install__copy"
          data-copied={copied}
          onClick={copy}
          type="button"
        >
          <Icon name={copied ? "check" : "copy"} size={16} />
        </button>
      </div>
    </div>
  );
}

/** Live telemetry instrument — reflects the page's own observation. */
function Instrument() {
  const { snapshot } = useObserver();
  const reduced = usePrefersReducedMotion();

  return (
    <div className="rio-instrument" data-animate={!reduced}>
      <div className="rio-instrument__head">
        <span className="rio-instrument__dot" data-live={snapshot.inView} />
        <span className="rio-instrument__title">observer</span>
        <span className="rio-instrument__badge">live</span>
      </div>

      <div className="rio-instrument__stage">
        <div className="rio-instrument__scan" />
        <div className="rio-instrument__threshold">
          <span>threshold</span>
        </div>
        <div className="rio-instrument__target" data-in={snapshot.inView}>
          <Icon name="target" size={18} />
          <span>{snapshot.activeLabel}</span>
        </div>
      </div>

      <dl className="rio-instrument__readout">
        <Readout label="section" value={snapshot.activeLabel} />
        <Readout label="intersectionRatio" value={snapshot.ratio.toFixed(2)} />
        <Readout
          label="inView"
          value={String(snapshot.inView)}
          tone={snapshot.inView ? "on" : "off"}
        />
        <Readout label="impressions" value={String(snapshot.impressions)} />
      </dl>

      <div className="rio-instrument__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${snapshot.ratio})` }} />
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "on" | "off";
}) {
  return (
    <div className="rio-readout">
      <dt>{label}</dt>
      <dd data-tone={tone}>{value}</dd>
    </div>
  );
}

/* ================================================================== */
/* Reveal band — scroll-triggered animation                            */
/* ================================================================== */

type Feature = {
  icon: string;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: "hook",
    title: "Hooks or component",
    body: "useInView for state, useOnInView for effects, and <InView> for render props or a wrapper.",
  },
  {
    icon: "feather",
    title: "About a kilobyte",
    body: "Around 1 kB gzipped per API. Tree-shakeable, so you ship only what you import.",
  },
  {
    icon: "native",
    title: "Matches the native API",
    body: "The same threshold, rootMargin, and root options you already know from IntersectionObserver.",
  },
  {
    icon: "share",
    title: "Shared instances",
    body: "Elements with identical options reuse one observer, so thousands of targets stay cheap.",
  },
  {
    icon: "braces",
    title: "Typed to the core",
    body: "Written in TypeScript. Options, return values, and entries are typed, with no extra @types.",
  },
  {
    icon: "flask",
    title: "Ready to test",
    body: "A drop-in mock for the Intersection Observer keeps Vitest and Jest suites deterministic.",
  },
];

function RevealBand() {
  const ref = useSectionSignal("features", "Features");
  return (
    <section className="rio-section rio-band" ref={ref}>
      <Reveal className="rio-head">
        <h2 className="rio-h2">This section revealed itself.</h2>
        <p className="rio-subhead">
          Every card below waited off-screen and animated in as it crossed the
          threshold, with the same <code className="rio-inline">useInView</code>{" "}
          you would ship. It fires once and then leaves the DOM alone.
        </p>
      </Reveal>

      <div className="rio-grid">
        {FEATURES.map((feature, i) => (
          <Reveal
            className="rio-feature"
            delay={(i % 3) * 80}
            key={feature.title}
          >
            <span className="rio-feature__icon">
              <Icon name={feature.icon} size={22} />
            </span>
            <h3 className="rio-feature__title">{feature.title}</h3>
            <p className="rio-feature__body">{feature.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="rio-band__note">
        <Icon name="pulse" size={16} />
        <code className="rio-inline">
          useInView(&#123; triggerOnce: true &#125;)
        </code>
        <span>drives every reveal on this page.</span>
      </Reveal>
    </section>
  );
}

/* ================================================================== */
/* API scrollspy — three APIs, one observer                            */
/* ================================================================== */

type ApiStep = {
  id: string;
  name: string;
  signature: string;
  blurb: string;
  code: Tk[][];
};

const API_STEPS: ApiStep[] = [
  {
    id: "useInView",
    name: "useInView",
    signature: "{ ref, inView, entry }",
    blurb:
      "Reach for it when visibility belongs in render. You get a ref, the inView boolean, and the latest entry.",
    code: [
      [c.k("const"), c.t(" { ref, inView } = "), c.f("useInView"), c.t("({")],
      [c.t("  threshold: "), c.t("0.5"), c.t(",")],
      [c.t("});")],
      [],
      [c.p("<section"), c.t(" ref={ref}>")],
      [
        c.t("  {inView ? "),
        c.s('"In view"'),
        c.t(" : "),
        c.s('"Waiting"'),
        c.t("}"),
      ],
      [c.p("</section>")],
    ],
  },
  {
    id: "useOnInView",
    name: "useOnInView",
    signature: "(inView, entry) => void",
    blurb:
      "Run an effect without a hook-owned re-render. Ideal for analytics, prefetching, or logging.",
    code: [
      [c.k("const"), c.t(" ref = "), c.f("useOnInView"), c.t("(")],
      [c.t("  (inView, entry) => {")],
      [
        c.t("    "),
        c.f("track"),
        c.t("("),
        c.s('"seen"'),
        c.t(", entry.target);"),
      ],
      [c.t("  },")],
      [
        c.t("  { threshold: "),
        c.t("1"),
        c.t(", triggerOnce: "),
        c.k("true"),
        c.t(" },"),
      ],
      [c.t(");")],
    ],
  },
  {
    id: "InView",
    name: "<InView>",
    signature: "render props · plain children",
    blurb:
      "When render props or a wrapper element fit the composition better than a hook.",
    code: [
      [
        c.p("<InView"),
        c.t(" "),
        c.p("as"),
        c.t("="),
        c.s('"div"'),
        c.t(" "),
        c.p("threshold"),
        c.t("={0.2} "),
        c.p("triggerOnce"),
        c.t(">"),
      ],
      [c.t("  {({ ref, inView }) => (")],
      [c.t("    "), c.p("<div"), c.t(" ref={ref}>")],
      [
        c.t("      {inView ? "),
        c.s('"Loaded"'),
        c.t(" : "),
        c.s('"Placeholder"'),
        c.t("}"),
      ],
      [c.t("    "), c.p("</div>")],
      [c.t("  )}")],
      [c.p("</InView>")],
    ],
  },
];

function ApiScrollspy() {
  const ref = useSectionSignal("apis", "Three APIs");
  const [active, setActive] = useState(0);
  const ratios = useRef<number[]>(API_STEPS.map(() => 0));
  // Timestamp of the last manual pick. While set, scroll position does not
  // override the choice; a genuine scroll (250ms+ later) clears it and hands
  // control back to the scrollspy.
  const lockedAt = useRef(0);

  const setRatio = useCallback((index: number, ratio: number) => {
    ratios.current[index] = ratio;
    if (lockedAt.current) {
      return;
    }
    let best = 0;
    for (let i = 1; i < ratios.current.length; i++) {
      if (ratios.current[i] > ratios.current[best]) {
        best = i;
      }
    }
    setActive((prev) => (prev === best ? prev : best));
  }, []);

  const select = useCallback((index: number) => {
    lockedAt.current = Date.now();
    setActive(index);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (lockedAt.current && Date.now() - lockedAt.current > 250) {
        lockedAt.current = 0;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = API_STEPS[active];

  return (
    <section className="rio-section rio-spy" ref={ref}>
      <Reveal className="rio-head">
        <h2 className="rio-h2">Three APIs, one observer.</h2>
        <p className="rio-subhead">
          Pick the shape that fits your component. The panel follows whichever
          you are reading. That is <code className="rio-inline">useInView</code>{" "}
          doing scrollspy, right here. Tap a card to pin one.
        </p>
      </Reveal>

      <div className="rio-spy__layout">
        <div className="rio-spy__sticky">
          <Code
            key={current.id}
            className="rio-spy__code"
            label={current.name}
            lines={current.code}
          />
        </div>

        <ol className="rio-spy__steps">
          {API_STEPS.map((step, i) => (
            <ApiStepCard
              active={active === i}
              index={i}
              key={step.id}
              onRatio={setRatio}
              onSelect={select}
              step={step}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function ApiStepCard({
  active,
  index,
  onRatio,
  onSelect,
  step,
}: {
  active: boolean;
  index: number;
  onRatio: (index: number, ratio: number) => void;
  onSelect: (index: number) => void;
  step: ApiStep;
}) {
  const { ref, entry } = useInView({
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: "-30% 0px -30% 0px",
  });
  useEffect(() => {
    if (entry) {
      onRatio(index, entry.intersectionRatio);
    }
  }, [entry, index, onRatio]);

  return (
    <li className="rio-step-item">
      <button
        aria-label={`Show the ${step.name} example`}
        aria-pressed={active}
        className="rio-step"
        data-active={active}
        onClick={() => onSelect(index)}
        ref={ref}
        type="button"
      >
        <span className="rio-step__marker" aria-hidden="true">
          <span />
        </span>
        <span className="rio-step__body">
          <span className="rio-step__name">{step.name}</span>
          <span className="rio-step__sig">{step.signature}</span>
          <span className="rio-step__blurb">{step.blurb}</span>
        </span>
      </button>
      {/* Mobile: each step carries its own snippet (sticky panel is hidden). */}
      <Code className="rio-step__code" lines={step.code} />
    </li>
  );
}

/* ================================================================== */
/* Impression strip — fire once, when seen                             */
/* ================================================================== */

const TILES = [
  "card-01",
  "card-02",
  "card-03",
  "card-04",
  "card-05",
  "card-06",
  "card-07",
  "card-08",
];

function ImpressionStrip() {
  const ref = useSectionSignal("impressions", "Impressions");
  const { snapshot } = useObserver();

  return (
    <section className="rio-section rio-impr" ref={ref}>
      <Reveal className="rio-head">
        <h2 className="rio-h2">Fire once, exactly when seen.</h2>
        <p className="rio-subhead">
          <code className="rio-inline">useOnInView</code> runs your callback
          without a hook-owned re-render. It is the right tool for impressions,
          prefetching, and logging. Each tile below logs itself the first time
          it is fully visible.
        </p>
      </Reveal>

      <div className="rio-impr__layout">
        <div className="rio-impr__grid">
          {TILES.map((id, i) => (
            <ImpressionTile id={id} index={i} key={id} />
          ))}
        </div>

        <aside className="rio-impr__panel">
          <div className="rio-counter">
            <span className="rio-counter__num">{snapshot.impressions}</span>
            <span className="rio-counter__label">impressions logged</span>
          </div>
          <Code
            className="rio-impr__code"
            label="track once"
            lines={[
              [c.k("const"), c.t(" ref = "), c.f("useOnInView"), c.t("(")],
              [c.t("  () => "), c.f("logImpression"), c.t("(id),")],
              [
                c.t("  { threshold: "),
                c.t("1"),
                c.t(", triggerOnce: "),
                c.k("true"),
                c.t(" },"),
              ],
              [c.t(");")],
            ]}
          />
        </aside>
      </div>
    </section>
  );
}

function ImpressionTile({ id, index }: { id: string; index: number }) {
  const { logImpression } = useObserver();
  const [logged, setLogged] = useState(false);
  const ref = useOnInView(
    (inView) => {
      if (inView) {
        logImpression(id);
        setLogged(true);
      }
    },
    { threshold: 1, triggerOnce: true },
  );

  return (
    <article className="rio-tile" data-logged={logged} ref={ref}>
      <span className="rio-tile__id">{id}</span>
      <span className="rio-tile__state">
        {logged ? (
          <>
            <Icon name="check" size={13} /> logged
          </>
        ) : (
          "waiting"
        )}
      </span>
      <span className="rio-tile__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
    </article>
  );
}

/* ================================================================== */
/* Playground — the existing interactive demo                          */
/* ================================================================== */

function Playground() {
  const ref = useSectionSignal("playground", "Playground");
  return (
    <section className="rio-section rio-play" ref={ref}>
      <Reveal className="rio-head">
        <h2 className="rio-h2">Try it yourself.</h2>
        <p className="rio-subhead">
          Change the threshold and scroll the custom root. Same hook, wired to
          live controls and a live readout.
        </p>
      </Reveal>
      <Reveal>
        <ObserverDemo />
      </Reveal>
    </section>
  );
}

/* ================================================================== */
/* Closing                                                             */
/* ================================================================== */

function ClosingCta() {
  const ref = useSectionSignal("closing", "Get started");
  return (
    <section className="rio-section rio-closing" ref={ref}>
      <Reveal className="rio-closing__inner">
        <h2 className="rio-h2 rio-closing__title">
          Add a kilobyte. Ship the viewport.
        </h2>
        <p className="rio-subhead rio-closing__lead">
          Install, attach a ref, and read{" "}
          <code className="rio-inline">inView</code>. Thresholds, roots, and
          margins are there when you need them.
        </p>
        <InstallCommand />
        <div className="rio-cta rio-cta--center">
          <a className="rio-btn rio-btn--primary" href={DOCS}>
            Read the docs
            <Icon name="arrow" size={18} />
          </a>
          <a
            className="rio-btn rio-btn--ghost"
            href={REPO}
            rel="noreferrer"
            target="_blank"
          >
            <Icon name="github" size={18} />
            GitHub
          </a>
          <a
            className="rio-btn rio-btn--ghost"
            href={NPM}
            rel="noreferrer"
            target="_blank"
          >
            <Icon name="npm" size={18} />
            npm
          </a>
        </div>
        <p className="rio-closing__test">
          <Icon name="flask" size={15} />
          Testing?{" "}
          <a href="/testing">
            The package ships a mock for the Intersection Observer
          </a>{" "}
          so your suites stay deterministic.
        </p>
      </Reveal>
    </section>
  );
}

/* ================================================================== */
/* Floating HUD — the page watching itself                             */
/* ================================================================== */

function Hud() {
  const { snapshot } = useObserver();
  // Retire the HUD once the closing CTA is reached, so it never sits over the
  // footer links at the end of the page.
  const hidden = snapshot.activeLabel === "Get started";
  return (
    <div aria-hidden="true" className="rio-hud" data-hidden={hidden}>
      <div className="rio-hud__head">
        <span className="rio-hud__dot" data-live={snapshot.inView} />
        observing
      </div>
      <div className="rio-hud__row">
        <span className="rio-hud__key">section</span>
        <span className="rio-hud__val">{snapshot.activeLabel}</span>
      </div>
      <div className="rio-hud__bar">
        <span style={{ transform: `scaleX(${snapshot.ratio})` }} />
      </div>
      <div className="rio-hud__row">
        <span className="rio-hud__key">ratio</span>
        <span className="rio-hud__val">{snapshot.ratio.toFixed(2)}</span>
      </div>
      <div className="rio-hud__row">
        <span className="rio-hud__key">impressions</span>
        <span className="rio-hud__val">{snapshot.impressions}</span>
      </div>
    </div>
  );
}
