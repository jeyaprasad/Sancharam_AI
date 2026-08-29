import { createFileRoute } from "@tanstack/react-router";
import { clientOnly } from "@/lib/client-page";

const RoutingPage = clientOnly(() => import("@/pages/RoutingPage"));

export const Route = createFileRoute("/_authenticated/features/routing")({
  head: () => ({
    meta: [
      { title: "Oor — Smart Routing | Sancharam AI" },
      {
        name: "description",
        content: "Real-time, safety-aware routing across Chennai with live map intelligence.",
      },
      { property: "og:title", content: "Oor — Smart Routing | Sancharam AI" },
      {
        property: "og:description",
        content: "Real-time, safety-aware routing across Chennai with live map intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutingPage,
});
