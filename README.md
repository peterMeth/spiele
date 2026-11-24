# Spielesammlung (PWA)

Startseite: `index.html` – liest die Spiele aus `games.json`.
Jedes Spiel liegt in einem eigenen Ordner mit `index.html` und `icon.svg`.

## Veröffentlichen

1. Neues Repo `spiele` (Public) anlegen und den **Inhalt** dieses Ordners hochladen (Add file → Upload files, Ordner mit hineinziehen).
2. Settings → Pages → Branch `main`, Ordner `/ (root)` → Save.
3. Nach ca. 1 Minute: `https://petermeth.github.io/spiele/`
4. In Chrome öffnen → Menü → installieren. Die alte Pong-App kann danach deinstalliert werden.

## Neues Spiel hinzufügen

1. Ordner anlegen, z. B. `tetris/`, darin `index.html` und `icon.svg` (quadratisch).
2. In `games.json` einen Eintrag ergänzen:
   `{ "id": "tetris", "title": "Tetris", "desc": "Kurze Beschreibung", "color": "#c0392b" }`
3. Optional zeigt die Startseite eine Statistik an, wenn das Spiel
   `localStorage.setItem('stat_tetris', 'Rekord 1234')` schreibt.
4. Hochladen. Die installierte App holt sich Updates selbst im Hintergrund und zeigt sie beim übernächsten Start.
