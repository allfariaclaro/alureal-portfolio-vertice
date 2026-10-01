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
 assert.equal(run("filterQuery(filterState('bairro=bad&tipo=bad&quartos=9&precoMax=-1'))"),'');
});
test('return allowlist rejects external and malformed destinations',()=>{
 for(const value of ['https://evil.example','//evil.example','/imoveis.html','imoveis.html#x','imoveis.html\\evil','../imoveis.html','imoveis.html\n'])assert.equal(run(`safeListingReturn(${JSON.stringify(value)})`),'imoveis.html');
 assert.equal(run("safeListingReturn('imoveis.html?bairro=Pinheiros&tipo=Casa&redirect=https://evil.example')"),'imoveis.html?bairro=Pinheiros&tipo=Casa');
});
