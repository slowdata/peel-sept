import type { APIRoute, GetStaticPaths } from 'astro';
import { issues, type Issue } from '../../data/issues';
import { renderSocialCardPng } from '../../lib/social-card';

export const getStaticPaths = (() =>
  issues.map((issue) => ({
    params: { week: issue.week },
    props: { issue },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderSocialCardPng((props as { issue: Issue }).issue, 'og');
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
