(() => {
  function insertReadingGuide() {
    if (location.pathname.includes('square')) return;
    const mapSection = document.querySelector('.map-section');
    if (!mapSection || document.querySelector('.reading-guide')) return;

    const isMin50 = location.pathname.includes('min50');
    const guide = document.createElement('section');
    guide.className = 'reading-guide';
    guide.setAttribute('aria-labelledby', 'readingGuideTitle');
    guide.innerHTML = `
      <h2 id="readingGuideTitle">このマップの目的</h2>
      <p class="guide-lead">過去騎乗データから、騎手ごとの「普段どの位置で運びやすいか」と「レース中にどの程度位置を動かすか」を比較するためのマップです。1人の騎手を1つの点で表し、騎乗スタイルの違いを相対的に確認します。</p>
      <div class="guide-summary" aria-label="基本の読み方">
        <div><b>上</b><span>前めの位置で運ぶ傾向</span></div>
        <div><b>下</b><span>控えて後方から運ぶ傾向</span></div>
        <div><b>右</b><span>位置を上げる・動かす傾向</span></div>
        <div><b>左</b><span>溜めて待つ傾向</span></div>
      </div>
      <p class="guide-edition"><strong>${isMin50 ? 'min50版' : 'min100版'}</strong>：${isMin50 ? '50騎乗以上の騎手を対象とする補助表示です。対象は広がりますが、min100版より偶然の影響を受けやすいため、傾向を探す入口として確認してください。' : '100騎乗以上の騎手を対象とする主表示です。標本数を優先して確認する場合はこちらを推奨します。'}</p>
      <details class="guide-details">
        <summary>このマップの詳しい見方</summary>
        <div class="guide-body">
          <section>
            <h3>縦軸：前寄り軸</h3>
            <p>上ほど前方で運ぶ傾向、下ほど控えて後方から運ぶ傾向です。単純な逃げ率ではなく、通過順や4角位置などをまとめた相対スコアです。</p>
          </section>
          <section>
            <h3>横軸：動き軸</h3>
            <p>右ほどレース中に位置を上げたり、自分から動いたりする傾向です。左ほど位置を大きく変えず、溜めて待つ傾向です。</p>
          </section>
          <section class="guide-wide">
            <h3>4象限</h3>
            <div class="quadrant-guide">
              <div><b>Q1 折り合いタイプ</b><span>前め × 溜める・待つ</span></div>
              <div><b>Q2 前め積極タイプ</b><span>前め × 動かす・押し上げる</span></div>
              <div><b>Q3 悠々自適タイプ</b><span>控えめ × 溜める・待つ</span></div>
              <div><b>Q4 後方積極タイプ</b><span>控えめ × 動かす・押し上げる</span></div>
            </div>
          </section>
          <section>
            <h3>点の読み方</h3>
            <p>点が近い騎手ほど、この2軸上では位置取りと動かし方の傾向が近いことを示します。中心から離れるほど、その方向の特徴が相対的に強くなります。</p>
          </section>
          <section>
            <h3>このデータの使い方</h3>
            <p>前方でじっくり運ぶ騎手、後方から位置を押し上げる騎手など、位置取りスタイルを探す入口として使います。検索や騎乗数フィルタを使い、特定騎手や一定以上の標本がある騎手を比較できます。</p>
          </section>
          <section class="guide-wide guide-warning">
            <h3>注意</h3>
            <p>能力や騎乗の上手さを示すランキングではありません。馬の脚質・能力、厩舎方針、枠順、展開、距離、馬場、相手関係などの影響を含みます。使用データは前1走〜前5走ブロックから構成した過去騎乗データであり、全騎乗履歴を完全に網羅したものではありません。象限だけで適性、勝率、回収率、馬券期待値を判断しないでください。</p>
          </section>
        </div>
      </details>`;
    mapSection.parentNode.insertBefore(guide, mapSection);
  }

  insertReadingGuide();

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
