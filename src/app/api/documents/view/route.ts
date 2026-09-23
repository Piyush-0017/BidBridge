import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDocumentBuffer } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    // Requires authenticated session (or demo mode)
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Document key is required" }, { status: 400 });
    }

    // Sanitize key to prevent directory traversal
    const safeKey = key.replace(/(\.\.[\/\\])/g, "").trim();
    const buffer = getDocumentBuffer(safeKey);

    if (!buffer) {
      return NextResponse.json({ error: "Document not found or inaccessible in secure vault" }, { status: 404 });
    }

    const mimeType = safeKey.endsWith(".pdf")
      ? "application/pdf"
      : safeKey.endsWith(".png")
      ? "image/png"
      : safeKey.endsWith(".jpg") || safeKey.endsWith(".jpeg")
      ? "image/jpeg"
      : "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${safeKey.split("/").pop()}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    if (error.statusCode === 401 || error.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized. Please sign in to view procurement documents." }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load document from secure vault" }, { status: 500 });
  }
}
