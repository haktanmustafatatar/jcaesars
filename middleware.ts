import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/(tr|en|ru|ar|fr|de|gr)/dashboard(.*)",
  "/(tr|en|ru|ar|fr|de|gr)/admin(.*)",
  "/api/chatbots(.*)",
  "/api/conversations(.*)",
  "/api/settings(.*)",
  "/api/crawl(.*)",
]);

const isAdminRoute = createRouteMatcher(["/(tr|en|ru|ar|fr|de|gr)/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Bypass next-intl for API routes to prevent JSON parsing errors (returning HTML)
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    await auth.protect((has) => {
      return has({ role: "org:admin" }) || has({ role: "org:superadmin" });
    });
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
