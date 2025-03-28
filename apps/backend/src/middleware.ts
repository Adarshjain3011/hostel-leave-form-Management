import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";

import { ROLE } from "@repo/common/config";
interface CustomNextRequest extends NextRequest {
  user?: string;
}

const PublicPaths = '/auth/';
const DefaultPage = ["/", "/unauthorized", "/something-went-wrong"];

export async function middleware(req: CustomNextRequest) {
  const path = req.nextUrl.pathname;
  let isLoggedIn = req.cookies.get("token")?.value || "";
  let decodedToken;

  if (isLoggedIn) {
    decodedToken = await getDataFromToken(req);
    req.user = decodedToken.id;
  }

  if (DefaultPage.includes(path)) {
    return NextResponse.next();
  }

  const isPublicPath = path.startsWith(PublicPaths);

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL(`/${(decodedToken.role)?.toLowerCase()}`, req.url));
  }

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (isLoggedIn) {
    const hasPermission = checkPermission(decodedToken.role, path);
    if (!hasPermission) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

function checkPermission(role: ROLE, path: string): boolean {
  switch (role) {
    case "Student":
      return path.includes('student');
    case "Admin":
      return path.includes('admin');
    case "Principal":
      return path.includes('principal');
    case "Gatekeeper":
      return path.includes('gatekeeper');
    case "Warden":
      return path.includes('warden');
    case "Coordinator":
      return path.includes('coordinator');
    default:
      return false;
  }
}

export const config = {
  matcher: ['/((?!api|static|.\\..|_next).*)', '/auth/verifyEmail/:token'],
};
