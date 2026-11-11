import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE, token } from "@/lib/tilgang";

/** Alt bak passord, unntatt innloggingen og fontene den bruker. */
export async function proxy(request: NextRequest) {
  const verdi = request.cookies.get(COOKIE)?.value;
  if (verdi && verdi === (await token())) return NextResponse.next();
  const url = new URL("/logg-inn/", request.url);
  url.searchParams.set("til", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!logg-inn|api/logg-inn|_next/static|_next/image|fonts|favicon.ico|robots.txt).*)"],
};
