const { chromium } = require('playwright');
const D = '/home/user/LAMASIA/brand/lanzamiento';
(async () => {
  const b = await chromium.launch();
  // 1) previews + PDFs de impresos
  const p = await b.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 2 });
  await p.goto('file://' + D + '/impresos.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  for (const [id, f] of [['flyer-a', 'prev-flyer-a'], ['flyer-b', 'prev-flyer-b'], ['carta-1', 'prev-carta'], ['etiqueta', 'prev-etiqueta']]) await p.locator('#' + id).screenshot({ path: `${D}/${f}.png` });
  await p.locator('#tarjetas .tarj.b').first().screenshot({ path: `${D}/prev-tarjeta.png` });
  await p.locator('#pegatinas .peg').first().screenshot({ path: `${D}/prev-pegatina.png` });
  const pdf = async (ids, out, w, h) => {
    await p.evaluate((ids) => { document.querySelectorAll('.sheet').forEach((el) => { el.style.display = ids.includes(el.id) ? '' : 'none'; el.style.pageBreakAfter = 'always'; }); document.body.style.background = '#fff'; }, ids);
    await p.pdf({ path: `${D}/${out}`, width: w, height: h, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  };
  await pdf(['flyer-a', 'flyer-b'], 'flyer-buzoneo-A5.pdf', '154mm', '216mm');
  await pdf(['carta-1', 'carta-2', 'carta-3'], 'carta-presentacion.pdf', '210mm', '297mm');
  await pdf(['tarjetas'], 'tarjeta-mensaje.pdf', '210mm', '297mm');
  await pdf(['pegatinas'], 'pegatina-50mm.pdf', '210mm', '297mm');
  await p.close();
  // 2) dossier
  const q = await b.newPage(); const errs = []; q.on('pageerror', (e) => errs.push(e.message));
  await q.goto('file://' + D + '/dossier.html', { waitUntil: 'networkidle' }); await q.waitForTimeout(1500);
  await q.pdf({ path: `${D}/material-y-lanzamiento-malaga.pdf`, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close(); console.log('render ok', errs.join(';'));
})();
