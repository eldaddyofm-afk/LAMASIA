const express = require('express');
const path = require('node:path');
const { db, STATUSES, SCENTS, PRICING, bagFor, priceFor } = require('./db');
const { optimize, HUB } = require('./routing');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
// Recursos de marca y documentación (PDF, logos, Instagram, planes) servidos desde la propia app.
app.use('/brand', express.static(path.join(__dirname, '..', '..', 'brand')));
app.use('/docs', express.static(path.join(__dirname, '..', '..', 'docs')));
app.get('/landing', (_req, res) => res.sendFile(path.join(__dirname, '..', '..', 'brand', 'landing.html')));
app.get('/en', (_req, res) => res.sendFile(path.join(__dirname, '..', '..', 'brand', 'en', 'landing.html')));

// ---------- Server-Sent Events: posiciones de riders y cambios de pedidos en vivo ----------
const sseClients = new Set();
app.get('/api/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('retry: 3000\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});
function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const c of sseClients) c.write(msg);
}
setInterval(() => { for (const c of sseClients) c.write(': ping\n\n'); }, 25000);

// ---------- Meta ----------
app.get('/api/meta', (_req, res) => {
  res.json({ statuses: STATUSES, scents: SCENTS, pricing: PRICING, hub: HUB });
});

// ---------- Pedidos ----------
const ORDER_SELECT = `
  SELECT o.*, c.name AS customer_name, c.phone, c.address, c.zone, c.lat, c.lng,
         w.name AS washer_name, pr.name AS pickup_rider_name, dr.name AS delivery_rider_name
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  LEFT JOIN washers w ON w.id = o.washer_id
  LEFT JOIN riders pr ON pr.id = o.pickup_rider_id
  LEFT JOIN riders dr ON dr.id = o.delivery_rider_id`;

app.get('/api/orders', (req, res) => {
  const { status, rider, washer } = req.query;
  const where = [];
  const params = [];
  if (status) { where.push('o.status = ?'); params.push(status); }
  if (rider) { where.push('(o.pickup_rider_id = ? OR o.delivery_rider_id = ?)'); params.push(rider, rider); }
  if (washer) { where.push('o.washer_id = ?'); params.push(washer); }
  const sql = ORDER_SELECT + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY o.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/orders/:id', (req, res) => {
  const o = db.prepare(ORDER_SELECT + ' WHERE o.id = ?').get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Pedido no encontrado' });
  o.events = db.prepare('SELECT * FROM order_events WHERE order_id = ? ORDER BY at').all(o.id);
  res.json(o);
});

// Crear pedido (desde la web del cliente o desde el panel).
app.post('/api/orders', (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.address || !b.kg) return res.status(400).json({ error: 'Faltan nombre, dirección o kg' });
  const kg = Number(b.kg);
  const zone = b.zone || 'Zona 1';
  const ironing = ['basico', 'completo', 'ninguno'].includes(b.ironing) ? b.ironing : 'basico';
  const scent = SCENTS.some((s) => s.id === b.scent) ? b.scent : 'fresco';
  const tx = db.prepare('BEGIN'); tx.run();
  try {
    const c = db.prepare('INSERT INTO customers (name, phone, email, address, zone, lat, lng, notes) VALUES (?,?,?,?,?,?,?,?)')
      .run(b.name, b.phone || null, b.email || null, b.address, zone, b.lat ?? null, b.lng ?? null, b.notes || null);
    const price = priceFor(kg, ironing, zone);
    const last = db.prepare('SELECT MAX(id) AS m FROM orders').get().m || 1000;
    const code = `CC-${last + 1001}`;
    const r = db.prepare(`INSERT INTO orders (code, customer_id, kg, bag_size, scent, ironing, vacuum, status, pickup_slot, delivery_slot, price_eur, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(code, Number(c.lastInsertRowid), kg, bagFor(kg), scent, ironing, b.vacuum === false ? 0 : 1, 'pendiente_recogida', b.pickup_slot || null, b.delivery_slot || null, price, b.notes || null);
    db.prepare('INSERT INTO order_events (order_id, status, actor) VALUES (?,?,?)').run(Number(r.lastInsertRowid), 'pendiente_recogida', b.actor || 'web');
    db.prepare('COMMIT').run();
    const o = db.prepare(ORDER_SELECT + ' WHERE o.id = ?').get(Number(r.lastInsertRowid));
    broadcast('order', o);
    res.status(201).json(o);
  } catch (e) {
    db.prepare('ROLLBACK').run();
    res.status(500).json({ error: e.message });
  }
});

// Cambiar estado / asignaciones.
app.patch('/api/orders/:id', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Pedido no encontrado' });
  const b = req.body || {};
  const fields = [];
  const params = [];
  for (const k of ['pickup_rider_id', 'delivery_rider_id', 'washer_id', 'pickup_slot', 'delivery_slot', 'notes', 'kg', 'scent', 'ironing']) {
    if (k in b) { fields.push(`${k} = ?`); params.push(b[k]); }
  }
  if (b.status) {
    if (!STATUSES.includes(b.status)) return res.status(400).json({ error: 'Estado inválido' });
    fields.push('status = ?'); params.push(b.status);
  }
  if (!fields.length) return res.status(400).json({ error: 'Nada que actualizar' });
  fields.push("updated_at = datetime('now')");
  db.prepare(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`).run(...params, o.id);
  if (b.status && b.status !== o.status) {
    db.prepare('INSERT INTO order_events (order_id, status, actor, note) VALUES (?,?,?,?)').run(o.id, b.status, b.actor || 'panel', b.note || null);
    // Liberar la lavadora cuando el pedido deja de estar lavando, y la secadora cuando deja de secar.
    if (b.status !== 'lavando') db.prepare("UPDATE machines SET status='libre', order_id=NULL, started_at=NULL, ends_at=NULL WHERE order_id = ? AND kind='lavadora'").run(o.id);
    if (b.status !== 'secando') db.prepare("UPDATE machines SET status='libre', order_id=NULL, started_at=NULL, ends_at=NULL WHERE order_id = ? AND kind='secadora'").run(o.id);
    broadcast('machine', { order_id: o.id });
  }
  const out = db.prepare(ORDER_SELECT + ' WHERE o.id = ?').get(o.id);
  broadcast('order', out);
  res.json(out);
});

