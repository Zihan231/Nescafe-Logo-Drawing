import "./globals.css";
import FullscreenButton from "@/components/FullscreenButton";
import KeyboardFit from "@/components/KeyboardFit";

// interactiveWidget: the on-screen keyboard covers the page instead of shrinking it (as on iPads), so the
// editor keeps its size while typing. KeyboardFit then fits form pages above the keyboard and brings the
// field being typed in into view.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-visual"
};

export const metadata = {
  title: "NESCAFÉ — Make Your World",
  description: "Draw your mark, send it into orbit, and make the world yours."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/NescafeSans-Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/MyriadPro-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BetterTimes.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body>
        <KeyboardFit />
        <FullscreenButton />
        {children}
      </body>
    </html>
  );
}
