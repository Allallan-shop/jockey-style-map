
(() => {
  const search = document.getElementById('jockeySearch');
  const clear = document.getElementById('clearSearch');
  const ride = document.getElementById('rideFilter');
  const rideNum = document.getElementById('rideFilterNumber');
  const recent = document.getElementById('recentOnly');
  const visible = document.getElementById('visibleCount');
  const noResult = document.getElementById('noResult');
  const tip = document.getElementById('tooltip');
  const cutoff = '2021-07-07';
  const points = [...document.querySelectorAll('.point')];
  const cards = [...document.querySelectorAll('.rep-card')];
  const labels = [...document.querySelectorAll('.point-label')];
  function norm(s){ return (s || '').toString().trim().toLowerCase(); }
  function showTip(e, p){
    if(!tip) return;
    tip.innerHTML = `<b>${p.dataset.name}</b>${p.dataset.quad}<br>騎乗数: ${p.dataset.ride}<br>前寄り軸: ${p.dataset.forward}<br>動き軸: ${p.dataset.push}<br>4角5番手以内率: ${p.dataset.front5 || '-'}<br>位置変化の目安: ${p.dataset.gain || '-'}<br>最新日: ${p.dataset.date || '-'}`;
    tip.hidden = false;
    const pad = 14, w = 290, h = 150;
    let x = e.clientX + pad, y = e.clientY + pad;
    if(x + w > window.innerWidth) x = e.clientX - w - pad;
    if(y + h > window.innerHeight) y = e.clientY - h - pad;
    tip.style.left = `${Math.max(8, x)}px`; tip.style.top = `${Math.max(8, y)}px`;
  }
  function hideTip(){ if(tip) tip.hidden = true; }
  function apply(){
    const q = norm(search && search.value);
    const minRide = parseInt((rideNum && rideNum.value) || (ride && ride.value) || '0', 10);
    let count = 0, anySearch = Boolean(q);
    points.forEach(p => {
      const name = norm(p.dataset.name);
      const bySearch = !q || name.includes(q);
      const byRide = parseInt(p.dataset.ride || '0', 10) >= minRide;
      const byRecent = !recent || !recent.checked || ((p.dataset.date || '') >= cutoff);
      const ok = bySearch && byRide && byRecent;
      p.classList.toggle('hidden', !ok);
      p.classList.toggle('dimmed', ok && anySearch && !bySearch);
      p.classList.toggle('highlight', ok && anySearch && bySearch);
      if(ok) count++;
    });
    labels.forEach(l => {
      const name = norm(l.textContent);
      const hit = !q || name.includes(q);
      l.classList.toggle('dimmed', anySearch && !hit);
    });
    cards.forEach(c => {
      const name = norm(c.dataset.name);
      const ok = (!q || name.includes(q)) && parseInt(c.dataset.ride || '0', 10) >= minRide;
      c.classList.toggle('hidden', !ok);
    });
    if(visible) visible.textContent = count;
    if(noResult) noResult.hidden = count !== 0;
  }
  if(search) search.addEventListener('input', apply);
  if(clear) clear.addEventListener('click', () => { search.value=''; apply(); search.focus(); });
  if(ride) ride.addEventListener('input', () => { rideNum.value = ride.value; apply(); });
  if(rideNum) rideNum.addEventListener('input', () => { if(ride) ride.value = rideNum.value; apply(); });
  if(recent) recent.addEventListener('change', apply);
  points.forEach(p => {
    p.addEventListener('mousemove', e => showTip(e, p));
    p.addEventListener('mouseenter', e => showTip(e, p));
    p.addEventListener('mouseleave', hideTip);
    p.addEventListener('click', e => showTip(e, p));
  });
  apply();
})();
