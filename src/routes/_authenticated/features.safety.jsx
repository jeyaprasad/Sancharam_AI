import { createFileRoute } from "@tanstack/react-router";
import { clientOnly } from "@/lib/client-page";

const SafetyPage = clientOnly(() => import("@/pages/SafetyPage"));

export const Route = createFileRoute("/_authenticated/features/safety")({
  head: () => ({
    meta: [
      { title: "Kaaval — Safety Intelligence | Sancharam AI" },
      {
        name: "description",
        content: "Real-time safety intelligence and risk zone awareness for moving around Chennai confidently.",
      },
      { property: "og:title", content: "Kaaval — Safety Intelligence | Sancharam AI" },
      {
        property: "og:description",
        content: "Real-time safety intelligence and risk zone awareness for moving around Chennai confidently.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SafetyPage,
});
