const { chromium } = require('playwright');
const D = '/home/user/LAMASIA/brand/lanzamiento', S='/tmp/claude-0/-home-user-LAMASIA/20c7de75-cac9-5ac4-b8b6-ef5a8a66b721/scratchpad';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1300 }, deviceScaleFactor: 3 });
  const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + D + '/tarjeta-buzon.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  // comprobar que el texto no se sale de la zona segura (4 mm dentro del corte = 7 mm desde el borde de la tarjeta con sangrado)
  const chk = await p.evaluate(() => { const out=[]; document.querySelectorAll('#single-front .card, #single-back .card').forEach(c=>{ const r=c.getBoundingClientRect(); const mm=r.width/91; c.querySelectorAll('h1,h2,.sub,.price,.badge,li,.prices,.wa,.qr,.code,.calle').forEach(e=>{ const q=e.getBoundingClientRect(); const L=(q.left-r.left)/mm, R=(r.right-q.right)/mm, T=(q.top-r.top)/mm, Bt=(r.bottom-q.bottom)/mm; if(Math.min(L,R,T,Bt)<6.4) out.push(e.className||e.tagName, [L,R,T,Bt].map(v=>v.toFixed(1)).join('/')); }); }); return out; });
  console.log('fuera de zona segura:', chk.length ? chk.join(' | ') : 'nada');
  await p.locator('#single-front .card').screenshot({ path: S + '/buzon-f.png' }); await p.locator('#single-back .card').screenshot({ path: S + '/buzon-b.png' });
  await p.locator('#a4-front .trim').first().screenshot({ path: D + '/ahora-anverso.png' }); await p.locator('#a4-back .trim').first().screenshot({ path: D + '/ahora-reverso.png' });
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const show = async (ids) => p.evaluate((ids) => { document.querySelectorAll('body > div').forEach(el => { el.style.display = ids.includes(el.id) ? '' : 'none'; el.style.pageBreakAfter='always'; }); document.body.style.background='#fff'; }, ids);
  await show(['p-intro','a4-front','a4-back']); await p.pdf({ path: D + '/tarjeta-buzon.pdf', format:'A4', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} });
  await show(['single-front','single-back']); await p.pdf({ path: D + '/tarjeta-buzon-imprenta.pdf', width:'91mm', height:'61mm', printBackground:true, margin:{top:0,right:0,bottom:0,left:0} });
  await b.close(); console.log('ok', errs.join(';'));
})();
