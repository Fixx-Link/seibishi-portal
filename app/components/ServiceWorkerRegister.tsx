"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration: ServiceWorkerRegistration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error: unknown) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
