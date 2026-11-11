# Glasset Nora

Nettside og tilbud fra Monn til Glasset Vinbar. Konfidensielt.

- Statisk side i public/ (index.html, tilbud.html, film, fonts, img).
- Alt ligger bak passord (proxy.ts, lib/tilgang.ts). Passordet er lagret som SHA-256. Miljøvariabelen PASSORD i Vercel godtas også.
- app/signer/route.ts lagrer signering i Upstash Redis hvis KV_REST_API_URL og KV_REST_API_TOKEN finnes.
