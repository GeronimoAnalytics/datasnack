# Datasnack: "Het Zomerse Airco-Effect" 
**Interactieve "You Draw It" Visualisatie met React & D3.js**

---

## 1. Concept & Context
* **Doel:** Kantoormedewerkers op een speelse manier laten inzien hoe weersomstandigheden ons thuiswerk- en kantoorgedrag beïnvloeden.
* **Format:** "You Draw / Drag It" (100% gestapelde staafgrafiek + temperatuurlijn).
* **De Verrassing (Het Aha-moment):** De meeste mensen verwachten dat men in de hete zomermaanden (juli/augustus) massaal thuisblijft om in de tuin te werken. De data laat echter zien dat de kantoorbezetting in die maanden juist extreem piekt vanwege de **airconditioning op kantoor**!

---

## 2. De Dataset (`data.json`)

Bewaar onderstaande JSON-structuur als `data.json` of gebruik deze rechtstreeks in je code:

```json
[
  { "maand": "Jan", "temp": 3.6,  "kantoorEcht": 52, "thuisEcht": 48, "interactief": false },
  { "maand": "Feb", "temp": 4.2,  "kantoorEcht": 50, "thuisEcht": 50, "interactief": false },
  { "maand": "Mar", "temp": 7.1,  "kantoorEcht": 55, "thuisEcht": 45, "interactief": false },
  { "maand": "Apr", "temp": 10.3, "kantoorEcht": 53, "thuisEcht": 47, "interactief": false },
  { "maand": "Mei", "temp": 14.2, "kantoorEcht": 48, "thuisEcht": 52, "interactief": true },
  { "maand": "Jun", "temp": 17.5, "kantoorEcht": 42, "thuisEcht": 58, "interactief": true },
  { "maand": "Jul", "temp": 22.8, "kantoorEcht": 78, "thuisEcht": 22, "interactief": true },
  { "maand": "Aug", "temp": 23.4, "kantoorEcht": 82, "thuisEcht": 18, "interactief": true },
  { "maand": "Sep", "temp": 16.1, "kantoorEcht": 58, "thuisEcht": 42, "interactief": true },
  { "maand": "Okt", "temp": 11.5, "kantoorEcht": 52, "thuisEcht": 48, "interactief": true },
  { "maand": "Nov", "temp": 7.0,  "kantoorEcht": 49, "thuisEcht": 51, "interactief": true },
  { "maand": "Dec", "temp": 4.1,  "kantoorEcht": 45, "thuisEcht": 55, "interactief": true }
]
```

---

## 3. Visualisatie-architectuur & Interactie Flow

### Layout
1. **Linker Y-as (Balken):** Verdeling Werkplek (0% tot 100%).
   * **Blauw:** % Thuiswerkers.
   * **Oranje:** % Kantoorwerkers.
2. **Rechter Y-as (Rode Lijn):** Gemiddelde Maandtemperatuur (°C).
3. **X-as:** Maanden van het jaar (Jan t/m Dec).

### Interactie-stappen
1. **Fase 1 (Invoeren):** 
   * De maanden **Januari t/m April** zijn al ingevuld ter ondersteuning.
   * Voor de maanden **Mei t/m December** kan de gebruiker de grens tussen Thuis/Kantoor omhoog en omlaag slepen met de muis of touch (Drag Interaction).
2. **Fase 2 (Onthullen):**
   * De gebruiker klikt op de knop **"Onthul de werkelijkheid"**.
   * De voorspelling van de gebruiker verandert in een gestippelde outline/schaduw.
   * De echte data geanimeerd met D3 transitions naar voren en laat de grote piek in Juli & Augustus zien.
3. **Fase 3 (Feedback & Conclusie):**
   * Er verschijnt een korte toelichting op het scherm over de uitkomst ("Het Airco-effect").

---

## 4. Volledige React + D3.js Code

Bewaar dit component als `AircoEffectChart.jsx` in je React applicatie.

