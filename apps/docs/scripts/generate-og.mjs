// Renders the landing page's custom Open Graph card (1200x630) to
// public/og-home.png using Takumi — the same renderer Blume uses, but driven
// directly here so the layout isn't limited to Blume's og config surface.
//
// The right zone is the "viewport": an observed element crosses into it and
// clips the card's right edge — an intersection, the product's whole idea.
//
// Run once and commit the PNG (Vercel serves the static file; it never renders
// Takumi at build). Regenerate with:  pnpm --filter docs og
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
const PANEL = "#0f0f18";
const FG = "#f5f3ff";
const MUTED = "#a6a3be";
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

function skeletonBar(width, alpha = 0.1) {
  return container({
    style: {
      backgroundColor: `rgb(255 255 255 / ${alpha})`,
      borderRadius: 7,
      height: 15,
      width,
    },
  });
}

// The observed element: a media card that has crossed into the viewport and
// runs off the right edge of the OG card (clipped by the root's overflow).
function observedElement(mono) {
  return container({
    style: {
      backgroundColor: PANEL,
      border: `1px solid ${VLINE}`,
      borderRadius: 24,
      display: "flex",
      flexDirection: "column",
      gap: 22,
      height: 344,
      left: 726,
      padding: 30,
      position: "absolute",
      top: 143,
      width: 640,
    },
    children: [
      // "in view" pill — the observer's verdict for this element.
      container({
        style: {
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: "rgb(52 211 153 / 0.13)",
          border: "1px solid rgb(52 211 153 / 0.42)",
          borderRadius: 999,
          display: "flex",
          gap: 10,
          paddingBottom: 8,
          paddingLeft: 14,
          paddingRight: 18,
          paddingTop: 8,
        },
        children: [
          container({
            style: {
              backgroundColor: EMERALD,
              borderRadius: 999,
              height: 11,
              width: 11,
            },
          }),
          text("in view", { color: EMERALD, fontFamily: mono, fontSize: 20 }),
        ],
      }),
      // Media thumbnail carrying the brand gradient.
      container({
        style: {
          backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)",
          borderRadius: 14,
          height: 150,
          width: "100%",
        },
      }),
      skeletonBar("82%", 0.12),
      skeletonBar("58%", 0.08),
    ],
  });
}

async function main() {
  const f = await loadFonts();

  const brand = container({
    style: { alignItems: "center", display: "flex", gap: 16, marginBottom: 40 },
    children: [
      image({ src: ICON_URI, width: 50, height: 50 }),
      text("React Intersection Observer", {
        color: FG,
        fontFamily: f.display,
        fontSize: 27,
        fontWeight: 600,
        letterSpacing: "-0.01em",
      }),
    ],
  });

  const message = container({
    style: { display: "flex", flexDirection: "column", maxWidth: 560 },
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

  // The viewport boundary the element has crossed, and its label.
  const boundary = container({
    style: {
      backgroundColor: "rgb(167 139 250 / 0.4)",
      height: 452,
      left: 686,
      position: "absolute",
      top: 89,
      width: 2,
    },
  });
  const boundaryLabel = container({
    style: { left: 686, position: "absolute", top: 56 },
    children: [
      text("viewport", {
        color: "rgb(200 188 245 / 0.9)",
        fontFamily: f.mono,
        fontSize: 16,
      }),
    ],
  });

  const root = container({
    style: {
      alignItems: "flex-start",
      backgroundColor: BG,
      backgroundImage:
        "radial-gradient(880px 520px at 86% -14%, rgb(139 92 246 / 0.26), transparent 60%)",
      color: FG,
      display: "flex",
      flexDirection: "column",
      height: HEIGHT,
      justifyContent: "center",
      overflow: "hidden",
      paddingLeft: 72,
      paddingRight: 72,
      position: "relative",
      width: WIDTH,
    },
    // Paint order: the element card, then the boundary line + label on top of
    // it (so the line reads as the edge it crossed), then the message.
    children: [observedElement(f.mono), boundary, boundaryLabel, message],
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
