const f = document.getElementById("f"), msg = document.getElementById("msg");
const dizer = (t, ok) => { msg.textContent = t; msg.className = ok ? "ok" : "erro"; };
f.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f));
  if (d.senha !== d.senha2) return dizer("As senhas não conferem.", false);
  dizer("Enviando…", true);
  try {
    const r = await fetch(window.CONFIG.API + "/cadastro", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: d.usuario, senha: d.senha, email: d.email, sexo: d.sexo }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { f.reset(); dizer(j.mensagem || "Conta criada.", true); }
    else dizer(typeof j.detail === "string" ? j.detail : "Dados inválidos.", false);
  } catch { dizer("Não consegui falar com o servidor.", false); }
});
