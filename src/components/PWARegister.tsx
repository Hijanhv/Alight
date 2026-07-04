"use client";

import { useEffect } from "react";

// Registers the service worker in production so Alight is installable
// (Add to Home Screen on iPhone, Install prompt on Android).
export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
