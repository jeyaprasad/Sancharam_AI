import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "@/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Sancharam AI — Our Mission for Chennai" },
      {
        name: "description",
        content:
          "Learn how Sancharam AI redefines travel in Chennai with live safety data, real-time routing, and hyper-local insights.",
      },
      { property: "og:title", content: "About Sancharam AI — Our Mission for Chennai" },
      {
        property: "og:description",
        content:
          "Learn how Sancharam AI redefines travel in Chennai with live safety data, real-time routing, and hyper-local insights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});
