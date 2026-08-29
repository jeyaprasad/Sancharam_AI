// Compatibility shim so ported components can keep `react-router-dom`-style
// imports while running on TanStack Router.
import {
  Link as TanStackLink,
  useLocation as useTanStackLocation,
  useParams as useTanStackParams,
  useNavigate as useTanStackNavigate,
} from "@tanstack/react-router";

export const Link = TanStackLink;

export function useLocation() {
  return useTanStackLocation();
}

export function useParams() {
  // strict: false returns the merged params of all matched routes
  return useTanStackParams({ strict: false });
}

export function useNavigate() {
  const navigate = useTanStackNavigate();
  return (to, opts) => (typeof to === "string" ? navigate({ to, ...opts }) : navigate(to));
}
