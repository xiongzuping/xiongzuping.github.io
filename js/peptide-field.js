/*
 * Peptide field — a conceptual, residue-scale illustration for an academic homepage.
 * GQNVKST, KVSNQGT and NQGSVKT are illustrative sequence labels, not experimental claims.
 * Beads represent amino-acid residues; curved links represent a schematic backbone.
 * Dashes indicate proximity-based intermolecular contacts, NOT assigned hydrogen bonds.
 * Color/intensity communicate an illustrative proximity–emission relationship. They are
 * not measured spectra, a prediction for these sequences, or molecular-dynamics results.
 * Each peptide moves as one rigid object; its local curve and residue order stay fixed.
 */
(function () {
  'use strict';
  const canvas = document.getElementById('peptide-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const pauseButton = document.getElementById('field-pause');
  const replayButton = document.getElementById('field-replay');
  const phaseLabel = document.getElementById('field-phase');
  const intensityLabel = document.getElementById('field-intensity');
  const emissionMeter = document.getElementById('field-emission');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sequences = ['GQNVKST', 'KVSNQGT', 'NQGSVKT'];
  const motifColors = [[32, 215, 255], [137, 105, 255], [225, 143, 255]];
  const colors = [[19, 186, 255], [90, 103, 255], [176, 108, 255], [211, 231, 255]];
  const glowCache = [];
  const atoms = [];
  let width = 1440, height = 900, dpr = 1, mobile = false;
  let elapsed = motionQuery.matches ? 8 : 0.8;
  let paused = motionQuery.matches;
  let raf = 0, previousTime = 0, previousDraw = 0;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  let lastPhase = '';
  let lastIntensity = '';
  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const ease = (v) => { const t = clamp(v); return t * t * (3 - 2 * t); };
  const blend = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const multiply = (c, v) => c.map((n) => Math.round(clamp(n * v, 0, 255)));
  const emissionColor = (proximity) => {
    const position = clamp(proximity) * (colors.length - 1);
    const index = Math.min(colors.length - 2, Math.floor(position));
    return blend(colors[index], colors[index + 1], position - index);
  };
  function random(index) {
    const value = Math.sin(index * 127.1 + 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }

  // Pre-render bloom into small reusable textures. No per-frame shadowBlur operations.
  for (let i = 0; i < 25; i++) {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 128;
    const sc = sprite.getContext('2d');
    if (!sc) continue;
    const color = emissionColor(i / 24);
    const gradient = sc.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, rgba(color, 0.78));
    gradient.addColorStop(0.1, rgba(color, 0.64));
    gradient.addColorStop(0.32, rgba(color, 0.23));
    gradient.addColorStop(0.64, rgba(color, 0.055));
    gradient.addColorStop(1, rgba(color, 0));
    sc.fillStyle = gradient;
    sc.fillRect(0, 0, 128, 128);
    glowCache.push(sprite);
  }
  for (let i = 0; i < 44; i++) atoms.push({
    x: random(i + 1), y: random(i + 120), z: random(i + 260), phase: random(i + 440) * Math.PI * 2
  });
  const localChains = [0, 1, 2].map((variant) => Array.from({ length: 7 }, (_, i) => {
    const parameter = i / 6;
    return [
      (parameter - 0.5) * 240,
      Math.sin(parameter * Math.PI * 1.85 + variant * 0.65) * 22,
      Math.cos(parameter * Math.PI * 1.65 + variant * 0.65) * 24
    ];
  }));

  function bloom(x, y, radius, proximity, opacity) {
    if (!glowCache.length || opacity < 0.002) return;
    const image = glowCache[Math.round(clamp(proximity) * (glowCache.length - 1))];
    ctx.globalAlpha = opacity;
    ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = 1;
  }

  function makeCluster(index) {
    const small = index !== 0;
    const baseScale = mobile ? Math.min(width / 400, 1.04) : Math.min(width / 720, height / 470, 2.1);
    const scale = baseScale * (small ? (mobile ? (index === 1 ? 0.44 : 0.40) : (index === 1 ? 0.28 : 0.25)) : 1);
    const centers = mobile ? [[0.50, 0.60], [0.05, 0.90], [0.97, 0.20]] : [[0.74, 0.45], [0.18, 0.76], [0.91, 0.87]];
    const cx = centers[index][0] * width + pointerX * (small ? 2 : 9);
    const cy = centers[index][1] * height + pointerY * (small ? 2 : 7);
    const cycle = ((elapsed + index * 5.9) % 18);
    const approach = ease((cycle - 1.0) / 5.3) * (1 - ease((cycle - 10.6) / 5.3));
    const separation = 62 + 104 * (1 - approach);
    const angle = (mobile ? -0.54 : -0.27) + Math.sin(elapsed * 0.12 + index) * 0.045;
    const co = Math.cos(angle), si = Math.sin(angle);
    const tilt = 0.33 + Math.sin(elapsed * 0.10 + index) * 0.045;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const groups = [];
    const alpha = small ? (mobile ? 0.12 : index === 1 ? 0.15 : 0.26) : 1;
    for (let side = 0; side < 2; side++) {
      const variant = (index + side) % 3;
      const sequence = sequences[variant];
      const sign = side === 0 ? -1 : 1;
      const drift = Math.sin(elapsed * 0.24 + side * 1.9 + index) * 4;
      const world = localChains[variant].map(([x, y, z]) => [
        x + sign * 7 + drift,
        y * (side === 0 ? 1 : -1) + sign * separation / 2,
        z * (side === 0 ? 1 : -1) + sign * 8
      ]);
      const points = world.map(([x, y, z]) => {
        const yt = y * ct - z * st, zt = y * st + z * ct;
        const xr = x * co - yt * si, yr = x * si + yt * co;
        const perspective = 700 / (700 - zt);
        return { x: cx + xr * scale * perspective, y: cy + yr * scale * perspective, z: zt, perspective };
      });
      groups.push({ points, world, variant, sequence, side });
    }
    let minDistance = Infinity;
    const candidates = [];
    groups[0].world.forEach((a, ai) => {
      groups[1].world.forEach((b, bi) => {
        const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        minDistance = Math.min(minDistance, distance);
        if (distance < 66) candidates.push({ ai, bi, distance });
      });
    });
    // Contacts and light depend on the actual distance of the rigidly moving strands.
    const proximity = ease((86 - minDistance) / 63);
    const contacts = [];
    const usedA = new Set(), usedB = new Set();
    candidates.sort((a, b) => a.distance - b.distance);
    candidates.forEach((pair) => {
      if (usedA.has(pair.ai) || usedB.has(pair.bi) || contacts.length >= 5) return;
      usedA.add(pair.ai); usedB.add(pair.bi); contacts.push(pair);
    });
    return { index, groups, contacts, proximity, cx, cy, scale, alpha };
  }

  function drawContact(cluster, contact, color) {
    const a = cluster.groups[0].points[contact.ai], b = cluster.groups[1].points[contact.bi];
    const strength = ease((66 - contact.distance) / 38);
    ctx.strokeStyle = rgba(blend(color, [225, 240, 250], 0.42), strength * cluster.alpha * 0.9);
    ctx.lineWidth = Math.max(0.85, cluster.scale * 1.2);
    ctx.setLineDash([2.7 * cluster.scale, 5.1 * cluster.scale]);
    ctx.lineDashOffset = -elapsed * 2.3;
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const padding = Math.min(0.42, 11.8 * cluster.scale / length);
    ctx.beginPath();
    ctx.moveTo(a.x + (b.x - a.x) * padding, a.y + (b.y - a.y) * padding);
    ctx.lineTo(b.x - (b.x - a.x) * padding, b.y - (b.y - a.y) * padding); ctx.stroke();
    ctx.setLineDash([]);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    bloom(mx, my, 44 * cluster.scale, cluster.proximity, strength * cluster.alpha * 0.7);
  }

  function tubePath(points, start, offset = 0) {
    // The curve is a residue-level backbone guide, never an atomistic bond diagram.
    const a = points[Math.max(0, start - 1)], b = points[start];
    const c = points[start + 1], d = points[Math.min(points.length - 1, start + 2)];
    ctx.beginPath();
    ctx.moveTo(b.x + offset, b.y + offset);
    ctx.bezierCurveTo(b.x + (c.x - a.x) / 6 + offset, b.y + (c.y - a.y) / 6 + offset,
      c.x - (d.x - b.x) / 6 + offset, c.y - (d.y - b.y) / 6 + offset, c.x + offset, c.y + offset);
  }

  function drawCluster(cluster) {
    const { groups, scale, alpha, proximity } = cluster;
    const light = emissionColor(proximity);
    bloom(cluster.cx, cluster.cy, (130 + proximity * 70) * scale, proximity, alpha * (0.025 + proximity * 0.30));
    const objects = [];
    for (const strand of groups) {
      for (let i = 0; i < strand.points.length - 1; i++) objects.push({
        type: 'tube', strand, i, depth: (strand.points[i].z + strand.points[i + 1].z) / 2
      });
      strand.points.forEach((point, i) => objects.push({ type: 'bead', strand, i, point, depth: point.z + 3 }));
    }
    objects.sort((a, b) => a.depth - b.depth);
    ctx.lineCap = 'round';
    for (const object of objects) {
      const front = clamp((object.depth + 72) / 144);
      const material = blend(motifColors[object.strand.variant], light, proximity * 0.57);
      const color = multiply(material, 0.72 + front * 0.28);
      if (object.type === 'tube') {
        ctx.strokeStyle = rgba(multiply(color, 0.24), alpha);
        ctx.lineWidth = scale * 6.6;
        tubePath(object.strand.points, object.i); ctx.stroke();
        const a = object.strand.points[object.i], b = object.strand.points[object.i + 1];
        const gradient = ctx.createLinearGradient(a.x - 2, a.y - 2, b.x + 2, b.y + 2);
        gradient.addColorStop(0, rgba(multiply(color, 0.6), alpha));
        gradient.addColorStop(0.5, rgba(blend(color, [235, 247, 252], 0.28), alpha));
        gradient.addColorStop(1, rgba(color, alpha));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = scale * 3.6;
        tubePath(object.strand.points, object.i, -0.6 * scale); ctx.stroke();
        ctx.strokeStyle = rgba(blend(color, [230, 247, 255], 0.58), alpha * (0.35 + 0.2 * proximity));
        ctx.lineWidth = scale * 0.8;
        tubePath(object.strand.points, object.i, -1.2 * scale); ctx.stroke();
      } else {
        const p = object.point;
        const radius = scale * (10.3 + (object.i % 3) * 0.55) * p.perspective;
        bloom(p.x, p.y, radius * (3.5 + proximity * 3), proximity,
          alpha * (0.025 + proximity * proximity * 0.66));
        // Three-dimensional shaded sphere with a small off-axis specular highlight.
        const gradient = ctx.createRadialGradient(p.x - radius * 0.34, p.y - radius * 0.39, radius * 0.04,
          p.x + radius * 0.12, p.y + radius * 0.13, radius * 1.12);
        gradient.addColorStop(0, rgba(blend(color, [250, 255, 255], 0.79), alpha));
        gradient.addColorStop(0.18, rgba(blend(color, [232, 250, 255], 0.18 + proximity * 0.34), alpha));
        gradient.addColorStop(0.48, rgba(color, alpha));
        gradient.addColorStop(0.82, rgba(multiply(color, 0.37), alpha));
        gradient.addColorStop(1, rgba(multiply(color, 0.12), alpha));
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = rgba(blend(color, [230, 248, 255], 0.3), alpha * 0.32);
        ctx.lineWidth = 0.6 * scale; ctx.stroke();
        if (cluster.index === 0 && scale > 0.65) {
          ctx.fillStyle = rgba([228, 247, 250], alpha * 0.9);
          ctx.font = `600 ${Math.max(9, scale * 8.8)}px Arial,sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(object.strand.sequence[object.i], p.x + 0.5, p.y + 1.1 * scale);
        }
      }
    }
    // Surface-trimmed contact dashes stay legible without drawing through residue centers.
    cluster.contacts.forEach((contact) => drawContact(cluster, contact, light));
    for (const strand of groups) {
      if (cluster.index !== 0) continue;
      const first = strand.points[0];
      const offsetY = strand.side === 0 ? -32 * scale : 34 * scale;
      const labelX = clamp(first.x - 10 * scale, 26, width - 125);
      const labelY = clamp(first.y + offsetY, 30, height - 24);
      ctx.font = `500 ${Math.max(10, 10.5 * scale)}px 'Courier New',monospace`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba([199, 218, 232], alpha * 0.84);
      ctx.fillText(strand.sequence, labelX, labelY);
      ctx.fillStyle = rgba(motifColors[strand.variant], 0.9);
      ctx.beginPath(); ctx.arc(labelX - 9, labelY, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#030811'; ctx.fillRect(0, 0, width, height);
    const background = ctx.createRadialGradient(width * 0.76, height * 0.48, 5,
      width * 0.71, height * 0.5, Math.max(width, height) * 0.66);
    background.addColorStop(0, '#091a29');
    background.addColorStop(0.42, '#06111e');
    background.addColorStop(1, '#030811');
    ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
    for (const atom of atoms) {
      const x = atom.x * width + Math.sin(elapsed * 0.09 + atom.phase) * 15;
      const y = atom.y * height + Math.cos(elapsed * 0.07 + atom.phase) * 11;
      const textSafe = !mobile && atom.x < 0.5 ? 0.15 : 1;
      ctx.fillStyle = rgba([137, 183, 209], (0.035 + atom.z * 0.15) * textSafe);
      ctx.beginPath(); ctx.arc(x, y, 0.55 + atom.z * 0.65, 0, Math.PI * 2); ctx.fill();
    }
    const clusters = [makeCluster(0), makeCluster(1), makeCluster(2)];
    drawCluster(clusters[1]); drawCluster(clusters[2]); drawCluster(clusters[0]);
    // Desktop copy lives on the left. A soft vignette gives it a quiet reading surface.
    if (!mobile) {
      const quiet = ctx.createLinearGradient(0, 0, width * 0.57, 0);
      quiet.addColorStop(0, 'rgba(3,8,17,0.7)');
      quiet.addColorStop(0.76, 'rgba(3,8,17,0.36)');
      quiet.addColorStop(1, 'rgba(3,8,17,0)');
      ctx.fillStyle = quiet; ctx.fillRect(0, 0, width * 0.57, height);
    }
    const p = clusters[0].proximity;
    const phase = p < 0.14 ? 'dispersed' : p < 0.65 ? 'contact' : 'emissive';
    const intensity = p < 0.14 ? 'Low' : p < 0.65 ? 'Building' : 'Bright';
    canvas.dataset.ready = 'true';
    document.body.classList.add('field-ready');
    document.body.dataset.fieldPhase = phase;
    canvas.dataset.phase = phase;
    canvas.dataset.proximity = p.toFixed(3);
    if (phase !== lastPhase) {
      if (phaseLabel) phaseLabel.textContent = {
        dispersed: 'Dispersed peptides', contact: 'Intermolecular contacts', emissive: 'Collective emission'
      }[phase];
      lastPhase = phase;
    }
    if (intensity !== lastIntensity) {
      if (intensityLabel) intensityLabel.textContent = intensity;
      lastIntensity = intensity;
    }
    if (emissionMeter) emissionMeter.style.setProperty('--value', String(p));
  }

  function updateControls() {
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Play peptide field' : 'Pause peptide field');
    pauseButton.textContent = paused ? 'Play' : 'Pause';
  }
  function running() { return !paused && !document.hidden; }
  function frame(now) {
    raf = 0;
    if (!running()) { previousTime = 0; return; }
    if (previousTime) elapsed += Math.min((now - previousTime) / 1000, 0.08);
    previousTime = now;
    pointerX += (targetX - pointerX) * 0.025;
    pointerY += (targetY - pointerY) * 0.025;
    if (now - previousDraw >= (mobile ? 41 : 32)) { render(); previousDraw = now; }
    raf = requestAnimationFrame(frame);
  }
  function reconcile() {
    if (running() && !raf) { previousTime = 0; raf = requestAnimationFrame(frame); }
    else if (!running() && raf) { cancelAnimationFrame(raf); raf = 0; previousTime = 0; }
  }
  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    mobile = width < 760;
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    render();
  }
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => {
    if (mobile || event.pointerType === 'touch' || event.clientX < width * 0.48) {
      targetX = targetY = 0; return;
    }
    targetX = clamp((event.clientX / width - 0.74) * 3, -1, 1);
    targetY = clamp((event.clientY / height - 0.48) * 2, -1, 1);
  }, { passive: true });
  document.addEventListener('visibilitychange', reconcile);
  if (pauseButton) pauseButton.addEventListener('click', () => {
    paused = !paused; updateControls(); reconcile();
  });
  if (replayButton) replayButton.addEventListener('click', () => {
    elapsed = 0.8; paused = false; updateControls(); render(); reconcile();
  });
  function motionPreferenceChanged() {
    paused = motionQuery.matches;
    if (paused) elapsed = 8;
    updateControls(); render(); reconcile();
  }
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', motionPreferenceChanged);
  updateControls(); resize(); reconcile();
})();
