// A Content cover in the "Product window" look, drawn from what
// `coverLayout()` in src/lib/cover.ts decides. One component serves two
// renderers:
//
// - On a card, Astro renders it with no client directive, as static HTML.
//   Its colours are the site's tokens through `var()`, so it follows the
//   theme, and its sizes are container-query units, so it scales to the
//   card's width with no JavaScript.
// - For an Open Graph image, satori renders it at 1200 by 630 pixels, with
//   the light tokens set inline on its root.
//
// satori sets its rules: inline styles only, `display: flex` on every `div`
// with more than one child, no `calc()`, and one line-clamp recipe
// (`display: -webkit-box`, a vertical box orient, a line clamp, hidden
// overflow and an ellipsis) that clamps in satori and browsers alike. Every
// length below is in pixels on the 1200 by 630 canvas, passed through
// `size()`.

import type { CSSProperties, ReactNode } from "react";
import {
  coverLayout,
  type CoverBar,
  type CoverProps,
  type CoverRow,
  type CoverWindow,
} from "../lib/cover.ts";

/** Where the cover is drawn: on a Content card, or as an Open Graph image. */
export type CoverUse = "card" | "open-graph";

export type Props = CoverProps & {
  /**
   * The Educates mark: its URL path on a card, a data URI for an Open Graph
   * image.
   */
  logo: string;
  /** Where the cover is drawn; a card unless given. */
  use?: CoverUse;
  /**
   * Custom properties set on the root, for a renderer without the site's
   * stylesheet: the light tokens for an Open Graph image.
   */
  tokens?: Readonly<Record<string, string>>;
};

/** The canvas every length is drawn on. */
const WIDTH = 1200;
const HEIGHT = 630;

/** The window's left edge and width; it bleeds off the right of the canvas. */
const WINDOW_LEFT = 652;
const WINDOW_WIDTH = 640;
/** How much of the window's width is past the canvas's right edge. */
const WINDOW_HIDDEN = WINDOW_LEFT + WINDOW_WIDTH - WIDTH;

type Size = (pixels: number) => string;

/**
 * A length on the canvas, written for the renderer: pixels for an Open
 * Graph image, or the same fraction of the card's width in container-query
 * units (`cqw`), so 1200 pixels is the card's full width.
 */
function sizer(use: CoverUse): Size {
  return use === "open-graph"
    ? (pixels) => `${pixels}px`
    : (pixels) => `${+((pixels * 100) / WIDTH).toFixed(4)}cqw`;
}

const color = (token: string) => `var(--color-${token})`;
const sans = "var(--font-sans)";
const mono = "var(--font-mono)";

/** The one line-clamp recipe that works in satori and in browsers. */
const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

/** One line of text, cut with an ellipsis. */
const oneLine: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default function Cover({ logo, use = "card", tokens, ...props }: Props) {
  const size = sizer(use);
  const layout = coverLayout(props as CoverProps);
  const logoWidth = 48;
  const logoHeight = Math.round((logoWidth * 636) / 656);

  const canvas = (
    <div
      style={{
        ...tokens,
        display: "flex",
        position: "relative",
        width: size(WIDTH),
        height: size(HEIGHT),
        overflow: "hidden",
        backgroundColor: color("background"),
        // A dot of 2.2 pixels every 30. The stops are percentages of the
        // gradient's ray, half the tile's diagonal: satori measures pixel
        // stops against the whole element instead.
        backgroundImage: `radial-gradient(${color("cover-dots")} 10.37%, transparent 12.73%)`,
        backgroundSize: `${size(30)} ${size(30)}`,
        color: color("ink"),
        fontFamily: sans,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: size(72),
          top: size(64),
          bottom: size(60),
          width: size(530),
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: size(14),
            fontFamily: mono,
            fontWeight: 600,
            fontSize: size(24),
            lineHeight: 1,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: color("accent"),
          }}
        >
          <div
            style={{
              width: size(14),
              height: size(14),
              borderRadius: "50%",
              backgroundColor: color("accent"),
            }}
          />
          <div>{layout.kind}</div>
          {layout.external && <ExternalMark size={size} />}
        </div>
        <div
          style={{
            ...clamp(4),
            fontWeight: 700,
            fontSize: size(layout.titleSize),
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            color: color("ink"),
          }}
        >
          {layout.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: size(14),
            fontWeight: 600,
            fontSize: size(26),
            lineHeight: 1,
          }}
        >
          <img
            src={logo}
            alt=""
            width={use === "open-graph" ? logoWidth : undefined}
            height={use === "open-graph" ? logoHeight : undefined}
            style={{ width: size(logoWidth), height: size(logoHeight) }}
          />
          <div>educates.dev</div>
          {layout.footnote && (
            <div
              style={{
                marginLeft: size(10),
                fontFamily: mono,
                fontWeight: 400,
                fontSize: size(22),
                color: color("ink-muted"),
              }}
            >
              {layout.footnote}
            </div>
          )}
        </div>
      </div>
      <Window window={layout.window} size={size} use={use} />
    </div>
  );

  if (use === "open-graph") return canvas;
  // On a card, the wrapper is the container the canvas's `cqw` lengths
  // measure: an element's container-query units never resolve against
  // itself.
  return (
    <div
      style={{
        containerType: "inline-size",
        position: "relative",
        width: "100%",
        aspectRatio: `${WIDTH} / ${HEIGHT}`,
        overflow: "hidden",
      }}
    >
      {canvas}
    </div>
  );
}

