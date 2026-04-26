import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Handles Meta App deauthorization notifications
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Meta usually sends this as a signed_request in the body
    const formData = await req.formData();
    const signedRequest = formData.get("signed_request") as string;

    if (signedRequest) {
      console.log("[MetaDeauth] Received deauthorization request");
      // In a real production app, you would decode the signedRequest 
      // using META_APP_SECRET to find the user_id and then disconnect their channels.
      // For now, we'll log it.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MetaDeauth] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
