# Peel Sept

Site estático público do Peel Sept — publicação semanal de 7 faixas e 7 álbuns,
gerada a partir do motor Python `peel`.

Produção:

```text
https://peel.sept.pt
```

## Estado actual

- Astro estático em Cloudflare Pages.
- EN por defeito (`/`), PT em `/pt/`.
- Dados musicais únicos em `src/data/weeks/*.json`.
- UI/chrome traduzida em `src/i18n/*.json`.
- Datas formatadas por locale a partir de `start_date`/`end_date`.
- Spotify privacy-first: iframe só é criado após clique.
- Playlist Spotify rolante só aparece na semana mais recente.
- Semanas de arquivo mostram nota e links individuais das faixas.
- OG/Twitter card e imagem Instagram geradas no build.
- Source chips linkam para homepages dos curadores.

Playlist canónica:

```text
https://open.spotify.com/playlist/3iHETIGrWBdoY3a8jNrMox
```

## Stack

- Astro 6
- TypeScript
- CSS próprio
- `satori` + `@resvg/resvg-js` para PNGs sociais estáticos
- Fontes self-hosted em `src/assets/fonts`
- JS mínimo:
  - rating local em `localStorage`;
  - Web Share API progressiva;
  - Spotify iframe click-to-load.

## Rotas

```text
/
/2026-W27/
/2026-W26/
/2026-W24/
/2026-W23/
/pt/
/pt/2026-W27/
/pt/2026-W26/
/pt/2026-W24/
/pt/2026-W23/
/og/<week>.png
/ig/<week>.png
```

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build estático

```bash
npm run build
```

O output fica em `dist/`.

Última validação conhecida:

```text
10 page(s) built
/og/2026-W23.png
/og/2026-W24.png
/og/2026-W26.png
/og/2026-W27.png
/ig/2026-W23.png
/ig/2026-W24.png
/ig/2026-W26.png
/ig/2026-W27.png
```

## Dados

Cada semana vive em:

```text
src/data/weeks/YYYY-Www.json
```

Os JSON são gerados pelo repo `peel`:

```bash
cd ../peel
uv run peel site export --weeks 2
```

Atenção: o exportador usa a semana ISO actual por defeito. Se for corrido antes
de haver dados reais da nova semana, pode criar uma semana vazia. Validar sempre
antes de commit/push.

## Contrato JSON resumido

```ts
type Issue = {
  week: string;
  start_date: string;
  end_date: string;
  playlist_url?: string | null;
  tracks: Track[];
  albums: Album[];
  sources: Source[];
};

type Source = {
  name: string;
  url: string | null;
};
```

Campos legados `label` e `date_range` podem ainda existir por compatibilidade no
export, mas não devem ser usados para UI.
