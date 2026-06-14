import en from './en.json';
import pt from './pt.json';
import type { Issue } from '../data/issues';

export type Locale = 'en' | 'pt';

type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = { en, pt };

export const locales: Locale[] = ['en', 'pt'];
export const defaultLocale: Locale = 'en';

export function normalizeLocale(locale: string | undefined): Locale {
  return locale === 'pt' ? 'pt' : 'en';
}

export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  const template = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  return Object.entries(vars).reduce(
    (value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)),
    template,
  );
}

export function weekParts(week: string): { year: string; week: string } {
  const [year, rawWeek] = week.split('-W');
  return { year, week: String(Number(rawWeek)) };
}

export function weekLabel(locale: Locale, issue: Issue): string {
  const parts = weekParts(issue.week);
  return t(locale, 'top.weekLabel', parts);
}

export function localizedIssuePath(locale: Locale, issue?: Issue): string {
  const suffix = issue ? `${issue.week}/` : '';
  if (locale === defaultLocale) {
    return `/${suffix}`;
  }
  return `/${locale}/${suffix}`;
}

export function alternateLinks(
  issue: Issue | undefined,
  base: URL,
): { locale: Locale | 'x-default'; href: string }[] {
  const enHref = new URL(localizedIssuePath('en', issue), base).toString();
  const ptHref = new URL(localizedIssuePath('pt', issue), base).toString();
  return [
    { locale: 'en', href: enHref },
    { locale: 'pt', href: ptHref },
    { locale: 'x-default', href: enHref },
  ];
}
