/* ============================================================
   CENTRO DE MANDO — módulo ARMARIO (v1)
   Tarjeta "Armario": paleta Invierno Profundo, cápsulas Old Money
   y Urbano, gym, ropa interior, Zara y Temu, tiendas de Madrid y
   lista de próximas compras con presupuesto.
   Se engancha al núcleo sin tocarlo: amplía tabsDe, renderContent,
   renderRail y manejarClick. Los datos viven en la ficha (S), así que
   entran en la copia de seguridad y en el espejo como todo lo demás.
   Cómo instalarlo en tu app: copia armario.js y la carpeta img/ junto a
   index.html y añade la etiqueta script que carga armario.js después de
   los scripts del núcleo (ver LEEME.txt).
   ============================================================ */

const PRENDAS_BASE = [
{
"id": "camisa_oxford_blanca",
"n": "Camisa oxford blanca",
"t": "Springfield",
"p": 39.99,
"g": "principal",
"s": "oldmoney",
"img": "img/sf_camisa_blanca.jpg",
"url": "https://myspringfield.com/es/es/hombre/camisas/camisa-oxford/0274072.html?dwvar_0274072_color=99",
"c": "Blanco",
"nt": "Tu camisa base. Con americana o sola con el chino."
},
{
"id": "chino_marino_jj",
"n": "Chino slim marino",
"t": "Jack & Jones",
"p": 34.99,
"g": "principal",
"s": "oldmoney",
"img": "img/jj_chino_navy.jpg",
"url": "https://www.jackjones.com/es-es/product/12150148_2078/pantalones-chinos-corte-slim-tiro-bajo",
"c": "Azul oscuro",
"nt": "Pide largo 32. Más barato que el de Springfield."
},
{
"id": "jersey_marino",
"n": "Jersey básico cuello redondo marino",
"t": "Springfield",
"p": 29.99,
"g": "principal",
"s": "oldmoney",
"img": "img/sf_jersey_marino.jpg",
"url": "https://myspringfield.com/es/es/hombre/jerseis/jersey-basico-cuello-redondo/0064953.html?dwvar_0064953_color=80",
"c": "Marino",
"nt": "Encima de la camisa blanca con el cuello asomando."
},
{
"id": "americana_marino",
"n": "Americana ojo de perdiz marino",
"t": "Celopman (Springfield)",
"p": 59.99,
"g": "principal",
"s": "oldmoney",
"img": "img/sf_americana_celopman.jpg",
"url": "https://myspringfield.com/es/es/hombre/americanas/americana-de-traje-ojo-de-perdiz/0934282.html?dwvar_0934282_color=10",
"c": "Marino",
"nt": "La prenda que define el estilo. Sin corbata."
},
{
"id": "mocasin_negro",
"n": "Mocasín antifaz negro",
"t": "Celopman (Springfield)",
"p": 39.99,
"g": "principal",
"s": "oldmoney",
"img": "img/sf_mocasin_01.jpg",
"url": "https://myspringfield.com/es/es/hombre/calzado/zapatos/mocasines-con-antifaz/1744331.html?dwvar_1744331_color=01",
"c": "Negro",
"nt": "Con chino, calcetín marino o invisible."
},
{
"id": "cinturon_reversible",
"n": "Cinturón reversible negro / marrón",
"t": "Springfield",
"p": 17.99,
"g": "principal",
"s": "oldmoney",
"img": "img/sf_cinturon_01.jpg",
"url": "https://myspringfield.com/es/es/hombre/complementos/cinturones/cinturon-reversible-efecto-piel/2864643.html?dwvar_2864643_color=01",
"c": "Negro y marrón",
"nt": "Lado negro con el mocasín. Hebilla plateada."
},
{
"id": "hoodie_negra",
"n": "Sudadera con capucha negra, relaxed",
"t": "Jack & Jones",
"p": 29.99,
"g": "principal",
"s": "urbano",
"img": "img/jj_hoodie.jpg",
"url": "https://www.jackjones.com/es-es/product/12249340_2161/sudaderas-corte-relaxed-capucha-sisa-en-disminucion",
"c": "Negro",
"nt": "Lisa, sin logo. Una talla más para el oversize."
},
{
"id": "cargo_negro",
"n": "Pantalón cargo relaxed negro",
"t": "Jack & Jones",
"p": 49.99,
"g": "principal",
"s": "urbano",
"img": "img/jj_cargo_relaxed.jpg",
"url": "https://www.jackjones.com/es-es/product/12291962_2161/pantalones-cargo-corte-relaxed-cintura-media",
"c": "Negro",
"nt": "Cintura media, pierna recta."
},
{
"id": "bomber_negra",
"n": "Bomber negra cuello béisbol",
"t": "Jack & Jones",
"p": 39.99,
"g": "principal",
"s": "urbano",
"img": "img/jj_bomber.jpg",
"url": "https://www.jackjones.com/es-es/product/12165203_2161/bombers-cuello-beisbol",
"c": "Negro",
"nt": "Capa de entretiempo sobre sudadera o camiseta."
},
{
"id": "camiseta_scuba_negra",
"n": "Camiseta Scuba negra, relaxed",
"t": "Jack & Jones",
"p": 24.99,
"g": "principal",
"s": "urbano",
"img": "img/jj_tee_black.jpg",
"url": "https://www.jackjones.com/es-es/product/12316254_2161/camisetas-corte-relaxed-cuello-redondo",
"c": "Negro",
"nt": "Tejido grueso que cae bien. Alternativa: 2 básicas de Primark por 16 EUR."
},
{
"id": "nike_court_vision",
"n": "Nike Court Vision Low negras",
"t": "Nike",
"p": 55.99,
"g": "principal",
"s": "urbano",
"img": "img/nike_cv_black.jpg",
"url": "https://www.nike.com/es/t/court-vision-low-next-nature-zapatillas-hombre-qz2jMVjz/DH2987-001",
"c": "Negro, suela blanca",
"nt": "Silueta Air Force 1 a mitad de precio. Modelo DH2987-001."
},
{
"id": "abrigo_negro_jj",
"n": "Abrigo negro cuello levantado",
"t": "Jack & Jones",
"p": 79.99,
"g": "siguiente",
"s": "base",
"img": "img/jj_abrigo_black.jpg",
"url": "https://www.jackjones.com/es-es/product/12299703_2161/abrigos-cuello-levantado",
"c": "Negro",
"nt": "Prioridad 1 de las siguientes. Vale para los dos estilos."
},
{
"id": "zapatilla_blanca",
"n": "Zapatilla blanca minimalista",
"t": "Springfield",
"p": 39.99,
"g": "siguiente",
"s": "oldmoney",
"img": "img/sf_zapatilla_blanca_98.jpg",
"url": "https://myspringfield.com/es/es/hombre/calzado/zapatillas/zapatilla-blanca-deportiva/2994122.html?dwvar_2994122_color=98",
"c": "Blanco",
"nt": "Old Money casual con chino y jersey."
},
{
"id": "camisa_oxford_azul",
"n": "Camisa oxford azul claro",
"t": "Springfield",
"p": 39.99,
"g": "siguiente",
"s": "oldmoney",
"img": "img/sf_camisa_azul.jpg",
"url": "https://myspringfield.com/es/es/hombre/camisas/camisa-oxford/0274072.html?dwvar_0274072_color=14",
"c": "Azul claro",
"nt": "Segunda camisa. Es tu azul hielo."
},
{
"id": "gabardina_negra",
"n": "Gabardina corta negra",
"t": "Only & Sons (Springfield)",
"p": 49.99,
"g": "siguiente",
"s": "base",
"img": "img/sf_gabardina_01.jpg",
"url": "https://myspringfield.com/es/es/hombre/abrigos/gabardinas/gabardina-con-cierre-de-botones/0934161.html?dwvar_0934161_color=01",
"c": "Negro",
"nt": "Entretiempo con americana debajo."
},
{
"id": "zara_abrigo_lana",
"n": "Abrigo relaxed fit con lana negro",
"t": "Zara",
"p": 79.95,
"g": "siguiente",
"s": "base",
"url": "https://www.zara.com/es/es/hombre-prendas-exterior-abrigos-l719.html",
"c": "Negro",
"nt": "Alternativa al abrigo de Jack & Jones. El cruzado con cinturón está a 89,95."
},
{
"id": "zara_jersey_cuello_alto",
"n": "Jersey cuello alto básico",
"t": "Zara",
"p": 29.95,
"g": "siguiente",
"s": "oldmoney",
"url": "https://www.zara.com/es/es/hombre-punto-cuello-alto-l2518.html",
"c": "Marino o negro",
"nt": "Debajo de la americana en invierno. Nunca blanco roto."
},
{
"id": "camisa_formal_blanca_jj",
"n": "Camisa formal blanca slim",
"t": "Jack & Jones",
"p": 24.99,
"g": "alternativa",
"s": "oldmoney",
"img": "img/jj_camisa_white.jpg",
"url": "https://www.jackjones.com/es-es/product/12187222_2206/camisas-corte-slim-cuello-de-camisa",
"c": "Blanco",
"nt": "Sustituye a la oxford y ahorra 15 EUR."
},
{
"id": "chino_marino_sf",
"n": "Chino slim fit marino",
"t": "Springfield",
"p": 39.99,
"g": "alternativa",
"s": "oldmoney",
"img": "img/sf_chino_marino.jpg",
"url": "https://myspringfield.com/es/es/hombre/pantalones/chinos/pantalon-chino-slim-fit/1554936.html?dwvar_1554936_color=11",
"c": "Marino",
"nt": "Si el de Jack & Jones no te queda bien."
},
{
"id": "jersey_zip_marino",
"n": "Jersey media cremallera marino",
"t": "Jack & Jones",
"p": 39.99,
"g": "alternativa",
"s": "oldmoney",
"img": "img/jj_jersey_zip_navy.jpg",
"url": "https://www.jackjones.com/es-es/product/12189339_2078/puloveres-cuello-alto",
"c": "Azul oscuro",
"nt": "Más Old Money que el cuello redondo."
},
{
"id": "jersey_negro",
"n": "Jersey básico cuello redondo negro",
"t": "Springfield",
"p": 29.99,
"g": "alternativa",
"s": "base",
"img": "img/sf_jersey_negro.jpg",
"url": "https://myspringfield.com/es/es/hombre/jerseis/jersey-basico-cuello-redondo/0064953.html?dwvar_0064953_color=10",
"c": "Negro",
"nt": "Vale para los dos estilos."
},
{
"id": "polo_marino",
"n": "Polo piqué marino slim",
"t": "Springfield",
"p": 29.99,
"g": "alternativa",
"s": "oldmoney",
"img": "img/sf_polo_pique_10.jpg",
"url": "https://myspringfield.com/es/es/hombre/polos/polo-pique-contrastes-slim-fit/4404002.html?dwvar_4404002_color=10",
"c": "Marino",
"nt": "El Old Money de verano."
},
{
"id": "blazer_negro",
"n": "Blazer slim negro",
"t": "Only & Sons (Springfield)",
"p": 69.99,
"g": "alternativa",
"s": "oldmoney",
"img": "img/sf_blazer_ons_01.jpg",
"url": "https://myspringfield.com/es/es/hombre/americanas/blazer-slim-fit/0934166.html?dwvar_0934166_color=01",
"c": "Negro",
"nt": "Más urbano que la americana marino. Vale con camiseta."
},
{
"id": "jeans_loose_negro",
"n": "Vaquero loose negro lavado",
"t": "Jack & Jones",
"p": 39.99,
"g": "alternativa",
"s": "urbano",
"img": "img/jj_jeans_loose_black.jpg",
"url": "https://www.jackjones.com/es-es/product/12300825_2103/vaqueros-corte-loose",
"c": "Negro lavado",
"nt": "Sustituye al cargo si prefieres denim. 30 % de descuento."
},
{
"id": "jeans_oscuro",
"n": "Jeans lavado oscuro regular",
"t": "Springfield",
"p": 39.99,
"g": "alternativa",
"s": "base",
"img": "img/sf_jeans_oscuro_11.jpg",
"url": "https://myspringfield.com/es/es/hombre/vaqueros/jeans-lavado-oscuro-regular-fit/1754458.html?dwvar_1754458_color=11",
"c": "Azul oscuro",
"nt": "El vaquero que une los dos estilos."
},
{
"id": "zara_camisa_blanca",
"n": "Camisa regular fit blanca",
"t": "Zara",
"p": 35.95,
"g": "alternativa",
"s": "oldmoney",
"url": "https://www.zara.com/es/es/camisa-regular-fit-p04493144.html",
"c": "Blanco",
"nt": "Mezcla que casi no necesita plancha."
},
{
"id": "zara_polo_rojo",
"n": "Polo de punto suave rojo",
"t": "Zara",
"p": 29.95,
"g": "alternativa",
"s": "oldmoney",
"url": "https://www.zara.com/es/es/hombre-polos-l733.html",
"c": "Rojo",
"nt": "Tu rojo verdadero. Con chino marino."
},
{
"id": "zara_jersey_burdeos",
"n": "Jersey punto manga corta burdeos",
"t": "Zara",
"p": 16.06,
"g": "alternativa",
"s": "oldmoney",
"url": "https://www.zara.com/es/es/jersey-punto-manga-corta-p05536117.html",
"c": "Burdeos",
"nt": "Rebajado de 22,95. Comprueba que es de hombre."
},
{
"id": "zara_camiseta_morada",
"n": "Camiseta rib morada",
"t": "Zara",
"p": 25.95,
"g": "alternativa",
"s": "urbano",
"url": "https://www.zara.com/es/es/hombre-camisetas-l855.html",
"c": "Morado",
"nt": "Color joya para romper el total black."
},
{
"id": "zara_sudadera_granate",
"n": "Sudadera relaxed fit granate",
"t": "Zara",
"p": 29.95,
"g": "alternativa",
"s": "urbano",
"url": "https://www.zara.com/es/es/hombre-sudaderas-l821.html",
"c": "Granate",
"nt": "Precio estimado, confirma en la ficha.",
"e": true
},
{
"id": "temu_jersey_cuello_alto",
"n": "Jersey cuello alto acrílico elástico",
"t": "Temu",
"p": 12,
"g": "alternativa",
"s": "oldmoney",
"url": "https://www.temu.com/es/jersey-de-cuello-alto-de-manga-larga-de-punto-elastico-de-acrilico-para-hombres-ideal-para-otono-e-invierno-g-601099540807450.html",
"c": "Negro, marino o vino",
"nt": "Precio orientativo. Pide una talla más.",
"e": true
},
{
"id": "temu_sudadera_basica",
"n": "Sudadera básica cuello redondo",
"t": "Temu",
"p": 10,
"g": "alternativa",
"s": "urbano",
"url": "https://www.temu.com/es/sudadera-de-moda-solida-de-mezcla-de-algodon-sudadera-basica-informal-con-cuello-redondo-para-hombre-otono-invierno-g-601099525650471.html",
"c": "Negro o carbón",
"nt": "Precio orientativo.",
"e": true
},
{
"id": "temu_camisa_negra",
"n": "Camisa negra manga larga",
"t": "Temu",
"p": 12,
"g": "alternativa",
"s": "urbano",
"url": "https://www.temu.com/es/camisa-de-manga-larga-negra-de-moda-para-hombre-g-601099511733780.html",
"c": "Negro",
"nt": "Precio orientativo.",
"e": true
},
{
"id": "temu_abrigo_lana",
"n": "Abrigo largo de lana con forro polar",
"t": "Temu",
"p": 35,
"g": "alternativa",
"s": "base",
"url": "https://www.temu.com/es/abrigo-largo-de-lana-para-hombre-con-forro-polar-ropa-exterior--y-abotonada-para--e-invierno---casual--para-el--e-invierno-abrigo-de-invierno-moda-versatil-lana--g-601100083752532.html",
"c": "Negro o marino",
"nt": "Precio orientativo. Solo negro o marino.",
"e": true
},
{
"id": "zara_camiseta_tecnica",
"n": "Camiseta técnica entrenamiento Athleticz",
"t": "Zara",
"p": 15.95,
"g": "gym",
"s": "gym",
"url": "https://www.zara.com/es/es/man-athleticz-training-l17015.html",
"c": "Negro, marino o rojo",
"nt": "Secado rápido. Coge 2 o 3."
},
{
"id": "zara_short_7",
"n": "Short de entrenamiento 7\"",
"t": "Zara",
"p": 22.95,
"g": "gym",
"s": "gym",
"url": "https://www.zara.com/es/es/man-athleticz-training-l17015.html",
"c": "Negro"
},
{
"id": "zara_short_2en1",
"n": "Short 2 en 1 running",
"t": "Zara",
"p": 39.95,
"g": "gym",
"s": "gym",
"url": "https://www.zara.com/es/es/zara-athleticz-running-l5146.html",
"c": "Negro",
"nt": "En rebajas el básico sale a 19,56."
},
{
"id": "zara_tecnica_ml",
"n": "Camiseta técnica manga larga",
"t": "Zara",
"p": 19.95,
"g": "gym",
"s": "gym",
"url": "https://www.zara.com/es/es/zara-athleticz-running-l5146.html",
"c": "Negro",
"nt": "Capa base para invierno."
},
{
"id": "temu_pack5_sinmangas",
"n": "Pack 5 camisetas sin mangas malla, negro",
"t": "Temu",
"p": 10,
"g": "gym",
"s": "gym",
"url": "https://www.temu.com/es/conjunto-de-5-camisetas-sin--de-malla-deportiva-para-hombre-camisetas--sin--transpirables-y--de-cuello--de-----poliester-para-entrenamiento-en-el-gimnasio-correr-hacer-ejercicio-negro-----g-601099647354693.html",
"c": "Negro",
"nt": "Precio orientativo.",
"e": true
},
{
"id": "temu_pack5_compresion",
"n": "Pack 5 camisetas compresión manga corta",
"t": "Temu",
"p": 14,
"g": "gym",
"s": "gym",
"url": "https://www.temu.com/us-es/-5-pack-camiseta-de-compresion-para-hombre-de-manga-corta-transpirable-y-rapida--camiseta-deportiva-de-base--elasticidad-adecuada-para-correr-en-interiores-y-exteriores-fitness-y-ciclismo-g-601100050666484.html",
"c": "Negro, marino, azul",
"nt": "Elige el surtido sin caqui. Precio orientativo.",
"e": true
},
{
"id": "temu_short_2en1",
"n": "Short 2 en 1 con bolsillos interiores",
"t": "Temu",
"p": 9,
"g": "gym",
"s": "gym",
"url": "https://www.temu.com/es/pantalones-cortos-para-correr-2-en-1-para-hombre-por-encima-de-las-rodillas-pantalones-cortos-de-doble-capa-con-bolsillos-interiores-ropa-masculina-para-entrenamiento-atletico-gimnasio-g-601099514540314.html",
"c": "Negro",
"nt": "Precio orientativo.",
"e": true
},
{
"id": "temu_joggers",
"n": "Pack 2 joggers con bolsillo de cremallera",
"t": "Temu",
"p": 20,
"g": "gym",
"s": "gym",
"url": "https://www.temu.com/2-pack-mens--workout-jogger-sweatpants-for-men-with-zipper-pocket-and-drawstring-g-601099590614335.html",
"c": "Negro y marino",
"nt": "Precio orientativo.",
"e": true
},
{
"id": "temu_calcetines_arco",
"n": "Pack 4 calcetines deportivos con soporte de arco",
"t": "Temu",
"p": 6,
"g": "gym",
"s": "gym",
"url": "https://www.temu.com/us-es/4-pares-de-calcetines-deportivos-de-algodon-para-hombre-con-soporte-para-el-arco-calcetines-acolchados-transpirables-para-correr-g-601099513346391.html",
"c": "Negro o blanco",
"nt": "Precio orientativo.",
"e": true
},
{
"id": "zara_boxer_negro",
"n": "Bóxer básico pack 3 negro",
"t": "Zara",
"p": 19.95,
"g": "interior",
"s": "interior",
"url": "https://www.zara.com/es/es/boxer-basico-pack-3-p04442410.html",
"c": "Negro",
"nt": "Mezcla de modal. Aparecía rebajado a 3,99."
},
{
"id": "zara_boxer_blanco",
"n": "Bóxer básico pack 3 blanco",
"t": "Zara",
"p": 19.95,
"g": "interior",
"s": "interior",
"url": "https://www.zara.com/es/es/boxer-basico-pack-3-p04442430.html",
"c": "Blanco",
"nt": "Para debajo de ropa clara."
},
{
"id": "temu_boxers_largos",
"n": "Pack 4 bóxers algodón largos deportivos",
"t": "Temu",
"p": 10,
"g": "interior",
"s": "interior",
"url": "https://www.temu.com/es/conjunto-de-ropa-interior-para-hombres-de-estilo-largo-y-comodo-de-algodon-4-piezas-calzoncillos-tipo-boxer-deportivos-transpirables-y-comodos-que-no-aprietan-las-piernas-g-601099547222654.html",
"c": "Negro",
"nt": "No rozan al entrenar. Precio orientativo.",
"e": true
},
{
"id": "temu_boxers_elasticos",
"n": "Pack 4 bóxers algodón elásticos",
"t": "Temu",
"p": 9,
"g": "interior",
"s": "interior",
"url": "https://www.temu.com/es/calzoncillos-boxer-elasticos-comodos-y--de-algodon-para-hombre-de-4-piezas-ropa-interior-para-adolescentes-g-601099512162068.html",
"c": "Negro o marino",
"nt": "Precio orientativo.",
"e": true
},
{
"id": "temu_tobilleros",
"n": "Pack 5 calcetines tobilleros invisibles",
"t": "Temu",
"p": 5,
"g": "interior",
"s": "interior",
"url": "https://www.temu.com/us-es/conjunto-de-5-pares-de-calcetines-de-tobillo-de-algodon-para-hombre-calcetines-bajos-casuales-para-deportes-transpirables-absorbentes-del-sudor-invisibles-y-antibacterianos-diseno-3a-para-actividades-al-aire-libre-g-601099551528621.html",
"c": "Negro",
"nt": "Para el mocasín. Precio orientativo.",
"e": true
},
{
"id": "primark_camisetas",
"n": "2 camisetas básicas algodón (blanca y negra)",
"t": "Primark",
"p": 16,
"g": "interior",
"s": "base",
"c": "Blanco y negro",
"nt": "Capa interior y para el look urbano. Precio orientativo.",
"e": true
},
{
"id": "nike_af1",
"n": "Nike Air Force 1 '07 negras",
"t": "Nike",
"p": 119.99,
"g": "mejora",
"s": "urbano",
"url": "https://www.nike.com/es/w?q=air%20force%201%20negro",
"c": "Negro",
"nt": "La versión original de las Court Vision."
},
{
"id": "pdh_americana",
"n": "Americana marino de lana",
"t": "Pedro del Hierro",
"p": 229,
"g": "mejora",
"s": "oldmoney",
"url": "https://pedrodelhierro.com/es/es/hombre/americanas",
"c": "Marino",
"nt": "Lana de verdad, dura años. Cortefiel desde 159."
},
{
"id": "cortefiel_mocasin",
"n": "Mocasín de piel",
"t": "Cortefiel",
"p": 139,
"g": "mejora",
"s": "oldmoney",
"url": "https://pedrodelhierro.com/es/es/hombre/calzado/zapatos/mocasines",
"c": "Negro",
"nt": "Silbon tiene uno a 99,90."
},
{
"id": "uniqlo_merino",
"n": "Jersey de lana merino",
"t": "Uniqlo",
"p": 40,
"g": "mejora",
"s": "oldmoney",
"url": "https://www.uniqlo.com/es/es/men",
"c": "Marino o negro",
"nt": "Gran Vía 37. Precio orientativo.",
"e": true
},
{
"id": "rl_outlet_polo",
"n": "Polo Ralph Lauren (outlet Las Rozas Village)",
"t": "Polo Ralph Lauren",
"p": 60,
"g": "mejora",
"s": "oldmoney",
"c": "Marino",
"nt": "Logo pequeño, mitad de precio en outlet. Precio orientativo.",
"e": true
}
];


