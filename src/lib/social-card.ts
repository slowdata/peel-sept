import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import type { Issue, Track } from '../data/issues';
import { formatDateRange, weekLabel } from '../i18n';

const BG = '#0a0a0a';
const FG = '#f3f1ee';
const MUTED = '#8d8a86';
const FAINT = '#5a5854';
const LINE = '#211f1d';
const ACCENT = '#e2895a';

const CARD_SIZES = {
  og: { width: 1200, height: 630 },
  ig: { width: 1080, height: 1080 },
} as const;

type CardKind = keyof typeof CARD_SIZES;
type Child = string | number | false | null | undefined | Element | Child[];
type Element = {
  type: string;
  props: Record<string, unknown> & { children?: Child[] };
};

type Style = Record<string, string | number>;

let fontsPromise: Promise<{ fraunces: Buffer; syne: Buffer }> | undefined;

export async function renderSocialCardPng(issue: Issue, kind: CardKind): Promise<Uint8Array> {
  const size = CARD_SIZES[kind];
  const fonts = await loadFonts();
  const svg = await satori(cardElement(issue, kind), {
    ...size,
    fonts: [
      { name: 'Fraunces', data: fonts.fraunces, weight: 500 },
      { name: 'Syne', data: fonts.syne, weight: 400 },
    ],
  });
  return new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: size.width,
    },
  })
    .render()
    .asPng();
}

function cardElement(issue: Issue, kind: CardKind): Element {
  return kind === 'og' ? ogCard(issue) : instagramCard(issue);
}

function ogCard(issue: Issue): Element {
  const tracks = issue.tracks.slice(0, 7);
  return h(
    'div',
    {
      style: rootStyle(1200, 630, 58),
    },
    h('div', { style: topRowStyle }, brandBlock(82), metaBlock(issue, 30)),
    h('div', { style: ogBodyStyle }, trackList(tracks, 'og')),
    h('div', { style: footerStyle }, h('div', { style: ruleStyle }), h('div', { style: footerTextStyle }, 'peel.sept.pt')),
  );
}

function instagramCard(issue: Issue): Element {
  const tracks = issue.tracks.slice(0, 7);
  return h(
    'div',
    {
      style: rootStyle(1080, 1080, 70),
    },
    h('div', { style: igHeaderStyle }, brandBlock(88), metaBlock(issue, 30)),
    h('div', { style: igBodyStyle }, trackList(tracks, 'ig')),
    h('div', { style: footerStyle }, h('div', { style: ruleStyle }), h('div', { style: footerTextStyle }, 'seven songs · by hand')),
  );
}

function brandBlock(size: number): Element {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' } },
    h(
      'div',
      {
        style: {
          display: 'flex',
          color: FG,
          fontFamily: 'Fraunces',
          fontSize: size,
          lineHeight: 0.92,
          letterSpacing: '-2px',
        },
      },
      'Peel',
      h('span', { style: { color: MUTED, marginLeft: 20 } }, 'Sept'),
    ),
    h('div', { style: kickerStyle }, 'human-selected weekly discoveries'),
  );
}

function metaBlock(issue: Issue, size: number): Element {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 } },
    h('div', { style: { ...monoStyle, color: ACCENT, fontSize: size } }, weekLabel('en', issue)),
    h('div', { style: { ...monoStyle, color: MUTED, fontSize: size } }, formatDateRange(issue.start_date, issue.end_date, 'en')),
  );
}

function trackList(tracks: Track[], kind: CardKind): Element {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
    tracks.map((track) => trackRow(track, kind)),
  );
}

function trackRow(track: Track, kind: CardKind): Element {
  const isInstagram = kind === 'ig';
  const title = truncate(track.title, isInstagram ? 35 : 38);
  const artist = truncate(track.artist, isInstagram ? 40 : 34);
  return h(
    'div',
    {
      style: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        borderTop: `1px solid ${LINE}`,
        padding: isInstagram ? '14px 0' : '10px 0',
      },
    },
    h('div', { style: { ...rankStyle, fontSize: isInstagram ? 18 : 16, width: isInstagram ? 68 : 66 } }, twoDigits(track.rank)),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 } },
      isInstagram
        ? [
            h('div', { style: { ...trackTitleStyle, fontSize: 30 } }, title),
            h('div', { style: { ...artistStyle, fontSize: 20 } }, artist),
          ]
        : h('div', { style: { ...trackTitleStyle, fontSize: 24 } }, `${title} · ${artist}`),
    ),
  );
}

function h(type: string, props: Record<string, unknown> = {}, ...children: Child[]): Element {
  return {
    type,
    props: {
      ...props,
      children: children.flat().filter((child) => child !== false && child !== null && child !== undefined),
    },
  };
}

function rootStyle(width: number, height: number, padding: number): Style {
  return {
    display: 'flex',
    flexDirection: 'column',
    width,
    height,
    padding,
    backgroundColor: BG,
    color: FG,
    fontFamily: 'Syne',
  };
}

const topRowStyle: Style = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
};

const ogBodyStyle: Style = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: 38,
};

const igHeaderStyle: Style = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
};

const igBodyStyle: Style = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: 48,
};

const kickerStyle: Style = {
  display: 'flex',
  marginTop: 18,
  color: FAINT,
  fontFamily: 'Syne',
  fontSize: 20,
  letterSpacing: '1.2px',
};

const monoStyle: Style = {
  display: 'flex',
  fontFamily: 'Syne',
  letterSpacing: '1.8px',
  textTransform: 'uppercase',
};

const rankStyle: Style = {
  display: 'flex',
  color: ACCENT,
  fontFamily: 'Syne',
  letterSpacing: '2px',
};

const trackTitleStyle: Style = {
  display: 'flex',
  color: FG,
  fontFamily: 'Syne',
  lineHeight: 1.16,
};

const artistStyle: Style = {
  display: 'flex',
  marginTop: 5,
  color: MUTED,
  fontFamily: 'Syne',
  lineHeight: 1.25,
};

const footerStyle: Style = {
  display: 'flex',
  flexDirection: 'column',
  marginTop: 'auto',
  width: '100%',
};

const ruleStyle: Style = {
  display: 'flex',
  width: '100%',
  height: 1,
  backgroundColor: LINE,
};

const footerTextStyle: Style = {
  display: 'flex',
  marginTop: 22,
  color: FAINT,
  fontFamily: 'Syne',
  fontSize: 18,
  letterSpacing: '2px',
  textTransform: 'uppercase',
};

async function loadFonts(): Promise<{ fraunces: Buffer; syne: Buffer }> {
  fontsPromise ??= Promise.all([
    readFile(resolve(process.cwd(), 'src/assets/fonts/Fraunces-Regular.ttf')),
    readFile(resolve(process.cwd(), 'src/assets/fonts/Syne-Regular.ttf')),
  ]).then(([fraunces, syne]) => ({ fraunces, syne }));
  return fontsPromise;
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
