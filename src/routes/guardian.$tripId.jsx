import { createFileRoute } from "@tanstack/react-router";
import { clientOnly } from "@/lib/client-page";

const GuardianPage = clientOnly(() => import("@/pages/GuardianPage"));

export const Route = createFileRoute("/guardian/$tripId")({
  component: GuardianPage,
});
