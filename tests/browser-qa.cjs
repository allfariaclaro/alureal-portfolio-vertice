const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const server=require('http').createServer((req,res)=>{const file=require('path').join(require('path').join(__dirname,'..'),new URL(req.url,'http://localhost').pathname);try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(require('fs').readFileSync(file))}catch{res.statusCode=404;res.end()}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port+'/';
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https:\/\/(images.unsplash.com|fonts.googleapis.com|fonts.gstatic.com)/,r=>r.abort());
  const go=path=>page.goto(base+path);
  const count=async n=>assert.equal(await page.locator('[data-listing] [data-property]').count(),n);
  await go('index.html');await page.selectOption('[name=bairro]','Pinheiros');await page.selectOption('[name=tipo]','Casa');await page.click('[data-search-form] button');await count(1);
  assert.equal(await page.inputValue('[name=bairro]'),'Pinheiros');assert.equal(await page.inputValue('[name=tipo]'),'Casa');
  await page.fill('[name=precoMax]','6000000');await count(0);assert.match(await page.locator('[data-listing]').innerText(),/Nenhum/);
  await page.reload();await count(0);assert.equal(await page.inputValue('[name=precoMax]'),'6000000');
  await page.fill('[name=precoMax]','6200000');await count(1);await page.selectOption('[name=quartos]','4');await page.fill('[name=q]','jardim');await count(1);
  await page.click('[data-property=patio] h3 a');assert.equal(await page.locator('[data-detail] h1').innerText(),'Casa Pátio');
  const favorite=page.locator('[data-fav-label]');await favorite.click();assert.equal(await favorite.innerText(),'♥ Salvo');await favorite.click();assert.equal(await favorite.innerText(),'♡ Salvar');await favorite.click();assert.equal(await favorite.innerText(),'♥ Salvo');
  await page.click('[data-listing-return]');await count(1);assert.equal(await page.inputValue('[name=q]'),'jardim');assert.equal(await page.inputValue('[name=quartos]'),'4');
  await page.click('[data-clear-filters]');await count(6);assert.equal(new URL(page.url()).search,'');await page.reload();await count(6);
  await page.goBack();await count(1);await page.goForward();await count(6);
  await page.click('[data-property=alameda] h3 a');await page.click('[data-listing-return]');await count(6);assert.equal(await page.inputValue('[name=bairro]'),'');
  for(let i=0;i<4;i++)await page.click('[data-property=alameda] [data-compare]');assert.equal(await page.locator('[data-compare-count]').innerText(),'0');
  await page.click('[data-property=alameda] [data-compare]');await page.click('[data-property=patio] [data-compare]');await go('comparar.html');assert.match(await page.locator('[data-compare-table]').innerText(),/Apartamento Alameda/);assert.match(await page.locator('[data-compare-table]').innerText(),/Casa Pátio/);
  await go('favoritos.html');assert.equal(await page.locator('[data-property=patio]').count(),1);await page.click('[data-property=patio] [data-fav]');assert.equal(await page.locator('[data-property=patio]').count(),0);
  await go('index.html');await page.selectOption('[name=bairro]','Pinheiros');await page.selectOption('[name=tipo]','Casa');await page.fill('[name=precoMax]','6 mi');await page.click('[data-search-form] button');await count(0);
  await page.click('[data-clear-filters]');await page.selectOption('[name=quartos]','4');await count(3);await page.fill('[name=q]','vista');await count(1);
  for(const theme of ['dark','light']){await page.click('[data-theme-toggle]');assert.equal(await page.locator('html').getAttribute('data-theme'),theme);await count(1);await page.screenshot({path:'/tmp/vertice-'+name+'-'+theme+'.png',fullPage:true})}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await go('imovel.html?id=alameda&retorno='+encodeURIComponent('//evil.example'));assert.equal(await page.locator('[data-listing-return]').getAttribute('href'),'imoveis.html');
  assert.deepEqual(errors,[]);console.log(name+': PASS home/filter/empty/reload/history/return/clear/favorite/compare/themes/overflow; pageerrors=0');await context.close();
 }
 await browser.close();await new Promise(resolve=>server.close(resolve));
})().catch(e=>{console.error(e);process.exitCode=1});
