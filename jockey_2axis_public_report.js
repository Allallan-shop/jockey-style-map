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
  const norm = value => (value || '').toString().trim().toLowerCase();
  const pointByName = new Map(points.map(point => [norm(point.dataset.name), point]));
  const hideTip = () => { if (tip) tip.hidden = true; };
  function showTip(event, point) {
    if (!tip || point.classList.contains('hidden')) return;
    tip.innerHTML = `<b>${point.dataset.name}</b>` +
      `<span>${point.dataset.quad || ''}</span><br>` +
      `騎乗数: ${point.dataset.ride || '-'}<br>` +
      `前寄り軸: ${point.dataset.forward || '-'}<br>` +
      `動き軸: ${point.dataset.push || '-'}<br>` +
      `4角5番手以内率: ${point.dataset.front5 || '-'}<br>` +
      `位置変化の目安: ${point.dataset.gain || '-'}<br>` +
      `最新日: ${point.dataset.date || '-'}`;
    tip.hidden = false;
    const pad = 14, width = 290, height = 150;
    let x = event.clientX + pad, y = event.clientY + pad;
    if (x + width > window.innerWidth) x = event.clientX - width - pad;
    if (y + height > window.innerHeight) y = event.clientY - height - pad;
    tip.style.left = `${Math.max(8, x)}px`;
    tip.style.top = `${Math.max(8, y)}px`;
  }
  function stateFor(point, query, minimum, recentOnly) {
    const bySearch = !query || norm(point.dataset.name).includes(query);
    const byRide = Number(point.dataset.ride || 0) >= minimum;
    const byRecent = !recentOnly || (point.dataset.date || '') >= cutoff;
    return { bySearch, byRide, byRecent, ok: bySearch && byRide && byRecent };
  }
  function apply() {
    const query = norm(search && search.value);
    const minimum = Number((rideNum && rideNum.value) || (ride && ride.value) || 0);
    const recentOnly = Boolean(recent && recent.checked);
    const states = new Map();
    let count = 0;
    points.forEach(point => {
      const state = stateFor(point, query, minimum, recentOnly);
      states.set(norm(point.dataset.name), state);
      point.classList.toggle('hidden', !state.ok);
      point.classList.toggle('highlight', state.ok && Boolean(query));
      if (state.ok) count += 1;
    });
    labels.forEach(label => {
      const state = states.get(norm(label.textContent));
      label.classList.toggle('hidden', !state || !state.ok);
    });
    const unmatchedCards = [];
    cards.forEach(card => {
      const point = pointByName.get(norm(card.dataset.name));
      if (!point) {
        unmatchedCards.push(card.dataset.name || '(unnamed)');
        card.classList.add('hidden');
        return;
      }
      const state = states.get(norm(point.dataset.name));
      card.classList.toggle('hidden', !state || !state.ok);
    });
    if (unmatchedCards.length) console.warn('Unmatched representative cards:', unmatchedCards);
    if (visible) visible.textContent = count;
    if (noResult) noResult.hidden = count !== 0;
    if (count === 0) hideTip();
  }
  if (search) search.addEventListener('input', apply);
  if (clear) clear.addEventListener('click', () => { search.value = ''; apply(); search.focus(); });
  if (ride) ride.addEventListener('input', () => { if (rideNum) rideNum.value = ride.value; apply(); });
  if (rideNum) rideNum.addEventListener('input', () => { if (ride) ride.value = rideNum.value; apply(); });
  if (recent) recent.addEventListener('change', apply);
  points.forEach(point => {
    point.addEventListener('mousemove', event => showTip(event, point));
    point.addEventListener('mouseenter', event => showTip(event, point));
    point.addEventListener('mouseleave', hideTip);
    point.addEventListener('click', event => showTip(event, point));
  });
  apply();
})();
