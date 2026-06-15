export type Track = {
  rank: number;
  artist: string;
  title: string;
  source: string;
  source_count: number;
  spotify_url: string | null;
};

export type Album = {
  rank: number;
  artist: string;
  title: string;
  source: string;
  source_count: number;
  link: string | null;
  spotify_url: string | null;
};

export type Issue = {
  week: string;
  start_date: string;
  end_date: string;
  playlist_url?: string | null;
  tracks: Track[];
  albums: Album[];
  sources: Source[];
};

export type Source = {
  name: string;
  url: string | null;
};

const modules = import.meta.glob('./weeks/*.json', { eager: true });

export const issues = Object.values(modules)
  .map((module) => (module as { default: Issue }).default)
  .sort((a, b) => a.week.localeCompare(b.week));

export const latestIssue = issues.at(-1) as Issue;

export function issueUrl(issue: Issue): string {
  return `/${issue.week}`;
}
