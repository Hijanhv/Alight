import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "You are in",
  robots: { index: false },
};

export default function CheckoutSuccess() {
  return (
    <>
      <SiteNav />
      <section className="section" style={{ textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "52ch" }}>
          <span className="eyebrow">Welcome to Alight</span>
          <h1 className="display" style={{ marginTop: 14 }}>
            You are in. Your nervous system thanks you. 🪶
          </h1>
          <p className="lede" style={{ margin: "20px auto 0" }}>
            Your spot is confirmed. We will email you the moment your personalized
            plan and daily loop are ready — you are one of the very first.
          </p>
          <div className="hero-cta" style={{ justifyContent: "center", marginTop: 28 }}>
            <Link href="/" className="btn btn-primary btn-lg">
              Back to home
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
