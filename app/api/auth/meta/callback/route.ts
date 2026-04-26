import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    // Decode state
    const { chatbotId, type, userId } = JSON.parse(Buffer.from(state, "base64").toString());

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${new URL(req.url).origin}/api/auth/meta/callback`;

    // 1. Exchange code for User Access Token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[MetaCallback] Token exchange error:", tokenData.error);
      return NextResponse.redirect(`${new URL(req.url).origin}/dashboard/chatbots/${chatbotId}/settings?error=meta_auth_failed`);
    }

    const userAccessToken = tokenData.access_token;

    // 2. Exchange for Long-Lived Token
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${userAccessToken}`
    );
    const longLivedData = await longLivedRes.json();
    const longLivedToken = longLivedData.access_token || userAccessToken;

    // 3. Fetch Pages/Accounts
    // Depending on 'type', we might want different info, but let's get all related info
    const accountsRes = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?access_token=${longLivedToken}&fields=name,id,access_token,instagram_business_account{id,username,name}`
    );
    const accountsData = await accountsRes.json();

    // 4. Fetch WhatsApp Business Accounts if needed
    const waRes = await fetch(
      `https://graph.facebook.com/v22.0/me/whatsapp_business_accounts?access_token=${longLivedToken}&fields=id,name,currency,timezone_id,message_template_namespace`
    );
    const waData = await waRes.json();

    // 5. Save this "connection session" temporarily in the Channel table or a dedicated field
    // For now, let's create a DISCONNECTED channel with the metadata in config
    const channel = await prisma.channel.upsert({
      where: { 
        // We'll use a specific way to find the "active" connection attempt
        id: `meta_temp_${chatbotId}_${type}` 
      },
      update: {
        status: "DISCONNECTED",
        config: {
          userToken: longLivedToken,
          pages: accountsData.data || [],
          whatsappAccounts: waData.data || [],
          expiresAt: Date.now() + 3600000 // 1 hour session
        }
      },
      create: {
        id: `meta_temp_${chatbotId}_${type}`,
        chatbotId,
        type: type as any,
        name: `Meta Connection (${type})`,
        status: "DISCONNECTED",
        config: {
          userToken: longLivedToken,
          pages: accountsData.data || [],
          whatsappAccounts: waData.data || [],
          expiresAt: Date.now() + 3600000
        }
      }
    });

    // Redirect back to settings with a success flag
    return NextResponse.redirect(`${new URL(req.url).origin}/dashboard/chatbots/${chatbotId}/settings?tab=channels&meta_session=${channel.id}`);
  } catch (error) {
    console.error("[MetaCallback] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
