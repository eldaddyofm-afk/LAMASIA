// Utilidades compartidas: navegación, API, eventos en vivo y formato.
const CC = (() => {
  const STATUS_LABEL = {
    pendiente_recogida: 'Pendiente de recoger', recogido: 'Recogido (en bici)', en_hub: 'En el hub (sin lavar)',
    lavando: 'Lavando', secando: 'Secando', planchando: 'Planchando', envasando: 'Envasando al vacío',
    listo: 'Listo para entregar', en_reparto: 'En reparto', entregado: 'Entregado', cancelado: 'Cancelado',
  };
  const IRONING_LABEL = { basico: 'Plancha básica', completo: 'Planchado completo', ninguno: 'Sin plancha' };
  let scents = {};

  async function api(path, opts = {}) {
    const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
    if (!r.ok) { let m = r.statusText; try { m = (await r.json()).error || m; } catch {} throw new Error(m); }
    return r.json();
  }

  async function loadMeta() {
    const m = await api('/api/meta');
    scents = Object.fromEntries(m.scents.map((s) => [s.id, s.label]));
    return m;
  }

  function nav(active) {
    const links = [['panel', 'Panel'], ['mapa', 'Mapa y GPS'], ['hub', 'Hub lavandería'], ['rider', 'App rider'], ['pedido', 'Web cliente'], ['calculadora', 'Calculadora'], ['recursos', 'Recursos']];
    const el = document.createElement('header');
    el.className = 'top';
    el.innerHTML = `<div class="brand">Costa Clean <span>OPS · Málaga</span></div>
      <nav>${links.map(([h, t]) => `<a href="${h}.html" class="${h === active ? 'active' : ''}">${t}</a>`).join('')}</nav>
      <div class="live"><span class="dot off" id="liveDot"></span><span id="liveTxt">conectando…</span></div>`;
    document.body.prepend(el);
    const t = document.createElement('div'); t.className = 'toast'; t.id = 'toast'; document.body.appendChild(t);
  }

  // Server-Sent Events con reconexión automática.
  function live(handlers) {
    const es = new EventSource('/api/stream');
    const dot = document.getElementById('liveDot'); const txt = document.getElementById('liveTxt');
    es.onopen = () => { if (dot) { dot.className = 'dot'; txt.textContent = 'en vivo'; } };
    es.onerror = () => { if (dot) { dot.className = 'dot off'; txt.textContent = 'reconectando…'; } };
    for (const [ev, fn] of Object.entries(handlers)) es.addEventListener(ev, (e) => fn(JSON.parse(e.data)));
    return es;
  }

  function toast(msg) { const t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }
  const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0);
  const num = (n, d = 0) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n || 0);
  const ago = (iso) => { if (!iso) return 'nunca'; const s = (Date.now() - new Date(iso.replace(' ', 'T') + (iso.endsWith('Z') ? '' : 'Z'))) / 1000; if (s < 60) return `hace ${Math.round(s)} s`; if (s < 3600) return `hace ${Math.round(s / 60)} min`; return `hace ${Math.round(s / 3600)} h`; };
  const scentLabel = (id) => scents[id] || id;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  return { api, loadMeta, nav, live, toast, eur, num, ago, STATUS_LABEL, IRONING_LABEL, scentLabel, esc };
})();
