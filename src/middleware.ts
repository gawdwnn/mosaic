import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Define routes that don't require authentication
  publicRoutes: ["/site", "/api/uploadthing"],

  // Function to run before authentication (currently empty)
  async beforeAuth(auth, req) {},

  // Function to run after authentication
  async afterAuth(auth, req) {
    // Extract URL and search parameters from the request
    const url = req.nextUrl;
    const searchParams = url.searchParams.toString();
    let hostname = req.headers;

    // Construct the full path including search parameters
    const pathWithSearchParams = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

    // Check if a custom subdomain exists
    const customSubDomain = hostname
      .get("host")
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
      .filter(Boolean)[0];

    // If a custom subdomain exists, rewrite the URL
    if (customSubDomain) {
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
      );
    }

    // Redirect sign-in and sign-up routes to the agency sign-in page
    if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
      return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
    }

    // Rewrite root and site routes to the site page
    if (
      url.pathname === "/" ||
      (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
    ) {
      return NextResponse.rewrite(new URL("/site", req.url));
    }

    // Rewrite agency and subaccount routes
    if (
      url.pathname.startsWith("/agency") ||
      url.pathname.startsWith("/subaccount")
    ) {
      return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
