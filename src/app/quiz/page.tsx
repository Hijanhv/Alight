import type { Metadata } from "next";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = {
  title: "The 2-minute nervous-system quiz",
  description:
    "Answer 18 quick statements and find out what is really behind your procrastination — your nervous-system type, your Regulation Score, and a reset you can use right now.",
};

export default function QuizPage() {
  return <Quiz />;
}