// ---------- Máquinas ----------
app.get('/api/machines', (_req, res) => {
  res.json(db.prepare(`SELECT m.*, o.code AS order_code, c.name AS customer_name
    FROM machines m LEFT JOIN orders o ON o.id = m.order_id LEFT JOIN customers c ON c.id = o.customer_id ORDER BY m.kind, m.id`).all());
});

// Meter un pedido en una máquina (y avanzar su estado).
app.post('/api/machines/:id/start', (req, res) => {
  const m = db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Máquina no encontrada' });
  if (m.status !== 'libre') return res.status(409).json({ error: 'La máquina no está libre' });
  const { order_id, minutes } = req.body || {};
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
  if (!o) return res.status(404).json({ error: 'Pedido no encontrado' });
  const mins = Number(minutes) || (m.kind === 'lavadora' ? 45 : 40);
  const now = new Date();
  const ends = new Date(now.getTime() + mins * 60000);
  db.prepare("UPDATE machines SET status='ocupada', order_id=?, started_at=?, ends_at=? WHERE id=?").run(o.id, now.toISOString(), ends.toISOString(), m.id);
  const newStatus = m.kind === 'lavadora' ? 'lavando' : 'secando';
  db.prepare("UPDATE orders SET status=?, updated_at=datetime('now') WHERE id=?").run(newStatus, o.id);
  db.prepare('INSERT INTO order_events (order_id, status, actor, note) VALUES (?,?,?,?)').run(o.id, newStatus, req.body.actor || 'hub', m.name);
  broadcast('machine', db.prepare('SELECT * FROM machines WHERE id = ?').get(m.id));
  broadcast('order', db.prepare(ORDER_SELECT + ' WHERE o.id = ?').get(o.id));
  res.json({ ok: true });
});

app.post('/api/machines/:id/free', (req, res) => {
  db.prepare("UPDATE machines SET status='libre', order_id=NULL, started_at=NULL, ends_at=NULL WHERE id=?").run(req.params.id);
  broadcast('machine', db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id));
  res.json({ ok: true });
});

app.patch('/api/machines/:id', (req, res) => {
  const { status } = req.body || {};
  if (!['libre', 'ocupada', 'averiada'].includes(status)) return res.status(400).json({ error: 'Estado inválido' });
  db.prepare('UPDATE machines SET status=? WHERE id=?').run(status, req.params.id);
  broadcast('machine', db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id));
  res.json({ ok: true });
});

// ---------- Lavanderas ----------
app.get('/api/washers', (_req, res) => {
  res.json(db.prepare(`SELECT w.*, (SELECT COUNT(*) FROM orders o WHERE o.washer_id = w.id AND o.status IN ('en_hub','lavando','secando','planchando','envasando')) AS en_curso FROM washers w WHERE active=1`).all());
});

