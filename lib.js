// Gemeinsame Helfer für die Spiele der Sammlung (Ton, Speicher, Kopfleisten-Symbole, Startmenü).
(() => {
  const store = {
    get(k) { try { return localStorage.getItem(k) } catch (e) { return null } },
    set(k, v) { try { localStorage.setItem(k, v) } catch (e) {} }
  };
  let ac = null, sound = (store.get('lib_sound') ?? '1') === '1';
  const actx = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  function beep(f, d = .08, type = 'square', vol = .05, slide = 1) {
    if (!sound) return;
    try {
      const a = actx(), o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, a.currentTime);
      if (slide !== 1) o.frequency.exponentialRampToValueAtTime(f * slide, a.currentTime + d);
      g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + d);
      o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + d);
    } catch (e) {}
  }
  function noise(d = .3, vol = .3) {
    if (!sound) return;
    try {
      const a = actx(), n = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const s = a.createBufferSource(), g = a.createGain(); g.gain.value = vol; s.buffer = buf; s.connect(g).connect(a.destination); s.start();
    } catch (e) {}
  }
  const vib = p => { try { navigator.vibrate && navigator.vibrate(p) } catch (e) {} };
  const orient = o => { try { screen.orientation.lock(o).catch(() => {}) } catch (e) {} };
  const resume = () => { if (ac && ac.state === 'suspended') ac.resume() };

  const I = {
    home: '<path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    fs: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    snd: '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><g class="w"><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a7.5 7.5 0 0 1 0 11"/></g><g class="m" style="display:none"><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></g>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>'
  };
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

  const css = document.createElement('style');
  css.textContent = `
  .lib-ico{display:inline-grid;place-items:center;width:44px;height:44px;padding:0;border-radius:10px;flex:none;cursor:pointer;text-decoration:none;
    border:1px solid var(--lib-edge,#3a3d47);background:var(--lib-panel,#262932);color:var(--lib-ink,#f1efe8);font:inherit}
  .lib-ico svg{width:22px;height:22px}.lib-ico[hidden]{display:none}
  .lib-ico:focus-visible,.lib-over button:focus-visible{outline:3px solid var(--lib-acc,#f4d03f);outline-offset:2px}
  .lib-over{position:fixed;inset:0;z-index:20;display:flex;align-items:safe center;justify-content:center;padding:14px;background:rgba(12,13,16,.55);overflow:auto}
  .lib-over[hidden]{display:none}
  .lib-msg{background:var(--lib-panel,#262932);color:var(--lib-ink,#f1efe8);border-radius:14px;padding:18px 20px;width:min(380px,100%);margin:auto;box-shadow:0 12px 30px rgba(0,0,0,.4)}
  .lib-msg h2{font:700 32px/1.05 "Roboto Condensed","Arial Narrow",sans-serif-condensed,system-ui,sans-serif;margin:0 0 6px}
  .lib-msg p{margin:0 0 12px;color:var(--lib-muted,#a7a9b3);font-size:15px;line-height:1.4}
  .lib-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;font-size:15px}
  .lib-row[hidden]{display:none}
  .lib-seg{display:flex;border:1px solid var(--lib-edge,#3a3d47);border-radius:10px;overflow:hidden;flex-wrap:wrap}
  .lib-seg button,.lib-go{font:600 15px system-ui,Roboto,sans-serif;min-height:44px;padding:0 12px;border:0;background:transparent;color:inherit;cursor:pointer}
  .lib-seg button[aria-pressed=true]{background:var(--lib-acc,#f4d03f);color:var(--lib-acc-ink,#222)}
  .lib-go{width:100%;border-radius:10px;background:var(--lib-acc,#f4d03f);color:var(--lib-acc-ink,#222);margin-top:4px}
  .lib-go2{background:transparent;color:inherit;border:1px solid var(--lib-edge,#3a3d47);margin-top:8px}`;
  document.head.appendChild(css);

  // Kopfleisten-Symbole: home, optional menu/undo/help, sound, fullscreen
  function icons(el, opt = {}) {
    const mk = (tag, name, label) => {
      const b = document.createElement(tag); b.className = 'lib-ico'; b.innerHTML = svg(I[name]); b.setAttribute('aria-label', label);
      if (tag === 'a') b.href = '../'; else b.type = 'button'; return b;
    };
    const out = {};
    if (opt.home !== false) el.appendChild(out.home = mk('a', 'home', 'Zur Spieleübersicht'));
    if (opt.onMenu) { el.appendChild(out.menu = mk('button', 'menu', 'Menü')); out.menu.onclick = opt.onMenu }
    if (opt.onUndo) { el.appendChild(out.undo = mk('button', 'undo', 'Zug zurück')); out.undo.onclick = opt.onUndo }
    if (opt.onHelp) { el.appendChild(out.help = mk('button', 'help', 'Tipp')); out.help.onclick = opt.onHelp }
    if (opt.board && window.Lib && Lib.online.enabled) { const t = document.createElement('button'); t.type = 'button'; t.className = 'lib-ico'; t.innerHTML = Lib.online.trophy; t.setAttribute('aria-label', 'Bestenliste'); t.onclick = () => Lib.online.board(opt.board); el.appendChild(t); out.board = t }
    const s = out.sound = mk('button', 'snd', 'Ton'); el.appendChild(s);
    const upd = () => { s.querySelector('.w').style.display = sound ? '' : 'none'; s.querySelector('.m').style.display = sound ? 'none' : ''; s.setAttribute('aria-label', sound ? 'Ton aus' : 'Ton an') };
    s.onclick = () => { sound = !sound; store.set('lib_sound', sound ? '1' : '0'); upd() }; upd();
    const f = out.fs = mk('button', 'fs', 'Vollbild'); el.appendChild(f);
    const root = document.documentElement;
    f.hidden = !(document.fullscreenEnabled || document.webkitFullscreenEnabled) || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches;
    f.onclick = async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else { await (root.requestFullscreen || root.webkitRequestFullscreen).call(root, { navigationUI: 'hide' }); if (opt.orient) orient(opt.orient) }
      } catch (e) { f.hidden = true }
    };
    return out;
  }

  // Startmenü mit Auswahlknöpfen. rows: [{key,label,opts:[[text,value]],def,showIf(settings)}]
  function menu({ prefix, title, text, rows = [], start = 'Spiel starten', onStart, extra }) {
    const s = {};
    rows.forEach(r => { const v = store.get(prefix + r.key); s[r.key] = v === null ? r.def : (typeof r.def === 'number' ? +v : v) });
    const over = document.createElement('div'); over.className = 'lib-over';
    over.innerHTML = `<div class="lib-msg"><h2></h2><p class="t"></p><div class="rows">${rows.map(r =>
      `<div class="lib-row" data-k="${r.key}"><span>${r.label}</span><div class="lib-seg">${r.opts.map(([t, v]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div></div>`).join('')}</div>
      <button type="button" class="lib-go"></button>${extra ? `<button type="button" class="lib-go lib-go2">${extra.label}</button>` : ''}</div>`;
    document.body.appendChild(over);
    const h2 = over.querySelector('h2'), t = over.querySelector('.t'), go = over.querySelector('.lib-go'), rowsEl = over.querySelector('.rows');
    const refresh = () => rows.forEach(r => {
      const row = over.querySelector(`[data-k="${r.key}"]`);
      row.hidden = r.showIf ? !r.showIf(s) : false;
      row.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v) === String(s[r.key])));
    });
    rows.forEach(r => over.querySelectorAll(`[data-k="${r.key}"] button`).forEach(b => b.onclick = () => {
      s[r.key] = typeof r.def === 'number' ? +b.dataset.v : b.dataset.v; store.set(prefix + r.key, s[r.key]); refresh();
    }));
    go.onclick = () => { resume(); over.hidden = true; onStart(s) };
    if (extra) over.querySelector('.lib-go2').onclick = () => { over.hidden = true; extra.onClick() };
    const api = {
      settings: s,
      show(tt = title, tx = text, btn = start, withRows = true) { h2.textContent = tt; t.textContent = tx; go.textContent = btn; rowsEl.hidden = !withRows; refresh(); over.hidden = false },
      hide() { over.hidden = true }
    };
    api.show(); return api;
  }

  // Statistik gegen den PC (für die Startseite)
  function record(id, won, label = 'gegen PC', pts = 0) {
    if (won === true && pts && window.Lib) Lib.submit(id, pts);
    const w = +(store.get(id + '_wins') || 0) + (won === true ? 1 : 0), l = +(store.get(id + '_losses') || 0) + (won === false ? 1 : 0);
    store.set(id + '_wins', w); store.set(id + '_losses', l); store.set('stat_' + id, `${w} Siege · ${l} Niederlagen ${label}`);
    return [w, l];
  }


  // ---------- Online-Bestenliste (Supabase) ----------
  const CFG = window.SPIELE_CONFIG || {}, ON = !!(CFG.supabaseUrl && CFG.supabaseKey && !/DEIN/.test(CFG.supabaseUrl));
  const mm = v => `${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, '0')}`;
  // m: max = höchster Wert zählt, min = niedrigster, add = wird aufsummiert (Siege; Leicht 1, Mittel 2, Schwer 3)
  const GAMES = {
    pong: { t: 'Pong', m: 'add', u: 'Punkte', i: 'Siege gegen den PC: Leicht 1, Mittel 2, Schwer 3 Punkte' },
    snake: { t: 'Snake', m: 'max', u: 'Punkte' },
    gorillas: { t: 'Gorillas', m: 'add', u: 'Punkte', i: 'Gewonnene Matches gegen den PC: Leicht 1, Mittel 2, Schwer 3 Punkte' },
    bloecke: { t: 'Blöcke', m: 'max', u: 'Punkte' },
    freecell: { t: 'FreeCell', m: 'add', u: 'gelöst', i: 'Anzahl gelöster Spiele' },
    mahjong: { t: 'Mahjong', m: 'min', f: mm, i: 'Schnellste Zeit' },
    muehle: { t: 'Mühle', m: 'add', u: 'Punkte', i: 'Siege gegen den PC: Leicht 1, Mittel 2, Schwer 3 Punkte' },
    dame: { t: 'Dame', m: 'add', u: 'Punkte', i: 'Siege gegen den PC: Leicht 1, Mittel 2, Schwer 3 Punkte' },
    vier: { t: 'Vier in einer Reihe', m: 'add', u: 'Punkte', i: 'Siege gegen den PC: Leicht 1, Mittel 2, Schwer 3 Punkte' },
    baseball: { t: 'Baseball', m: 'max', f: v => `${Math.round(v)} m`, i: 'Weitester Schlag' },
    bogen: { t: 'Bogenschießen', m: 'max', u: 'Ringe' },
    hammer: { t: 'Hammerwurf', m: 'max', f: v => `${(+v).toFixed(2).replace('.', ',')} m`, i: 'Beste Weite' },
    golf: { t: 'Golf', m: 'max', u: 'Punkte' },
    tontauben: { t: 'Tontauben', m: 'max', u: 'Punkte' }
  };
  const fmt = (g, v) => GAMES[g].f ? GAMES[g].f(+v) : `${Math.round(v)} ${GAMES[g].u || ''}`;
  let sess = null; try { sess = JSON.parse(store.get('sb_session')) } catch (e) {}
  const playerName = () => store.get('sb_name');
  async function auth(path, body) {
    const r = await fetch(CFG.supabaseUrl + '/auth/v1/' + path, { method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text()); return r.json();
  }
  function keep(d) { sess = { a: d.access_token, r: d.refresh_token, e: Date.now() + d.expires_in * 1000, id: d.user.id }; store.set('sb_session', JSON.stringify(sess)) }
  async function token() {
    if (!sess) return null;
    if (Date.now() > sess.e - 60000) { try { keep(await auth('token?grant_type=refresh_token', { refresh_token: sess.r })) } catch (e) { return null } }
    return sess.a;
  }
  async function rest(path, { method = 'GET', body, prefer } = {}) {
    const t = await token(), h = { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' };
    if (t) h.Authorization = 'Bearer ' + t; if (prefer) h.Prefer = prefer;
    const r = await fetch(CFG.supabaseUrl + '/rest/v1/' + path, { method, headers: h, body: body && JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text()); const tx = await r.text(); return tx ? JSON.parse(tx) : null;
  }
  async function signIn(name) {
    if (!sess) keep(await auth('signup', { data: {}, gotrue_meta_security: {} }));
    await rest('profiles', { method: 'POST', body: { id: sess.id, name }, prefer: 'resolution=merge-duplicates' });
    store.set('sb_name', name); flush();
  }
  const queue = () => { try { return JSON.parse(store.get('sb_queue') || '{}') } catch (e) { return {} } };
  function submit(g, v) {
    if (!ON || !GAMES[g] || !(v > 0 || (v === 0 && GAMES[g].m !== 'add'))) return;
    const q = queue(), m = GAMES[g].m, o = q[g];
    q[g] = o == null ? v : m === 'add' ? o + v : m === 'min' ? Math.min(o, v) : Math.max(o, v);
    store.set('sb_queue', JSON.stringify(q)); flush();
    if (!playerName() && !store.get('sb_later')) setTimeout(() => askName(), 1200);
  }
  let flushing = false;
  async function flush() {
    if (!ON || !sess || !playerName() || flushing || !navigator.onLine) return; flushing = true;
    try {
      for (const g of Object.keys(queue())) {
        const v = queue()[g];
        if (GAMES[g]?.m === 'add') { let left = v; while (left > 0) { const st = Math.min(3, left); await rest('rpc/submit_score', { method: 'POST', body: { p_game: g, p_score: st } }); left -= st; const q = queue(); q[g] -= st; if (q[g] <= 0) delete q[g]; store.set('sb_queue', JSON.stringify(q)) } }
        else { await rest('rpc/submit_score', { method: 'POST', body: { p_game: g, p_score: v } }); const q = queue(); if (q[g] === v) delete q[g]; store.set('sb_queue', JSON.stringify(q)) }
      }
    } catch (e) {} finally { flushing = false }
  }
  addEventListener('online', flush); setTimeout(flush, 1500);

  // Dialoge
  const TROPHY = '<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  css.textContent += `
  .lib-in{width:100%;font:16px system-ui,Roboto,sans-serif;min-height:46px;padding:0 12px;border-radius:10px;border:1px solid var(--lib-edge,#3a3d47);background:rgba(0,0,0,.25);color:inherit;margin-bottom:8px}
  .lib-err{color:#ff8a7a;font-size:14px;min-height:18px;margin:0 0 6px}
  .lib-tabs{display:flex;gap:6px;overflow-x:auto;margin:0 0 10px;padding-bottom:4px;scrollbar-width:thin}
  .lib-tabs button{flex:none;font:600 14px system-ui,Roboto,sans-serif;min-height:38px;padding:0 12px;border-radius:19px;border:1px solid var(--lib-edge,#3a3d47);background:transparent;color:inherit}
  .lib-tabs button[aria-pressed=true]{background:var(--lib-acc,#f4d03f);color:var(--lib-acc-ink,#222);border-color:transparent}
  .lib-ol{list-style:none;margin:0 0 8px;padding:0}
  .lib-ol li{display:grid;grid-template-columns:2em minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 6px;border-top:1px solid var(--lib-edge,#3a3d47);font-size:16px}
  .lib-ol li b{font-variant-numeric:tabular-nums;white-space:nowrap}.lib-ol li span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .lib-ol li.me{background:rgba(255,255,255,.08);border-radius:8px}
  .lib-ol .r{font-weight:700;color:var(--lib-muted,#a7a9b3)}.lib-ol li:nth-child(1) .r{color:#f4c430}.lib-ol li:nth-child(2) .r{color:#c9ced6}.lib-ol li:nth-child(3) .r{color:#d08b4f}
  .lib-small{font-size:13px;color:var(--lib-muted,#a7a9b3);margin:4px 0 0}
  .lib-msg button{box-shadow:none!important;transform:none!important}.lib-msg a{color:var(--lib-acc,#f4d03f)}`;
  function dialog(html) {
    const o = document.createElement('div'); o.className = 'lib-over'; o.innerHTML = `<div class="lib-msg">${html}</div>`; document.body.appendChild(o);
    o.addEventListener('click', e => { if (e.target === o) o.remove() }); return o;
  }
  function askName(after) {
    if (!ON || document.querySelector('.lib-over.name')) return;
    const o = dialog(`<h2>Bestenliste</h2><p>${playerName() ? 'Neuer Spielername:' : 'Wähl einmalig einen Spielernamen, dann landen deine Bestwerte aus allen Spielen in der gemeinsamen Bestenliste.'}</p>
      <input class="lib-in" maxlength="20" placeholder="Spielername" value="${esc(playerName() || '')}"><p class="lib-err"></p>
      <button type="button" class="lib-go">Speichern</button><button type="button" class="lib-go lib-go2">${playerName() ? 'Abbrechen' : 'Später'}</button>`);
    o.classList.add('name');
    const inp = o.querySelector('input'), err = o.querySelector('.lib-err');
    o.querySelector('.lib-go2').onclick = () => { if (!playerName()) store.set('sb_later', '1'); o.remove() };
    const go = async () => {
      const n = inp.value.trim(); if (n.length < 2) { err.textContent = 'Mindestens 2 Zeichen.'; return }
      err.textContent = 'Wird gespeichert …';
      try { await signIn(n); o.remove(); after && after() } catch (e) { err.textContent = navigator.onLine ? 'Das hat nicht geklappt. Ist die Anmeldung ohne Konto in Supabase erlaubt?' : 'Keine Internetverbindung.' }
    };
    o.querySelector('.lib-go').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go() }; setTimeout(() => inp.focus(), 50);
  }
  async function board(game) {
    if (!ON) return;
    const ids = Object.keys(GAMES); let g = GAMES[game] ? game : ids[0];
    const o = dialog(`<h2>Bestenliste</h2><div class="lib-tabs">${ids.map(id => `<button type="button" data-g="${id}">${GAMES[id].t}</button>`).join('')}</div>
      <p class="info lib-small"></p><ol class="lib-ol"></ol><p class="who lib-small"></p><button type="button" class="lib-go">Schließen</button>`);
    o.querySelector('.lib-go').onclick = () => o.remove();
    const who = () => { const w = o.querySelector('.who'); w.innerHTML = playerName() ? `Du spielst als <b>${esc(playerName())}</b> · <a href="#" class="ch">Namen ändern</a>` : '<a href="#" class="ch">Spielernamen wählen</a>, um mitzumachen';
      w.querySelector('.ch').onclick = e => { e.preventDefault(); askName(() => { who(); load() }) } };
    const load = async () => {
      o.querySelectorAll('.lib-tabs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.g === g));
      o.querySelector(`[data-g="${g}"]`).scrollIntoView({ block: 'nearest', inline: 'center' });
      o.querySelector('.info').textContent = GAMES[g].i || ''; const ol = o.querySelector('.lib-ol'); ol.innerHTML = '<li><span></span><span>Lädt …</span></li>';
      try {
        await flush();
        const rows = await rest(`leaderboard?game=eq.${g}&order=score.${GAMES[g].m === 'min' ? 'asc' : 'desc'},updated_at.asc&limit=10`);
        ol.innerHTML = rows.length ? rows.map((r, i) => `<li class="${sess && r.user_id === sess.id ? 'me' : ''}"><span class="r">${i + 1}.</span><span>${esc(r.name)}</span><b>${fmt(g, r.score)}</b></li>`).join('')
          : '<li><span></span><span>Noch keine Einträge – sei die oder der Erste!</span></li>';
      } catch (e) { ol.innerHTML = `<li><span></span><span>${navigator.onLine ? 'Bestenliste nicht erreichbar.' : 'Keine Internetverbindung.'}</span></li>` }
    };
    o.querySelectorAll('.lib-tabs button').forEach(b => b.onclick = () => { g = b.dataset.g; load() });
    who(); load();
  }
  const online = { enabled: ON, submit, board, askName, games: GAMES, get name() { return playerName() }, trophy: svg(TROPHY) };
  const base = document.currentScript ? new URL('.', document.currentScript.src) : new URL('../', location.href);
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register(new URL('sw.js', base)).catch(() => {});
  window.Lib = { store, beep, noise, vib, orient, resume, icons, menu, record, svg, online, submit, get sound() { return sound } };
})();
