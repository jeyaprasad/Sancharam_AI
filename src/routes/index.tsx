import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sancharam AI — Intelligent Travel Companion for Chennai" },
      {
        name: "description",
        content:
          "Sancharam AI blends live safety data, smart routing, and hyper-local insights into one travel ecosystem for Chennai.",
      },
      { property: "og:title", content: "Sancharam AI — Intelligent Travel Companion for Chennai" },
      {
        property: "og:description",
        content:
          "Live safety data, real-time routing, and hyper-local insights for Chennai travelers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
