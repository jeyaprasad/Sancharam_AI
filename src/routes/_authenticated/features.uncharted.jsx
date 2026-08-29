import { createFileRoute } from "@tanstack/react-router";
import { clientOnly } from "@/lib/client-page";

const UnchartedPage = clientOnly(() => import("@/pages/UnchartedPage"));

export const Route = createFileRoute("/_authenticated/features/uncharted")({
  head: () => ({
    meta: [
      { title: "Unarvu — Uncharted Chennai | Sancharam AI" },
      {
        name: "description",
        content: "Discover hidden gems and uncharted spots in Chennai that even locals miss.",
      },
      { property: "og:title", content: "Unarvu — Uncharted Chennai | Sancharam AI" },
      {
        property: "og:description",
        content: "Discover hidden gems and uncharted spots in Chennai that even locals miss.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UnchartedPage,
});
