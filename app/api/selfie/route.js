import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { readSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadDirectory = () => process.env.UPLOAD_DIRECTORY || path.join(process.cwd(), "uploads");

export async function POST(request) {
  if (!readSession(request)) return NextResponse.json({ error: "Please register and verify your code first." }, { status: 401 });
  try {
    let buffer;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.toLowerCase().includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "An image file is required" }, { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
    } else if (contentType.toLowerCase().includes("application/json")) {
      const body = await request.json();
      const dataUrl = body.image;
      if (!dataUrl || typeof dataUrl !== "string") {
        return NextResponse.json({ error: "Image data URL is required" }, { status: 400 });
      }
      const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "Only PNG data URLs are supported" }, { status: 400 });
      }
      buffer = Buffer.from(match[1], "base64");
    } else {
      return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 415 });
    }

    if (!buffer || buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Invalid image size" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const filename = `${id}.png`;
    const directory = uploadDirectory();
    await fs.mkdir(directory, { recursive: true });
    const filePath = path.join(directory, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      id,
      filename,
      url: `/uploads/${filename}`
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to save selfie image", error);
    return NextResponse.json({ error: "Failed to store selfie" }, { status: 500 });
  }
}
