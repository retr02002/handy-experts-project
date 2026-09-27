"use client";

import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export function CapacitorSetup() {
  useEffect(() => {
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("App")) {
      const backListener = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        // If we have web history, use it. Otherwise, exit the app (like on the login page).
        // For SPAs, we almost always have a history length > 1 if we've navigated.
        if (window.history.length > 1 || canGoBack) {
          window.history.back();
        } else {
          CapacitorApp.exitApp();
        }
      });

      return () => {
        backListener.then(listener => listener.remove());
      };
    }
  }, []);

  return null;
}
