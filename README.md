# 💌 Resignation Rejected.exe

A small interactive farewell website: three playful slides, then an envelope that opens into your letter.

```
Farewell/
├── index.html        ← the page (no need to edit)
├── style.css         ← the design (no need to edit)
├── script.js         ← the animations (no need to edit)
├── config.js         ← ✏️ EDIT THIS: names, photos, captions, jokes, letter, music
├── card.html         ← printable farewell card with a QR code
└── assets/
    ├── photos/       ← your photos go here (photo1.jpg, photo2.jpg, photo3.jpg are already in)
    └── music/        ← optional .mp3 for background music
```

---

## 1. Personalize it (only `config.js`)

Open **`config.js`** in VS Code. Every section has a numbered heading and comments.

| What you want to change | Where in `config.js` |
|---|---|
| Her name on the envelope | `managerName` (section 1) |
| Her nickname (used in the "official" jokes) | `nickname` |
| Your name / signature | `myName` |
| Photos, captions, labels | `photos: [ ... ]` (section 2) |
| Which photo appears on Slide 3 / in the letter | `favoritePhoto`, `letterPhoto` |
| Background music | `music` (section 3) |
| Funny dialogue, buttons, scan messages | `slide1`, `slide2`, `slide3` (sections 4–6) |
| **Your letter** | `letter: \` ... \`` (section 7) |
| Final quote, "With love," | `finalQuote`, `signOff` (section 8) |
| Website address for the QR card | `siteUrl` (section 9) |

**Golden rules:** only change text *inside* the quotes, keep the commas, and save + refresh the browser.

### Adding or replacing photos
1. Copy your photo into `assets/photos/` (for example `photo4.jpg`).
2. In `config.js`, find the photo block and set its `src`:
   ```js
   src: "assets/photos/photo4.jpg",
   ```
3. Change its `caption` and `alt` text. Done.

- Photos keep their original shape — portrait and landscape both look right and are never stretched.
- An empty `src: ""` shows a pretty "Add a photo here" placeholder. Right now **photo4 is one of these**. Either add a 4th photo, or delete that whole `{ ... },` block before you share the site.
- To add a 5th photo, copy one whole `{ ... },` block and change the `id`, `src`, `label` and `caption`.
- Online, file names are case-sensitive: `Photo4.JPG` ≠ `photo4.jpg`.
- Keep photos under ~1 MB each so the site loads fast on mobile data. Phone photos can be shrunk for free at squoosh.app.

### Editing the letter
Your letter is already in there, word for word. To change it, paste the new text between the two backticks:
```js
letter: `
Dear Ma'am,

Paragraph two...
`,
```
Leave an empty line between paragraphs. Emojis are fine. Just don't type a backtick ( ` ) inside the letter.

### Music
- Leave `music: ""` to use the built-in soft music-box tune.
- Or drop an MP3 into `assets/music/` and set `music: "assets/music/our-song.mp3",`.
- Music never autoplays. It starts when she opens the letter, and the ♪ button in the top-right corner turns it on or off. The 🔊 button mutes the sound effects.

---

## 2. Run it locally in VS Code

**Quickest:** double-click `index.html`. It opens in your browser and works offline. Fonts need internet.

**Better, with auto-refresh while you edit:**
1. Open the `Farewell` folder in VS Code (*File → Open Folder…*).
2. Open the Extensions panel (`Ctrl+Shift+X`), search for **Live Server** by Ritwick Dey, and install it.
3. Right-click `index.html` → **Open with Live Server**.
4. Every time you save `config.js`, the page reloads.

**To test on your phone:** with Live Server running and your phone on the same Wi-Fi, open `http://<your-PC-IP>:5500` on the phone. To find your PC's IP, run `ipconfig` and look for the IPv4 address.

To replay from the start, press the "Relive Our Little Journey ✨" button at the end, or just refresh.

---

## 3. Host it online for free

> 🔒 Anyone with the link can see the site, including your photos. The page tells search engines not to index it, so only people you give the link to will find it.

### Option A — Netlify Drop (easiest, about 2 minutes, no Git)
1. Go to **https://app.netlify.com/drop** and sign up for free (Google login works).
2. Drag the whole **`Farewell` folder** onto the page.
3. You get a link like `https://random-name-123.netlify.app`.
4. To get a nicer name: **Site configuration → Change site name**, e.g. `resignation-rejected-ma-am`.
5. To update the site later, open your site in Netlify → **Deploys** → drag the folder in again.

### Option B — GitHub Pages
1. Create a free account at github.com → **New repository** (for example `farewell`) → Public → Create.
2. Click **"uploading an existing file"**, drag in *everything inside* the Farewell folder (index.html, style.css, script.js, config.js, card.html and the assets folder), then **Commit**.
3. Go to **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root → Save**.
4. After about a minute your site is at `https://<your-username>.github.io/farewell/`.

### Option C — Vercel
1. Sign up at vercel.com, then install the CLI with `npm i -g vercel`.
2. In the VS Code terminal inside the folder, run `vercel` and accept the defaults. You'll get a `*.vercel.app` link.

---

## 4. Make the QR code farewell card

1. Copy your live link (from step 3) into `siteUrl` in `config.js`. If you're on Netlify, re-upload the folder afterwards.
2. Open **`card.html`** in your browser. It already shows a designed card with the QR code. You can also paste the link straight into the box at the top.
3. **Scan it with your own phone first** to make sure it opens the site.
4. Click **🖨️ Print card**. It's laid out for A5 landscape; choose "Fit to page" if your printer needs it. Thick paper or cardstock looks lovely.
5. Or click **⬇️ Download QR as PNG** and put the QR on any card you design yourself (Canva, a handwritten card, etc.).

Other free QR makers, if you prefer: qr-code-generator.com, or Chrome's own **Share → Create QR code** on your site's page. Avoid "dynamic QR" services that expire after a trial.

---

## 5. Before you give it to her ✅
- [ ] Names in `config.js` are right (`managerName`, `nickname`, `myName`).
- [ ] photo4 placeholder is either replaced or removed.
- [ ] Captions read the way you want.
- [ ] Ran through the whole thing once on your phone, with sound on.
- [ ] The QR code scans and opens the live site.

## Good to know
- Works on Chrome, Safari, Edge and Firefox, on desktop, Android and iPhone.
- Keyboard friendly: Tab / Enter / Esc all work. Users who have "reduce motion" switched on get a calmer version automatically.
- The longer animation sequences have a **Skip animation ⏭** button.
- No backend, database or build step is needed. It's plain HTML, CSS and JavaScript.
