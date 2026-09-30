import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { data } from './data.js';

const COLORS = {
  kantoor: '#ea5b1b',
  kantoorEdge: '#c2470f',
  thuis: '#3ab5a7',
  temp: '#4e2680',
  prediction: '#4a4b4b',
  grid: '#e6e1ee',
  text: '#4a4b4b',
  muted: '#8c8c8c',
};

// Meet alleen de breedte live mee (responsive), lus-veilig via rAF.
function useResizeObserver(ref) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      setWidth((prev) => (prev === w ? prev : w));
    };
    measure(); // meteen meten, nooit op 0 blijven hangen
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [ref]);
  return width;
}

export default function AircoEffectChart() {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const containerWidth = useResizeObserver(wrapperRef);

  const [revealed, setRevealed] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  // Door de gebruiker voorspelde kantoor-percentages (interactieve maanden starten op 50%).
  const [userKantoor, setUserKantoor] = useState(() => {
    const init = {};
    data.forEach((d) => {
      init[d.maand] = d.interactief ? 50 : d.kantoorEcht;
    });
    return init;
  });

  const reset = () => {
    setRevealed(false);
    setHasDragged(false);
    setTooltip(null);
    const init = {};
    data.forEach((d) => {
      init[d.maand] = d.interactief ? 50 : d.kantoorEcht;
    });
    setUserKantoor(init);
  };

  // Hoe goed was de voorspelling? Gemiddelde afwijking + een vlotte comment.
  const feedback = useMemo(() => {
    const months = data.filter((d) => d.interactief);
    const totErr = months.reduce(
      (sum, d) => sum + Math.abs(userKantoor[d.maand] - d.kantoorEcht),
      0
    );
    const avg = Math.round(totErr / months.length);
    if (avg <= 6)
      return { avg, tone: 'great', title: 'Scherpschutter! 🎯', sub: 'Je zat er bovenop.' };
    if (avg <= 12)
      return { avg, tone: 'good', title: 'Lekker dichtbij!', sub: 'Net niet helemaal.' };
    if (avg <= 22)
      return { avg, tone: 'meh', title: 'Redelijk gegokt', sub: 'Maar de zomer verraste je.' };
    return { avg, tone: 'off', title: 'Mijlenver ernaast! 😅', sub: 'De data had heel andere plannen.' };
  }, [userKantoor]);

  // Responsieve afmetingen afgeleid van de containerbreedte.
  const dims = useMemo(() => {
    const width = Math.max(containerWidth || 0, 280);
    const isNarrow = width < 520;
    const height = Math.round(Math.min(Math.max(width * 0.62, 300), 460));
    const margin = {
      top: 22,
      right: isNarrow ? 40 : 54,
      left: isNarrow ? 38 : 48,
      bottom: 34,
    };
    return { width, height, margin, isNarrow };
  }, [containerWidth]);

  useEffect(() => {
    if (!svgRef.current || dims.width < 280) return;

    const { width, height, margin, isNarrow } = dims;
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Schalen
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.maand))
      .range([0, innerW])
      .padding(0.28);

    const yScaleBar = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);
    const yScaleTemp = d3.scaleLinear().domain([0, 30]).range([innerH, 0]);

    // Horizontale gridlijnen
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScaleBar.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', (d) => yScaleBar(d))
      .attr('y2', (d) => yScaleBar(d))
      .attr('stroke', COLORS.grid)
      .attr('stroke-width', 1);

    // X-as
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickSize(0).tickPadding(8))
      .call((sel) => sel.select('.domain').attr('stroke', COLORS.muted))
      .selectAll('text')
      .style('font-size', isNarrow ? '10px' : '12px')
      .style('fill', COLORS.text);

    // Linker Y-as (percentages)
    g.append('g')
      .call(
        d3
          .axisLeft(yScaleBar)
          .ticks(5)
          .tickSize(0)
          .tickPadding(6)
          .tickFormat((d) => d + '%')
      )
      .call((sel) => sel.select('.domain').remove())
      .selectAll('text')
      .style('font-size', isNarrow ? '10px' : '11px')
      .style('fill', COLORS.muted);

    // Rechter Y-as (temperatuur)
    g.append('g')
      .attr('transform', `translate(${innerW},0)`)
      .call(
        d3
          .axisRight(yScaleTemp)
          .ticks(5)
          .tickSize(0)
          .tickPadding(6)
          .tickFormat((d) => d + '°')
      )
      .call((sel) => sel.select('.domain').remove())
      .selectAll('text')
      .style('font-size', isNarrow ? '10px' : '11px')
      .style('fill', COLORS.temp);

    // Scheidingslijn tussen vaste maanden (Jan–Apr) en het interactieve deel
    const dividerX = xScale('Mei') - xScale.step() * xScale.paddingInner() * 0.5;
    g.append('line')
      .attr('x1', dividerX)
      .attr('x2', dividerX)
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', COLORS.muted)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4')
      .attr('opacity', 0.6);

    // Tooltip helpers
    const showTip = (event, html) => {
      const [mx, my] = d3.pointer(event, svgRef.current);
      setTooltip({ x: mx, y: my, html });
    };
    const hideTip = () => setTooltip(null);

    // Staven per maand
    data.forEach((d) => {
      const x = xScale(d.maand);
      const bw = xScale.bandwidth();
      const targetKantoor = revealed ? d.kantoorEcht : userKantoor[d.maand];
      const startKantoor = userKantoor[d.maand];

      const group = g.append('g');

      // Kantoor (boven)
      const kantoorRect = group
        .append('rect')
        .attr('x', x)
        .attr('width', bw)
        .attr('rx', 3)
        .attr('fill', COLORS.kantoor);

      // Thuis (onder)
      const thuisRect = group
        .append('rect')
        .attr('x', x)
        .attr('width', bw)
        .attr('rx', 3)
        .attr('fill', COLORS.thuis);

      const setBar = (kantoorPct) => {
        const thuisPct = 100 - kantoorPct;
        kantoorRect
          .attr('y', yScaleBar(100))
          .attr('height', innerH - yScaleBar(kantoorPct));
        thuisRect
          .attr('y', yScaleBar(thuisPct))
          .attr('height', innerH - yScaleBar(thuisPct));
      };

      if (revealed && d.interactief) {
        // Animeer van voorspelling naar echte waarde
        setBar(startKantoor);
        const t = d3.transition().duration(900).ease(d3.easeCubicInOut);
        kantoorRect
          .transition(t)
          .attr('y', yScaleBar(100))
          .attr('height', innerH - yScaleBar(targetKantoor));
        thuisRect
          .transition(t)
          .attr('y', yScaleBar(100 - targetKantoor))
          .attr('height', innerH - yScaleBar(100 - targetKantoor));
      } else {
        setBar(targetKantoor);
      }

      // Hover-tooltip op de staven
      group
        .selectAll('rect')
        .on('mousemove', (event) =>
          showTip(
            event,
            `<strong>${d.maand}</strong><br/>` +
              `Kantoor: ${Math.round(targetKantoor)}%<br/>` +
              `Thuis: ${Math.round(100 - targetKantoor)}%`
          )
        )
        .on('mouseleave', hideTip);

      // Sleepbare handle voor interactieve maanden (vóór onthullen)
      if (d.interactief && !revealed) {
        const yBoundary = yScaleBar(100 - targetKantoor);
        const handle = group
          .append('g')
          .style('cursor', 'row-resize')
          .attr('touch-action', 'none');

        handle
          .append('line')
          .attr('x1', x - 2)
          .attr('x2', x + bw + 2)
          .attr('y1', yBoundary)
          .attr('y2', yBoundary)
          .attr('stroke', COLORS.kantoorEdge)
          .attr('stroke-width', 3)
          .attr('stroke-linecap', 'round');

        handle
          .append('circle')
          .attr('cx', x + bw / 2)
          .attr('cy', yBoundary)
          .attr('r', dims.isNarrow ? 9 : 8)
          .attr('fill', '#ffffff')
          .attr('stroke', COLORS.kantoorEdge)
          .attr('stroke-width', 3);

        // Onzichtbaar breder trefvlak voor makkelijker (touch) slepen
        handle
          .append('rect')
          .attr('x', x)
          .attr('y', yBoundary - 14)
          .attr('width', bw)
          .attr('height', 28)
          .attr('fill', 'transparent');

        const drag = d3
          .drag()
          .container(() => svgRef.current)
          .on('start', () => setTooltip(null))
          .on('drag', (event) => {
            // container = stabiele svg-node, dus corrigeer voor de margin-offset
            const localY = event.y - margin.top;
            const newY = Math.max(0, Math.min(innerH, localY));
            const pct = 100 - Math.round(yScaleBar.invert(newY));
            setHasDragged(true);
            setUserKantoor((prev) => ({ ...prev, [d.maand]: pct }));
          });

        handle.call(drag);
      }

      // Na onthullen: toon jouw voorspelling + het verschil met de werkelijkheid
      if (revealed && d.interactief) {
        const yPred = yScaleBar(100 - startKantoor);
        const yReal = yScaleBar(100 - d.kantoorEcht);
        const gapTop = Math.min(yPred, yReal);
        const gapH = Math.abs(yPred - yReal);
        const delta = Math.abs(startKantoor - d.kantoorEcht);

        // Gearceerd vlak = het verschil tussen voorspelling en werkelijkheid
        group
          .append('rect')
          .attr('x', x)
          .attr('width', bw)
          .attr('y', gapTop)
          .attr('height', gapH)
          .attr('fill', COLORS.prediction)
          .attr('opacity', 0)
          .transition()
          .delay(650)
          .duration(400)
          .attr('opacity', 0.16);

        // Stippellijn: jouw voorspelling
        group
          .append('line')
          .attr('x1', x - 3)
          .attr('x2', x + bw + 3)
          .attr('y1', yPred)
          .attr('y2', yPred)
          .attr('stroke', COLORS.prediction)
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '5 4')
          .attr('stroke-linecap', 'round')
          .attr('opacity', 0)
          .transition()
          .delay(700)
          .duration(400)
          .attr('opacity', 1);

        // Klein verschil-label bij grotere afwijkingen
        if (delta >= 8) {
          group
            .append('text')
            .attr('x', x + bw / 2)
            .attr('y', gapTop + gapH / 2 + 4)
            .attr('text-anchor', 'middle')
            .style('font-size', isNarrow ? '9px' : '11px')
            .style('font-weight', '700')
            .style('fill', COLORS.prediction)
            .style('pointer-events', 'none')
            .attr('opacity', 0)
            .text(`${delta}%`)
            .transition()
            .delay(900)
            .duration(300)
            .attr('opacity', 0.85);
        }
      }
    });

    // Temperatuurlijn
    const tempLine = d3
      .line()
      .x((d) => xScale(d.maand) + xScale.bandwidth() / 2)
      .y((d) => yScaleTemp(d.temp))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', COLORS.temp)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('d', tempLine);

    g.selectAll('.temp-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'temp-point')
      .attr('cx', (d) => xScale(d.maand) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScaleTemp(d.temp))
      .attr('r', 4)
      .attr('fill', '#fff')
      .attr('stroke', COLORS.temp)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) =>
        showTip(event, `<strong>${d.maand}</strong><br/>${d.temp} °C`)
      )
      .on('mouseleave', hideTip);

    // "Sleep hier" hint bij de eerste interactieve maand
    if (!revealed && !hasDragged) {
      const hintX = xScale('Mei') + xScale.bandwidth() / 2;
      g.append('text')
        .attr('x', hintX)
        .attr('y', yScaleBar(50) - 22)
        .attr('text-anchor', 'middle')
        .style('font-size', isNarrow ? '11px' : '13px')
        .style('font-style', 'italic')
        .style('font-weight', '600')
        .style('fill', COLORS.kantoorEdge)
        .style('pointer-events', 'none')
        .text('Sleep ↕');
    }
  }, [dims, revealed, userKantoor, hasDragged]);

  return (
    <div className="chart-card">
      <header className="chart-header">
        <p className="eyebrow">aaff · Datasnack</p>
        <h1>Hoe beïnvloedt het weer onze werkplek?</h1>
        <p className="intro">
          De maanden <strong>Jan–Apr</strong> staan vast. Sleep de knoppen voor{' '}
          <strong>Mei t/m Dec</strong> om te voorspellen hoeveel procent van de
          collega's die maand op{' '}
          <span className="tag tag-kantoor">kantoor</span> of{' '}
          <span className="tag tag-thuis">thuis</span> werkt.
        </p>
      </header>

      <div className="legend">
        <span className="legend-item">
          <span className="swatch swatch-kantoor" /> % Kantoor
        </span>
        <span className="legend-item">
          <span className="swatch swatch-thuis" /> % Thuis
        </span>
        <span className="legend-item">
          <span className="swatch swatch-temp" /> Temperatuur (°C)
        </span>
        {revealed && (
          <span className="legend-item">
            <span className="swatch swatch-prediction" /> Jouw voorspelling
          </span>
        )}
      </div>

      <div className="chart-wrapper" ref={wrapperRef}>
        <svg ref={svgRef} role="img" aria-label="You draw it: werkplekverdeling per maand" />
        {tooltip && (
          <div
            className="tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
            dangerouslySetInnerHTML={{ __html: tooltip.html }}
          />
        )}
        {revealed && (
          <div className={`callout callout--${feedback.tone}`}>
            <span className="callout-title">{feedback.title}</span>
            <span className="callout-sub">
              Gemiddeld <strong>{feedback.avg} procentpunt</strong> ernaast. {feedback.sub}
            </span>
          </div>
        )}
      </div>

      <div className="controls">
        {!revealed ? (
          <button className="btn btn-primary" onClick={() => setRevealed(true)}>
            Onthul de werkelijkheid!
          </button>
        ) : (
          <button className="btn" onClick={reset}>
            Opnieuw proberen
          </button>
        )}
      </div>

      {revealed && (
        <div className="conclusion">
          <h2>Het Airco-effect ❄️</h2>
          <p>
            Zag je dat aankomen? In de hete zomermaanden (juli &amp; augustus)
            schiet de kantoorbezetting juist omhoog naar meer dan 80%. Zodra het
            thuis boven de 25 °C wordt, verhuizen we massaal naar kantoor — voor
            de <strong>airconditioning</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
