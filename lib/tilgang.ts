/**
 * Passordet for Glasset Nora. Lagret som SHA-256 av passordet med små bokstaver.
 * Settes PASSORD i Vercel, godtas det også.
 */
export const PASSORD_HASH = "cef120e8b9f31b37567bc51a9f4a3383e289bff7a29866034adc04906da34aa3";
export const COOKIE = "nora_tilgang";
export const LEVETID = 60 * 60 * 24 * 30;

const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");

export async function sha256(tekst: string) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(tekst)));
}

/** Verdien i informasjonskapselen. Bytter du TILGANG_HEMMELIGHET, logges alle ut. */
export async function token() {
  return sha256("nora:" + PASSORD_HASH + ":" + (process.env.TILGANG_HEMMELIGHET ?? "glasset-nora"));
}

export async function riktigPassord(passord: string) {
  const p = passord.trim();
  if (!p) return false;
  if (process.env.PASSORD && process.env.PASSORD === p) return true;
  return (await sha256(p.toLowerCase())) === PASSORD_HASH;
}
