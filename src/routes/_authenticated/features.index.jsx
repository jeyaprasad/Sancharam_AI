import { createFileRoute } from "@tanstack/react-router";
import Features from "@/pages/Features";

export const Route = createFileRoute("/_authenticated/features/")({
  head: () => ({
    meta: [
      { title: "Features — Sancharam AI" },
      {
        name: "description",
        content:
          "Explore Sancharam AI features: uncharted spots, smart itinerary planning, safety intelligence, routing, and budget tracking for Chennai.",
      },
      { property: "og:title", content: "Features — Sancharam AI" },
      {
        property: "og:description",
        content:
          "Explore Sancharam AI features: uncharted spots, smart itinerary planning, safety intelligence, routing, and budget tracking for Chennai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Features,
});
