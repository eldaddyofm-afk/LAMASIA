// Mock de la API de Costa Clean OPS para la BETA de demostración (sin servidor).
// Intercepta fetch('/api/...') y EventSource('/api/stream'); persiste en localStorage.
(function () {
  const KEY = 'costaclean_demo_v1';
  const STATUSES = ['pendiente_recogida','recogido','en_hub','lavando','secando','planchando','envasando','listo','en_reparto','entregado','cancelado'];
  const SCENTS = [
    { id: 'fresco', label: 'Brisa marina (fresco)' }, { id: 'lavanda', label: 'Lavanda' }, { id: 'algodon', label: 'Algodón limpio' },
    { id: 'citrico', label: 'Cítrico mediterráneo' }, { id: 'jazmin', label: 'Jazmín de Málaga' }, { id: 'sin', label: 'Sin perfume (hipoalergénico)' },
  ];
  const PRICING = { bags: { S: { kg: 5, price: 22.9 }, M: { kg: 10, price: 36.9 }, L: { kg: 15, price: 49.9 } }, ironingFull: { S: 12, M: 20, L: 28 }, zone2Fee: 2.9 };
  const HUB = { lat: 36.7158, lng: -4.4335, name: 'Hub Costa Clean (Perchel / Cruz de Humilladero)' };
  const DETOUR = 1.3, BIKE_KMH = 14, STOP_MIN = 4;

  const nowIso = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
  const bagFor = (kg) => (kg <= 5 ? 'S' : kg <= 10 ? 'M' : 'L');
  function priceFor(kg, ironing, zone) {
    const bag = bagFor(kg); let p = PRICING.bags[bag].price;
    if (ironing === 'completo') p += PRICING.ironingFull[bag];
    if (zone && /zona 2/i.test(zone)) p += PRICING.zone2Fee;
    return Math.round(p * 100) / 100;
  }

  // ---------- Routing (copiado de server/routing.js) ----------
  function haversineKm(a, b) {
    const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const la1 = (a.lat * Math.PI) / 180, la2 = (b.lat * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function routeKm(points) { let km = 0; for (let i = 0; i < points.length - 1; i++) km += haversineKm(points[i], points[i + 1]); return km * DETOUR; }
  function nearestNeighbor(start, stops) {
    const remaining = stops.slice(), route = []; let cur = start;
    while (remaining.length) { let bi = 0, bd = Infinity; remaining.forEach((s, i) => { const d = haversineKm(cur, s); if (d < bd) { bd = d; bi = i; } }); cur = remaining.splice(bi, 1)[0]; route.push(cur); }
    return route;
  }
  function twoOpt(start, route) {
    let best = route.slice(), improved = true; const full = (r) => [start, ...r, start]; let bestLen = routeKm(full(best));
    while (improved) { improved = false;
      for (let i = 0; i < best.length - 1; i++) for (let k = i + 1; k < best.length; k++) {
        const cand = best.slice(0, i).concat(best.slice(i, k + 1).reverse(), best.slice(k + 1)); const len = routeKm(full(cand));
        if (len + 1e-9 < bestLen) { best = cand; bestLen = len; improved = true; }
      } }
    return best;
  }
  const round = (x) => Math.round(x * 10) / 10;
  function optimize(stops, start = HUB) {
    const valid = stops.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
    if (!valid.length) return { start, stops: [], km: 0, minutes: 0, baselineKm: 0, savedKm: 0, savedPct: 0 };
    const opt = twoOpt(start, nearestNeighbor(start, valid));
    const km = routeKm([start, ...opt, start]), baselineKm = routeKm([start, ...valid, start]);
    const minutes = (km / BIKE_KMH) * 60 + opt.length * STOP_MIN;
    return { start, stops: opt.map((s, i) => ({ ...s, seq: i + 1 })), km: round(km), minutes: Math.round(minutes), baselineKm: round(baselineKm), savedKm: round(baselineKm - km), savedPct: baselineKm > 0 ? Math.round(((baselineKm - km) / baselineKm) * 100) : 0 };
  }

  // ---------- Semilla (igual que server/db.js) ----------
  function seed() {
    const d = { customers: [], riders: [], washers: [], machines: [], orders: [], events: [], tracks: [], seq: { customer: 0, order: 0, event: 0, track: 0 } };
    d.riders = [
      { id: 1, name: 'Rider 1 · Dani', vehicle: 'cargo-bike', active: 1, lat: 36.7187, lng: -4.4245, speed: null, heading: null, last_seen: nowIso() },
      { id: 2, name: 'Rider 2 · Marta', vehicle: 'cargo-bike', active: 1, lat: 36.7140, lng: -4.4360, speed: null, heading: null, last_seen: nowIso() },
    ];
    d.washers = [{ id: 1, name: 'Carmen', active: 1 }, { id: 2, name: 'Rocío', active: 1 }, { id: 3, name: 'Isabel', active: 1 }];
    d.machines = [
      ['Lavadora 1 (11 kg)', 'lavadora', 11], ['Lavadora 2 (11 kg)', 'lavadora', 11], ['Lavadora 3 (20 kg)', 'lavadora', 20],
      ['Secadora 1 (14 kg)', 'secadora', 14], ['Secadora 2 (14 kg)', 'secadora', 14], ['Secadora 3 (14 kg)', 'secadora', 14],
    ].map((m, i) => ({ id: i + 1, name: m[0], kind: m[1], capacity_kg: m[2], status: 'libre', order_id: null, started_at: null, ends_at: null }));
    const customers = [
      ['Lucía Ramírez', '600111222', 'Calle Larios 4, 3ºB', 'Zona 1 · Centro', 36.7196, -4.4214],
      ['Javier Ortega', '600111223', 'Calle Carretería 32', 'Zona 1 · Centro', 36.7236, -4.4245],
      ['Ana Belén Soto', '600111224', 'Paseo de Reding 15', 'Zona 1 · Malagueta', 36.7206, -4.4106],
      ['Tom Becker', '600111225', 'Calle Tomás Heredia 9 (Soho)', 'Zona 1 · Soho', 36.7161, -4.4232],
      ['Marina Díaz', '600111226', 'Avenida de la Aurora 55', 'Zona 1 · Cruz de Humilladero', 36.7139, -4.4393],
      ['Pedro Lucena', '600111227', 'Calle La Hoz 21 (Huelin)', 'Zona 1 · Huelin', 36.7046, -4.4420],
      ['Sofía Navarro', '600111228', 'Avenida de Velázquez 120', 'Zona 1 · Carretera de Cádiz', 36.6975, -4.4555],
      ['Apartamentos Soho Flats', '951000001', 'Calle Casas de Campos 12', 'Zona 1 · Soho', 36.7150, -4.4220],
      ['Rafael Guzmán', '600111229', 'Calle Alcalde Joaquín Quiles 8', 'Zona 1 · Pedregalejo', 36.7215, -4.3665],
      ['Elena Castillo', '600111230', 'Paseo Marítimo El Pedregal 40', 'Zona 1 · Pedregalejo', 36.7196, -4.3720],
      ['Hugo Fernández', '600111231', 'Avenida Salvador Allende 33 (El Palo)', 'Zona 2 · El Palo', 36.7220, -4.3550],
      ['Claudia Mesa', '600111232', 'Bulevar Louis Pasteur 10', 'Zona 2 · Teatinos', 36.7175, -4.4785],
      ['Iván Rueda', '600111233', 'Calle Eolo 5 (Teatinos)', 'Zona 2 · Teatinos', 36.7215, -4.4820],
      ['Nuria Pardo', '600111234', 'Calle Martínez Maldonado 60', 'Zona 1 · Ciudad Jardín', 36.7320, -4.4355],
      ['Pisos turísticos Malagueta Beach', '951000002', 'Calle Maestranza 18', 'Zona 1 · Malagueta', 36.7193, -4.4130],
      ['Daniel Moreno', '600111235', 'Calle Héroe de Sostoa 90', 'Zona 1 · Carretera de Cádiz', 36.7020, -4.4470],
    ];
    d.customers = customers.map((c, i) => ({ id: i + 1, name: c[0], phone: c[1], email: null, address: c[2], zone: c[3], lat: c[4], lng: c[5], notes: null, created_at: nowIso() }));
    d.seq.customer = customers.length;
    const today = new Date().toISOString().slice(0, 10), tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const scents = ['fresco', 'lavanda', 'algodon', 'citrico', 'jazmin', 'sin'];
    const plan = [
      [0, 8, 'basico', 'lavando', 1, 1, 1], [1, 12, 'completo', 'secando', 1, 1, 2], [2, 5, 'basico', 'planchando', 2, 2, 3], [3, 9, 'basico', 'listo', 1, 1, 1],
      [4, 10, 'basico', 'en_hub', 2, 2, null], [5, 6, 'ninguno', 'pendiente_recogida', 2, 2, null], [6, 14, 'basico', 'pendiente_recogida', 2, 2, null],
      [7, 18, 'completo', 'envasando', 1, 1, 2], [8, 7, 'basico', 'pendiente_recogida', 1, 1, null], [9, 9, 'basico', 'listo', 1, 1, 3],
      [10, 11, 'basico', 'pendiente_recogida', 1, 1, null], [11, 5, 'completo', 'listo', 2, 2, 1], [12, 8, 'basico', 'recogido', 2, 2, null],
      [13, 10, 'basico', 'pendiente_recogida', 2, 2, null], [14, 20, 'basico', 'lavando', 1, 1, 3], [15, 6, 'basico', 'entregado', 2, 2, 2],
    ];
    plan.forEach((p, i) => {
      const [ci, kg, ironing, status, pr, dr, w] = p; const id = i + 1; const zone = customers[ci][3];
      const pending = status === 'pendiente_recogida';
      d.orders.push({ id, code: `CC-${1001 + i}`, customer_id: ci + 1, kg, bag_size: bagFor(kg), scent: scents[i % scents.length], ironing, vacuum: 1, status,
        pickup_slot: pending ? `${today} 17:00-19:00` : `${today} 09:00-11:00`, delivery_slot: pending ? `${tomorrow} 17:00-19:00` : `${today} 17:00-19:00`,
        pickup_rider_id: pr, delivery_rider_id: dr, washer_id: w, price_eur: priceFor(kg, ironing, zone), notes: null, created_at: nowIso(), updated_at: nowIso() });
      for (let s = 0; s <= STATUSES.indexOf(status); s++) d.events.push({ id: ++d.seq.event, order_id: id, status: STATUSES[s], actor: 'seed', note: null, at: nowIso() });
    });
    d.seq.order = plan.length;
    const now = Date.now();
    const occupy = (mid, oid, startMin, endMin) => Object.assign(d.machines[mid - 1], { status: 'ocupada', order_id: oid, started_at: new Date(now - startMin * 60000).toISOString(), ends_at: new Date(now + endMin * 60000).toISOString() });
    occupy(1, 1, 20, 25); occupy(3, 15, 10, 40); occupy(4, 2, 15, 30);
    return d;
  }

  let db = null;
  function load() {
    if (db) return db;
    try { const raw = localStorage.getItem(KEY); if (raw) db = JSON.parse(raw); } catch {}
    if (!db || !db.orders) db = seed();
    return db;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }
  window.CC_DEMO_RESET = () => { try { localStorage.removeItem(KEY); } catch {} db = null; };

  // ---------- EventSource falso ----------
  const listeners = new Set();
  function broadcast(event, data) { for (const es of listeners) es._emit(event, data); }
  class FakeEventSource {
    constructor() { this._handlers = {}; listeners.add(this); setTimeout(() => this.onopen && this.onopen({}), 50); }
    addEventListener(ev, fn) { (this._handlers[ev] = this._handlers[ev] || []).push(fn); }
    _emit(ev, data) { (this._handlers[ev] || []).forEach((fn) => { try { fn({ data: JSON.stringify(data) }); } catch {} }); }
    close() { listeners.delete(this); }
  }
  window.EventSource = FakeEventSource;

  // ---------- Vistas con JOIN ----------
  function orderView(o) {
    const d = load(); const c = d.customers.find((x) => x.id === o.customer_id) || {};
    const w = d.washers.find((x) => x.id === o.washer_id), pr = d.riders.find((x) => x.id === o.pickup_rider_id), dr = d.riders.find((x) => x.id === o.delivery_rider_id);
    return { ...o, customer_name: c.name, phone: c.phone, address: c.address, zone: c.zone, lat: c.lat, lng: c.lng, washer_name: w ? w.name : null, pickup_rider_name: pr ? pr.name : null, delivery_rider_name: dr ? dr.name : null };
  }
  function machineView(m) { const d = load(); const o = d.orders.find((x) => x.id === m.order_id); const c = o && d.customers.find((x) => x.id === o.customer_id); return { ...m, order_code: o ? o.code : null, customer_name: c ? c.name : null }; }
  const freeMachine = (pred) => { load().machines.filter(pred).forEach((m) => Object.assign(m, { status: 'libre', order_id: null, started_at: null, ends_at: null })); };

  // ---------- Router ----------
  function handle(method, path, query, body) {
    const d = load(); let m;
    if (path === '/api/meta') return { statuses: STATUSES, scents: SCENTS, pricing: PRICING, hub: HUB };
    if (path === '/api/orders' && method === 'GET') {
      let list = d.orders.slice();
      if (query.status) list = list.filter((o) => o.status === query.status);
      if (query.rider) list = list.filter((o) => String(o.pickup_rider_id) === query.rider || String(o.delivery_rider_id) === query.rider);
      if (query.washer) list = list.filter((o) => String(o.washer_id) === query.washer);
      return list.sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : b.id - a.id)).map(orderView);
    }
    if (path === '/api/orders' && method === 'POST') {
      const b = body || {};
      if (!b.name || !b.address || !b.kg) return [400, { error: 'Faltan nombre, dirección o kg' }];
      const kg = Number(b.kg), zone = b.zone || 'Zona 1';
      const ironing = ['basico', 'completo', 'ninguno'].includes(b.ironing) ? b.ironing : 'basico';
      const scent = SCENTS.some((s) => s.id === b.scent) ? b.scent : 'fresco';
      const c = { id: ++d.seq.customer, name: b.name, phone: b.phone || null, email: b.email || null, address: b.address, zone, lat: b.lat ?? null, lng: b.lng ?? null, notes: b.notes || null, created_at: nowIso() };
      d.customers.push(c);
      const id = ++d.seq.order;
      const o = { id, code: `CC-${id + 1000}`, customer_id: c.id, kg, bag_size: bagFor(kg), scent, ironing, vacuum: b.vacuum === false ? 0 : 1, status: 'pendiente_recogida', pickup_slot: b.pickup_slot || null, delivery_slot: b.delivery_slot || null, pickup_rider_id: null, delivery_rider_id: null, washer_id: null, price_eur: priceFor(kg, ironing, zone), notes: b.notes || null, created_at: nowIso(), updated_at: nowIso() };
      d.orders.push(o); d.events.push({ id: ++d.seq.event, order_id: id, status: 'pendiente_recogida', actor: b.actor || 'web', note: null, at: nowIso() });
      save(); const v = orderView(o); broadcast('order', v); return [201, v];
    }
    if ((m = path.match(/^\/api\/orders\/(\d+)$/))) {
      const o = d.orders.find((x) => x.id === Number(m[1])); if (!o) return [404, { error: 'Pedido no encontrado' }];
      if (method === 'GET') return { ...orderView(o), events: d.events.filter((e) => e.order_id === o.id) };
      if (method === 'PATCH') {
        const b = body || {}; let changed = false;
        for (const k of ['pickup_rider_id', 'delivery_rider_id', 'washer_id', 'pickup_slot', 'delivery_slot', 'notes', 'kg', 'scent', 'ironing']) if (k in b) { o[k] = b[k] === '' ? null : (k.endsWith('_id') && b[k] != null ? Number(b[k]) : b[k]); changed = true; }
        if (b.status) {
          if (!STATUSES.includes(b.status)) return [400, { error: 'Estado inválido' }];
          if (b.status !== o.status) {
            d.events.push({ id: ++d.seq.event, order_id: o.id, status: b.status, actor: b.actor || 'panel', note: b.note || null, at: nowIso() });
            if (b.status !== 'lavando') freeMachine((x) => x.order_id === o.id && x.kind === 'lavadora');
            if (b.status !== 'secando') freeMachine((x) => x.order_id === o.id && x.kind === 'secadora');
            broadcast('machine', { order_id: o.id });
          }
          o.status = b.status; changed = true;
        }
        if (!changed) return [400, { error: 'Nada que actualizar' }];
        o.updated_at = nowIso(); save(); const v = orderView(o); broadcast('order', v); return v;
      }
    }
    if (path === '/api/machines' && method === 'GET') return d.machines.slice().sort((a, b) => a.kind.localeCompare(b.kind) || a.id - b.id).map(machineView);
    if ((m = path.match(/^\/api\/machines\/(\d+)\/start$/))) {
      const mc = d.machines.find((x) => x.id === Number(m[1])); if (!mc) return [404, { error: 'Máquina no encontrada' }];
      if (mc.status !== 'libre') return [409, { error: 'La máquina no está libre' }];
      const o = d.orders.find((x) => x.id === Number(body && body.order_id)); if (!o) return [404, { error: 'Pedido no encontrado' }];
      const mins = Number(body.minutes) || (mc.kind === 'lavadora' ? 45 : 40); const now = new Date();
      Object.assign(mc, { status: 'ocupada', order_id: o.id, started_at: now.toISOString(), ends_at: new Date(now.getTime() + mins * 60000).toISOString() });
      const ns = mc.kind === 'lavadora' ? 'lavando' : 'secando'; o.status = ns; o.updated_at = nowIso();
      d.events.push({ id: ++d.seq.event, order_id: o.id, status: ns, actor: (body && body.actor) || 'hub', note: mc.name, at: nowIso() });
      save(); broadcast('machine', mc); broadcast('order', orderView(o)); return { ok: true };
    }
    if ((m = path.match(/^\/api\/machines\/(\d+)\/free$/))) { freeMachine((x) => x.id === Number(m[1])); save(); broadcast('machine', d.machines.find((x) => x.id === Number(m[1]))); return { ok: true }; }
    if ((m = path.match(/^\/api\/machines\/(\d+)$/)) && method === 'PATCH') {
      const mc = d.machines.find((x) => x.id === Number(m[1])); if (!mc) return [404, { error: 'Máquina no encontrada' }];
      if (!['libre', 'ocupada', 'averiada'].includes(body && body.status)) return [400, { error: 'Estado inválido' }];
      mc.status = body.status; save(); broadcast('machine', mc); return { ok: true };
    }
    if (path === '/api/washers') return d.washers.filter((w) => w.active).map((w) => ({ ...w, en_curso: d.orders.filter((o) => o.washer_id === w.id && ['en_hub', 'lavando', 'secando', 'planchando', 'envasando'].includes(o.status)).length }));
    if (path === '/api/riders' && method === 'GET') return d.riders.filter((r) => r.active).map((r) => ({ ...r,
      recogidas_pendientes: d.orders.filter((o) => o.pickup_rider_id === r.id && o.status === 'pendiente_recogida').length,
      entregas_pendientes: d.orders.filter((o) => o.delivery_rider_id === r.id && ['listo', 'en_reparto'].includes(o.status)).length }));
    if ((m = path.match(/^\/api\/riders\/(\d+)\/location$/))) {
      const { lat, lng, speed, heading, accuracy } = body || {};
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [400, { error: 'lat/lng inválidos' }];
      const r = d.riders.find((x) => x.id === Number(m[1])); if (!r) return [404, { error: 'Rider no encontrado' }];
      Object.assign(r, { lat, lng, speed: speed ?? null, heading: heading ?? null, last_seen: nowIso() });
      d.tracks.push({ id: ++d.seq.track, rider_id: r.id, lat, lng, speed: speed ?? null, heading: heading ?? null, accuracy: accuracy ?? null, at: nowIso() });
      const mine = d.tracks.filter((t) => t.rider_id === r.id); if (mine.length > 2000) d.tracks = d.tracks.filter((t) => t.rider_id !== r.id || mine.indexOf(t) >= mine.length - 2000);
      save(); broadcast('rider', r); return r;
    }
    if ((m = path.match(/^\/api\/riders\/(\d+)\/track$/))) return d.tracks.filter((t) => t.rider_id === Number(m[1])).slice(-300).map(({ lat, lng, speed, at }) => ({ lat, lng, speed, at }));
    if ((m = path.match(/^\/api\/riders\/(\d+)\/route$/))) {
      const id = Number(m[1]);
      const stops = d.orders.filter((o) => (o.pickup_rider_id === id && o.status === 'pendiente_recogida') || (o.delivery_rider_id === id && ['listo', 'en_reparto'].includes(o.status))).map(orderView).map((o) => ({
        order_id: o.id, code: o.code, customer_name: o.customer_name, address: o.address, zone: o.zone, phone: o.phone, lat: o.lat, lng: o.lng, kg: o.kg, scent: o.scent, status: o.status,
        type: o.status === 'pendiente_recogida' ? 'recogida' : 'entrega', slot: o.status === 'pendiente_recogida' ? o.pickup_slot : o.delivery_slot }));
      return optimize(stops);
    }
    if (path === '/api/routes/optimize') return optimize(Array.isArray(body && body.stops) ? body.stops : [], (body && body.start) || HUB);
    if (path === '/api/summary') {
      const byStatus = {}; STATUSES.forEach((s) => (byStatus[s] = 0)); d.orders.forEach((o) => byStatus[o.status]++);
      const today = new Date().toISOString().slice(0, 10);
      const machines = []; d.machines.forEach((mc) => { let row = machines.find((x) => x.kind === mc.kind && x.status === mc.status); if (!row) machines.push((row = { kind: mc.kind, status: mc.status, c: 0 })); row.c++; });
      return { byStatus, kgToday: d.orders.filter((o) => o.created_at.slice(0, 10) === today).reduce((a, o) => a + o.kg, 0), revenueToday: d.orders.filter((o) => o.created_at.slice(0, 10) === today && o.status !== 'cancelado').reduce((a, o) => a + (o.price_eur || 0), 0), machines };
    }
    return [404, { error: 'Ruta no encontrada en la demo' }];
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = function (input, opts = {}) {
    const url = typeof input === 'string' ? input : input.url;
    if (!/^\/api\//.test(url)) return realFetch(input, opts);
    const [path, qs] = url.split('?'); const query = Object.fromEntries(new URLSearchParams(qs || ''));
    const method = (opts.method || 'GET').toUpperCase();
    let body = null; try { body = opts.body ? JSON.parse(opts.body) : null; } catch {}
    let status = 200, data;
    try { const r = handle(method, path, query, body); if (Array.isArray(r) && typeof r[0] === 'number') { status = r[0]; data = r[1]; } else data = r; }
    catch (e) { status = 500; data = { error: e.message }; }
    return Promise.resolve(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }));
  };
})();
