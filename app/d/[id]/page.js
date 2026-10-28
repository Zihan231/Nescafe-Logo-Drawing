import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your NESCAFÉ card",
  robots: { index: false, follow: false }
};

const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function hasCard(id) {
  if (!validId.test(id)) return false;
  const directory = process.env.UPLOAD_DIRECTORY || path.join(process.cwd(), "uploads");
  try {
    await fs.access(path.join(directory, `${id}-frame.png`));
    return true;
  } catch {
    return false;
  }
}

// Opened from the QR code on a phone: just the card and a download button.
export default async function DownloadPage({ params }) {
  const { id } = await params;
  const found = await hasCard(id);
  const src = `/uploads/${id}-frame.png`;

  return (
    <main className="dl-page">
      <img className="dl-logo" src="/assets/nescafe-logo-trimmed.png" alt="NESCAFÉ — Make your world" />
      {found ? (
        <>
          <h1 className="dl-title">Your world, your card</h1>
          <img className="dl-card" src={src} alt="Your NESCAFÉ Make Your World card" />
          <a className="dl-btn" href={`${src}?download=1`} download="nescafe-make-your-world.png">
            <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M224 144v64a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-64a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0Zm-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 124.69V32a8 8 0 0 0-16 0v92.69l-26.34-26.35a8 8 0 0 0-11.32 11.32Z" />
            </svg>
            <span>DOWNLOAD</span>
          </a>
          <p className="dl-hint">If it opens as a picture, press and hold it and choose “Save image”.</p>
        </>
      ) : (
        <>
          <h1 className="dl-title">Card not found</h1>
          <p className="dl-hint">This link has expired or is not valid. Please ask the NESCAFÉ team for help.</p>
        </>
      )}
    </main>
  );
}
