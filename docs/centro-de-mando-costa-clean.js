// Ficha de Costa Clean para el Centro de Mando (pegar dentro de estadoInicial(), antes de la ficha Personal,
// y añadir `costa` a la lista `empresas`). Requiere las utilidades del núcleo: nuevaFicha, arch, uid, hoy, haceDias.

  const costa = nuevaFicha('Costa Clean', 'Lavandería a domicilio · Málaga', '🧺', 6);
  const RAW = 'https://raw.githubusercontent.com/eldaddyofm-afk/LAMASIA/ccr-dccf6d99-4afm8q';
  costa.archivos = [
    arch('Landing (español)', 'https://claude.ai/artifact/XY5qdLNjMMMFZmKzATrpKw'),
    arch('Landing (English)', 'https://claude.ai/artifact/1Rm1STKonrgdrMCkg36p4L'),
    arch('App de operaciones · beta (panel, mapa GPS, hub, rider, calculadora, recursos)', 'https://claude.ai/artifact/4mTka28BJN6Zn84yWCDgqv'),
    arch('Repositorio LAMASIA (app, marca y docs)', 'https://github.com/eldaddyofm-afk/LAMASIA/tree/ccr-dccf6d99-4afm8q'),
    arch('Plan operativo y económico (PDF)', `${RAW}/brand/plan-negocio.pdf`),
    arch('Costes sin IVA, sin local y sin gestoría (PDF, 1 página)', `${RAW}/brand/costes-sin-iva-local-gestoria.pdf`),
    arch('Kit de marca y lanzamiento (PDF)', `${RAW}/brand/kit-marca.pdf`),
    arch('Tarjetas de visita para imprenta (PDF)', `${RAW}/brand/tarjetas-visita.pdf`),
    arch('Logos SVG y PNG (zip)', `${RAW}/brand/logos.zip`),
    arch('Pack de Instagram: 9 posts, 3 stories y textos (zip)', `${RAW}/brand/instagram.zip`),
    arch('Business plan · English (PDF)', `${RAW}/brand/en/business-plan.pdf`),
    arch('Brand kit · English (PDF)', `${RAW}/brand/en/brand-kit.pdf`),
    arch('Instagram pack · English (zip)', `${RAW}/brand/en/instagram.zip`),
  ];
  const tc = (txt, dias) => ({ id: uid(), t: txt, hecho: false, fecha: dias === undefined ? '' : haceDias(-dias), creada: hoy() });
  costa.proyectos = [
    {
      id: uid(), nombre: 'Validar demanda (semanas 1-2)', estado: 'activo', tocado: hoy(),
      notas: 'Antes de comprar nada: 30 pre-reservas y 10 pedidos reales cronometrados.',
      tareas: [
        tc('Contratar WhatsApp Business y sustituir el 600 000 000 en landing, tarjetas y kit', 2),
        tc('Compartir la landing y la beta desde el menú Share para que se abran sin cuenta', 1),
        tc('Registrar el dominio y apuntarlo a la landing; regenerar el QR', 7),
        tc('Abrir el Instagram con el avatar y publicar los 3 primeros posts del calendario', 3),
        tc('Repartir 200 flyers con el QR en Soho y Malagueta', 10),
        tc('Lavar 10 pedidos de conocidos y cronometrar: doblar, planchar, envasar', 14),
        tc('Probar el envasado al vacío parcial con ropa planchada (que no se arrugue)', 14),
      ],
    },
    {
      id: uid(), nombre: 'Maquinaria y local (semanas 3-4)', estado: 'activo', tocado: hoy(),
      notas: 'Configuración del plan: 2 lavadoras 10-11 kg, 1 de 20 kg, 3 secadoras, plancha con caldera, envasadora de campana. ≈ 32.600 € sin IVA nuevo; renting ≈ 600 €/mes.',
      tareas: [
        tc('Pedir 3 presupuestos de maquinaria (Girbau Málaga, Primer, Fagor): nuevo y en renting', 21),
        tc('Visitar 5 locales en Perchel / Cruz de Humilladero (100-120 m², trifásica, desagües)', 21),
        tc('Consultar en el Ayuntamiento la licencia de actividad (IAE 971.1) antes de firmar', 25),
        tc('Decidir: micro-hub (recomendado) o red doméstica como prueba de 1-2 meses', 28),
      ],
    },
    {
      id: uid(), nombre: 'Constitución y equipo (mes 2)', estado: 'idea', tocado: hoy(),
      notas: 'Las lavanderas van con contrato a tiempo parcial desde el día uno (convenio de tintorerías y lavanderías).',
      tareas: [
        tc('Constituir la SL y alta en el IAE 971.1'),
        tc('Seguro de responsabilidad civil con cobertura de prendas'),
        tc('Contratar 2 lavanderas a media jornada y 1 rider'),
        tc('Comprar o alquilar la maquinaria e instalarla'),
        tc('Comprar 1 cargo-bike eléctrica (la segunda cuando se pasen los 25 pedidos/día)'),
      ],
    },
    {
      id: uid(), nombre: 'Lanzamiento Zona 1 (mes 3)', estado: 'idea', tocado: hoy(),
      notas: 'Objetivo: 10 pedidos al día. Centro, Soho, Malagueta, Huelin, Carretera de Cádiz, Cruz de Humilladero, Ciudad Jardín y Pedregalejo.',
      tareas: [
        tc('Imprimir 250 tarjetas y 200 flyers con el teléfono real'),
        tc('Firmar 3-5 gestores de apartamentos turísticos (kit cama y baño desde 14,90 € + IVA)'),
        tc('Lanzar la suscripción de 4 bolsas M al mes a 129 €'),
      ],
    },
    {
      id: uid(), nombre: 'Software (app de operaciones)', estado: 'activo', tocado: hoy(),
      notas: 'Código en la carpeta app/ del repositorio. La beta publicada funciona sin servidor.',
      tareas: [
        tc('Desplegar la app en un VPS con HTTPS (necesario para el GPS del rider)'),
        tc('Login y roles (panel, hub, rider)'),
        tc('Pagos con tarjeta y Bizum'),
        tc('Avisos automáticos por WhatsApp (confirmación, rider cerca, entregado)'),
        tc('Geocodificación de direcciones en la web de pedido'),
        tc('Versión en inglés de la app'),
      ],
    },
  ];
  costa.objetivos = [
    { id: uid(), titulo: 'Cubrir costes: 10 pedidos al día (sin IVA, local ni gestoría)', meta: 10, actual: 0, unidad: 'pedidos/día', fecha: haceDias(-90), hecho: false, creado: hoy(), hist: [], inicio: 0, baja: false },
    { id: uid(), titulo: 'Llegar a 30 pedidos al día (≈ 10.500 €/mes de margen)', meta: 30, actual: 0, unidad: 'pedidos/día', fecha: haceDias(-270), hecho: false, creado: hoy(), hist: [], inicio: 0, baja: false },
    { id: uid(), titulo: 'Firmar 5 gestores de apartamentos turísticos', meta: 5, actual: 0, unidad: '', fecha: haceDias(-120), hecho: false, creado: hoy(), hist: [], inicio: 0, baja: false },
  ];
  costa.habitos = [
    { id: uid(), titulo: 'Publicar en Instagram (calendario de lanzamiento)', dias: [0, 2, 4], historial: {}, creado: hoy() },
  ];
  costa.kpis = [
    { id: uid(), nombre: 'Precio bolsa M (10 kg)', valor: '36,90', unidad: '€', actualizado: hoy() },
    { id: uid(), nombre: 'Coste por pedido a 30/día', valor: '27,81', unidad: '€', actualizado: hoy() },
    { id: uid(), nombre: 'Punto de equilibrio', valor: '18', unidad: 'ped/día', actualizado: hoy() },
    { id: uid(), nombre: 'Inversión inicial', valor: '45.100', unidad: '€', actualizado: hoy() },
  ];
  costa.notas = `COSTA CLEAN — lavandería a domicilio premium en Málaga: recogida y entrega en cargo-bike, lavado, secado, plancha, envasado al vacío y aroma a elegir (6 aromas).

Modelo: micro-hub de 100-120 m² en Perchel / Cruz de Humilladero con 3 lavadoras y 3 secadoras profesionales; 2 riders en bici; 3-5 lavanderas a media jornada con contrato.

Tarifa (IVA incluido): bolsa S 5 kg 22,90 € · M 10 kg 36,90 € · L 15 kg 49,90 €. Planchado completo +12/20/28 €. Suscripción 4 bolsas M: 129 €/mes. Nórdico 19,90 €. B2B pisos turísticos: kit cama y baño desde 14,90 € + IVA. Zona 2 (El Palo, Teatinos) +2,90 €.

Cifras (pedido medio 8 kg):
· Coste por pedido: 37,70 € a 15/día · 27,81 € a 30/día · 23,85 € a 50/día. La mano de obra del hub es la mitad (14,38 €).
· Punto de equilibrio: 18 pedidos/día con 2 riders (10/día sin IVA, local ni gestoría; 6,4/día con 1 rider).
· Margen: 20 % a 30/día (≈ 4.500 €/mes) · 31 % a 50/día (≈ 11.900 €/mes). Sin IVA/local/gestoría: 38 % a 30/día (≈ 10.550 €/mes).
· Inversión inicial: ≈ 45.100 € sin IVA con maquinaria nueva; 20.000-25.000 € con segunda mano.

Competencia: Mr Jeff 8 kg 17 € (solo lavado y doblado) · Washrocks 5 kg 20,95 € · industrial local 1,80 €/kg. No competimos en €/kg: competimos en acabado.

Marca: percha con ola. Mar #0B7A8A · Mar profundo #075B67 · Arena #F6EFE4 · Sol #F6C66B · Coral #F26B4E · Tinta #1D2A30. Outfit + Nunito Sans. Todo el material (ES y EN) en la carpeta brand/ del repositorio y en la pestaña Recursos de la app.

Pendiente: el WhatsApp 600 000 000 es un marcador; dominio y correo hola@costaclean.es provisionales; landing y beta en privado hasta compartirlas.`;