```jsx
import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

const initialData = [
  { maand: "Jan", temp: 3.6,  kantoorEcht: 52, thuisEcht: 48, interactief: false },
  { maand: "Feb", temp: 4.2,  kantoorEcht: 50, thuisEcht: 50, interactief: false },
  { maand: "Mar", temp: 7.1,  kantoorEcht: 55, thuisEcht: 45, interactief: false },
  { maand: "Apr", temp: 10.3, kantoorEcht: 53, thuisEcht: 47, interactief: false },
  { maand: "Mei", temp: 14.2, kantoorEcht: 48, thuisEcht: 52, interactief: true },
  { maand: "Jun", temp: 17.5, kantoorEcht: 42, thuisEcht: 58, interactief: true },
  { maand: "Jul", temp: 22.8, kantoorEcht: 78, thuisEcht: 22, interactief: true },
  { maand: "Aug", temp: 23.4, kantoorEcht: 82, thuisEcht: 18, interactief: true },
  { maand: "Sep", temp: 16.1, kantoorEcht: 58, thuisEcht: 42, interactief: true },
  { maand: "Okt", temp: 11.5, kantoorEcht: 52, thuisEcht: 48, interactief: true },
  { maand: "Nov", temp: 7.0,  kantoorEcht: 49, thuisEcht: 51, interactief: true },
  { maand: "Dec", temp: 4.1,  kantoorEcht: 45, thuisEcht: 55, interactief: true }
];

export default function AircoEffectChart() {
  const svgRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  
  // State voor de door de gebruiker ingestelde kantoor-percentages (standaard op 50%)
  const [userKantoor, setUserKantoor] = useState(() => {
    const init = {};
    initialData.forEach(d => {
      init[d.maand] = d.interactief ? 50 : d.kantoorEcht;
    });
    return init;
  });

  useEffect(() => {
    if (!svgRef.current) return;

    // Afmetingen instellen
    const margin = { top: 50, right: 60, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // SVG opschonen bij re-render
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Schalen definieren
    const xScale = d3.scaleBand()
      .domain(initialData.map(d => d.maand))
      .range([0, width])
      .padding(0.3);

    const yScaleBar = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    const yScaleTemp = d3.scaleLinear()
      .domain([0, 30])
      .range([height, 0]);

    // Assen
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "12px");

    // Linker Y-as (Percentages)
    g.append("g")
      .call(d3.axisLeft(yScaleBar).ticks(5).tickFormat(d => d + "%"));

    // Rechter Y-as (Temperatuur)
    g.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(yScaleTemp).ticks(5).tickFormat(d => d + "°C"))
      .attr("color", "#e63946");

    // Teken de Staven (Thuis vs Kantoor)
    initialData.forEach(d => {
      const x = xScale(d.maand);
      const barWidth = xScale.bandwidth();

      const currentKantoor = revealed ? d.kantoorEcht : userKantoor[d.maand];
      const currentThuis = 100 - currentKantoor;

      const group = g.append("g").attr("class", `bar-group-${d.maand}`);

      // Kantoor Balk (Oranje/Boven)
      group.append("rect")
        .attr("x", x)
        .attr("y", yScaleBar(100))
        .attr("width", barWidth)
        .attr("height", height - yScaleBar(currentKantoor))
        .attr("fill", "#f4a261")
        .attr("rx", 3);

      // Thuis Balk (Blauw/Onder)
      group.append("rect")
        .attr("x", x)
        .attr("y", yScaleBar(100 - currentKantoor))
        .attr("width", barWidth)
        .attr("height", height - yScaleBar(currentThuis))
        .attr("fill", "#2a9d8f")
        .attr("rx", 3);

      // Als het interactief is en nog niet onthuld, voeg een sleepbare grenslijn/knop toe
      if (d.interactief && !revealed) {
        const dragHandle = group.append("circle")
          .attr("cx", x + barWidth / 2)
          .attr("cy", yScaleBar(currentKantoor))
          .attr("r", 8)
          .attr("fill", "#ffffff")
          .attr("stroke", "#e76f51")
          .attr("stroke-width", 3)
          .style("cursor", "row-resize");

        const drag = d3.drag()
          .on("drag", (event) => {
            // Bereken nieuw percentage op basis van muis y-positie
            const newY = Math.max(0, Math.min(height, event.y));
            const newKantoorPct = Math.round(yScaleBar.invert(newY));
            
            setUserKantoor(prev => ({
              ...prev,
              [d.maand]: newKantoorPct
            }));
          });

        dragHandle.call(drag);
      }

      // Indien revealed, toon de stippellijn van de voorspelling van de gebruiker
      if (revealed && d.interactief) {
        group.append("line")
          .attr("x1", x)
          .attr("x2", x + barWidth)
          .attr("y1", yScaleBar(userKantoor[d.maand]))
          .attr("y2", yScaleBar(userKantoor[d.maand]))
          .attr("stroke", "#264653")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4 4");
      }
    });

    // Temperatuur Lijn (D3 Line)
    const tempLine = d3.line()
      .x(d => xScale(d.maand) + xScale.bandwidth() / 2)
      .y(d => yScaleTemp(d.temp))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(initialData)
      .attr("fill", "none")
      .attr("stroke", "#e63946")
      .attr("stroke-width", 3)
      .attr("d", tempLine);

    // Temperatuur Datapunten (Cirkels)
    g.selectAll(".temp-point")
      .data(initialData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.maand) + xScale.bandwidth() / 2)
      .attr("cy", d => yScaleTemp(d.temp))
      .attr("r", 4)
      .attr("fill", "#e63946");

  }, [revealed, userKantoor]);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto', padding: '20px' }}>
      <h2>Datasnack: Hoe beïnvloedt het weer onze werkplek?</h2>
      <p>
        <strong>Hoe werkt het?</strong> De maanden Jan–Apr staan vast. Sleep de witte knoppen voor Mei t/m Dec om te voorspellen hoeveel procent van de collega's die maand op <strong>Kantoor (Oranje)</strong> of <strong>Thuis (Groen)</strong> werkt.
      </p>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', fontSize: '14px' }}>
        <span style={{ color: '#f4a261', fontWeight: 'bold' }}>■ % Kantoor</span>
        <span style={{ color: '#2a9d8f', fontWeight: 'bold' }}>■ % Thuis</span>
        <span style={{ color: '#e63946', fontWeight: 'bold' }}>━ Temp (°C)</span>
      </div>

      {/* SVG Container */}
      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '10px' }}>
        <svg ref={svgRef}></svg>
      </div>

      {/* Actie Knoppen & Conclusie */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {!revealed ? (
          <button 
            onClick={() => setRevealed(true)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#e76f51',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Onthul de werkelijkheid!
          </button>
        ) : (
          <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '5px' }}>
            <h3>Het Airco-effect! ❄️</h3>
            <p>
              Zag je dat niet aankomen? In de hete zomermaanden (Juli & Augustus) schiet de kantoorbezetting juist omhoog naar meer dan 80%.
              Wanneer de temperatuur thuis boven de 25°C stijgt, verhuizen we massaal naar het kantoor voor de airconditioning!
            </p>
            <button 
              onClick={() => setRevealed(false)}
              style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}
            >
              Opnieuw proberen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Tips voor GitHub Copilot Prompts in VS Code

Als je deze code in VS Code opent met GitHub Copilot, kun je onderstaande prompts gebruiken in de Chat panel om het verder uit te breiden:

* **Styling verfijnen:**
  `"Voeg Tailwind CSS klassen toe aan AircoEffectChart.jsx om de layout strakker te maken."`
* **Animaties toevoegen met D3:**
  `"Voeg een D3 transition toe aan de staven in AircoEffectChart.jsx zodat ze vloeiend naar de echte waarden animeren wanneer revealed true wordt."`
* **Tooltip toevoegen:**
  `"Voeg een hover tooltip toe aan de temperatuurpunten die de exacte temperatuur en het percentage laat zien."`