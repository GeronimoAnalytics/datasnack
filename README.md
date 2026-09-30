<div align="center">

# 🌡️ Datasnack — Het Zomerse Airco-Effect

**Een interactieve _"You Draw It"_ datavisualisatie**
_Voorspel zelf hoeveel collega's op kantoor werken… en ontdek het verrassende airco-effect._

Gebouwd met **React** · **D3.js** · **SVG** — volledig responsive & deelbaar.

![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-7-F9A03C?logo=d3dotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-4E2680)

</div>

---

## ✨ Wat is dit?

Een **datasnack** in de stijl van de beroemde _New York Times "You Draw It"_ grafieken.
De bezoeker tekent eerst zijn eigen **voorspelling** door de verdeling
Thuis/Kantoor per maand te slepen, en ziet daarna in één klik hoe ver hij
ernaast zat.

> **Het aha-moment:** iedereen verwacht dat we in de hete zomermaanden massaal
> thuis in de tuin werken. De data laat het tegenovergestelde zien — in juli &
> augustus piekt de kantoorbezetting tot boven de **80%**. Waarom? De
> **airconditioning** op kantoor. ❄️

### 🎬 De interactie in 3 fasen
1. **Tekenen** — Jan–Apr staan vast, sleep de knoppen voor Mei t/m Dec om te voorspellen.
2. **Onthullen** — één klik en de echte data animeert naar voren, jouw voorspelling blijft als stippellijn staan.
3. **Feedback** — een vlotte comment vertelt hoe ver je ernaast zat (_"Scherpschutter!"_ … _"Mijlenver ernaast!"_).

---

## 🎨 Twee smaken

| Versie | Map | Stijl |
| --- | --- | --- |
| **Origineel** | [`/src`](src) | Warme, redactionele "datasnack"-look (crème + oranje/groen) |
| **aaff-huisstijl** | [`/aaff-versie`](aaff-versie) | Poppins · aaff-paars `#4E2680` · oranje `#EA5B1B` · teal `#3AB5A7` |

Beide zijn volledig zelfstandige projecten met een eigen build.

---

## 🚀 Aan de slag

```bash
# origineel
npm install
npm run dev            # http://localhost:5173

# aaff-versie
cd aaff-versie
npm install
npm run dev            # http://localhost:5174
```

### Builden

| Commando | Resultaat | Gebruik |
| --- | --- | --- |
| `npm run build` | `dist/` | Normale static site voor hosting / iframe |
| `npm run build:embed` | `dist-embed/index.html` | **Eén** self-contained HTML-bestand om te delen |

---

## 🧩 Features

- 📱 **Responsive** — schaalt mee via `ResizeObserver`, werkt met muis én touch.
- ✏️ **Sleepbare voorspelling** — vloeiende drag-interactie met `d3.drag`.
- 🎞️ **D3-transitions** — de balken animeren soepel naar de echte waarden.
- 💬 **Slimme feedback** — gemiddelde afwijking + kleurgecodeerde comment.
- 🔍 **Tooltips** — op de balken en temperatuurpunten.
- 🧱 **Geen backend** — puur static, host het overal.

---

## 🔗 Delen & insluiten

### Op je website
```bash
npm run build
```
Upload `dist/` en sluit in met een iframe:
```html
<iframe src="https://JOUW-URL/" style="width:100%;max-width:880px;height:820px;border:0"
        title="Het Zomerse Airco-Effect" loading="lazy"></iframe>
```

### In SharePoint
1. Host de build op een https-URL (GitHub Pages, Netlify, Vercel, Azure Static Web Apps).
2. SharePoint-pagina → **Bewerken** → web-onderdeel **Insluiten** → plak de iframe.
3. Domein geblokkeerd? Laat een beheerder het toevoegen via
   **HTML-veldbeveiliging → toegestane domeinen voor insluiten**.

> 💡 SharePoint draait geen eigen scripts vanuit een documentbibliotheek — hosten + iframe is de betrouwbare route.

---

## 🗂️ Projectstructuur

```
datasnack/
├─ src/                    # originele versie
│  ├─ AircoEffectChart.jsx # de volledige visual (D3 + drag + reveal)
│  ├─ data.js              # de dataset
│  └─ styles.css
├─ aaff-versie/            # volledige kopie in aaff-huisstijl
│  └─ src/…
├─ vite.config.js          # normale build
└─ vite.embed.config.js    # single-file build
```

### Data aanpassen
Pas [`src/data.js`](src/data.js) aan. `interactief: false` zet een maand vast,
`true` laat de bezoeker die maand voorspellen.

---

<div align="center">

Gemaakt met ❤️ en veel ☕ · **aaff**

</div>
