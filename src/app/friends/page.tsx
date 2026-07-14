import type { Metadata } from "next";
import Friends from "@/components/Friends";

export const metadata: Metadata = {
  title: "Lily & John, your Alight friends",
  robots: { index: false },
};

export default function FriendsPage() {
  return <Friends />;
}
