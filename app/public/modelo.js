// Modelo económico de Costa Clean. Mismo código en la calculadora web y en Node (docs).
// Todos los importes sin IVA salvo que se indique. Fuentes y razonamiento: docs/plan-negocio.md
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.Modelo = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const DEFAULTS = {
    // Demanda
    pedidosDia: 30,            // pedidos/día
    diasMes: 22,               // días operativos/mes (lunes-sábado ≈ 26; usamos 22 por prudencia)
    kgPedido: 8,               // kg medio por pedido
    pctPlanchadoCompleto: 0.25,// % pedidos con planchado completo (extra)
    ticketMedioIva: 36.9,      // € IVA incluido por bolsa base (bolsa M 10 kg)
    extraPlanchadoIva: 20,     // € IVA incluido del extra de planchado completo (bolsa M)
    iva: 0.21,

    // Personal (coste empresa, incluye Seguridad Social ~31,5 %)
    costeHoraLavandera: 12.5,  // €/h coste empresa (SMI 2026 1.221 €×14 pagas + SS ≈ 11,6 €/h; 12,5 con margen)
    riders: 2,
    costeRiderMes: 1900,       // €/mes coste empresa jornada completa a SMI 2026
    horasRiderDia: 7,          // horas productivas en ruta
    paradasHoraRider: 7,       // paradas/hora en ciudad densa con cargo-bike (recogida o entrega)

    // Tiempos de mano de obra en el hub por pedido de 8 kg (minutos)
    minClasificarCargar: 8,    // recibir, pesar, clasificar, cargar lavadora
    minTransferirSecadora: 5,
    minDoblar: 18,             // ~35 prendas × 30 s
    minPlanchaBasica: 15,      // vapor rápido a camisas/pantalones (≈6-8 prendas)
    minPlanchadoCompleto: 60,  // extra si el cliente pide todo planchado
    minEnvasar: 8,             // envasado al vacío + etiqueta + aroma

    // Consumibles y energía por pedido de 8 kg
    detergenteKg: 0.12,        // €/kg (detergente + suavizante + perfume textil profesional)
    bolsasVacioPedido: 1.2,    // € (2 bolsas grandes de 0,60 €)
    kwhLavado: 1.6,            // lavadora 11 kg a 40 ºC
    kwhSecado: 4.5,            // secadora eléctrica 14 kg (bomba de calor: ~2,5)
    kwhPlanchaEnvasado: 0.6,
    precioKwh: 0.18,           // €/kWh pyme 2025-26 (ver plan)
    m3AguaPedido: 0.08,        // 80 L por ciclo de 8-10 kg
    precioM3: 2.2,             // agua + saneamiento Málaga (orientativo)

    // Fijos mensuales
    alquilerLocal: 1100,       // nave/local 100-120 m² Málaga (Perchel / Cruz de Humilladero / polígono)
    suministrosFijos: 150,     // potencia contratada, internet, basura
    bicisMes: 320,             // 2 cargo-bikes: amortización 36 meses + mantenimiento + seguro
    software: 150,             // hosting, SMS/WhatsApp API, pasarela de pago
    marketing: 400,
    seguros: 100,              // RC + pérdida/daño de prendas
    gestoria: 150,
    inversionMaquinaria: 30000,// CAPEX hub (ver sección lavadoras industriales)
    mesesAmortizacion: 84,     // 7 años
  };

  function calcular(p) {
    const d = { ...DEFAULTS, ...p };
    const pedidosMes = d.pedidosDia * d.diasMes;
    const kgMes = pedidosMes * d.kgPedido;

    // --- Capacidad de reparto ---
    const paradasMes = pedidosMes * 2; // cada pedido = 1 recogida + 1 entrega
    const capacidadParadasMes = d.riders * d.horasRiderDia * d.paradasHoraRider * d.diasMes;
    const ocupacionRiders = paradasMes / capacidadParadasMes;

    // --- Mano de obra hub ---
    const minBase = d.minClasificarCargar + d.minTransferirSecadora + d.minDoblar + d.minPlanchaBasica + d.minEnvasar;
    const minMedio = minBase + d.pctPlanchadoCompleto * d.minPlanchadoCompleto;
    const horasHubMes = (pedidosMes * minMedio) / 60;
    const costeHubMes = horasHubMes * d.costeHoraLavandera;
    const lavanderasEquivalentes = horasHubMes / (d.diasMes * 4); // en jornadas de 4 h (media jornada)

    // --- Consumibles y energía ---
    const kwhPedido = d.kwhLavado + d.kwhSecado + d.kwhPlanchaEnvasado;
    const consumPedido = d.detergenteKg * d.kgPedido + d.bolsasVacioPedido + kwhPedido * d.precioKwh + d.m3AguaPedido * d.precioM3;
    const consumMes = consumPedido * pedidosMes;

    // --- Fijos ---
    const amortizacion = d.inversionMaquinaria / d.mesesAmortizacion;
    const fijosMes = d.alquilerLocal + d.suministrosFijos + d.bicisMes + d.software + d.marketing + d.seguros + d.gestoria + amortizacion;
    const ridersMes = d.riders * d.costeRiderMes;

    const costeTotalMes = costeHubMes + consumMes + fijosMes + ridersMes;
    const costePedido = costeTotalMes / pedidosMes;
    const costeKg = costeTotalMes / kgMes;

    // --- Ingresos ---
    const ingresoPedidoNeto = (d.ticketMedioIva + d.pctPlanchadoCompleto * d.extraPlanchadoIva) / (1 + d.iva);
    const ingresosMes = ingresoPedidoNeto * pedidosMes;
    const margenMes = ingresosMes - costeTotalMes;
    const margenPct = ingresosMes ? margenMes / ingresosMes : 0;

    // --- Punto de equilibrio (pedidos/mes) con riders como coste fijo ---
    const variablePedido = (minMedio / 60) * d.costeHoraLavandera + consumPedido;
    const contribucion = ingresoPedidoNeto - variablePedido;
    const breakEvenPedidosMes = contribucion > 0 ? (fijosMes + ridersMes) / contribucion : Infinity;

    return {
      pedidosMes, kgMes, paradasMes, capacidadParadasMes, ocupacionRiders,
      minMedio, horasHubMes, costeHubMes, lavanderasEquivalentes,
      kwhPedido, consumPedido, consumMes, amortizacion, fijosMes, ridersMes,
      costeTotalMes, costePedido, costeKg,
      desglosePedido: { hub: costeHubMes / pedidosMes, consumibles: consumPedido, reparto: ridersMes / pedidosMes, fijos: fijosMes / pedidosMes },
      ingresoPedidoNeto, ingresosMes, margenMes, margenPct, variablePedido, contribucion, breakEvenPedidosMes, breakEvenPedidosDia: breakEvenPedidosMes / d.diasMes,
    };
  }

  return { DEFAULTS, calcular };
});
