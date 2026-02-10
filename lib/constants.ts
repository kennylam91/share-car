import { Route } from '@/types';

export const ROUTES: Route[] = ['HN-HP', 'HN-QN', 'QN-HP'];

export const ROUTE_LABELS: Record<Route, string> = {
  'HN-HP': 'Hanoi ↔ Hai Phong',
  'HN-QN': 'Hanoi ↔ Quang Ninh',
  'QN-HP': 'Quang Ninh ↔ Hai Phong',
};
