import { promises as fs } from "node:fs";
import path from "node:path";
import { isDesignPublic } from "@/lib/design-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validFilename = /^(selfie-)?([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(-frame)?\.png$/i;

export async function GET(request, { params }) {
  const { filename } = await params;
  const match = filename.match(validFilename);
  if (!match) return new Response("Not found", { status: 404 });
  const isSelfie = Boolean(match[1]);
  // A design (or its card) that an admin hid is not served. Its files are cached only briefly, so hiding takes effect soon.
  if (!isSelfie && !(await isDesignPublic(match[2]))) return new Response("Not found", { status: 404 });
  const directory = process.env.UPLOAD_DIRECTORY || path.join(process.cwd(), "uploads");
  try {
    const image = await fs.readFile(path.join(directory, filename));
    const cache = isSelfie ? "public, max-age=31536000, immutable" : "public, max-age=300";
    const headers = { "Content-Type": "image/png", "Cache-Control": cache, "Content-Length": String(image.length) };
    // ?download=1 makes phones save the card instead of just showing it.
    if (new URL(request.url).searchParams.has("download")) headers["Content-Disposition"] = 'attachment; filename="nescafe-make-your-world.png"';
    return new Response(image, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