const ARM_GRUPOS = { principal: 'Plan principal (450 €)', siguiente: 'Siguientes compras', gym: 'Gimnasio', interior: 'Ropa interior', alternativa: 'Alternativas', mejora: 'Mejoras de nivel' };
const ARM_ORDEN = ['principal', 'siguiente', 'gym', 'interior', 'alternativa', 'mejora'];
const ARM_ESTILOS = { oldmoney: 'Old Money', urbano: 'Urbano', gym: 'Gym', interior: 'Interior', base: 'Base' };
const ARM_TIENDAS = ['Springfield', 'Jack & Jones', 'Nike', 'Zara', 'Temu', 'Primark', 'H&M', 'Uniqlo', 'Massimo Dutti', 'Mango', 'Otra'];

(function () {
  const estilo = document.createElement('style');
  estilo.textContent = `
    .arm-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
    .arm-card { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
    .arm-card.done { opacity: .5; }
    .arm-card .pic { aspect-ratio: 3 / 4; background: rgba(0,0,0,.3); display: grid; place-items: center; overflow: hidden; }
    .arm-card .pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .arm-card .pic .nopic { text-align: center; color: var(--txt-3); font-size: 12px; padding: 12px; line-height: 1.5; }
    .arm-card .pic .nopic b { display: block; font-size: 15px; color: var(--txt-2); }
    .arm-card .cb { padding: 10px 12px 6px; display: flex; flex-direction: column; gap: 3px; flex: 1; }
    .arm-card .nm { font-size: 13px; font-weight: 600; line-height: 1.3; }
    .arm-card .mt { font-size: 11px; color: var(--txt-3); }
    .arm-card .pr { font-size: 17px; font-weight: 300; margin-top: 2px; }
    .arm-card .pr small { font-size: 10px; color: var(--txt-3); }
    .arm-card .nt { font-size: 11px; color: var(--txt-2); line-height: 1.45; }
    .arm-card .ft { display: flex; gap: 6px; padding: 8px 12px 12px; flex-wrap: wrap; align-items: center; }
    .arm-card .ft a { color: var(--txt-3); font-size: 11.5px; text-decoration: none; padding: 5px 9px; border-radius: 9px; border: 1px solid var(--line); }
    .arm-card .ft a:hover { color: var(--txt); }
    .arm-sw { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; }
    .arm-sw div { border-radius: 10px; overflow: hidden; border: 1px solid var(--line); background: rgba(0,0,0,.25); }
    .arm-sw i { display: block; height: 46px; }
    .arm-sw span { display: block; padding: 6px 8px; font-size: 11px; color: var(--txt-2); line-height: 1.35; }
    .arm-sw span b { display: block; color: var(--txt); font-size: 11.5px; }
    .arm-combo { border-radius: 12px; overflow: hidden; border: 1px solid var(--line); background: var(--panel); }
    .arm-combo .b { display: flex; height: 30px; } .arm-combo .b i { display: block; } .arm-combo .b i:first-child { flex: 3 } .arm-combo .b i:nth-child(2) { flex: 1.5 } .arm-combo .b i:last-child { flex: 1 }
    .arm-combo p { margin: 0; padding: 8px 10px; font-size: 12px; color: var(--txt-2); } .arm-combo p b { display: block; color: var(--txt); }
    .arm-thumb { width: 44px; height: 56px; border-radius: 8px; object-fit: cover; background: rgba(0,0,0,.3); flex: 0 0 auto; }
    .arm-thumb.v { display: grid; place-items: center; font-size: 9px; color: var(--txt-3); text-align: center; }
    .arm-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    .arm-table th { text-align: left; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--txt-3); padding: 6px 8px; border-bottom: 1px solid var(--line-hi); }
    .arm-table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,.055); vertical-align: top; color: var(--txt-2); }
    .arm-table td:first-child { color: var(--txt); font-weight: 550; white-space: nowrap; }
    .arm-rules { padding-left: 18px; font-size: 13px; line-height: 1.6; color: var(--txt-2); display: grid; gap: 4px; }
    .arm-filtros { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }
    .arm-filtros select { padding: 8px 11px; border-radius: 11px; border: 1px solid var(--line); background: rgba(0,0,0,.25); font-size: 12.5px; }
    .arm-filtros select option { background: var(--bg-2); }
    form[data-act="arm-add"] select { padding: 9px 11px; border-radius: 11px; border: 1px solid var(--line); background: rgba(0,0,0,.25); font-size: 12.5px; max-width: 180px; }
    form[data-act="arm-add"] select option { background: var(--bg-2); }
  `;
  document.head.appendChild(estilo);
})();

