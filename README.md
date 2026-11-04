# Costa Clean · Lavandería a domicilio en Málaga

Servicio de lavandería a domicilio: recogida y entrega en bicicleta de carga, lavado, secado, plancha,
**envasado al vacío** y **aroma a elegir**. Este repositorio contiene:

| Carpeta | Qué hay |
|---|---|
| `docs/plan-negocio.md` | Plan operativo y económico: cómo funciona el sistema, costes, precio de venta, rutas, maquinaria industrial, punto de equilibrio, riesgos y siguientes pasos. |
| `app/` | Aplicación web interna **Costa Clean OPS** (Node.js + Express + SQLite, sin frameworks de frontend). |

## La aplicación

| Pantalla | URL | Para quién | Qué hace |
|---|---|---|---|
| Panel de operaciones | `/panel` | Vosotros | Tablero por estados (pendiente de recoger → lavando → secando → planchando → envasando → listo → en reparto → entregado), KPIs, máquinas, riders, lavanderas. Crear pedidos por teléfono. |
| Mapa y GPS | `/mapa` | Vosotros | Posición en vivo de los riders, recorrido, paradas pendientes y **ruta optimizada** por rider (vecino más cercano + 2-opt) con km ahorrados. |
| Hub lavandería | `/hub` | Lavanderas | Cola de trabajo por persona, meter pedidos en lavadora/secadora con temporizador, aroma y tipo de planchado de cada bolsa, envasado, marcar listo. |
| App rider | `/rider` | Repartidores (móvil) | Ruta del día en orden óptimo, navegación, marcar recogido/entregado, **envío automático del GPS** del móvil cada 5 s. |
| Web cliente | `/pedido` | Clientes | Formulario de pedido: bolsa (5/10/15 kg), aroma, planchado, barrio, franja horaria y precio. |
| Calculadora | `/calculadora` | Vosotros | Modelo económico interactivo (mismos números que el plan): costes, margen, punto de equilibrio, inversión en maquinaria. |

### Arrancar

```bash
cd app
npm install
npm start          # http://localhost:3000
npm test           # tests del optimizador de rutas y del modelo económico
```

Requiere Node.js 22.13 o superior (usa el módulo SQLite integrado; no hay dependencias nativas).
La base de datos se crea en `app/data/costaclean.db` con datos de ejemplo de Málaga la primera vez.

Para que los riders envíen el GPS desde su móvil la web debe servirse por **HTTPS** (los navegadores
bloquean la geolocalización en HTTP). En producción: un VPS pequeño (5-10 €/mes) con Caddy o nginx delante,
o un servicio tipo Railway/Fly.io; el servidor es un único proceso Node.

### API (resumen)

- `GET/POST /api/orders`, `PATCH /api/orders/:id` (estado, rider, lavandera, notas)
- `GET /api/machines`, `POST /api/machines/:id/start|free`
- `GET /api/riders`, `POST /api/riders/:id/location` (GPS), `GET /api/riders/:id/track`, `GET /api/riders/:id/route`
- `POST /api/routes/optimize` (lista de paradas → orden óptimo, km, minutos, ahorro)
- `GET /api/stream` (Server-Sent Events: pedidos, máquinas y GPS en tiempo real)

## Qué no está hecho todavía (siguientes pasos técnicos)

- Autenticación (login para panel/hub/rider) y roles.
- Pagos online (Stripe/Bizum) y avisos por WhatsApp (API de Meta o Twilio).
- Geocodificación automática de direcciones (Nominatim/Google) en la web del cliente.
- Franjas horarias como restricción dura en el optimizador (ahora optimiza solo distancia).
