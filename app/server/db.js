// Base de datos SQLite (módulo nativo de Node 22, sin dependencias nativas externas).
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DATA_DIR = process.env.COSTACLEAN_DATA || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'costaclean.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  zone TEXT,
  lat REAL, lng REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS riders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  vehicle TEXT DEFAULT 'cargo-bike',
  active INTEGER DEFAULT 1,
  lat REAL, lng REAL, speed REAL, heading REAL,
  last_seen TEXT
);

CREATE TABLE IF NOT EXISTS rider_tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rider_id INTEGER NOT NULL REFERENCES riders(id),
  lat REAL, lng REAL, speed REAL, heading REAL, accuracy REAL,
  at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS washers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('lavadora','secadora')),
  capacity_kg REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'libre' CHECK(status IN ('libre','ocupada','averiada')),
  order_id INTEGER,
  started_at TEXT,
  ends_at TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  kg REAL NOT NULL,
  bag_size TEXT,
  scent TEXT NOT NULL DEFAULT 'fresco',
  ironing TEXT NOT NULL DEFAULT 'basico',  -- basico | completo | ninguno
  vacuum INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pendiente_recogida',
  pickup_slot TEXT,
  delivery_slot TEXT,
  pickup_rider_id INTEGER REFERENCES riders(id),
  delivery_rider_id INTEGER REFERENCES riders(id),
  washer_id INTEGER REFERENCES washers(id),
  price_eur REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL,
  actor TEXT,
  note TEXT,
  at TEXT DEFAULT (datetime('now'))
);
`);

// Flujo de estados de un pedido (orden lógico del proceso).
const STATUSES = [
  'pendiente_recogida', // el cliente ha pedido, aún no se ha recogido
  'recogido',           // la ropa va en la bici hacia el hub
  'en_hub',             // recibida y pesada en el hub, esperando máquina
  'lavando',
  'secando',
  'planchando',
  'envasando',
  'listo',              // envasada al vacío, lista para salir
  'en_reparto',
  'entregado',
  'cancelado',
];

const SCENTS = [
  { id: 'fresco', label: 'Brisa marina (fresco)' },
  { id: 'lavanda', label: 'Lavanda' },
  { id: 'algodon', label: 'Algodón limpio' },
  { id: 'citrico', label: 'Cítrico mediterráneo' },
  { id: 'jazmin', label: 'Jazmín de Málaga' },
  { id: 'sin', label: 'Sin perfume (hipoalergénico)' },
];

// Tarifa (IVA incluido). Debe coincidir con docs/plan-negocio.md y la calculadora.
const PRICING = {
  bags: { S: { kg: 5, price: 22.9 }, M: { kg: 10, price: 36.9 }, L: { kg: 15, price: 49.9 } },
  ironingFull: { S: 12, M: 20, L: 28 },
  zone2Fee: 2.9,
};

function bagFor(kg) {
  if (kg <= 5) return 'S';
  if (kg <= 10) return 'M';
  return 'L';
}

function priceFor(kg, ironing, zone) {
  const bag = bagFor(kg);
  let p = PRICING.bags[bag].price;
  if (ironing === 'completo') p += PRICING.ironingFull[bag];
  if (zone && /zona 2/i.test(zone)) p += PRICING.zone2Fee;
  return Math.round(p * 100) / 100;
}

function seed() {
  const n = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  if (n > 0) return;

  const insRider = db.prepare("INSERT INTO riders (name, vehicle, lat, lng, last_seen) VALUES (?,?,?,?,datetime('now'))");
  insRider.run('Rider 1 · Dani', 'cargo-bike', 36.7187, -4.4245);
  insRider.run('Rider 2 · Marta', 'cargo-bike', 36.7140, -4.4360);

  const insWasher = db.prepare('INSERT INTO washers (name) VALUES (?)');
  ['Carmen', 'Rocío', 'Isabel'].forEach((w) => insWasher.run(w));

  const insMachine = db.prepare('INSERT INTO machines (name, kind, capacity_kg) VALUES (?,?,?)');
  insMachine.run('Lavadora 1 (11 kg)', 'lavadora', 11);
  insMachine.run('Lavadora 2 (11 kg)', 'lavadora', 11);
  insMachine.run('Lavadora 3 (20 kg)', 'lavadora', 20);
  insMachine.run('Secadora 1 (14 kg)', 'secadora', 14);
  insMachine.run('Secadora 2 (14 kg)', 'secadora', 14);
  insMachine.run('Secadora 3 (14 kg)', 'secadora', 14);

  // Clientes de ejemplo repartidos por barrios reales de Málaga.
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
  const insCust = db.prepare('INSERT INTO customers (name, phone, address, zone, lat, lng) VALUES (?,?,?,?,?,?)');
  const custIds = customers.map((c) => Number(insCust.run(...c).lastInsertRowid));

  const insOrder = db.prepare(`INSERT INTO orders
    (code, customer_id, kg, bag_size, scent, ironing, vacuum, status, pickup_slot, delivery_slot, pickup_rider_id, delivery_rider_id, washer_id, price_eur, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insEvent = db.prepare('INSERT INTO order_events (order_id, status, actor, note) VALUES (?,?,?,?)');

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const scents = ['fresco', 'lavanda', 'algodon', 'citrico', 'jazmin', 'sin'];
  const plan = [
    // [custIdx, kg, ironing, status, pickupRider, deliveryRider, washer]
    [0, 8, 'basico', 'lavando', 1, 1, 1],
    [1, 12, 'completo', 'secando', 1, 1, 2],
    [2, 5, 'basico', 'planchando', 2, 2, 3],
    [3, 9, 'basico', 'listo', 1, 1, 1],
    [4, 10, 'basico', 'en_hub', 2, 2, null],
    [5, 6, 'ninguno', 'pendiente_recogida', 2, 2, null],
    [6, 14, 'basico', 'pendiente_recogida', 2, 2, null],
    [7, 18, 'completo', 'envasando', 1, 1, 2],
    [8, 7, 'basico', 'pendiente_recogida', 1, 1, null],
    [9, 9, 'basico', 'listo', 1, 1, 3],
    [10, 11, 'basico', 'pendiente_recogida', 1, 1, null],
    [11, 5, 'completo', 'listo', 2, 2, 1],
    [12, 8, 'basico', 'recogido', 2, 2, null],
    [13, 10, 'basico', 'pendiente_recogida', 2, 2, null],
    [14, 20, 'basico', 'lavando', 1, 1, 3],
    [15, 6, 'basico', 'entregado', 2, 2, 2],
  ];
  plan.forEach((p, i) => {
    const [ci, kg, ironing, status, pr, dr, w] = p;
    const code = `CC-${String(1001 + i)}`;
    const zone = customers[ci][3];
    const price = priceFor(kg, ironing, zone);
    const pickupSlot = status === 'pendiente_recogida' ? `${today} 17:00-19:00` : `${today} 09:00-11:00`;
    const deliverySlot = status === 'pendiente_recogida' ? `${tomorrow} 17:00-19:00` : `${today} 17:00-19:00`;
    const r = insOrder.run(code, custIds[ci], kg, bagFor(kg), scents[i % scents.length], ironing, 1, status, pickupSlot, deliverySlot, pr, dr, w, price, null);
    const oid = Number(r.lastInsertRowid);
    const idx = STATUSES.indexOf(status);
    for (let s = 0; s <= idx; s++) insEvent.run(oid, STATUSES[s], 'seed', null);
  });

  // Ocupación de máquinas coherente con los pedidos en lavado/secado.
  const now = Date.now();
  const occupy = db.prepare("UPDATE machines SET status='ocupada', order_id=?, started_at=?, ends_at=? WHERE id=?");
  const o1 = db.prepare('SELECT id FROM orders WHERE code=?').get('CC-1001').id;
  const o15 = db.prepare('SELECT id FROM orders WHERE code=?').get('CC-1015').id;
  const o2 = db.prepare('SELECT id FROM orders WHERE code=?').get('CC-1002').id;
  occupy.run(o1, new Date(now - 20 * 60000).toISOString(), new Date(now + 25 * 60000).toISOString(), 1);
  occupy.run(o15, new Date(now - 10 * 60000).toISOString(), new Date(now + 40 * 60000).toISOString(), 3);
  occupy.run(o2, new Date(now - 15 * 60000).toISOString(), new Date(now + 30 * 60000).toISOString(), 4);
}

seed();

module.exports = { db, STATUSES, SCENTS, PRICING, bagFor, priceFor };
