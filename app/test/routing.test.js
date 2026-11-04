const test = require('node:test');
const assert = require('node:assert');
const { optimize, haversineKm, HUB } = require('../server/routing');
const Modelo = require('../public/modelo');

test('haversine: Centro a Pedregalejo ≈ 5 km', () => {
  const d = haversineKm({ lat: 36.7196, lng: -4.4214 }, { lat: 36.7215, lng: -4.3665 });
  assert.ok(d > 4.5 && d < 5.5, `distancia ${d}`);
});

test('optimize nunca empeora el orden de llegada y conserva todas las paradas', () => {
  const stops = [
    { id: 1, lat: 36.7220, lng: -4.3550 }, // El Palo
    { id: 2, lat: 36.7175, lng: -4.4785 }, // Teatinos
    { id: 3, lat: 36.7196, lng: -4.4214 }, // Centro
    { id: 4, lat: 36.7215, lng: -4.3665 }, // Pedregalejo
    { id: 5, lat: 36.7046, lng: -4.4420 }, // Huelin
    { id: 6, lat: 36.7215, lng: -4.4820 }, // Teatinos 2
  ];
  const r = optimize(stops, HUB);
  assert.equal(r.stops.length, 6);
  assert.deepEqual(r.stops.map((s) => s.id).sort(), [1, 2, 3, 4, 5, 6]);
  assert.ok(r.km <= r.baselineKm + 1e-9);
  assert.ok(r.savedPct >= 0);
  assert.ok(r.minutes > 0);
});

test('optimize con lista vacía o sin coordenadas', () => {
  assert.equal(optimize([]).stops.length, 0);
  assert.equal(optimize([{ id: 1, lat: null, lng: null }]).stops.length, 0);
});

test('modelo económico: más volumen baja el coste por pedido y el break-even es estable', () => {
  const a = Modelo.calcular({ pedidosDia: 15 });
  const b = Modelo.calcular({ pedidosDia: 50 });
  assert.ok(b.costePedido < a.costePedido);
  assert.ok(Math.abs(a.breakEvenPedidosMes - b.breakEvenPedidosMes) < 1e-6);
  assert.ok(a.breakEvenPedidosDia > 10 && a.breakEvenPedidosDia < 30);
});
