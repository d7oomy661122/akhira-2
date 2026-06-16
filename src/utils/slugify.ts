import { Match } from '../types';

export function makeMatchSlug(match: Match | null | undefined): string {
  if (!match) return 'match';
  const h = match.homeTeam.name?.toLowerCase().replace(/[^a-z0-9]+/gu, '-') || 'home';
  const a = match.awayTeam.name?.toLowerCase().replace(/[^a-z0-9]+/gu, '-') || 'away';
  return `${h}-vs-${a}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
}