/** The window on the right, drawn like the Session dashboard. */
function Window({
  window,
  size,
  use,
}: {
  window: CoverWindow;
  size: Size;
  use: CoverUse;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: size(WINDOW_LEFT),
        top: size(70),
        width: size(WINDOW_WIDTH),
        height: size(640),
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: color("surface"),
        border: `${size(2)} solid ${color("line")}`,
        borderRadius: size(22),
        boxShadow: `0 ${size(30)} ${size(70)} ${color("cover-shadow")}`,
      }}
    >
      {windowTop(window, size)}
      {windowBody(window, size, use)}
    </div>
  );
}

/**
 * The top of the window: the dashboard's blue bar, or a browser's address
 * bar for an outside article.
 */
function windowTop(window: CoverWindow, size: Size): ReactNode {
  if (window.type !== "browser") return <Bar bar={window.bar} size={size} />;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        gap: size(12),
        height: size(64),
        padding: `0 ${size(20)}`,
        backgroundColor: color("chrome"),
      }}
    >
      {[0, 1, 2].map((dot) => (
        <div
          key={dot}
          style={{
            flexShrink: 0,
            width: size(14),
            height: size(14),
            borderRadius: "50%",
            backgroundColor: color("line"),
          }}
        />
      ))}
      <div
        style={{
          ...oneLine,
          flexGrow: 1,
          minWidth: 0,
          marginLeft: size(8),
          padding: `${size(9)} ${size(18)}`,
          backgroundColor: color("surface"),
          border: `${size(2)} solid ${color("line")}`,
          borderRadius: size(999),
          fontFamily: mono,
          fontWeight: 400,
          fontSize: size(19),
          lineHeight: 1,
          color: color("ink-muted"),
        }}
      >
        {window.address}
      </div>
    </div>
  );
}

/** What fills the window below its top. */
function windowBody(window: CoverWindow, size: Size, use: CoverUse): ReactNode {
  switch (window.type) {
    case "contents":
      return (
        <Body size={size}>
          <Label size={size}>On this page</Label>
          {window.rows.map((row) => (
            <Row key={row.number} row={row} size={size} />
          ))}
        </Body>
      );
    case "summary":
      return (
        <Body size={size}>
          <Label size={size}>Summary</Label>
          <Text size={size}>{window.text}</Text>
        </Body>
      );
    case "path":
      return (
        <Body size={size}>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: size(26),
              padding: `${size(8)} 0 0 ${size(4)}`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: size(31),
                top: size(30),
                bottom: size(30),
                width: size(3),
                backgroundColor: color("line"),
              }}
            />
            {window.steps.map((step) => (
              <div
                key={step.marker}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: size(22),
                  fontWeight: step.current ? 700 : 400,
                  fontSize: size(28),
                  lineHeight: 1.2,
                  color: step.current ? color("ink") : color("ink-muted"),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: size(56),
                    height: size(56),
                    borderRadius: "50%",
                    border: `${size(3)} solid ${color("accent")}`,
                    backgroundColor: step.current
                      ? color("accent")
                      : color("surface"),
                    color: step.current ? color("surface") : color("accent"),
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: size(24),
                    lineHeight: 1,
                  }}
                >
                  {step.marker}
                </div>
                <div>{step.label}</div>
              </div>
            ))}
          </div>
        </Body>
      );
    case "video":
      return (
        <div
          style={{
            position: "relative",
            display: "flex",
            flexGrow: 1,
            backgroundColor: color("logo-blue"),
          }}
        >
          {window.poster ? (
            <img
              src={window.poster}
              alt=""
              width={use === "open-graph" ? WINDOW_WIDTH : undefined}
              height={use === "open-graph" ? 576 : undefined}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                ...clamp(2),
                position: "absolute",
                left: size(30),
                top: size(28),
                width: size(WINDOW_WIDTH - WINDOW_HIDDEN - 60),
                fontWeight: 700,
                fontSize: size(32),
                lineHeight: 1.2,
                color: color("dashboard-bar-ink"),
              }}
            >
              {window.source}
            </div>
          )}
          <PlayMarker size={size} />
        </div>
      );
    case "browser":
      return (
        <Body size={size} gap={16}>
          <div
            style={{
              ...clamp(4),
              fontWeight: 600,
              fontSize: size(34),
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              color: color("ink"),
            }}
          >
            {window.quote}
          </div>
          {[92, 84, 88, 62].map((width) => (
            <div
              key={width}
              style={{
                width: `${width}%`,
                height: size(14),
                borderRadius: size(7),
                backgroundColor: color("line"),
              }}
            />
          ))}
          <div
            style={{
              marginTop: size(10),
              fontFamily: mono,
              fontWeight: 400,
              fontSize: size(19),
              lineHeight: 1,
              color: color("ink-muted"),
            }}
          >
            {window.byline}
          </div>
        </Body>
      );
    case "session":
      return (
        <Body size={size}>
          <Text size={size}>Deploy the frontend to the cluster.</Text>
          <Action size={size}>kubectl apply -f frontend/</Action>
          <Text size={size} marginTop={8}>
            Then check that it's ready.
          </Text>
          <Action size={size}>examiner: deployment ready</Action>
        </Body>
      );
  }
}

