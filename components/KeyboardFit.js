"use client";

import { useEffect } from "react";

// When the on-screen keyboard opens, the visible part of the page gets shorter. This keeps --app-h equal to
// the visible height (so full-screen pages shrink to fit above the keyboard) and scrolls the field being
// typed in into view, so it is never hidden behind the keyboard.
export default function KeyboardFit() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const isField = (element) => element && /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) && element.type !== "range" && element.type !== "checkbox" && element.type !== "radio";
    let timer = null;

    const reveal = () => {
      const field = document.activeElement;
      if (!isField(field)) return;
      field.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    };
    const settle = () => {
      clearTimeout(timer);
      timer = setTimeout(reveal, 280); // after the keyboard has finished sliding up
    };
    const fit = () => {
      const height = viewport ? viewport.height : window.innerHeight;
      document.documentElement.style.setProperty("--app-h", `${Math.round(height)}px`);
      const keyboardOpen = viewport ? window.innerHeight - viewport.height > 120 : false;
      document.documentElement.classList.toggle("keyboard-open", keyboardOpen);
      if (keyboardOpen) settle();
      else window.scrollTo(0, 0); // iPads scroll the page up when the keyboard opens: bring it back
    };

    fit();
    viewport?.addEventListener("resize", fit);
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    document.addEventListener("focusin", settle);
    return () => {
      clearTimeout(timer);
      viewport?.removeEventListener("resize", fit);
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
      document.removeEventListener("focusin", settle);
    };
  }, []);

  return null;
}
