const css = `
@font-face{font-family:"Nyght Serif";src:url("/fonts/NyghtSerif-Light.woff2") format("woff2");font-weight:300;font-display:swap}
@font-face{font-family:"Nyght Serif";src:url("/fonts/NyghtSerif-LightItalic.woff2") format("woff2");font-weight:300;font-style:italic;font-display:swap}
@font-face{font-family:"HK Grotesk";src:url("/fonts/HKGrotesk-Light.woff2") format("woff2");font-weight:300;font-display:swap}
@font-face{font-family:"HK Grotesk";src:url("/fonts/HKGrotesk-Regular.woff2") format("woff2");font-weight:400;font-display:swap}
html,body{margin:0;background:#ECEBE6;color:#232128;color-scheme:light}
body{font-family:"HK Grotesk","Helvetica Neue",Arial,sans-serif;font-weight:300;min-height:100vh;display:grid;place-items:center;padding:24px 16px;box-sizing:border-box}
main{width:100%;max-width:380px;display:grid;gap:22px}
h1{font-family:"Nyght Serif",Georgia,serif;font-weight:300;font-size:48px;line-height:1;margin:0;letter-spacing:-.01em}
h1 em{font-style:italic}
p{margin:0;font-size:15px;line-height:1.6;color:#3B393F}
form{display:grid;gap:14px;margin-top:6px}
input{font:inherit;font-size:17px;padding:12px 0;border:0;border-bottom:1px solid #232128;background:transparent;color:#232128;border-radius:0}
input:focus{outline:none;border-bottom-color:#46191E}
button{justify-self:start;font:inherit;font-size:13px;letter-spacing:.08em;color:#fff;background:#46191E;border:0;border-radius:999px;padding:13px 26px;cursor:pointer}
button:focus-visible,input:focus-visible{outline:2px solid #46191E;outline-offset:3px}
.feil{color:#762A1D;font-size:14px}
.fot{font-size:13px;color:#5C5A5F}
`;

export default async function LoggInn({ searchParams }: { searchParams: Promise<{ til?: string; feil?: string }> }) {
  const sp = await searchParams;
  const til = sp.til && sp.til.startsWith("/") && !sp.til.startsWith("//") ? sp.til : "/";
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <main>
        <h1>Glasset <em>Nora</em></h1>
        <p>Konfidensielt forslag og tilbud fra Monn Interiørarkitekter. Skriv inn passordet du har fått.</p>
        <form method="post" action="/api/logg-inn/">
          <input type="hidden" name="til" value={til} />
          <input type="password" name="passord" placeholder="Passord" aria-label="Passord" autoComplete="current-password" autoFocus required />
          {sp.feil ? <p className="feil" role="alert">Passordet stemmer ikke. Prøv igjen.</p> : null}
          <button type="submit">Gå inn</button>
        </form>
        <p className="fot">Monn Interiørarkitekter</p>
      </main>
    </>
  );
}
