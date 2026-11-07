import { promises as fs } from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validFilename = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(-frame)?\.png$/i;

// A design or take-home card for the admin panel, hidden ones included (the public /uploads route refuses those).
export async function GET(request, { params }) {
  const auth = await requireAdmin(request, "view");
  if (auth.response) return auth.response;
  const { filename } = await params;
  if (!validFilename.test(filename)) return new Response("Not found", { status: 404 });
  const directory = process.env.UPLOAD_DIRECTORY || path.join(process.cwd(), "uploads");
  try {
    const image = await fs.readFile(path.join(directory, filename));
    const headers = { "Content-Type": "image/png", "Cache-Control": "private, max-age=300", "Content-Length": String(image.length) };
    if (new URL(request.url).searchParams.has("download")) headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    return new Response(image, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
