// Página do site (item 238): abas Cadastro/Download, formulário do cadastro e dados do download.
(() => {
  const C = window.CONFIG || {};
  const $ = (s) => document.querySelector(s);

  // nome, logo e download vêm do config.js
  if (C.NOME) { $("#nome").textContent = C.NOME; document.title = C.NOME; }
  if (C.LOGO) {
    const img = new Image(); img.src = C.LOGO; img.alt = C.NOME || "logo"; img.className = "logo";
    const b = $("#brasao"); b.replaceChildren(img); b.removeAttribute("aria-hidden");
    document.body.classList.add("com-logo");   // o logo já traz o nome: o h1 fica só para leitor de tela
  }
  if (C.TAMANHO) $("#tamanho").textContent = C.TAMANHO;
  if (C.SHA256) $("#sha").textContent = C.SHA256;
  const link = $("#link-drive");
  if (C.DRIVE && /^https:\/\//.test(C.DRIVE)) link.href = C.DRIVE;
  else { link.classList.add("desligado"); link.removeAttribute("href"); link.setAttribute("aria-disabled", "true"); $("#sem-link").hidden = false; }
  $("#copiar").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText($("#sha").textContent); e.target.textContent = "copiado"; }
    catch { e.target.textContent = "selecione e copie"; }
  });

  // abas: uma seção por vez; o endereço (#cadastro / #download) escolhe
  const abas = ["cadastro", "download"];
  const mostrar = () => {
    const a = abas.includes(location.hash.slice(1)) ? location.hash.slice(1) : "cadastro";
    abas.forEach((x) => {
      document.getElementById(x).hidden = x !== a;
      document.querySelector(`[data-aba="${x}"]`).setAttribute("aria-current", x === a ? "page" : "false");
    });
  };
  addEventListener("hashchange", () => { mostrar(); scrollTo(0, 0); });
  mostrar();

  // cadastro
  const f = $("#f"), msg = $("#msg"), botao = $("#enviar");
  const dizer = (t, ok) => { msg.textContent = t; msg.className = ok ? "ok" : "erro"; };
  const conv = f.elements.convite;
  conv.addEventListener("input", () => {   // RAG-XXXX-XXXX enquanto digita
    const s = conv.value.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^RAG/, "").slice(0, 8);
    conv.value = s ? "RAG-" + s.slice(0, 4) + (s.length > 4 ? "-" + s.slice(4) : "") : "";
  });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (!/^RAG-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(d.convite)) return dizer("Confira o código de convite (RAG-XXXX-XXXX).", false);
    if (!/^[A-Za-z0-9_]{4,23}$/.test(d.usuario)) return dizer("Usuário: 4 a 23 letras, números ou _.", false);
    if (d.senha.length < 4 || d.senha.length > 23) return dizer("Senha: 4 a 23 caracteres.", false);
    if (d.senha !== d.senha2) return dizer("As senhas não conferem.", false);
    if (!f.elements.email.checkValidity()) return dizer("Confira o e-mail.", false);
    dizer("Enviando…", true); botao.disabled = true;
    try {
      const r = await fetch(C.API + "/cadastro", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: d.usuario, senha: d.senha, email: d.email, sexo: d.sexo, convite: d.convite }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { f.reset(); dizer((j.mensagem || "Conta criada.") + " Agora baixe o jogo na aba Download.", true); }
      else dizer(typeof j.detail === "string" ? j.detail : "Dados inválidos.", false);
    } catch { dizer("Não consegui falar com o servidor. Tente de novo em alguns minutos.", false); }
    finally { botao.disabled = false; }
  });
})();