/* ---------- ficha ---------- */
function fichaArmario() { return S.empresas.find((e) => e.esArmario); }

function nuevaPrenda(b) {
  return { id: b.id, n: b.n, t: b.t, p: b.p, g: b.g, s: b.s, img: b.img || '', url: b.url || '', c: b.c || '', nt: b.nt || '', e: !!b.e, estado: 'pendiente', comprada: '', gastoId: '' };
}

/* Crea la tarjeta si no existe y le añade las prendas nuevas sin tocar las que ya marcaste. */
function asegurarArmario() {
  if (!S || !Array.isArray(S.empresas)) return null;
  let a = fichaArmario();
  if (!a) {
    a = nuevaFicha('Armario', 'Old Money · Urbano · Gym', '🧥', 7, 'negocio', 'personal');
    a.esArmario = true;
    a.prendas = [];
    a.presupuestoArmario = 450;
    a.notas = `ARMARIO — colorimetría Invierno Profundo.

Dominante: profundidad. Secundaria: frío. Marino, negro, blanco puro y colores joya. Nada de beige, camel, mostaza ni oliva.
Dos cápsulas con un solo presupuesto de 450 €: Old Money (camisa oxford, chino marino, jersey, americana, mocasín) y Urbano (sudadera, cargo, bomber, Nike negras).
Las fotos y precios son de Springfield, Jack & Jones y Nike a 21/10/2026. Zara y Temu no dejan ver fotos: abre la ficha.`;
    S.empresas.push(a);
  }
  a.prendas ||= [];
  a.presupuestoArmario ??= 450;
  const ids = new Set(a.prendas.map((p) => p.id));
  PRENDAS_BASE.forEach((b) => { if (!ids.has(b.id)) a.prendas.push(nuevaPrenda(b)); });
  return a;
}

