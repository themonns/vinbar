import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Digital aksept av tilbudet til Glasset Nora.
 * Første signatur lagres i Upstash Redis (Vercel Storage), så alle som åpner
 * tilbudet ser at avtalen er signert. Bekreftelsen til kontakt@monn.no sendes
 * fra nettleseren via FormSubmit. Siden ligger bak passord (proxy.ts).
 */
const NOKKEL = "nora:signering";

const rens = (v: unknown, maks = 200) =>
  String(v ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, maks);

type Signering = { navn: string; rolle: string; firma: string; tid: string; dato: string };

function lager() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return async (kommando: string[]) => {
    const svar = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(kommando),
      cache: "no-store",
    });
    if (!svar.ok) throw new Error(`Lager svarte ${svar.status}`);
    return (await svar.json()) as { result: unknown };
  };
}

async function hent(redis: NonNullable<ReturnType<typeof lager>>) {
  const { result } = await redis(["GET", NOKKEL]);
  return typeof result === "string" ? (JSON.parse(result) as Signering) : null;
}

export async function GET() {
  const redis = lager();
  if (!redis) return NextResponse.json({ signert: false, lager: false });
  try {
    const s = await hent(redis);
    return NextResponse.json(s ? { signert: true, ...s } : { signert: false });
  } catch {
    return NextResponse.json({ signert: false, feil: true });
  }
}

export async function POST(req: Request) {
  const data = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const navn = rens(data.navn);
  const rolle = rens(data.rolle);
  const firma = rens(data.firma);
  const epost = rens(data.epost);
  const signatur = rens(data.signatur);

  if (!navn || !firma || !signatur || data.aksept !== true) {
    return NextResponse.json({ ok: false, feil: "Fyll inn alle feltene." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(epost)) {
    return NextResponse.json({ ok: false, feil: "Sjekk e-postadressen." }, { status: 400 });
  }
  if (signatur.toLowerCase() !== navn.toLowerCase()) {
    return NextResponse.json({ ok: false, feil: "Signaturen må være det samme som navnet." }, { status: 400 });
  }

  const naa = new Date();
  const s: Signering = {
    navn,
    rolle,
    firma,
    tid: naa.toISOString(),
    dato: new Intl.DateTimeFormat("nb-NO", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Oslo",
    }).format(naa),
  };
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "ukjent";
  console.log("Nora signert", JSON.stringify({ ...s, epost, ip }));

  const redis = lager();
  if (!redis) return NextResponse.json({ ok: true, lagret: false, ...s });

  try {
    const { result } = await redis(["SET", NOKKEL, JSON.stringify(s), "NX"]);
    if (result !== "OK") {
      const fra = await hent(redis);
      return NextResponse.json({ ok: false, alleredeSignert: true, ...(fra ?? {}) }, { status: 409 });
    }
    return NextResponse.json({ ok: true, lagret: true, ...s });
  } catch (e) {
    console.error("Nora: kunne ikke lagre signering", e);
    return NextResponse.json({ ok: true, lagret: false, ...s });
  }
}