/**
 * The window's blue bar. Its right-hand end stops at the canvas's edge, so
 * the detail stays in view.
 */
function Bar({ bar, size }: { bar: CoverBar; size: Size }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        gap: size(20),
        height: size(64),
        padding: `0 ${size(26 + WINDOW_HIDDEN)} 0 ${size(26)}`,
        backgroundColor: color("dashboard-bar"),
        color: color("dashboard-bar-ink"),
        fontFamily: mono,
        fontWeight: 600,
        fontSize: size(21),
        lineHeight: 1,
      }}
    >
      <div style={{ ...oneLine, minWidth: 0 }}>{bar.label}</div>
      {bar.detail && <div style={{ flexShrink: 0 }}>{bar.detail}</div>}
    </div>
  );
}

function Body({
  size,
  gap = 10,
  children,
}: {
  size: Size;
  gap?: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: size(gap),
        padding: `${size(28)} ${size(30)}`,
      }}
    >
      {children}
    </div>
  );
}

function Label({ size, children }: { size: Size; children: string }) {
  return (
    <div
      style={{
        marginBottom: size(6),
        fontFamily: mono,
        fontWeight: 600,
        fontSize: size(18),
        lineHeight: 1,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: color("ink-muted"),
      }}
    >
      {children}
    </div>
  );
}

function Text({
  size,
  marginTop = 0,
  children,
}: {
  size: Size;
  marginTop?: number;
  children: string;
}) {
  return (
    <div
      style={{
        marginTop: size(marginTop),
        fontWeight: 400,
        fontSize: size(28),
        lineHeight: 1.4,
        color: color("ink"),
      }}
    >
      {children}
    </div>
  );
}

/** The box of a row: a numbered heading, or a clickable action. */
function rowStyle(size: Size, action: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: size(18),
    padding: `${size(12)} ${size(16)}`,
    borderRadius: size(12),
    border: `${size(2)} solid ${action ? color("highlight-line") : "transparent"}`,
    backgroundColor: action ? color("highlight") : "transparent",
    color: action ? color("highlight-ink") : color("ink"),
    fontWeight: 400,
    fontSize: size(26),
    lineHeight: 1.3,
  };
}

function Row({ row, size }: { row: CoverRow; size: Size }) {
  return (
    <div style={rowStyle(size, row.action)}>
      {row.action ? (
        <RunMark size={size} />
      ) : (
        <div
          style={{
            flexShrink: 0,
            fontFamily: mono,
            fontWeight: 600,
            fontSize: size(20),
            lineHeight: 1,
            color: color("ink-muted"),
          }}
        >
          {row.number}
        </div>
      )}
      <div>{row.text}</div>
    </div>
  );
}

/** A clickable action with a command, as in a workshop's instructions. */
function Action({ size, children }: { size: Size; children: string }) {
  return (
    <div style={rowStyle(size, true)}>
      <RunMark size={size} />
      <div style={{ fontFamily: mono, fontSize: size(22) }}>{children}</div>
    </div>
  );
}

/** The triangle that marks a clickable action, in the text's colour. */
function RunMark({ size }: { size: Size }) {
  return (
    <svg
      viewBox="0 0 10 10"
      style={{ flexShrink: 0, width: size(18), height: size(18) }}
      fill="currentColor"
    >
      <path d="M1.5 0.8 9.2 5 1.5 9.2z" />
    </svg>
  );
}

/** The arrow that marks a link leaving the site, in the text's colour. */
function ExternalMark({ size }: { size: Size }) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ flexShrink: 0, width: size(26), height: size(26) }}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

/** The yellow play marker over a video's poster or its blue ground. */
function PlayMarker({ size }: { size: Size }) {
  const diameter = 128;
  const center = { x: 318, y: 246 };
  return (
    <div
      style={{
        position: "absolute",
        left: size(center.x - diameter / 2),
        top: size(center.y - diameter / 2),
        width: size(diameter),
        height: size(diameter),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        backgroundColor: color("play-marker"),
        boxShadow: `0 ${size(12)} ${size(40)} rgba(0, 0, 0, 0.35)`,
        color: color("play-marker-ink"),
      }}
    >
      <svg
        viewBox="0 0 10 10"
        style={{
          width: size(diameter * 0.36),
          height: size(diameter * 0.36),
          marginLeft: size(diameter * 0.06),
        }}
        fill="currentColor"
      >
        <path d="M1.5 0.8 9.2 5 1.5 9.2z" />
      </svg>
    </div>
  );
}