/* ---------- cálculos ---------- */
const armSuma = (l) => l.reduce((x, p) => x + num(p.p), 0);
function armCompradas(a) { return a.prendas.filter((p) => p.estado === 'comprada'); }
function armPendientes(a) { return a.prendas.filter((p) => p.estado === 'pendiente'); }
function armOrden(x, y) { return (ARM_ORDEN.indexOf(x.g) - ARM_ORDEN.indexOf(y.g)) || (num(x.p) - num(y.p)); }

/* ---------- piezas ---------- */
function armFoto(p, cls) {
  if (p.img) return `<img class="${cls || ''}" src="${esc(p.img)}" alt="${esc(p.n)}" loading="lazy">`;
  return cls ? `<div class="${cls} v">${esc(p.t)}</div>` : `<div class="nopic"><b>${esc(p.t)}</b>sin foto<br>abre la ficha</div>`;
}

function armBotones(p) {
  if (p.estado === 'comprada') return `<button class="btn sm" data-act="arm-estado" data-p="${p.id}" data-v="pendiente">Deshacer</button>`;
  if (p.estado === 'descartada') return `<button class="btn sm" data-act="arm-estado" data-p="${p.id}" data-v="pendiente">Recuperar</button>`;
  return `<button class="btn sm primary" data-act="arm-estado" data-p="${p.id}" data-v="comprada">Comprada</button>
          <button class="btn ghost sm" data-act="arm-estado" data-p="${p.id}" data-v="descartada" title="Quitar del plan">✕</button>`;
}

