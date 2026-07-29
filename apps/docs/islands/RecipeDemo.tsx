import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { useInView, useOnInView } from "react-intersection-observer";

export const client = "load";

export type Recipe = "lazy-image" | "reveal" | "impression" | "infinite-list";

export default function RecipeDemo({ recipe }: { recipe: Recipe }) {
  switch (recipe) {
    case "lazy-image":
      return <LazyImageDemo />;
    case "reveal":
      return <RevealDemo />;
    case "impression":
      return <ImpressionDemo />;
    case "infinite-list":
      return <InfiniteListDemo />;
  }
}

function LazyImageDemo() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { inView, ref } = useInView({
    root,
    rootMargin: "72px 0px",
    triggerOnce: true,
  });

  return (
    <DemoFrame
      detail="The observer starts work 72px before the image enters the reading area."
      title="Preload before the image arrives"
    >
      <ScrollViewport setRoot={setRoot}>
        <ScrollLeadIn
          height="13rem"
          label="Scroll down to release the image request"
        />
        <article ref={ref} style={{ display: "grid", gap: "0.65rem" }}>
          <div style={imageStyle}>
            {inView ? (
              <img
                alt="Sunlit studio workspace with plants and a desk"
                onLoad={() => setLoaded(true)}
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
                style={imageElementStyle}
              />
            ) : (
              <div aria-hidden="true" style={imagePlaceholderStyle} />
            )}
            <div style={imageOverlayStyle}>
              <span style={imageBadgeStyle}>
                {inView ? (loaded ? "Loaded" : "Loading") : "Queued"}
              </span>
              <strong style={imageTitleStyle}>
                {inView
                  ? "The image request has started"
                  : "Waiting inside the preload margin"}
              </strong>
            </div>
          </div>
          <span style={captionStyle}>Product update · 3 min read</span>
        </article>
        <div style={{ height: "12rem" }} />
      </ScrollViewport>
      <DemoStatus
        detail={
          inView
            ? loaded
              ? "Image decoded and ready"
              : "Image request released 72px early"
            : "Waiting for the preload margin"
        }
        state={inView ? (loaded ? "complete" : "active") : "waiting"}
      />
    </DemoFrame>
  );
}

function RevealDemo() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const { inView, ref } = useInView({ root, threshold: 0.7 });

  return (
    <DemoFrame
      detail="The content stays in the document; its presentation changes after 70% enters the reading area."
      title="Reveal without hiding the content source"
    >
      <ScrollViewport setRoot={setRoot}>
        <ScrollLeadIn
          height="15rem"
          label="Scroll until most of the section is in view"
        />
        <article
          ref={ref}
          style={{
            background: inView
              ? "linear-gradient(135deg, #312e81, #0f766e)"
              : "color-mix(in srgb, var(--blume-accent) 12%, var(--color-background))",
            border:
              "1px solid color-mix(in srgb, var(--blume-accent) 42%, transparent)",
            borderRadius: "0.75rem",
            boxShadow: inView ? "0 18px 36px rgb(79 70 229 / 0.24)" : "none",
            color: inView ? "#f8fafc" : "var(--color-foreground)",
            display: "grid",
            gap: "0.45rem",
            minHeight: "10rem",
            opacity: inView ? 1 : 0.46,
            padding: "1rem",
            filter: inView ? "blur(0)" : "blur(3px)",
            transform: inView
              ? "translateY(0) scale(1)"
              : "translateY(2.25rem) scale(0.94)",
            transition:
              "background 420ms ease-out, box-shadow 420ms ease-out, color 420ms ease-out, filter 420ms ease-out, opacity 420ms ease-out, transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span
            style={{
              ...captionStyle,
              color: inView ? "#c4b5fd" : "var(--color-muted-foreground)",
            }}
          >
            {inView ? "Threshold reached" : "Approaching the threshold"}
          </span>
          <strong
            style={{ color: inView ? "#f8fafc" : "var(--color-foreground)" }}
          >
            The section is ready to read.
          </strong>
          <span
            style={{
              color: inView ? "#ddd6fe" : "var(--color-muted-foreground)",
              fontSize: "0.875rem",
            }}
          >
            A CSS transition can follow observer state without removing the
            content.
          </span>
        </article>
        <div style={{ height: "10rem" }} />
      </ScrollViewport>
      <DemoStatus
        detail={
          inView ? "70% threshold crossed" : "Scroll until 70% is visible"
        }
        state={inView ? "complete" : "waiting"}
      />
    </DemoFrame>
  );
}

function ImpressionDemo() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [recorded, setRecorded] = useState(false);
  const ref = useOnInView(
    (inView) => {
      if (inView) setRecorded(true);
    },
    { root, threshold: 0.5, triggerOnce: true },
  );

  return (
    <DemoFrame
      detail="The event is recorded once when at least half of the card is visible."
      title="Record one meaningful impression"
    >
      <ScrollViewport setRoot={setRoot}>
        <ScrollLeadIn
          height="12rem"
          label="Reach half of this card to record the event"
        />
        <article
          ref={ref}
          style={{
            background:
              "color-mix(in srgb, var(--color-foreground) 4%, var(--color-background))",
            border:
              "1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent)",
            borderRadius: "0.75rem",
            display: "grid",
            gap: "0.45rem",
            padding: "1rem",
          }}
        >
          <span style={captionStyle}>Recommended reading</span>
          <strong>How to make visibility events useful</strong>
          <span
            style={{
              color: "var(--color-muted-foreground)",
              fontSize: "0.875rem",
            }}
          >
            This card has a stable content identifier and a one-time event
            policy.
          </span>
        </article>
        <div style={{ height: "7rem" }} />
      </ScrollViewport>
      <DemoStatus
        detail={
          recorded
            ? "Event recorded: article_visible"
            : "Waiting for a meaningful view"
        }
        state={recorded ? "complete" : "waiting"}
      />
    </DemoFrame>
  );
}

