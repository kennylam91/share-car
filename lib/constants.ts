import { Route } from "@/types";

export const ROUTES: Route[] = ["HN-HP", "HN-QN", "QN-HP"];

export const ROUTE_LABELS: Record<Route, string> = {
  "HN-HP": "HN ↔ HP",
  "HN-QN": "HN ↔ QN",
  "QN-HP": "QN ↔ HP",
};
