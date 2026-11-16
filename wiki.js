// Wiki do jogador (item 242): menu no celular, busca no navegador (busca.json) e "voltar ao topo".
(() => {
  const raiz = document.body.dataset.raiz || "";
  const $ = (s) => document.querySelector(s);

  const lateral = $("#lateral"), botao = $("#menu-botao");
  botao.addEventListener("click", () => {
    const aberta = lateral.classList.toggle("aberta");
    botao.setAttribute("aria-expanded", String(aberta));
  });

  const topo = $("#ao-topo");
  addEventListener("scroll", () => topo.classList.toggle("visivel", scrollY > 500), { passive: true });

  // busca: sem acento e sem maiúscula; título pesa mais que o texto
  const normal = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const campo = $("#busca"), lista = $("#resultados");
  let indice = null;
  const carregar = () => indice || (indice = fetch(raiz + "busca.json").then((r) => r.json())
    .then((d) => d.map((p) => ({ ...p, nt: normal(p.t), nx: normal(p.x) }))).catch(() => []));
  const trecho = (p, termo) => {
    const i = p.nx.indexOf(termo);
    if (i < 0) return p.x.slice(0, 90) + "…";
    const a = Math.max(0, i - 40);
    return (a ? "…" : "") + p.x.slice(a, i + 70) + "…";
  };
  const item = (p, termos) => {
    const li = document.createElement("li"), a = document.createElement("a"), s = document.createElement("small");
    a.href = raiz + p.u; a.textContent = p.t; s.textContent = trecho(p, termos[0]);
    a.append(s); li.append(a); return li;
  };
  const buscar = async () => {
    const q = normal(campo.value.trim());
    if (q.length < 2) { lista.hidden = true; return; }
    const termos = q.split(/\s+/);
    const achados = (await carregar())
      .map((p) => ({ p, n: termos.every((t) => p.nt.includes(t) || p.nx.includes(t)) ? termos.reduce((s, t) => s + (p.nt.includes(t) ? 10 : 0) + (p.nx.includes(t) ? 1 : 0), 0) - (p.u.startsWith("fichas/") ? 5 : 0) : 0 }))
      .filter((r) => r.n > 0).sort((a, b) => b.n - a.n).slice(0, 12);
    lista.replaceChildren(...(achados.length ? achados.map((r) => item(r.p, termos))
      : [Object.assign(document.createElement("li"), { className: "vazio", textContent: "Nada encontrado." })]));
    lista.hidden = false;
  };
  campo.addEventListener("input", buscar);
  campo.addEventListener("focus", carregar, { once: true });
  campo.addEventListener("keydown", (e) => { if (e.key === "Escape") { campo.value = ""; lista.hidden = true; } });
})();
