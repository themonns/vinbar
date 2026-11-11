import { NextResponse } from "next/server";
import { COOKIE, LEVETID, riktigPassord, token } from "@/lib/tilgang";

export async function POST(req: Request) {
  const form = await req.formData();
  const passord = String(form.get("passord") ?? "");
  let til = String(form.get("til") ?? "/");
  if (!til.startsWith("/") || til.startsWith("//") || til.startsWith("/logg-inn")) til = "/";

  if (!(await riktigPassord(passord))) {
    const url = new URL("/logg-inn/", req.url);
    url.searchParams.set("feil", "1");
    url.searchParams.set("til", til);
    return NextResponse.redirect(url, 303);
  }
  const res = NextResponse.redirect(new URL(til, req.url), 303);
  res.cookies.set(COOKIE, await token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LEVETID,
  });
  return res;
}
