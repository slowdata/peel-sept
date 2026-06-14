# Peel Sept

Site estático do Peel Sept — publicação semanal de 7 faixas e 7 álbuns.

## Stack

- Astro
- CSS próprio
- Zero/minimal JavaScript: só a barra de rating local
- Dados fixture em `src/data/weeks/*.json`

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre o endereço indicado pelo Astro.

## Build estático

```bash
npm run build
```

O output fica em `dist/`.

## Dados

Cada semana vive em:

```text
src/data/weeks/YYYY-Www.json
```

O contrato destes JSON será produzido pelo projeto `peel` no Sprint C1.
