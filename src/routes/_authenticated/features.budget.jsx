import { createFileRoute } from "@tanstack/react-router";
import { clientOnly } from "@/lib/client-page";

const BudgetTrackerPage = clientOnly(() => import("@/pages/BudgetTrackerPage"));

export const Route = createFileRoute("/_authenticated/features/budget")({
  head: () => ({
    meta: [
      { title: "Payana Nidhi — Budget Tracker | Sancharam AI" },
      {
        name: "description",
        content: "Track trip spending in real time with smart budgets built for Chennai travel.",
      },
      { property: "og:title", content: "Payana Nidhi — Budget Tracker | Sancharam AI" },
      {
        property: "og:description",
        content: "Track trip spending in real time with smart budgets built for Chennai travel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BudgetTrackerPage,
});
