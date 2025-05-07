import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// List of paths that don't require authentication
const publicPaths = [
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/register",
  "/register",
];

// Function to check if a path should be public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith("/api/") || 
    path.startsWith("/_next/") || 
    path.includes(".")
  );
};

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXT_AUTH_SECRET || process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  
  // Allow access to public paths or if the user is authenticated
  if (isPublicPath(pathname) || token) {
    return NextResponse.next();
  }
  
  // If the user is not authenticated and tries to access a protected route,
  // redirect to the Auth.js signin page
  const url = new URL("/api/auth/signin", request.url);
  url.searchParams.set("callbackUrl", encodeURI(request.url));
  
  return NextResponse.redirect(url);
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (all images)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)",
  ],
};