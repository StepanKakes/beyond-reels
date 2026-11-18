// Střižna reelů na lokálním serveru revize: místo databáze Artifactu (window.claude.use("db")) volá /api/db tohohle serveru.
// Editor používá jen collection(c).onSnapshot, collection(c).doc(id).update a set, nic víc tu není potřeba.
(() => {
  const api = (c, id) => `/api/db/${encodeURIComponent(c)}` + (id ? `/${encodeURIComponent(id)}` : "");
  const volej = async (metoda, url, telo) => {
    const r = await fetch(url, { method: metoda, headers: { "Content-Type": "application/json" }, body: JSON.stringify(telo) });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).chyba || r.status);
  };
  let zmeny = null; const posluchaci = new Map();
  const sleduj = (c, fn) => {
    if (!zmeny) {
      zmeny = new EventSource("/api/zmeny");
      zmeny.addEventListener("zmena", (e) => { const k = JSON.parse(e.data); (posluchaci.get(k) || []).forEach((f) => f()); });
    }
    posluchaci.set(c, [...(posluchaci.get(c) || []), fn]);
  };
  const db = {
    collection: (c) => ({
      onSnapshot(ok, chyba) {
        const nacti = () => fetch(api(c)).then((r) => r.json())
          .then((xs) => ok({ docs: xs.map(({ id, ...x }) => ({ id, data: () => x })) }), (e) => chyba && chyba(e));
        sleduj(c, nacti); nacti();
        return () => {};
      },
      doc: (id) => ({
        update: (d) => volej("PATCH", api(c, id), d),
        set: (d) => volej("PUT", api(c, id), d),
      }),
    }),
  };
  window.claude = { use: async (n) => (n === "db" ? db : n === "user" ? { id: async () => "mistni" } : null) };
})();
