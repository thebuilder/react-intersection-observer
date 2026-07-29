import { useState } from "react";
import { useInView } from "react-intersection-observer";
import RecipeDemo, { type Recipe } from "./RecipeDemo";

export const client = "load";

const thresholds = [0, 0.5, 1] as const;

export default function ObserverDemo({ recipe }: { recipe?: Recipe }) {
  return recipe ? <RecipeDemo recipe={recipe} /> : <LiveObserverDemo />;
}

function LiveObserverDemo() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [threshold, setThreshold] = useState<(typeof thresholds)[number]>(0.5);
  const { entry, inView, ref } = useInView({
    root,
    threshold,
  });
  const ratio = entry?.intersectionRatio.toFixed(2) ?? "—";

  return (
    <section
      aria-label="Interactive intersection observer demo"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--blume-accent) 12%, var(--color-background)), var(--color-background) 48%)",
        border:
          "1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent)",
        borderRadius: "1rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "space-between",
          padding: "1rem 1rem 0",
        }}
      >
        <div>
          <strong style={{ fontSize: "1.125rem" }}>
            See when an element becomes visible
          </strong>
        </div>
        <button
          onClick={() => root?.scrollTo({ behavior: "smooth", top: 0 })}
          style={{
            background:
              "color-mix(in srgb, var(--color-foreground) 9%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--color-foreground) 24%, transparent)",
            borderRadius: "999px",
            color: "var(--color-foreground)",
            cursor: "pointer",
            font: "inherit",
            padding: "0.45rem 0.75rem",
          }}
          type="button"
        >
          ↺ Start over
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))",
          padding: "1rem",
        }}
      >
        <section
          aria-label="Scrollable feed. Scroll to reveal the feature card."
          ref={setRoot}
          style={{
            background:
              "color-mix(in srgb, var(--color-foreground) 3%, transparent)",
            alignSelf: "stretch",
            blockSize: "27rem",
            border:
              "1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent)",
            borderRadius: "0.75rem",
            overflowY: "auto",
            padding: "0.75rem",
          }}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: A labelled custom scroll viewport needs keyboard focus.
          tabIndex={0}
        >
          <div
            style={{
              background: "var(--color-background)",
              border:
                "1px solid color-mix(in srgb, var(--color-foreground) 14%, transparent)",
              borderRadius: "0.45rem",
              color: "var(--color-muted-foreground)",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              margin: "0.1rem 0 0.4rem",
              padding: "0.5rem 0.6rem",
            }}
          >
            Step 2 · Scroll this panel to reveal the observed card ↓
          </div>
          <FeedTeaser label="Design systems that travel" tone="warm" />
          <FeedTeaser label="A quiet note on shipping" tone="cool" />
          <FeedTeaser label="Small details, deliberately timed" tone="warm" />
          <FeedTeaser label="A scroll worth observing" tone="cool" />

          <article
            ref={ref}
            style={{
              background: inView
                ? "linear-gradient(135deg, #28234a, #1f3d57)"
                : "var(--blume-muted)",
              border: inView
                ? "1px solid color-mix(in srgb, #a78bfa 58%, transparent)"
                : "1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent)",
              borderRadius: "0.65rem",
              color: inView ? "#f8fafc" : "var(--color-foreground)",
              display: "grid",
              gap: "0.65rem",
              minBlockSize: "9.5rem",
              padding: "0.9rem",
              transition:
                "background 180ms ease, border-color 180ms ease, color 180ms ease",
            }}
          >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  background: inView
                    ? "rgb(221 214 254 / 0.18)"
                    : "var(--color-background)",
                  border: inView
                    ? "1px solid rgb(221 214 254 / 0.38)"
                    : "1px solid color-mix(in srgb, var(--color-foreground) 14%, transparent)",
                  borderRadius: "999px",
                  color: inView ? "#ede9fe" : "var(--color-muted-foreground)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.5rem",
                }}
              >
                {inView ? "Loaded" : "Queued"}
              </span>
              <span
                style={{
                  color: inView ? "#c4b5fd" : "var(--color-muted-foreground)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {inView ? "Threshold reached" : "Watching"}
              </span>
            </div>

            <div>
              <strong
                style={{
                  color: inView ? "#f8fafc" : "var(--color-foreground)",
                  display: "block",
                  fontSize: "1.05rem",
                  lineHeight: 1.3,
                }}
              >
                {inView ? "Feature card is ready" : "Feature card is waiting"}
              </strong>
              <p
                style={{
                  color: inView ? "#d8d2ff" : "var(--color-muted-foreground)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  margin: "0.5rem 0 0",
                }}
              >
                {inView
                  ? "The observer crossed the selected threshold."
                  : "Scroll until enough of this card is visible."}
              </p>
            </div>

            <div
              style={{
                alignItems: "center",
                color: inView ? "#c4b5fd" : "var(--color-muted-foreground)",
                display: "flex",
                fontSize: "0.75rem",
                fontWeight: 600,
                gap: "0.4rem",
                marginTop: "auto",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  background: inView
                    ? "#a78bfa"
                    : "var(--color-muted-foreground)",
                  blockSize: "0.4rem",
                  borderRadius: "999px",
                  inlineSize: "0.4rem",
                }}
              />
              {inView ? "Ready to reveal" : "Waiting for visibility"}
            </div>
          </article>

          <FeedTeaser label="Where interaction begins" tone="cool" />
        </section>

        <aside
          style={{
            alignContent: "start",
            background:
              "color-mix(in srgb, var(--color-foreground) 5%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent)",
            borderRadius: "0.75rem",
            display: "grid",
            gap: "1rem",
            order: -1,
            padding: "1rem",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--color-muted-foreground)",
                fontSize: "0.75rem",
              }}
            >
              Step 1 · Choose a trigger point
            </div>
            <div
              style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}
            >
              {thresholds.map((value) => (
                <button
                  aria-pressed={threshold === value}
                  aria-label={`Trigger when ${value === 0 ? "any part" : `${value * 100}%`} of the card is visible`}
                  key={value}
                  onClick={() => setThreshold(value)}
                  style={{
                    background:
                      threshold === value
                        ? "var(--blume-action)"
                        : "var(--color-background)",
                    border:
                      threshold === value
                        ? "1px solid color-mix(in srgb, var(--blume-action) 72%, var(--color-foreground))"
                        : "1px solid color-mix(in srgb, var(--color-foreground) 24%, transparent)",
                    borderRadius: "0.4rem",
                    color:
                      threshold === value
                        ? "var(--blume-action-foreground)"
                        : "var(--color-foreground)",
                    cursor: "pointer",
                    flex: 1,
                    font: "inherit",
                    fontWeight: threshold === value ? 700 : 500,
                    padding: "0.55rem 0.2rem",
                  }}
                  type="button"
                >
                  {value === 0 ? "Any" : `${value * 100}%`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                color: "var(--color-muted-foreground)",
                fontSize: "0.75rem",
              }}
            >
              Live result
            </div>
            <div
              aria-atomic="true"
              aria-live="polite"
              style={{
                alignItems: "center",
                display: "flex",
                fontSize: "1.15rem",
                fontWeight: 700,
                gap: "0.5rem",
                marginTop: "0.4rem",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  background: inView
                    ? "#34d399"
                    : "var(--color-muted-foreground)",
                  blockSize: "0.65rem",
                  borderRadius: "999px",
                  inlineSize: "0.65rem",
                }}
              />
              {inView ? "In view" : "Waiting"}
            </div>
          </div>

          <div
            style={{
              borderTop:
                "1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent)",
              display: "grid",
              gap: "0.45rem",
              paddingTop: "0.85rem",
            }}
          >
            <Signal label="intersectionRatio" value={ratio} />
            <Signal label="trigger" value={`threshold ${threshold}`} />
            <Signal label="target" value="feature card" />
          </div>

          <div
            style={{
              borderTop:
                "1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent)",
              display: "grid",
              gap: "0.45rem",
              paddingTop: "0.85rem",
            }}
          >
            <span
              style={{
                color: "var(--color-muted-foreground)",
                fontSize: "0.75rem",
              }}
            >
              Hook setup
            </span>
            <code
              style={{
                background: "var(--color-background)",
                border:
                  "1px solid color-mix(in srgb, var(--color-foreground) 14%, transparent)",
                borderRadius: "0.4rem",
                fontSize: "0.75rem",
                padding: "0.55rem 0.6rem",
              }}
            >
              {`useInView({ root, threshold: ${threshold} })`}
            </code>
            <span
              style={{
                color: "var(--color-muted-foreground)",
                fontSize: "0.75rem",
              }}
            >
              The feed panel is this demo&apos;s custom root.
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FeedTeaser({ label, tone }: { label: string; tone: "cool" | "warm" }) {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: "0.75rem",
        padding: "0.75rem 0.25rem",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          background:
            tone === "warm"
              ? "linear-gradient(135deg, #fbbf24, #fb7185)"
              : "linear-gradient(135deg, #38bdf8, #818cf8)",
          blockSize: "2.75rem",
          borderRadius: "0.45rem",
          inlineSize: "2.75rem",
        }}
      />
      <div>
        <strong style={{ display: "block", fontSize: "0.875rem" }}>
          {label}
        </strong>
        <span
          style={{
            color: "var(--color-muted-foreground)",
            fontSize: "0.75rem",
          }}
        >
          A small feed item
        </span>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: "0.75rem",
        justifyContent: "space-between",
      }}
    >
      <span style={{ color: "var(--color-muted-foreground)" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
