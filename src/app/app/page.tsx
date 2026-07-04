import type { Metadata } from "next";
import DailyLoop from "@/components/DailyLoop";

export const metadata: Metadata = {
  title: "Your daily loop",
  robots: { index: false },
};

export default function AppPage() {
  return <DailyLoop />;
}
