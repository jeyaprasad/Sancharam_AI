import { createFileRoute } from "@tanstack/react-router";
import ItineraryPage from "@/pages/ItineraryPage";

export const Route = createFileRoute("/_authenticated/features/itinerary")({
  head: () => ({
    meta: [
      { title: "Neram — AI Itinerary Planner | Sancharam AI" },
      {
        name: "description",
        content: "Plan perfect Chennai days with an AI itinerary that adapts to time, budget, and mood.",
      },
      { property: "og:title", content: "Neram — AI Itinerary Planner | Sancharam AI" },
      {
        property: "og:description",
        content: "Plan perfect Chennai days with an AI itinerary that adapts to time, budget, and mood.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ItineraryPage,
});
