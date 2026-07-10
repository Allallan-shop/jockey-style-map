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

  function norm(s) {
    return (s || '').toString().trim().toLowerCase();
  }

  const pointByName = new Map();
  points.forEach((point) => {
    const name = norm(point.dataset.name);
    if (name && !pointByName.has(name)) pointByName.set(name, point);
  });

  function passesFilters(point, query, minRide) {
    if (!point) return false;
    const name = norm(point.dataset.name);
    const bySearch = !query || name.includes(query);
    const byRide = parseInt(point.dataset.ride || '0', 10) >= minRide;
    const byRecent = !recent || !recent.checked || ((point.dataset.date || '') >= cutoff);
    return { ok: bySearch && byRide && byRecent, bySearch };
  }

  function showTip(e, p) {
    if (!tip) return;
    tip.innerHTML = `<b>${p.dataset.name}</b>${p.dataset.quad}<br>騎乗数: ${p.dataset.ride}<br>前寄り軸: ${p.dataset.forward}<br>動き軸: ${p.dataset.push}<br>4角5番手以内率: ${p.dataset.front5 || '-'}<br>位置変化の目安: ${p.dataset.gain || '-'}<br>最新日: ${p.dataset.date || '-'}`;
    tip.hidden = false;
    const pad = 14;
    const w = 290;
    const h = 150;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + w > window.innerWidth) x = e.clientX - w - pad;
    if (y + h > window.innerHeight) y = e.clientY - h - pad;
    tip.style.left = `${Math.max(8, x)}px`;
    tip.style.top = `${Math.max(8, y)}px`;
  }

  function hideTip() {
    if (tip) tip.hidden = true;
  }

  function apply() {
    const q = norm(search && search.value);
    const minRide = parseInt((rideNum && rideNum.value) || (ride && ride.value) || '0', 10);
    const anySearch = Boolean(q);
    let count = 0;

    points.forEach((point) => {
      const state = passesFilters(point, q, minRide);
      point.classList.toggle('hidden', !state.ok);
      point.classList.toggle('dimmed', false);
      point.classList.toggle('highlight', state.ok && anySearch && state.bySearch);
      if (state.ok) count++;
    });

    labels.forEach((label) => {
      const name = norm(label.textContent);
      const point = pointByName.get(name);
      const state = passesFilters(point, q, minRide);
      label.classList.toggle('hidden', !state.ok);
      label.classList.toggle('dimmed', false);
    });

    cards.forEach((card) => {
      const name = norm(card.dataset.name);
      const point = pointByName.get(name);
      const state = passesFilters(point, q, minRide);
      card.classList.toggle('hidden', !state.ok);
    });

    if (visible) visible.textContent = count;
    if (noResult) noResult.hidden = count !== 0;
    if (count === 0) hideTip();
  }

  if (search) search.addEventListener('input', apply);
  if (clear) {
    clear.addEventListener('click', () => {
      search.value = '';
      apply();
      search.focus();
    });
  }
  if (ride) {
    ride.addEventListener('input', () => {
      rideNum.value = ride.value;
      apply();
    });
  }
  if (rideNum) {
    rideNum.addEventListener('input', () => {
      if (ride) ride.value = rideNum.value;
      apply();
    });
  }
  if (recent) recent.addEventListener('change', apply);

  points.forEach((point) => {
    point.addEventListener('mousemove', (e) => showTip(e, point));
    point.addEventListener('mouseenter', (e) => showTip(e, point));
    point.addEventListener('mouseleave', hideTip);
    point.addEventListener('click', (e) => showTip(e, point));
  });

  apply();
})();