function armCard(p) {
  return `
    <div class="arm-card ${p.estado === 'comprada' ? 'done' : ''}">
      <div class="pic">${armFoto(p)}</div>
      <div class="cb">
        <div class="nm">${esc(p.n)}</div>
        <div class="mt">${esc(p.t)}${p.c ? ' · ' + esc(p.c) : ''}</div>
        <div class="pr">${eur(num(p.p))}${p.e ? ' <small>aprox.</small>' : ''}</div>
        ${p.nt ? `<div class="nt">${esc(p.nt)}</div>` : ''}
      </div>
      <div class="ft">
        <span class="pill">${esc(ARM_ESTILOS[p.s] || p.s)}</span>
        ${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Ficha</a>` : ''}
        <span style="flex:1"></span>
        ${armBotones(p)}
      </div>
    </div>`;
}

function armFila(p) {
  return `
    <div class="row ${p.estado === 'comprada' ? 'done' : ''}">
      <button class="chk ${p.estado === 'comprada' ? 'on' : ''}" data-act="arm-estado" data-p="${p.id}" data-v="${p.estado === 'comprada' ? 'pendiente' : 'comprada'}">✓</button>
      ${armFoto(p, 'arm-thumb')}
      <div class="grow">
        <div class="t">${esc(p.n)}</div>
        <div class="s">${esc(p.t)}${p.c ? ' · ' + esc(p.c) : ''}${p.comprada ? ' · comprada el ' + fechaCorta(p.comprada) : ''}${p.nt ? ' · ' + esc(p.nt) : ''}</div>
      </div>
      <span class="pill">${eur(num(p.p))}${p.e ? ' ~' : ''}</span>
      ${p.url ? `<a class="btn ghost sm" href="${esc(p.url)}" target="_blank" rel="noopener" style="text-decoration:none">Ficha</a>` : ''}
      ${p.estado === 'descartada' ? `<button class="btn sm" data-act="arm-estado" data-p="${p.id}" data-v="pendiente">Recuperar</button>`
        : p.estado === 'pendiente' ? `<button class="btn ghost sm" data-act="arm-estado" data-p="${p.id}" data-v="descartada" title="Quitar del plan">✕</button>` : ''}
    </div>`;
}

function armStats(a) {
  const pres = num(a.presupuestoArmario) || 450;
  const gastado = armSuma(armCompradas(a));
  const plan = armSuma(armPendientes(a).filter((p) => p.g === 'principal'));
  const queda = pres - gastado;
  return `
    <div class="grid c4" style="margin-bottom:16px">
      <div class="panel stat"><span class="n" style="font-size:26px">${eur(pres)}</span><span class="l">Presupuesto</span>
        <button class="btn ghost sm" style="align-self:flex-start;margin-top:6px" data-act="arm-presupuesto">cambiar</button></div>
      <div class="panel stat"><span class="n" style="font-size:26px">${eur(gastado)}</span><span class="l">Gastado</span><span style="font-size:11px;color:var(--txt-3);margin-top:4px">${armCompradas(a).length} prendas compradas</span></div>
      <div class="panel stat"><span class="n" style="font-size:26px;color:${queda < 0 ? 'var(--bad)' : 'inherit'}">${eur(queda)}</span><span class="l">${queda < 0 ? 'Te has pasado' : 'Queda'}</span></div>
      <div class="panel stat"><span class="n" style="font-size:26px">${eur(plan)}</span><span class="l">Plan pendiente</span><span style="font-size:11px;color:var(--txt-3);margin-top:4px">${armPendientes(a).filter((p) => p.g === 'principal').length} del plan principal</span></div>
    </div>
    <div class="panel" style="margin-bottom:16px">
      <h3>Presupuesto del armario <span class="right">${eur(gastado)} de ${eur(pres)}</span></h3>
      <div class="bar" style="height:9px"><i style="width:${Math.min(100, gastado / pres * 100)}%;background:${gastado > pres ? 'var(--bad)' : gastado > pres * 0.8 ? 'var(--warn)' : 'var(--ok)'}"></i></div>
    </div>`;
}

/* ---------- vistas ---------- */
function armVistaResumen(a) {
  const sig = armPendientes(a).sort(armOrden).slice(0, 5);
  const porEstilo = ['oldmoney', 'urbano', 'gym', 'interior'].map((s) => {
    const todas = a.prendas.filter((p) => p.s === s && p.estado !== 'descartada');
    const c = todas.filter((p) => p.estado === 'comprada');
    return `<div class="panel stat"><span class="n">${c.length}/${todas.length}</span><span class="l">${ARM_ESTILOS[s]}</span><span style="font-size:11px;color:var(--txt-3);margin-top:4px">${eur(armSuma(c))} de ${eur(armSuma(todas))}</span></div>`;
  }).join('');
  return `
    ${tituloFicha(a, `<button class="btn" data-act="tab" data-tab="compras">Ver todas las compras</button>`)}
    ${armStats(a)}
    <div class="grid c2" style="margin-bottom:16px">
      <div class="panel">
        <h3>Lo siguiente que toca comprar <span class="right">por prioridad</span></h3>
        ${sig.length ? sig.map(armFila).join('') : '<div class="empty">Nada pendiente. Añade prendas en Compras.</div>'}
      </div>
      <div class="panel">
        <h3>Tu paleta en una línea</h3>
        <div class="row"><div class="grow"><div class="t">Invierno Profundo</div><div class="s">Marino, negro, blanco puro y colores joya. Plata, nunca oro. Nada de beige, camel, mostaza ni oliva.</div></div></div>
        <div class="row"><div class="grow"><div class="t">Old Money</div><div class="s">Camisa oxford blanca + chino marino + americana marino + mocasín negro.</div></div><button class="btn sm" data-act="tab" data-tab="oldmoney">Ver</button></div>
        <div class="row"><div class="grow"><div class="t">Urbano</div><div class="s">Sudadera negra + cargo negro + bomber negra + Nike negras. Total black con un detalle blanco.</div></div><button class="btn sm" data-act="tab" data-tab="urbano">Ver</button></div>
        <div class="row"><div class="grow"><div class="t">Prueba del espejo</div><div class="s">Prenda junto a la cara: si la piel se ve uniforme y las ojeras se marcan menos, es tuya.</div></div></div>
      </div>
    </div>
    <div class="grid c4">${porEstilo}</div>`;
}

let _armFiltroTienda = '', _armFiltroEstilo = '';

function armVistaCompras(a) {
  let lista = a.prendas.filter((p) => p.estado !== 'comprada');
  if (_armFiltroTienda) lista = lista.filter((p) => p.t === _armFiltroTienda);
  if (_armFiltroEstilo) lista = lista.filter((p) => p.s === _armFiltroEstilo);
  const grupos = ARM_ORDEN.map((g) => ({ g, l: lista.filter((p) => p.g === g && p.estado === 'pendiente').sort(armOrden) })).filter((x) => x.l.length);
  const desc = lista.filter((p) => p.estado === 'descartada');
  const compradas = armCompradas(a).sort((x, y) => String(y.comprada).localeCompare(String(x.comprada)));
  const tiendas = [...new Set(a.prendas.map((p) => p.t))].sort();
  return `
    ${cabecera('Próximas compras', `<button class="btn" data-act="arm-presupuesto"><span>💶</span>&nbsp;Presupuesto</button>`)}
    ${armStats(a)}
    <div class="panel" style="margin-bottom:16px">
      <h3>Añadir prenda</h3>
      <form class="quickadd" data-act="arm-add" data-e="${a.id}" style="margin:0">
        <select name="tienda">${ARM_TIENDAS.map((t) => `<option>${t}</option>`).join('')}</select>
        <select name="grupo">${ARM_ORDEN.map((g) => `<option value="${g}">${ARM_GRUPOS[g]}</option>`).join('')}</select>
        <select name="estilo">${Object.entries(ARM_ESTILOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
        <input placeholder="Prenda e importe (ej: Jersey burdeos 29,95)" autocomplete="off">
        <button class="btn sm primary" type="submit">Añadir</button>
      </form>
    </div>
    <div class="arm-filtros">
      <select data-act="arm-filtro" data-k="tienda"><option value="">Todas las tiendas</option>${tiendas.map((t) => `<option ${t === _armFiltroTienda ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <select data-act="arm-filtro" data-k="estilo"><option value="">Todos los estilos</option>${Object.entries(ARM_ESTILOS).map(([k, v]) => `<option value="${k}" ${k === _armFiltroEstilo ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <span style="font-size:11px;color:var(--txt-3)">Marca la casilla al comprar: el importe pasa a Gastos de la tarjeta Personal.</span>
    </div>
    ${grupos.map((x) => `
      <div class="panel" style="margin-bottom:14px">
        <h3>${ARM_GRUPOS[x.g]} <span class="right">${x.l.length} prendas · ${eur(armSuma(x.l))}</span></h3>
        ${x.l.map(armFila).join('')}
      </div>`).join('')}
    ${!grupos.length ? '<div class="panel"><div class="empty">No hay prendas pendientes con ese filtro.</div></div>' : ''}
    ${compradas.length ? `<div class="panel" style="margin-bottom:14px"><h3>Compradas <span class="right">${compradas.length} · ${eur(armSuma(compradas))}</span></h3>${compradas.map(armFila).join('')}</div>` : ''}
    ${desc.length ? `<div class="panel"><h3>Descartadas <span class="right">${desc.length}</span></h3>${desc.map(armFila).join('')}</div>` : ''}`;
}

function armVistaEstilo(a, estilo, titulo, intro, reglas) {
  const todas = a.prendas.filter((p) => (p.s === estilo || ((estilo === 'oldmoney' || estilo === 'urbano') && p.s === 'base')) && p.estado !== 'descartada').sort(armOrden);
  const grupos = ARM_ORDEN.map((g) => ({ g, l: todas.filter((p) => p.g === g) })).filter((x) => x.l.length);
  return `
    ${cabecera(titulo)}
    <div class="grid c2" style="margin-bottom:16px">
      <div class="panel"><h3>Cómo se lleva</h3><div style="font-size:13px;color:var(--txt-2);line-height:1.6">${intro}</div></div>
      <div class="panel"><h3>Reglas</h3><ul class="arm-rules">${reglas.map((r) => `<li>${r}</li>`).join('')}</ul></div>
    </div>
    ${grupos.map((x) => `
      <div style="margin-bottom:18px">
        <h3 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--txt-3);margin:0 0 10px;display:flex;gap:8px"><span>${ARM_GRUPOS[x.g]}</span><span style="margin-left:auto;font-weight:500;letter-spacing:0;text-transform:none">${x.l.length} prendas · ${eur(armSuma(x.l))}</span></h3>
        <div class="arm-cards">${x.l.map(armCard).join('')}</div>
      </div>`).join('')}`;
}

function armVistaOldMoney(a) {
  return armVistaEstilo(a, 'oldmoney', 'Old Money',
    'Corte limpio, tejidos naturales y colores apagados. En ti funciona en marino, negro y blanco, no en beige ni camel. Las prendas "Base" valen para los dos estilos. Núcleo del plan: camisa oxford blanca, chino marino, jersey marino, americana marino, mocasín negro y cinturón reversible, 222,94 €.',
    ['Nada de logos visibles. Si hay uno, pequeño y del color de la prenda.', 'Camisa por dentro con americana; por fuera solo con jersey encima.', 'Chino con un pequeño roto en el bajo y mocasín sin calcetín visible o calcetín marino.', 'Reloj con correa negra o metal plateado. Nada dorado.', 'Planchado: el Old Money es 50 % prenda y 50 % que esté impecable.']);
}
function armVistaUrbano(a) {
  return armVistaEstilo(a, 'urbano', 'Urbano',
    'Arriba holgado, abajo recto o ancho, calzado negro y limpio. Total black con un detalle blanco (la camiseta o la suela) es tu combinación más potente. Núcleo del plan: sudadera negra, cargo negro, bomber negra, camiseta negra y Nike Court Vision negras, 200,95 €.',
    ['Una talla más arriba, nunca todo ajustado.', 'Un solo color joya por outfit si metes color: burdeos o cobalto con el resto negro.', 'Zapatillas siempre limpias. Unas Court Vision limpias ganan a unas Air Force sucias.', 'Gorra o gorro negro, nunca beige ni gris claro.', 'Cargo negro + bomber negra + Nike negras es un uniforme: repítelo cambiando la camiseta.']);
}
function armVistaGym(a) {
  return armVistaEstilo(a, 'gym', 'Gimnasio',
    'Negro, marino y blanco como base y un acento en rojo o cobalto en la camiseta. Evita gris claro jaspeado, caqui, verde militar y arena: son los colores por defecto de la ropa deportiva barata y te apagan. Tiendas: Sprinter, Zara Athleticz, H&M Move, Décimas, Temu.',
    ['Camisetas de entreno: poliéster 100 % o con elastano.', 'Zapatillas de gym en negro o negro con blanco.', 'En Temu pide una talla más y descarta los packs con caqui o vino claro.', 'Calcetines blancos solo para deporte; negros para calle.']);
}
function armVistaInterior(a) {
  return armVistaEstilo(a, 'interior', 'Ropa interior y básicos',
    'Bóxers negros o marinos; blancos solo bajo ropa clara. Camisetas interiores blanco puro o negro. Los packs de Zara, Primark y Temu cubren todo por menos de 60 €.',
    ['Bóxers de diario: 95 % algodón, 5 % elastano. Evita 100 % poliéster.', 'Tobilleros invisibles negros para el mocasín.', 'Primark para cantidad, Zara para calidad (modal), Temu para packs de gym.']);
}

function armVistaZaraTemu(a) {
  const z = a.prendas.filter((p) => p.t === 'Zara' && p.estado !== 'descartada').sort(armOrden);
  const t = a.prendas.filter((p) => p.t === 'Temu' && p.estado !== 'descartada').sort(armOrden);
  const terminos = [['jersey cuello alto hombre liso vino', 'vino, negro o marino'], ['jersey hombre verde esmeralda', 'esmeralda'], ['polo hombre azul real manga larga', 'azul real'], ['camiseta hombre fucsia algodón', 'fucsia'], ['camisa hombre blanca popelín manga larga', 'blanco'], ['abrigo lana hombre negro largo', 'negro'], ['pack bóxer hombre algodón negro', 'negro'], ['camiseta gym hombre secado rápido negro', 'negro'], ['short 2 en 1 hombre running negro', 'negro'], ['jogger hombre entrenamiento negro cremallera', 'negro'], ['calcetines deportivos hombre tobilleros negro', 'negro']];
  return `
    ${cabecera('Zara y Temu')}
    <div class="panel" style="margin-bottom:16px">
      <div style="font-size:13px;color:var(--txt-2);line-height:1.6">Zara para lo que se ve: jersey cuello alto, camisa, abrigo y la línea Athleticz para el gym. Temu para packs de gym y ropa interior. Ninguna deja ver sus fotos desde fuera, por eso estas fichas no llevan imagen: abre el enlace. Los precios de Temu son orientativos.</div>
    </div>
    <h3 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--txt-3);margin:0 0 10px">Zara · ${z.length} prendas · ${eur(armSuma(z))}</h3>
    <div class="arm-cards" style="margin-bottom:18px">${z.map(armCard).join('')}</div>
    <h3 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--txt-3);margin:0 0 10px">Temu · ${t.length} prendas · ${eur(armSuma(t))} aprox.</h3>
    <div class="arm-cards" style="margin-bottom:18px">${t.map(armCard).join('')}</div>
    <div class="grid c2">
      <div class="panel">
        <h3>Buscar en la app de Temu</h3>
        <table class="arm-table"><tr><th>Escribe esto</th><th>Pide el color</th></tr>
        ${terminos.map((r) => `<tr><td style="white-space:normal">${r[0]} <button class="btn ghost sm" data-act="copiar-ruta" data-r="${r[0]}" title="Copiar">⧉</button></td><td>${r[1]}</td></tr>`).join('')}</table>
      </div>
      <div class="panel">
        <h3>Regla de compra online</h3>
        <ul class="arm-rules">
          <li>Si la foto tiene fondo beige o luz cálida, el color real es más apagado. Fíate del nombre del color de la ficha.</li>
          <li>Busca: negro, marino, vino, burdeos, esmeralda, verde botella, azul real, cobalto, fucsia, frambuesa, blanco.</li>
          <li>Descarta: crema, beige, camel, caqui, oliva, mostaza, teja, marrón, rosa palo.</li>
          <li>Temu: una talla más de la habitual. Bóxers 95 % algodón 5 % elastano; camisetas de entreno poliéster 100 %.</li>
          <li>Zara: el cuello alto en marino o negro, nunca blanco roto ni gris vigoré.</li>
        </ul>
      </div>
    </div>`;
}

function armVistaTiendas() {
  const filas = [['Springfield', 'Camisa oxford, jersey, americana, mocasín, cinturón, polo', 'Bajo-medio', 'Gran Vía, Preciados, Islazul, Príncipe Pío'], ['Jack & Jones', 'Chino, sudadera, cargo, bomber, camisetas, abrigo', 'Bajo-medio', 'Gran Vía, Islazul, Príncipe Pío, Plenilunio'], ['Nike', 'Court Vision, Air Force 1', 'Medio', 'Nike Gran Vía, JD, Foot Locker, Sprinter'], ['Primark', 'Camisetas básicas, calcetines, gorro, bóxers', 'Muy bajo', 'Gran Vía 32, Islazul, Plenilunio, Xanadú'], ['Zara', 'Jersey cuello alto, camisa, abrigo, Athleticz', 'Medio', 'Toda la ciudad; la grande en Castellana 79'], ['Massimo Dutti', 'Americana, jersey de lana, camisa, mocasín. El Old Money de Inditex', 'Medio-alto', 'Gran Vía, Serrano, Castellana'], ['Mango Man', 'Americana, abrigo de lana, chino', 'Medio', 'Gran Vía, Serrano, Preciados'], ['H&M', 'Chino, jersey, sudadera, bóxers, H&M Move', 'Bajo', 'Gran Vía, Preciados, Islazul'], ['Uniqlo', 'Camisa oxford, jersey merino, camiseta algodón pesado', 'Bajo-medio', 'Gran Vía 37'], ['COS', 'Básicos minimalistas de calidad', 'Medio-alto', 'Serrano, Fuencarral'], ['Pull & Bear / Bershka / Lefties', 'Cargo, sudadera oversize, bomber, vaquero ancho', 'Bajo', 'Gran Vía, Fuencarral, Islazul'], ['Sprinter / JD / Snipes / Foot Locker', 'Zapatillas negras, gorra, calcetines, ropa de gym', 'Bajo-medio', 'Gran Vía, Preciados, Islazul'], ['Cortefiel / Pedro del Hierro', 'Americana y mocasín de piel para subir de nivel', 'Alto', 'Preciados, Serrano, El Corte Inglés'], ['Scalpers / Silbon / Álvaro Moreno', 'Polo, camisa, americana con aire preppy', 'Medio-alto', 'Salamanca, Chamberí, Islazul'], ['El Corte Inglés', 'Todo bajo un techo', 'Medio-alto', 'Preciados, Castellana, Goya'], ['Las Rozas Village (outlet)', 'Polo Ralph Lauren, Hackett, Tommy, Massimo Dutti outlet. Old Money a mitad de precio', 'Con descuento', 'Bus 625 o 628 desde Moncloa'], ['Humana / Flamingos Vintage Kilo', 'Americanas de lana y camisas oxford de segunda mano, 10 a 25 €', 'Muy bajo', 'Varias calles; Flamingos en Malasaña'], ['Vinted / Wallapop', 'Ralph Lauren, Tommy, Lacoste de segunda mano', 'Muy bajo', 'App']];
  return `
    ${cabecera('Tiendas en Madrid')}
    <div class="grid c2" style="margin-bottom:16px">
      <div class="panel">
        <h3>Ruta de un día</h3>
        <ul class="arm-rules">
          <li><b>Gran Vía</b>, de Callao a Plaza de España: Primark, Springfield, Jack & Jones, Uniqlo, Nike, Massimo Dutti, Mango, H&M y Zara en menos de 800 metros.</li>
          <li><b>Islazul</b> (Villaverde), de 10:00 a 22:00: Springfield, Jack & Jones, Primark, H&M, Zara, Sprinter, JD, Décimas, Álvaro Moreno, Calzedonia.</li>
          <li><b>Las Rozas Village</b> y <b>Humana</b> para Old Money con marca sin pagar la marca.</li>
        </ul>
      </div>
      <div class="panel">
        <h3>Orden sugerido en Islazul</h3>
        <ul class="arm-rules">
          <li>1 · Sprinter: camisetas técnicas, short, jogger, zapatillas.</li>
          <li>2 · Primark o H&M: bóxers, calcetines, camisetas básicas.</li>
          <li>3 · Zara: jersey cuello alto, camisa blanca, packs de bóxer.</li>
          <li>Opcional: Jack & Jones y Springfield para el plan con foto.</li>
        </ul>
      </div>
    </div>
    <div class="panel"><table class="arm-table"><tr><th>Tienda</th><th>Para qué</th><th>Precio</th><th>Dónde</th></tr>
      ${filas.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
}

function armVistaPaleta() {
  const sw = (l) => `<div class="arm-sw">${l.map(([n, h, t]) => `<div><i style="background:${h}"></i><span><b>${n}</b>${h} · ${t}</span></div>`).join('')}</div>`;
  return `
    ${cabecera('Paleta Invierno Profundo')}
    <div class="grid c2" style="margin-bottom:16px">
      <div class="panel"><h3>Diagnóstico</h3><div style="font-size:13px;color:var(--txt-2);line-height:1.6">Pelo casi negro, ojos marrón oscuro, piel clara-media con base oliva y contraste alto. Dominante: profundidad. Secundaria: frío. Te realzan los colores oscuros, saturados y limpios, sin amarillo ni polvo. Alternativa cercana: Otoño Profundo, si la prueba del dorado frente a la plata con luz natural favorece al dorado.</div></div>
      <div class="panel"><h3>Reglas rápidas</h3><ul class="arm-rules">
        <li>Cerca de la cara, siempre un oscuro profundo o un color joya. Los claros, de cintura para abajo.</li>
        <li>Contraste alto. Evita el monocromo en tonos medios.</li>
        <li>Metales: plata, acero, oro blanco. El dorado te apaga.</li>
        <li>Gafas: montura negra, carey muy oscuro o metal plateado.</li>
        <li>Vaqueros: lavado oscuro o negro. Estampados pocos y de alto contraste.</li></ul></div>
    </div>
    <div class="panel" style="margin-bottom:14px"><h3>Neutros base</h3>${sw([['Negro', '#0B0B0D', 'abrigo, cuello alto'], ['Blanco puro', '#FFFFFF', 'camisa, camiseta'], ['Carbón', '#2B2D31', 'sudaderas'], ['Azul marino', '#0F1F3D', 'trajes, chinos'], ['Gris pizarra', '#4A4E57', 'pantalón'], ['Marrón negro', '#2A1A24', 'calzado']])}</div>
    <div class="panel" style="margin-bottom:14px"><h3>Colores joya · cerca de la cara</h3>${sw([['Rojo verdadero', '#C1121F', 'polo, jersey'], ['Rojo cereza', '#9B0E2E', 'jersey'], ['Burdeos', '#5C0A1E', 'jersey, chaqueta'], ['Ciruela', '#4B1D4E', 'sustituye al marrón'], ['Fucsia', '#B5176A', 'camiseta'], ['Frambuesa', '#A81C4F', 'polo'], ['Esmeralda', '#046241', 'jersey'], ['Verde pino', '#0E3B2E', 'abrigo'], ['Azul cobalto', '#0047AB', 'camisa'], ['Azul real', '#1F3FA3', 'polo'], ['Azul petróleo', '#0B4F5C', 'jersey'], ['Teal profundo', '#0C6E7A', 'camiseta']])}</div>
    <div class="panel" style="margin-bottom:14px"><h3>Hielo · tus únicos claros</h3>${sw([['Azul hielo', '#D6E6F2', 'camisa'], ['Gris hielo', '#E6E9EE', 'camiseta'], ['Lavanda hielo', '#E2DDF0', 'camisa verano'], ['Rosa hielo', '#F2DCE6', 'camiseta'], ['Amarillo hielo', '#F3F0D8', 'con moderación']])}</div>
    <div class="panel"><h3>Lo que te apaga</h3>${sw([['Beige / crema', '#E8DCC4', 'usa blanco puro'], ['Camel', '#C19A6B', 'usa marino'], ['Mostaza', '#D4A017', 'solo amarillo hielo'], ['Naranja', '#E07A2A', 'usa rojo'], ['Verde oliva', '#6B7A3A', 'usa verde pino'], ['Marrón cálido', '#8B5A3C', 'usa marrón negro'], ['Rosa empolvado', '#E9B4C4', 'usa fucsia'], ['Verde salvia', '#B8C4B0', 'usa esmeralda']])}</div>`;
}

function armVistaOutfits() {
  const combos = [['#0B0B0D', '#C1121F', '#FFFFFF', 'Negro, rojo, blanco', 'Abrigo negro, jersey rojo, camiseta blanca.'], ['#0F1F3D', '#046241', '#D6E6F2', 'Marino, esmeralda, azul hielo', 'Chino marino, jersey esmeralda, camisa azul hielo asomando.'], ['#2B2D31', '#B5176A', '#0B0B0D', 'Carbón, fucsia, negro', 'Sudadera carbón, camiseta fucsia, zapatillas negras.'], ['#5C0A1E', '#FFFFFF', '#2A1A24', 'Burdeos, blanco, marrón negro', 'Jersey burdeos, camisa blanca, mocasín.'], ['#0B0B0D', '#0047AB', '#4A4E57', 'Negro, cobalto, pizarra', 'Total look oscuro con un golpe de azul.'], ['#FFFFFF', '#0E3B2E', '#0B0B0D', 'Blanco, verde pino, negro', 'Verano: camiseta blanca, pantalón verde pino, zapatillas negras.']];
  const outs = [['Old Money', 'Camisa oxford blanca + chino marino + americana marino + mocasín negro + cinturón negro', 'Cena, cita, evento'], ['Old Money', 'Jersey marino con el cuello de la camisa blanca asomando + chino marino + mocasín o zapatilla blanca', 'Diario, universidad'], ['Old Money', 'Polo marino + chino marino + zapatilla blanca', 'Verano, terraza'], ['Old Money', 'Camisa azul claro + jersey media cremallera + jeans oscuro + mocasín', 'Fin de semana'], ['Urbano', 'Camiseta negra + cargo negro + bomber negra + Nike negras', 'Salir, concierto'], ['Urbano', 'Sudadera negra + cargo negro + Nike negras', 'Diario, clase'], ['Urbano', 'Camiseta blanca + vaquero loose negro + bomber negra + Nike negras', 'Contraste'], ['Urbano', 'Sudadera negra + jeans oscuro + abrigo negro + Nike negras', 'Invierno'], ['Mixto', 'Camisa oxford blanca abierta sobre camiseta negra + cargo negro + Nike negras', 'Smart casual urbano'], ['Mixto', 'Americana marino + camiseta negra + jeans oscuro + Nike negras', 'Cena informal con nivel'], ['Mixto', 'Jersey negro + chino marino + mocasín negro + abrigo negro', 'Old Money oscuro']];
  return `
    ${cabecera('Outfits')}
    <div class="grid c3" style="margin-bottom:16px">${combos.map((c) => `<div class="arm-combo"><div class="b"><i style="background:${c[0]}"></i><i style="background:${c[1]}"></i><i style="background:${c[2]}"></i></div><p><b>${c[3]}</b>${c[4]}</p></div>`).join('')}</div>
    <div class="panel"><table class="arm-table"><tr><th>Estilo</th><th>Outfit</th><th>Cuándo</th></tr>${outs.map((o) => `<tr><td>${o[0]}</td><td>${o[1]}</td><td>${o[2]}</td></tr>`).join('')}</table></div>`;
}

/* ---------- acciones ---------- */
function armCambiarEstado(a, id, v) {
  const p = a.prendas.find((x) => x.id === id);
  if (!p || p.estado === v) return;
  const PER = fichaPersonal();
  if (v === 'comprada') {
    p.estado = 'comprada'; p.comprada = hoy();
    if (PER && PER !== a) {
      const g = { id: uid(), f: hoy(), cat: 'Compras', txt: p.n, eur: num(p.p) };
      PER.gastos.push(g); p.gastoId = g.id;
      toast(`Comprada: ${p.n} · ${eur(num(p.p))} apuntado en Gastos`);
    } else toast(`Comprada: ${p.n}`);
  } else {
    if (p.estado === 'comprada' && PER && p.gastoId) PER.gastos = PER.gastos.filter((g) => g.id !== p.gastoId);
    p.gastoId = ''; p.comprada = '';
    p.estado = v;
    toast(v === 'descartada' ? 'Fuera del plan' : 'Vuelve a pendiente');
  }
  guardar(); render();
}

function armModalPresupuesto(a) {
  modal('Presupuesto del armario', `
    <div class="field"><label>Cuánto quieres gastar en ropa (€)</label>
      <input name="presupuestoArmario" type="number" step="any" value="${esc(a.presupuestoArmario)}" placeholder="450">
      <span class="hint">El plan principal suma 423,89 €. El resto son siguientes compras y mejoras.</span>
    </div>`, (v) => { a.presupuestoArmario = num(v.presupuestoArmario) || 450; });
}

function armSubmit(f) {
  const a = fichaArmario();
  if (!a) return;
  const input = $('input', f);
  const { texto, valor } = separaNumeroFinal(input.value.trim());
  if (!texto) { toast('Escribe la prenda. Ej: Jersey burdeos 29,95'); return; }
  const sel = (n) => { const s = f.querySelector(`select[name="${n}"]`); return s ? s.value : ''; };
  a.prendas.push({ id: 'manual_' + uid(), n: texto.charAt(0).toUpperCase() + texto.slice(1), t: sel('tienda') || 'Otra', p: valor, g: sel('grupo') || 'siguiente', s: sel('estilo') || 'base', img: '', url: '', c: '', nt: 'Añadida a mano', e: false, estado: 'pendiente', comprada: '', gastoId: '' });
  input.value = '';
  guardar(); render();
  toast(`Añadida: ${texto}`);
}

/* ---------- enganches al núcleo ---------- */
(function () {
  const _tabsDe = tabsDe;
  tabsDe = function (e) {
    if (!e || !e.esArmario) return _tabsDe(e);
    const pend = armPendientes(e).filter((p) => p.g === 'principal').length;
    return [
      ['resumen', '◎', 'Resumen', ''],
      ['compras', '🛍️', 'Compras', pend || ''],
      ['oldmoney', '🎩', 'Old Money', ''],
      ['urbano', '🧢', 'Urbano', ''],
      ['gym', '🏋️', 'Gym', ''],
      ['interior', '🧦', 'Interior', ''],
      ['zaratemu', '🏷️', 'Zara y Temu', ''],
      ['tiendas', '📍', 'Madrid', ''],
      ['paleta', '🎨', 'Paleta', ''],
      ['outfits', '👔', 'Outfits', ''],
      ['notas', '📝', 'Notas', ''],
    ];
  };

  const _renderContent = renderContent;
  renderContent = function () {
    const e = empresaActual();
    if (!e || !e.esArmario) return _renderContent();
    const c = $('#content');
    if (!c) return;
    const vistas = {
      resumen: armVistaResumen, compras: armVistaCompras, oldmoney: armVistaOldMoney, urbano: armVistaUrbano,
      gym: armVistaGym, interior: armVistaInterior, zaratemu: armVistaZaraTemu, tiendas: armVistaTiendas,
      paleta: armVistaPaleta, outfits: armVistaOutfits, notas: vistaNotas,
    };
    if (!vistas[tab]) tab = 'resumen';
    c.innerHTML = vistas[tab](e);
  };

  const _renderRail = renderRail;
  renderRail = function () {
    _renderRail();
    const a = fichaArmario();
    if (!a) return;
    const card = document.querySelector(`#rail .card[data-e="${a.id}"] .meta`);
    if (card) {
      const c = armCompradas(a).length, t = a.prendas.filter((p) => p.estado !== 'descartada').length;
      card.textContent = `${c}/${t} compradas · ${eur(armSuma(armPendientes(a).filter((p) => p.g === 'principal')))} pendientes`;
    }
  };

  const _render = render;
  render = function () { asegurarArmario(); _render(); };

  const _manejarClick = manejarClick;
  manejarClick = function (ev) {
    const el = ev.target.closest('[data-act^="arm-"]');
    if (!el) return _manejarClick(ev);
    const a = fichaArmario();
    if (!a) return;
    switch (el.dataset.act) {
      case 'arm-estado': armCambiarEstado(a, el.dataset.p, el.dataset.v); break;
      case 'arm-presupuesto': armModalPresupuesto(a); break;
    }
  };

  document.addEventListener('change', (ev) => {
    const el = ev.target.closest('select[data-act="arm-filtro"]');
    if (!el) return;
    if (el.dataset.k === 'tienda') _armFiltroTienda = el.value; else _armFiltroEstilo = el.value;
    renderContent();
  });

  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('form[data-act="arm-add"]');
    if (!f) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    armSubmit(f);
  }, true);

  if (typeof S !== 'undefined' && S) { asegurarArmario(); }
})();
