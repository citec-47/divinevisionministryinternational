import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { createUploadTicket, isCloudinaryConfigured } from "@/lib/cloudinary";

/** Signs a browser-to-Cloudinary upload. Signed-in staff only. */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Image uploads are not configured." }, { status: 503 });
  }

  try {
    return NextResponse.json(createUploadTicket());
  } catch (error) {
    console.error("[admin] could not sign upload:", error);
    return NextResponse.json({ error: "Could not prepare the upload." }, { status: 500 });
  }
}
