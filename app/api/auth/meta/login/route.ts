import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const chatbotId = searchParams.get("chatbotId");
    const channelType = searchParams.get("type"); // WHATSAPP, INSTAGRAM, FACEBOOK

    if (!chatbotId || !channelType) {
      return NextResponse.json({ error: "Missing chatbotId or type" }, { status: 400 });
    }

    const appId = process.env.META_APP_ID;
    const redirectUri = `${new URL(req.url).origin}/api/auth/meta/callback`;
    
    // State to pass through the OAuth flow
    const state = JSON.stringify({ chatbotId, type: channelType, userId });
    const encodedState = Buffer.from(state).toString("base64");

    const scopes = [
      "public_profile",
      "pages_show_list",
      "pages_messaging",
      "pages_read_engagement",
      "pages_manage_metadata",
      "instagram_manage_messages",
      "whatsapp_business_management",
      "whatsapp_business_messaging",
      "business_management"
    ].join(",");

    const fbLoginUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodedState}&scope=${scopes}&response_type=code`;

    return NextResponse.redirect(fbLoginUrl);
  } catch (error) {
    console.error("[MetaLogin] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
