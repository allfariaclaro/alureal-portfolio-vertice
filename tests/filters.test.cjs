const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const context=vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}},URLSearchParams});
vm.runInContext(fs.readFileSync(path.join(root,'vertice-data.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'vertice-app.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
const ids=query=>JSON.parse(run(`JSON.stringify(filteredProperties(filterState(${JSON.stringify(query)})).map(p=>p.id))`));
test('Pinheiros Casa respects maximum price, including BRL and millions',()=>{
 assert.deepEqual(ids('bairro=Pinheiros&tipo=Casa'),['patio']);
 for(const price of ['6000000','R$ 6.000.000,00','6 mi','6,0 milhões'])assert.deepEqual(ids('bairro=Pinheiros&tipo=Casa&precoMax='+encodeURIComponent(price)),[]);
 assert.deepEqual(ids('bairro=Pinheiros&tipo=Casa&precoMax=6200000'),['patio']);
 assert.deepEqual(ids('precoMax=0'),[]);
});
test('bedroom minimum, accent-insensitive keyword and combined filters',()=>{
 assert.deepEqual(ids('quartos=4'),['patio','jardim','paulista']);
 assert.deepEqual(ids('q=metro'),['concreto']);
 assert.deepEqual(ids('q=pátio&bairro=Pinheiros&tipo=Casa&quartos=4'),['patio']);
 assert.deepEqual(ids('q=vista&precoMax=6000000'),['horizonte']);
});
test('clear and roundtrip preserve only valid criteria',()=>{
 const query='bairro=Pinheiros&tipo=Casa&precoMax=6200000&quartos=4&q=jardim';
 assert.equal(run(`filterQuery(filterState('${query}'))`),query);
 assert.equal(run("listingUrl(filterState(''))"),'imoveis.html');
 assert.equal(ids('').length,6);
 assert.equal(run("filterQuery(filterState('bairro=bad&tipo=bad&quartos=9'))"),'');
});
test('return allowlist rejects external and malformed destinations',()=>{
 for(const value of ['https://evil.example','//evil.example','/imoveis.html','imoveis.html#x','imoveis.html\\evil','../imoveis.html','imoveis.html\n'])assert.equal(run(`safeListingReturn(${JSON.stringify(value)})`),'imoveis.html');
 assert.equal(run("safeListingReturn('imoveis.html?bairro=Pinheiros&tipo=Casa&redirect=https://evil.example')"),'imoveis.html?bairro=Pinheiros&tipo=Casa');
});

test('decimal millions and cents stay exact and survive query roundtrips',()=>{
 for(const [raw,expected] of [['4,1 mi','4100000'],['4.1 mi','4100000'],['R$ 6.000.000,50','6000000.50'],['6000000.50','6000000.50'],['0,00000001 mi','0.01'],['6,19999999 mi','6199999.99']]){
  assert.equal(run(`parsePrice(${JSON.stringify(raw)})`),expected);
  assert.equal(run(`filterState(filterQuery(filterState(new URLSearchParams({precoMax:${JSON.stringify(raw)}})))).precoMax`),expected);
  assert.deepEqual(ids('bairro=Pinheiros&tipo=Casa&precoMax='+encodeURIComponent(raw)),[]);
 }
 assert.deepEqual(ids('bairro=Pinheiros&tipo=Casa&precoMax='+encodeURIComponent('R$ 6.200.000,00')),['patio']);
 assert.equal(run("priceMatches(6000000.50,'6000000.50')"),true);
 assert.equal(run("priceMatches(6000000.50,'6000000.49')"),false);
 assert.equal(run("priceMatches(4100000.01,'4,1 mi')"),false);
});
test('safe cent limit and malformed prices never silently remove the ceiling',()=>{
 assert.equal(run("parsePrice('90071992547409.91')"),'90071992547409.91');
 for(const raw of ['90071992547409.92','90071992547410','NaN','Infinity','1e309','-1','6.000.000,501','4,123456789 mi','9'.repeat(201)]){
  assert.equal(run(`parsePrice(${JSON.stringify(raw)})`),null);
  assert.deepEqual(ids('bairro=Pinheiros&tipo=Casa&precoMax='+encodeURIComponent(raw)),[]);
  assert.notEqual(run(`filterState(new URLSearchParams({precoMax:${JSON.stringify(raw)}})).precoMax`),'');
 }
 assert.equal(run("parsePrice('')"),'');
});
