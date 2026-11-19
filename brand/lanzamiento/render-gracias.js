const { chromium } = require('playwright');
const D = '/home/user/LAMASIA/brand/lanzamiento';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1700 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + D + '/gracias.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  // comprobar que nada se sale del módulo A5
  const over = await p.evaluate(() => [...document.querySelectorAll('.mod')].map(m => { const r = m.getBoundingClientRect(); const bd = m.querySelector('.firma').getBoundingClientRect(); const ft = m.querySelector('.ft').getBoundingClientRect(); return Math.round(ft.bottom - r.bottom) + '/' + Math.round(ft.top - bd.bottom); }));
  console.log('pie vs borde / hueco firma-pie (px):', over.join('  '));
  await p.locator('#a4-color').screenshot({ path: D + '/prev-gracias.png' });
  const one = async (ids, out, w, h) => { await p.evaluate((ids) => { document.querySelectorAll('.sheet').forEach(el => { el.style.display = ids.includes(el.id) ? '' : 'none'; el.style.pageBreakAfter = 'always'; }); document.body.style.background = '#fff'; }, ids); await p.pdf({ path: out, width: w, height: h, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } }); };
  const S = '/tmp/claude-0/-home-user-LAMASIA/20c7de75-cac9-5ac4-b8b6-ef5a8a66b721/scratchpad';
  await one(['a4-color'], S + '/g1.pdf', '210mm', '297mm');
  await one(['a5-x2'], S + '/g2.pdf', '297mm', '210mm');
  await one(['a4-ink'], S + '/g3.pdf', '210mm', '297mm');
  await one(['a5-x2-ink'], S + '/g4.pdf', '297mm', '210mm');
  await b.close(); console.log('ok', errs.join(';'));
})();
