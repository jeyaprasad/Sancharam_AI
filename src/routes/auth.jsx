import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/pages/AuthPage";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Sancharam AI Chennai Travel Companion" },
      {
        name: "description",
        content:
          "Sign in or create your Sancharam AI account to unlock Chennai itineraries, safety intelligence, smart routing and travel budgeting.",
      },
      { property: "og:title", content: "Sign in — Sancharam AI" },
      {
        property: "og:description",
        content:
          "Create your free Sancharam AI account to plan safer, smarter Chennai journeys.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthRoute,
});

function AuthRoute() {
  const { redirect } = Route.useSearch();
  return <AuthPage redirectTo={redirect} />;
}