function InfiniteListDemo() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [items, setItems] = useState(["Atlas", "Beacon", "Current", "Drift"]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadMore = useCallback(() => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    window.setTimeout(() => {
      setItems((current) => [...current, "Ember", "Field", "Glow"]);
      setHasNextPage(false);
      setLoading(false);
    }, 450);
  }, [hasNextPage, loading]);

  const { ref } = useInView({
    root,
    rootMargin: "56px 0px",
    skip: loading || !hasNextPage,
    onChange: (inView) => {
      if (inView) loadMore();
    },
  });

  return (
    <DemoFrame
      detail="The sentinel preloads one page, and the button remains as the explicit fallback."
      title="Load the next page near the list end"
    >
      <section
        aria-label="Scrollable result list"
        ref={setRoot}
        style={{ ...viewportStyle, height: "13.5rem" }}
      >
        <ol
          style={{
            display: "grid",
            gap: "0.45rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {items.map((item) => (
            <li
              key={item}
              style={{
                background:
                  "color-mix(in srgb, var(--color-foreground) 4%, var(--color-background))",
                border:
                  "1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent)",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                padding: "0.7rem 0.8rem",
              }}
            >
              {item}
            </li>
          ))}
        </ol>
        {hasNextPage ? (
          <div
            ref={ref}
            style={{
              color: "var(--color-muted-foreground)",
              fontSize: "0.75rem",
              padding: "1rem 0.25rem",
              textAlign: "center",
            }}
          >
            {loading ? "Loading the next page…" : "Scroll toward this sentinel"}
          </div>
        ) : (
          <p
            style={{
              color: "var(--color-muted-foreground)",
              fontSize: "0.75rem",
              textAlign: "center",
            }}
          >
            End of this demo list
          </p>
        )}
      </section>
      <DemoStatus
        detail={
          loading
            ? "Fetching the next page"
            : hasNextPage
              ? "Sentinel waits 56px before the list end"
              : "All demo results loaded"
        }
        state={loading ? "active" : hasNextPage ? "waiting" : "complete"}
      />
      {hasNextPage ? (
        <button onClick={loadMore} style={buttonStyle} type="button">
          {loading ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </DemoFrame>
  );
}

function DemoFrame({
  children,
  detail,
  title,
}: {
  children: ReactNode;
  detail: string;
  title: string;
}) {
  return (
    <section aria-label={title} style={frameStyle}>
      <div style={{ display: "grid", gap: "0.25rem", marginBottom: "0.85rem" }}>
        <strong>{title}</strong>
        <span style={captionStyle}>{detail}</span>
      </div>
      {children}
    </section>
  );
}

function ScrollViewport({
  children,
  setRoot,
}: {
  children: ReactNode;
  setRoot: (node: HTMLDivElement | null) => void;
}) {
  return (
    <section
      aria-label="Scrollable recipe demonstration"
      ref={setRoot}
      style={viewportStyle}
    >
      {children}
    </section>
  );
}

function ScrollLeadIn({ height, label }: { height: string; label: string }) {
  return (
    <div
      style={{
        alignItems: "center",
        color: "var(--color-muted-foreground)",
        display: "flex",
        fontSize: "0.75rem",
        height,
        justifyContent: "center",
        paddingInline: "1rem",
        textAlign: "center",
      }}
    >
      {label} ↓
    </div>
  );
}

function DemoStatus({
  detail,
  state,
}: {
  detail: string;
  state: "waiting" | "active" | "complete";
}) {
  const label =
    state === "complete"
      ? "Complete"
      : state === "active"
        ? "In progress"
        : "Waiting";

  return (
    <div aria-live="polite" style={statusStyle}>
      <span
        aria-hidden="true"
        style={{
          ...statusDotStyle,
          background:
            state === "complete"
              ? "#34d399"
              : state === "active"
                ? "var(--blume-accent)"
                : "var(--color-muted-foreground)",
        }}
      />
      <strong style={{ fontSize: "0.75rem" }}>{label}</strong>
      <span style={{ ...captionStyle, marginLeft: "auto", textAlign: "right" }}>
        {detail}
      </span>
    </div>
  );
}

const frameStyle: CSSProperties = {
  background:
    "color-mix(in srgb, var(--blume-accent) 11%, var(--color-background))",
  border:
    "1px solid color-mix(in srgb, var(--color-foreground) 22%, transparent)",
  borderRadius: "0.875rem",
  marginBlock: "1.25rem",
  padding: "1rem",
};

const viewportStyle: CSSProperties = {
  background: "color-mix(in srgb, var(--color-foreground) 6%, transparent)",
  border:
    "1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent)",
  borderRadius: "0.625rem",
  height: "13rem",
  overflowY: "auto",
  padding: "0.75rem",
};

const imageStyle: CSSProperties = {
  borderRadius: "0.625rem",
  minHeight: "11rem",
  overflow: "hidden",
  position: "relative",
};

const imageElementStyle: CSSProperties = {
  display: "block",
  height: "100%",
  inset: 0,
  objectFit: "cover",
  position: "absolute",
  width: "100%",
};

const imagePlaceholderStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, color-mix(in srgb, var(--blume-accent) 28%, var(--blume-muted)), var(--blume-muted))",
  inset: 0,
  position: "absolute",
};

