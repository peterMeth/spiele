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
  function record(id, won, label = 'gegen PC') {
    const w = +(store.get(id + '_wins') || 0) + (won === true ? 1 : 0), l = +(store.get(id + '_losses') || 0) + (won === false ? 1 : 0);
    store.set(id + '_wins', w); store.set(id + '_losses', l); store.set('stat_' + id, `${w} Siege · ${l} Niederlagen ${label}`);
    return [w, l];
  }

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('../sw.js').catch(() => {});
  window.Lib = { store, beep, noise, vib, orient, resume, icons, menu, record, svg, get sound() { return sound } };
})();
