// Renders the landing page's custom Open Graph card (1200x630) to
// public/og-home.png using Takumi — the same renderer Blume uses, but driven
// directly here so the layout isn't limited to Blume's og config surface.
//
// Run once and commit the PNG (Vercel serves the static file; it never renders
// Takumi at build). Regenerate with:  node scripts/generate-og.mjs
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "takumi-js";
import { container, googleFonts, image, text } from "takumi-js/helpers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "og-home.png");
const WIDTH = 1200;
const HEIGHT = 630;

// Palette mirrored from the landing page (home.css instrument surface).
const BG = "#0b0b12";
const PANEL = "#0d0d15";
const FG = "#f5f3ff";
const MUTED = "#a6a3be";
const VIOLET = "#a78bfa";
const EMERALD = "#34d399";
const VLINE = "rgb(167 139 250 / 0.35)";

// The brand mark, recoloured light so its bracket reads on the dark card
// (the source logo strokes with currentColor, i.e. black).
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="t" x1="30" y1="30" x2="58" y2="58" gradientUnits="userSpaceOnUse">
    <stop stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/>
  </linearGradient></defs>
  <path d="M7 28V15C7 10.6 10.6 7 15 7H27M37 7H49C53.4 7 57 10.6 57 15V23M7 37V49C7 53.4 10.6 57 15 57H23"
    fill="none" stroke="#ece9f8" stroke-linecap="round" stroke-width="4"/>
  <rect x="30" y="30" width="28" height="28" rx="8" fill="url(#t)"/>
</svg>`;
const ICON_URI = `data:image/svg+xml;base64,${Buffer.from(ICON).toString("base64")}`;

// A crosshair for the "target" chip, echoing the page's instrument.
const TARGET = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
  stroke="#c9b8ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.6"/>
  <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/></svg>`;
const TARGET_URI = `data:image/svg+xml;base64,${Buffer.from(TARGET).toString("base64")}`;

async function loadFonts() {
  try {
    const subsets = await googleFonts([
      { name: "Inter Tight", weight: [600, 700] },
      { name: "Inter", weight: 400 },
      { name: "IBM Plex Mono", weight: 500 },
    ]);
    return {
      subsets,
      display: "Inter Tight",
      body: "Inter",
      mono: "IBM Plex Mono",
    };
  } catch (error) {
    console.warn(
      "[og] Google Fonts unavailable, using built-in font:",
      error?.message ?? error,
    );
    return {
      subsets: undefined,
      display: undefined,
      body: undefined,
      mono: undefined,
    };
  }
}

function readout(key, value, mono, valueColor) {
  return container({
    children: [
      text(key, { color: MUTED, fontFamily: mono, fontSize: 22 }),
      text(value, {
        color: valueColor,
        fontFamily: mono,
        fontSize: 22,
        fontWeight: 600,
      }),
    ],
    style: {
      alignItems: "center",
      borderBottom: `1px solid rgb(255 255 255 / 0.06)`,
      display: "flex",
      justifyContent: "space-between",
      paddingBottom: 10,
      width: "100%",
    },
  });
}

function instrument(mono) {
  return container({
    style: {
      backgroundColor: PANEL,
      border: `1px solid ${VLINE}`,
      borderRadius: 22,
      display: "flex",
      flexDirection: "column",
      gap: 22,
      justifyContent: "space-between",
      padding: 32,
      width: 424,
    },
    children: [
      // Header: live dot · observer · LIVE badge
      container({
        style: { alignItems: "center", display: "flex", gap: 12 },
        children: [
          container({
            style: {
              backgroundColor: EMERALD,
              borderRadius: 999,
              height: 12,
              width: 12,
            },
          }),
          text("observer", { color: MUTED, fontFamily: mono, fontSize: 22 }),
          container({
            style: {
              border: `1px solid ${VLINE}`,
              borderRadius: 6,
              marginLeft: "auto",
              paddingBottom: 3,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 3,
            },
            children: [
              text("LIVE", { color: VIOLET, fontFamily: mono, fontSize: 16 }),
            ],
          }),
        ],
      }),
      // Viewport field: a threshold line the target chip sits on.
      container({
        style: {
          alignItems: "center",
          backgroundColor: "#0a0a11",
          border: `1px solid rgb(255 255 255 / 0.08)`,
          borderRadius: 14,
          display: "flex",
          height: 152,
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        },
        children: [
          container({
            style: {
              backgroundColor: "rgb(167 139 250 / 0.45)",
              height: 1,
              left: 0,
              position: "absolute",
              top: 97,
              width: "100%",
            },
          }),
          container({
            style: { position: "absolute", right: 16, top: 74 },
            children: [
              text("threshold", {
                color: "rgb(200 188 245 / 0.85)",
                fontFamily: mono,
                fontSize: 15,
              }),
            ],
          }),
          container({
            style: {
              alignItems: "center",
              backgroundColor: "rgb(167 139 250 / 0.18)",
              border: `1px solid ${VLINE}`,
              borderRadius: 10,
              display: "flex",
              gap: 8,
              paddingBottom: 10,
              paddingLeft: 14,
              paddingRight: 16,
              paddingTop: 10,
              position: "relative",
            },
            children: [
              image({ src: TARGET_URI, width: 18, height: 18 }),
              text("Hero", { color: FG, fontFamily: mono, fontSize: 22 }),
            ],
          }),
        ],
      }),
      readout("intersectionRatio", "1.00", mono, FG),
      readout("inView", "true", mono, EMERALD),
    ],
  });
}

async function main() {
  const f = await loadFonts();

  // Brand lockup anchors the top of the message column instead of floating
  // alone as a header, so the left and right columns share a vertical extent.
  const brand = container({
    style: { alignItems: "center", display: "flex", gap: 18, marginBottom: 42 },
    children: [
      image({ src: ICON_URI, width: 60, height: 60 }),
      text("React Intersection Observer", {
        color: FG,
        fontFamily: f.display,
        fontSize: 30,
        fontWeight: 600,
        letterSpacing: "-0.01em",
      }),
    ],
  });

  const message = container({
    style: {
      display: "flex",
      flexDirection: "column",
      maxWidth: 566,
      paddingRight: 40,
    },
    children: [
      brand,
      text("Know the moment an element meets the viewport.", {
        color: FG,
        fontFamily: f.display,
        fontSize: 58,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
      }),
      text(
        "A tiny, fully-typed React adapter for the Intersection Observer API.",
        {
          color: MUTED,
          fontFamily: f.body,
          fontSize: 26,
          lineHeight: 1.4,
          marginTop: 24,
          maxWidth: 468,
        },
      ),
    ],
  });

  // The two-column band, centred as a unit so top and bottom margins match.
  // `stretch` matches the instrument's height to the message column so their
  // tops and bottoms align; the panel distributes its rows to fill.
  const band = container({
    style: {
      alignItems: "stretch",
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
    },
    children: [message, instrument(f.mono)],
  });

  const root = container({
    style: {
      backgroundColor: BG,
      backgroundImage:
        "radial-gradient(900px 520px at 88% -12%, rgb(139 92 246 / 0.28), transparent 60%)",
      color: FG,
      display: "flex",
      flexDirection: "column",
      height: HEIGHT,
      justifyContent: "center",
      paddingLeft: 72,
      paddingRight: 72,
      width: WIDTH,
    },
    children: [band],
  });

  const png = await render(root, {
    fonts: f.subsets,
    format: "png",
    height: HEIGHT,
    width: WIDTH,
  });
  await writeFile(OUT, png);
  console.log(`[og] wrote ${OUT} (${png.length} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