// ---------- Riders y GPS ----------
app.get('/api/riders', (_req, res) => {
  res.json(db.prepare(`SELECT r.*,
    (SELECT COUNT(*) FROM orders o WHERE o.pickup_rider_id = r.id AND o.status = 'pendiente_recogida') AS recogidas_pendientes,
    (SELECT COUNT(*) FROM orders o WHERE o.delivery_rider_id = r.id AND o.status IN ('listo','en_reparto')) AS entregas_pendientes
    FROM riders r WHERE active=1`).all());
});

// La app del repartidor envía su posición cada pocos segundos.
app.post('/api/riders/:id/location', (req, res) => {
  const { lat, lng, speed, heading, accuracy } = req.body || {};
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: 'lat/lng inválidos' });
  const r = db.prepare('SELECT id FROM riders WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Rider no encontrado' });
  db.prepare("UPDATE riders SET lat=?, lng=?, speed=?, heading=?, last_seen=datetime('now') WHERE id=?").run(lat, lng, speed ?? null, heading ?? null, r.id);
  db.prepare('INSERT INTO rider_tracks (rider_id, lat, lng, speed, heading, accuracy) VALUES (?,?,?,?,?,?)').run(r.id, lat, lng, speed ?? null, heading ?? null, accuracy ?? null);
  // Mantener solo las últimas 2.000 posiciones por rider.
  db.prepare('DELETE FROM rider_tracks WHERE rider_id = ? AND id NOT IN (SELECT id FROM rider_tracks WHERE rider_id = ? ORDER BY id DESC LIMIT 2000)').run(r.id, r.id);
  const out = db.prepare('SELECT * FROM riders WHERE id = ?').get(r.id);
  broadcast('rider', out);
  res.json(out);
});

app.get('/api/riders/:id/track', (req, res) => {
  res.json(db.prepare('SELECT lat, lng, speed, at FROM rider_tracks WHERE rider_id = ? ORDER BY id DESC LIMIT 300').all(req.params.id).reverse());
});

// ---------- Rutas ----------
// Paradas de un rider: recogidas pendientes + entregas listas, optimizadas desde el hub.
app.get('/api/riders/:id/route', (req, res) => {
  const id = Number(req.params.id);
  const rows = db.prepare(`${ORDER_SELECT}
    WHERE (o.pickup_rider_id = ? AND o.status = 'pendiente_recogida')
       OR (o.delivery_rider_id = ? AND o.status IN ('listo','en_reparto'))`).all(id, id);
  const stops = rows.map((o) => ({
    order_id: o.id, code: o.code, customer_name: o.customer_name, address: o.address, zone: o.zone,
    phone: o.phone, lat: o.lat, lng: o.lng, kg: o.kg, scent: o.scent, status: o.status,
    type: o.status === 'pendiente_recogida' ? 'recogida' : 'entrega',
    slot: o.status === 'pendiente_recogida' ? o.pickup_slot : o.delivery_slot,
  }));
  res.json(optimize(stops));
});

// Optimización ad-hoc: el panel manda cualquier lista de paradas.
app.post('/api/routes/optimize', (req, res) => {
  const stops = Array.isArray(req.body?.stops) ? req.body.stops : [];
  res.json(optimize(stops, req.body?.start || HUB));
});

// Resumen para el panel.
app.get('/api/summary', (_req, res) => {
  const byStatus = {};
  for (const s of STATUSES) byStatus[s] = 0;
  for (const r of db.prepare('SELECT status, COUNT(*) AS c FROM orders GROUP BY status').all()) byStatus[r.status] = r.c;
  const kgToday = db.prepare("SELECT COALESCE(SUM(kg),0) AS kg FROM orders WHERE date(created_at) = date('now')").get().kg;
  const revenueToday = db.prepare("SELECT COALESCE(SUM(price_eur),0) AS eur FROM orders WHERE date(created_at) = date('now') AND status != 'cancelado'").get().eur;
  const machines = db.prepare('SELECT kind, status, COUNT(*) AS c FROM machines GROUP BY kind, status').all();
  res.json({ byStatus, kgToday, revenueToday, machines });
});

// Páginas limpias (sin .html)
for (const p of ['panel', 'mapa', 'rider', 'hub', 'calculadora', 'pedido', 'recursos']) {
  app.get(`/${p}`, (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', `${p}.html`)));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Costa Clean Ops escuchando en http://localhost:${PORT}`));
