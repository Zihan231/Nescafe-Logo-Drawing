import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validFilename = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(-frame)?\.png$/i;

export async function GET(request, { params }) {
  const { filename } = await params;
  if (!validFilename.test(filename)) return new Response("Not found", { status: 404 });
  const directory = process.env.UPLOAD_DIRECTORY || path.join(process.cwd(), "uploads");
  try {
    const image = await fs.readFile(path.join(directory, filename));
    const headers = { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable", "Content-Length": String(image.length) };
    // ?download=1 makes phones save the card instead of just showing it.
    if (new URL(request.url).searchParams.has("download")) headers["Content-Disposition"] = 'attachment; filename="nescafe-make-your-world.png"';
    return new Response(image, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
