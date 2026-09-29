const cards=[...document.querySelectorAll('.property')];
const filters=[...document.querySelectorAll('[data-filter]')];

filters.forEach(button=>button.addEventListener('click',()=>{
  filters.forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  cards.forEach(card=>card.classList.toggle('hide',button.dataset.filter!=='all'&&card.dataset.type!==button.dataset.filter));
}));

document.querySelectorAll('.fav').forEach(button=>button.addEventListener('click',()=>{
  button.classList.toggle('on');
  button.textContent=button.classList.contains('on')?'♥':'♡';
}));

document.querySelector('[data-search]')?.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const bairro=data.get('bairro');
  const perfil=data.get('perfil');
  cards.forEach(card=>card.classList.toggle('hide',(bairro!=='all'&&card.dataset.neighborhood!==bairro)||(perfil!=='all'&&card.dataset.type!==perfil)));
  document.querySelector('#imoveis')?.scrollIntoView({behavior:'smooth'});
});

document.querySelector('[data-interest]')?.addEventListener('click',()=>{
  document.querySelector('[data-status]').textContent='Demonstração: briefing comercial iniciado. Em produção, este fluxo seria integrado ao CRM.';
});