const imageOverlayStyle: CSSProperties = {
  alignContent: "end",
  background: "linear-gradient(180deg, transparent 25%, rgb(8 15 31 / 0.82))",
  color: "#f8fafc",
  display: "grid",
  gap: "0.5rem",
  inset: 0,
  padding: "0.85rem",
  position: "absolute",
};

const imageBadgeStyle: CSSProperties = {
  background: "rgb(255 255 255 / 0.22)",
  borderRadius: "999px",
  color: "#f8fafc",
  fontSize: "0.7rem",
  fontWeight: 700,
  justifySelf: "start",
  padding: "0.25rem 0.5rem",
};

const imageTitleStyle: CSSProperties = {
  color: "#f8fafc",
  fontSize: "1.1rem",
  textShadow: "0 1px 2px rgb(8 15 31 / 0.48)",
};

const captionStyle: CSSProperties = {
  color: "var(--color-muted-foreground)",
  fontSize: "0.75rem",
  lineHeight: 1.45,
};

const statusStyle: CSSProperties = {
  alignItems: "center",
  background:
    "color-mix(in srgb, var(--color-foreground) 4%, var(--color-background))",
  border:
    "1px solid color-mix(in srgb, var(--color-foreground) 16%, transparent)",
  borderRadius: "0.625rem",
  display: "flex",
  gap: "0.45rem",
  marginTop: "0.75rem",
  minHeight: "2.75rem",
  padding: "0.55rem 0.7rem",
};

const statusDotStyle: CSSProperties = {
  borderRadius: "999px",
  flex: "0 0 auto",
  height: "0.55rem",
  width: "0.55rem",
};

const buttonStyle: CSSProperties = {
  background: "var(--blume-accent)",
  border: 0,
  borderRadius: "0.5rem",
  color: "var(--blume-accent-foreground)",
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.875rem",
  fontWeight: 650,
  marginTop: "0.75rem",
  padding: "0.55rem 0.8rem",
};
