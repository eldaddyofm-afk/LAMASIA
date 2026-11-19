// Optimización de rutas para reparto en bicicleta de carga.
// Vecino más cercano + mejora 2-opt sobre distancia Haversine.
// Para 10-40 paradas por rider es suficiente y corre en milisegundos.

const HUB = { lat: 36.7158, lng: -4.4335, name: 'Hub Costa Clean (Perchel / Cruz de Humilladero)' };

// Factor de rodeo: la distancia real en bici por calles es ~1,3x la línea recta.
const DETOUR = 1.3;
const BIKE_KMH = 14;         // velocidad media real de una cargo-bike eléctrica en ciudad
const STOP_MIN = 4;          // minutos por parada (aparcar, subir, entregar/recoger)

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function routeKm(points) {
  let km = 0;
  for (let i = 0; i < points.length - 1; i++) km += haversineKm(points[i], points[i + 1]);
  return km * DETOUR;
}

function nearestNeighbor(start, stops) {
  const remaining = stops.slice();
  const route = [];
  let cur = start;
  while (remaining.length) {
    let bi = 0;
    let bd = Infinity;
    remaining.forEach((s, i) => {
      const d = haversineKm(cur, s);
      if (d < bd) { bd = d; bi = i; }
    });
    cur = remaining.splice(bi, 1)[0];
    route.push(cur);
  }
  return route;
}

function twoOpt(start, route) {
  // Ruta cerrada: hub -> paradas -> hub
  let best = route.slice();
  let improved = true;
  const full = (r) => [start, ...r, start];
  let bestLen = routeKm(full(best));
  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const cand = best.slice(0, i).concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
        const len = routeKm(full(cand));
        if (len + 1e-9 < bestLen) { best = cand; bestLen = len; improved = true; }
      }
    }
  }
  return best;
}

/**
 * stops: [{id, lat, lng, ...}]
 * Devuelve: orden optimizado, km, minutos estimados y comparación con el orden original.
 */
function optimize(stops, start = HUB) {
  const valid = stops.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
  if (valid.length === 0) return { stops: [], km: 0, minutes: 0, baselineKm: 0, savedKm: 0, savedPct: 0 };
  const nn = nearestNeighbor(start, valid);
  const opt = twoOpt(start, nn);
  const km = routeKm([start, ...opt, start]);
  const baselineKm = routeKm([start, ...valid, start]); // orden de llegada de los pedidos (sin optimizar)
  const minutes = (km / BIKE_KMH) * 60 + opt.length * STOP_MIN;
  return {
    start,
    stops: opt.map((s, i) => ({ ...s, seq: i + 1 })),
    km: round(km),
    minutes: Math.round(minutes),
    baselineKm: round(baselineKm),
    savedKm: round(baselineKm - km),
    savedPct: baselineKm > 0 ? Math.round(((baselineKm - km) / baselineKm) * 100) : 0,
  };
}

function round(x) { return Math.round(x * 10) / 10; }

module.exports = { optimize, haversineKm, HUB, BIKE_KMH, STOP_MIN };
