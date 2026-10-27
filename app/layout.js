import "./globals.css";
import FullscreenButton from "@/components/FullscreenButton";

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
        <FullscreenButton />
        {children}
      </body>
    </html>
  );
}
