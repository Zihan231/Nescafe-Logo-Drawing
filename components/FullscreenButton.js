"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";

export default function FullscreenButton() {
  const onAdminPage = usePathname()?.startsWith("/admin"); // the admin panel is a normal web page, not a kiosk screen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateStatus = () => {
      const active = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(active);
    };

    updateStatus();
    document.addEventListener("fullscreenchange", updateStatus);
    document.addEventListener("webkitfullscreenchange", updateStatus);
    return () => {
      document.removeEventListener("fullscreenchange", updateStatus);
      document.removeEventListener("webkitfullscreenchange", updateStatus);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          await root.requestFullscreen();
        } else if (root.webkitRequestFullscreen) {
          await root.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  };

  if (!mounted || onAdminPage) return null;

  return (
    <button
      type="button"
      className="fullscreen-toggle-btn"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
    >
      {isFullscreen ? <BsFullscreenExit size={17} /> : <BsFullscreen size={16} />}
    </button>
  );
}
