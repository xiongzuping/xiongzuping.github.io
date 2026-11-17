/*
 * Configuration explorer. All chemistry comes from window.INTERACTION_MODEL.
 * Two rigid copies of that model are shown; interactions are geometric candidates.
 * H-bond display filter: H...A <= 2.6 A, D...A <= 3.5 A, D-H...A >= 140 degrees.
 * Other N/O contacts: 2.7 <= distance <= 3.7 A, excluding assigned H-bond D/A pairs.
 * Intrachain candidates also exclude all covalent graph paths of three bonds or fewer.
 * Interactive rotation is limited at 0.75 of summed van der Waals screening radii,
 * except geometrically assigned H...A pairs, whose minimum displayed distance is 1.6 A.
 * These are explicit visualization filters, not energies, proof of bonding, or spectra.
 * Bloom is artistic. Independent contact counts are never normalized to sum to one.
 * Pose convention: XYZ Euler radians, applied X then Y then Z about the origin,
 * followed by translation; interpolation uses quaternion slerp to preserve rigidity.
 */
(function () {
  'use strict';
  const model = window.INTERACTION_MODEL;
  const canvas = document.getElementById('peptide-field');
  const viewport = document.getElementById('interaction-window');
  if (!model || !canvas || !viewport || !Array.isArray(model.atoms) || !model.atoms.length) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const subtract = (a, b) => a.map((v, i) => v - b[i]);
  const dot = (a, b) => a.reduce((v, x, i) => v + x * b[i], 0);
  const length = (v) => Math.hypot(...v);
  const distance = (a, b) => length(subtract(a, b));
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const rgb = (c, a = 1) => `rgba(${c.map(Math.round).join(',')},${a})`;
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const shade = (a, s) => a.map((v) => clamp(v * s, 0, 255));
  const palette = { C: [134, 153, 174], N: [60, 133, 249], O: [242, 76, 91], H: [225, 232, 241], S: [237, 193, 73] };
  const names = { C: 'Carbon', N: 'Nitrogen', O: 'Oxygen', H: 'Hydrogen', S: 'Sulfur' };
  const numbers = { 1: 'H', 6: 'C', 7: 'N', 8: 'O', 16: 'S' };
  const colorHB = [86, 224, 255], colorContact = [178, 122, 255];
  const vdw = { H: 1.20, C: 1.70, N: 1.55, O: 1.52, S: 1.80 };
  let atoms, indexById, bonds, donors, acceptors, contacts, poses, residues, closeGraph;
  function quaternionMultiply(a, b) {
    return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
      a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
      a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
  }
  function fromEuler([x, y, z]) {
    const qx = [Math.sin(x / 2), 0, 0, Math.cos(x / 2)];
    const qy = [0, Math.sin(y / 2), 0, Math.cos(y / 2)];
    const qz = [0, 0, Math.sin(z / 2), Math.cos(z / 2)];
    return quaternionMultiply(qz, quaternionMultiply(qy, qx));
  }
  function rotate(v, q) {
    const cross = [q[1] * v[2] - q[2] * v[1], q[2] * v[0] - q[0] * v[2], q[0] * v[1] - q[1] * v[0]];
    const cross2 = [q[1] * cross[2] - q[2] * cross[1], q[2] * cross[0] - q[0] * cross[2], q[0] * cross[1] - q[1] * cross[0]];
    return v.map((x, i) => x + 2 * (q[3] * cross[i] + cross2[i]));
  }
  function slerp(a, b, t) {
    let cosine = dot(a, b), target = b;
    if (cosine < 0) { target = b.map((v) => -v); cosine = -cosine; }
    if (cosine > 0.9995) {
      const q = lerp(a, target, t), norm = length(q);
      return q.map((v) => v / norm);
    }
    const angle = Math.acos(clamp(cosine, -1, 1));
    const denominator = Math.sin(angle);
    return a.map((v, i) => (v * Math.sin((1 - t) * angle) + target[i] * Math.sin(t * angle)) / denominator);
  }
  try {
    atoms = model.atoms.map((a) => ({ id: a.id, element: numbers[a.element] || a.element, xyz: a.xyz.map(Number), role: a.role || (model.atomRoles || model.atomroles || {})[a.id] || '' }));
    if (atoms.some((a) => a.xyz.length !== 3 || a.xyz.some((v) => !Number.isFinite(v)))) return;
    indexById = new Map(atoms.map((a, i) => [String(a.id), i]));
    if (indexById.size !== atoms.length) return;
    const getIndex = (id) => {
      const index = indexById.get(String(id));
      if (index === undefined) throw new Error('Unknown atom id');
      return index;
    };
    bonds = (model.bonds || []).map((b) => ({ a: getIndex(b.a), b: getIndex(b.b), order: Number(b.order) || 1 }));
    const adjacency = atoms.map(() => []);
    bonds.forEach(({ a, b }) => { adjacency[a].push(b); adjacency[b].push(a); });
    // Never classify 1–2, 1–3 or 1–4 covalent neighbours as nonbonded intrachain contacts.
    closeGraph = atoms.map((_, start) => {
      const seen = new Set([start]); let frontier = [start];
      for (let depth = 0; depth < 3; depth++) {
        const next = [];
        frontier.forEach((node) => adjacency[node].forEach((neighbour) => {
          if (!seen.has(neighbour)) { seen.add(neighbour); next.push(neighbour); }
        }));
        frontier = next;
      }
      return seen;
    });
    donors = (model.donors || []).map(([d, h]) => [getIndex(d), getIndex(h)]);
    acceptors = (model.acceptors || []).map(getIndex);
    contacts = (model.contacts || []).map(getIndex).filter((i) => ['N', 'O'].includes(atoms[i].element));
    poses = (model.poses || []).map((p) => ({ q: fromEuler(p.rotation || [0, 0, 0]), translation: p.translation || [0, 0, 0] }));
    residues = (model.residues || []).map((r) => ({ name: String(r.name), index: r.index, indices: r.atomIds.map(getIndex) }));
    if (poses.length < 2 || poses.some((p) => [...p.q, ...p.translation].some((v) => !Number.isFinite(v)))) return;
  } catch (_) { return; }

  const slider = document.getElementById('arrangement-range');
  const output = document.getElementById('arrangement-output');
  const phaseLabel = document.getElementById('field-phase');
  const hbLabel = document.getElementById('hbond-count');
  const contactLabel = document.getElementById('contact-count');
  const inspector = document.getElementById('atom-inspector');
  const limitNotice = document.getElementById('interaction-limit');
  const pauseButton = document.getElementById('field-pause');
  const replayButton = document.getElementById('field-replay');
  const modeButtons = [...document.querySelectorAll('[data-lab-mode]')];
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const centroid = atoms.reduce((sum, a) => add(sum, a.xyz.map((v) => v / atoms.length)), [0, 0, 0]);
  let camera = fromEuler([-0.9875, 0.1092, -0.2084]);
  let arrangement = 0, mode = 'auto', elapsed = 0, dragRotation = 0;
  let paused = motionQuery.matches, raf = 0, lastTime = 0, lastDraw = 0;
  let width = 1440, height = 900, dpr = 1;
  let pointer = null, selectedAtom = null, hitAtoms = [], state = null, lastStatus = '';
  let clashLimited = false;
  let currentRect = null;

  function poseAt(value) {
    const position = clamp(value / 100) * (poses.length - 1);
    const index = Math.min(poses.length - 2, Math.floor(position));
    const t = position - index;
    return { q: slerp(poses[index].q, poses[index + 1].q, t), translation: lerp(poses[index].translation, poses[index + 1].translation, t) };
  }
  function transform(value, yaw) {
    const pose = poseAt(value);
    const center = add(rotate(centroid, pose.q), pose.translation);
    const drag = fromEuler([0, yaw, 0]);
    return [atoms.map((a) => a.xyz.slice()), atoms.map((a) => {
      const world = add(rotate(a.xyz, pose.q), pose.translation);
      return add(rotate(subtract(world, center), drag), center);
    })];
  }
  function contactKey(copyA, a, copyB, b) {
    const first = `${copyA}:${a}`, second = `${copyB}:${b}`;
    return first < second ? `${first}|${second}` : `${second}|${first}`;
  }
  function evaluate(molecules) {
    const hbonds = [], otherContacts = [], excluded = new Set();
    for (let donorCopy = 0; donorCopy < 2; donorCopy++) {
      for (let acceptorCopy = 0; acceptorCopy < 2; acceptorCopy++) {
       for (const [d, h] of donors) for (const a of acceptors) {
        if (donorCopy === acceptorCopy && closeGraph[d].has(a)) continue;
        const D = molecules[donorCopy][d], H = molecules[donorCopy][h], A = molecules[acceptorCopy][a];
        const hDistance = distance(H, A), dDistance = distance(D, A);
        const u = subtract(D, H), v = subtract(A, H);
        const denominator = length(u) * length(v);
        const angle = denominator ? Math.acos(clamp(dot(u, v) / denominator, -1, 1)) * 180 / Math.PI : 0;
        if (hDistance <= 2.6 && dDistance <= 3.5 && angle >= 140) {
          hbonds.push({ donorCopy, acceptorCopy, d, h, a, hDistance, dDistance, angle, scope: donorCopy === acceptorCopy ? 'intra' : 'inter' });
          excluded.add(contactKey(donorCopy, d, acceptorCopy, a));
        }
       }
      }
    }
    for (const a of contacts) for (const b of contacts) {
      const separation = distance(molecules[0][a], molecules[1][b]);
      if (separation >= 2.7 && separation <= 3.7 && !excluded.has(contactKey(0, a, 1, b))) otherContacts.push({ aCopy: 0, bCopy: 1, a, b, distance: separation, scope: 'inter' });
    }
    for (let copy = 0; copy < 2; copy++) {
      for (const a of contacts) for (const b of contacts) {
        if (a >= b || closeGraph[a].has(b)) continue;
        const separation = distance(molecules[copy][a], molecules[copy][b]);
        if (separation >= 2.7 && separation <= 3.7 && !excluded.has(contactKey(copy, a, copy, b))) {
          otherContacts.push({ aCopy: copy, bCopy: copy, a, b, distance: separation, scope: 'intra' });
        }
      }
    }
    return { molecules, hbonds, contacts: otherContacts };
  }
  function clashScreen(configuration) {
    const assignedHA = new Set(configuration.hbonds.filter((b) => b.scope === 'inter').map((b) => contactKey(b.donorCopy, b.h, b.acceptorCopy, b.a)));
    const clashes = [];
    atoms.forEach((a, ai) => atoms.forEach((b, bi) => {
      const separation = distance(configuration.molecules[0][ai], configuration.molecules[1][bi]);
      const minimum = assignedHA.has(contactKey(0, ai, 1, bi)) ? 1.6 : 0.75 * ((vdw[a.element] || 1.7) + (vdw[b.element] || 1.7));
      if (separation < minimum - 1e-6) clashes.push({ a: ai, b: bi, distance: separation, minimum });
    }));
    return clashes;
  }
  function tryRotation(target) {
    const start = dragRotation;
    if (clashScreen(evaluate(transform(arrangement, start))).length) { clashLimited = true; render(); return; }
    const difference = clamp(target - start, -0.6, 0.6);
    const steps = Math.max(1, Math.ceil(Math.abs(difference) / 0.045));
    let accepted = start; clashLimited = false;
    for (let step = 1; step <= steps; step++) {
      const trial = start + difference * step / steps;
      if (!clashScreen(evaluate(transform(arrangement, trial))).length) { accepted = trial; continue; }
      let safe = accepted, blocked = trial;
      for (let refinement = 0; refinement < 9; refinement++) {
        const middle = (safe + blocked) / 2;
        if (clashScreen(evaluate(transform(arrangement, middle))).length) blocked = middle;
        else safe = middle;
      }
      accepted = safe; clashLimited = true; break;
    }
    dragRotation = accepted; render();
  }

  // Stable bounds across all preset arrangements prevent a misleading zoom on approach.
  let center = [0, 0, 0], rangeX = 5, rangeY = 4.6;
  function frameCamera() {
    camera = fromEuler(width < 760 ? [0.51, -0.43, -0.12] : [-0.9875, 0.1092, -0.2084]);
    const boundPoints = [];
    for (let sample = 0; sample <= 40; sample++) {
      transform(sample * 2.5, 0).forEach((molecule) => molecule.forEach((p) => boundPoints.push(rotate(p, camera))));
    }
    const bounds = [0, 1, 2].map((axis) => [Math.min(...boundPoints.map((p) => p[axis])), Math.max(...boundPoints.map((p) => p[axis]))]);
    center = bounds.map(([lo, hi]) => (lo + hi) / 2);
    rangeX = Math.max(5, bounds[0][1] - bounds[0][0]);
    rangeY = Math.max(4.6, bounds[1][1] - bounds[1][0]);
  }
  const glowSprites = [colorHB, colorContact].map((color) => {
    const image = document.createElement('canvas'); image.width = image.height = 128;
    const gc = image.getContext('2d');
    if (!gc) return null;
    const gradient = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, rgb(color, 0.6)); gradient.addColorStop(0.18, rgb(color, 0.36));
    gradient.addColorStop(0.46, rgb(color, 0.1)); gradient.addColorStop(1, rgb(color, 0));
    gc.fillStyle = gradient; gc.fillRect(0, 0, 128, 128); return image;
  });
  function glow(x, y, radius, type, opacity) {
    const sprite = glowSprites[type]; if (!sprite) return;
    ctx.globalAlpha = opacity;
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = 1;
  }
  function drawCandidate(a, b, color, type, scale, strength) {
    const dx = b.x - a.x, dy = b.y - a.y, size = Math.hypot(dx, dy) || 1;
    const inset = Math.min(0.35, scale * 0.13 / size);
    glow((a.x + b.x) / 2, (a.y + b.y) / 2, Math.min(145, scale * 2.1), type, strength * 0.58);
    ctx.strokeStyle = rgb(color, 0.9); ctx.lineWidth = Math.max(1.2, Math.min(2, scale * 0.025));
    ctx.setLineDash(type === 0 ? [4, 5] : [1, 5]);
    ctx.beginPath(); ctx.moveTo(a.x + dx * inset, a.y + dy * inset);
    ctx.lineTo(b.x - dx * inset, b.y - dy * inset); ctx.stroke(); ctx.setLineDash([]);
  }
  function render() {
    state = evaluate(transform(arrangement, dragRotation));
    currentRect = viewport.getBoundingClientRect();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#030811'; ctx.fillRect(0, 0, width, height);
    const wash = ctx.createRadialGradient(width * 0.75, height * 0.45, 1, width * 0.75, height * 0.45, width * 0.75);
    wash.addColorStop(0, '#081a2a'); wash.addColorStop(0.55, '#05101d'); wash.addColorStop(1, '#030811');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, width, height);
    hitAtoms = [];
    const usable = currentRect.width > 0 && currentRect.height > 0 && currentRect.bottom > 0 && currentRect.top < height;
    if (usable) {
      const scale = Math.min((currentRect.width - 56) / (rangeX + 1.4), (currentRect.height - 64) / (rangeY + 1.3));
      const cx = currentRect.left + currentRect.width / 2, cy = currentRect.top + currentRect.height / 2;
      const project = (world) => {
        const p = rotate(world, camera);
        return { x: cx + (p[0] - center[0]) * scale, y: cy - (p[1] - center[1]) * scale, z: p[2] - center[2] };
      };
      const projected = state.molecules.map((molecule) => molecule.map(project));
      if (state.hbonds.length) glow(cx - 20, cy, Math.min(240, currentRect.width * 0.4), 0, Math.min(0.3, state.hbonds.length * 0.10));
      if (state.contacts.length) glow(cx + 24, cy, Math.min(220, currentRect.width * 0.38), 1, Math.min(0.3, state.contacts.length * 0.08));
      const objects = [];
      projected.forEach((molecule, copy) => {
        bonds.forEach((b) => objects.push({ type: 'bond', copy, bond: b, z: (molecule[b.a].z + molecule[b.b].z) / 2 }));
        molecule.forEach((p, index) => objects.push({ type: 'atom', copy, index, p, z: p.z + 0.02 }));
      });
      objects.sort((a, b) => a.z - b.z);
      ctx.lineCap = 'round';
      for (const object of objects) {
        if (object.type === 'bond') {
          const a = projected[object.copy][object.bond.a], b = projected[object.copy][object.bond.b];
          const dx = b.x - a.x, dy = b.y - a.y, size = Math.hypot(dx, dy) || 1;
          const offsets = object.bond.order === 2 ? [-0.065, 0.065] : object.bond.order === 3 ? [-0.10, 0, 0.10] : [0];
          const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          gradient.addColorStop(0.35, rgb(shade(palette[atoms[object.bond.a].element] || palette.C, 0.76)));
          gradient.addColorStop(0.65, rgb(shade(palette[atoms[object.bond.b].element] || palette.C, 0.76)));
          for (const offset of offsets) {
            const ox = -dy / size * offset * scale, oy = dx / size * offset * scale;
            ctx.strokeStyle = '#0b1320'; ctx.lineWidth = Math.max(2.4, scale * 0.061);
            ctx.beginPath(); ctx.moveTo(a.x + ox, a.y + oy); ctx.lineTo(b.x + ox, b.y + oy); ctx.stroke();
            ctx.strokeStyle = gradient; ctx.lineWidth = Math.max(1.1, scale * 0.036);
            ctx.beginPath(); ctx.moveTo(a.x + ox - 0.3, a.y + oy - 0.3); ctx.lineTo(b.x + ox - 0.3, b.y + oy - 0.3); ctx.stroke();
          }
        } else {
          const atom = atoms[object.index], p = object.p;
          const radius = clamp(scale * (atom.element === 'H' ? 0.12 : 0.21), atom.element === 'H' ? 2.7 : 4.8, atom.element === 'H' ? 8 : 15);
          const depth = clamp((p.z + 4) / 8);
          const color = shade(palette[atom.element] || palette.C, 0.77 + depth * 0.23);
          const gradient = ctx.createRadialGradient(p.x - radius * 0.35, p.y - radius * 0.38, 0.1, p.x, p.y, radius);
          gradient.addColorStop(0, rgb(mix(color, [255, 255, 255], 0.94)));
          gradient.addColorStop(0.12, rgb(mix(color, [230, 240, 255], 0.4)));
          gradient.addColorStop(0.29, rgb(mix(color, [230, 240, 255], 0.13)));
          gradient.addColorStop(0.63, rgb(color)); gradient.addColorStop(1, rgb(shade(color, 0.26)));
          ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = rgb(mix(color, [220, 238, 255], 0.3), 0.38); ctx.lineWidth = 0.65; ctx.stroke();
          if (selectedAtom && selectedAtom.copy === object.copy && selectedAtom.index === object.index) {
            ctx.strokeStyle = '#e2f5ff'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(p.x, p.y, radius + 4, 0, Math.PI * 2); ctx.stroke();
          }
          hitAtoms.push({ ...p, radius, copy: object.copy, index: object.index });
        }
      }
      state.hbonds.forEach((b) => drawCandidate(projected[b.donorCopy][b.h], projected[b.acceptorCopy][b.a], colorHB, 0, scale, 1));
      state.contacts.forEach((c) => drawCandidate(projected[c.aCopy][c.a], projected[c.bCopy][c.b], colorContact, 1, scale, c.scope === 'intra' ? 0.38 : 0.8));
      // Residue names identify chemistry without recolouring element-coded atoms.
      residues.forEach((residue) => {
        if (residue.name !== 'Sar') return;
        for (let copy = 0; copy < 2; copy++) {
          const points = residue.indices.filter((index) => atoms[index].element !== 'H').map((index) => projected[copy][index]);
          if (!points.length) continue;
          const x = points.reduce((sum, p) => sum + p.x / points.length, 0);
          const y = copy === 0 ? Math.min(...points.map((p) => p.y)) - 22 : Math.max(...points.map((p) => p.y)) + 23;
          const name = residue.name === 'Sar' ? 'Sar · N-methyl' : `${residue.name}${residue.index ? ' ' + residue.index : ''}`;
          ctx.font = `${residue.name === 'Sar' ? 600 : 400} ${width < 760 ? 9 : 10.5}px Arial,sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = residue.name === 'Sar' ? 'rgba(199,207,239,0.9)' : 'rgba(141,165,190,0.82)';
          ctx.fillText(name, clamp(x, currentRect.left + 42, currentRect.right - 42), clamp(y, currentRect.top + 13, currentRect.bottom - 13));
        }
      });
    }
    updateStatus();
  }
  function updateStatus() {
    const h = state.hbonds.length, c = state.contacts.length;
    const hi = state.hbonds.filter((b) => b.scope === 'intra').length, ci = state.contacts.filter((b) => b.scope === 'intra').length;
    const he = h - hi, ce = c - ci;
    const phase = he && ce ? 'mixed' : he ? 'hbond' : ce ? 'contacts' : 'separated';
    Object.assign(canvas.dataset, { ready: 'true', phase, hbonds: String(h), contacts: String(c), hbondIntra: String(hi), hbondInter: String(he), contactIntra: String(ci), contactInter: String(ce), clashLimited: String(clashLimited), mode, arrangement: arrangement.toFixed(2) });
    document.body.classList.add('field-ready'); document.body.dataset.fieldPhase = phase;
    const status = `${phase}:${h}:${c}:${hi}:${ci}:${clashLimited}`;
    if (status !== lastStatus) {
      if (hbLabel) { hbLabel.textContent = String(h); hbLabel.title = `${he} interchain · ${hi} intrachain`; }
      if (contactLabel) { contactLabel.textContent = String(c); contactLabel.title = `${ce} interchain · ${ci} intrachain`; }
      const hbScope = document.getElementById('hbond-scope'), contactScope = document.getElementById('contact-scope');
      if (hbScope) hbScope.textContent = `${he} inter · ${hi} intra`;
      if (contactScope) contactScope.textContent = `Within chains: ${hi + ci} · Between chains: ${he + ce}`;
      if (phaseLabel) phaseLabel.textContent = !limitNotice && clashLimited ? 'Rotation limited by close contact' : { mixed: 'Coexisting interchain geometries', hbond: 'Interchain hydrogen-bond geometry', contacts: 'Other interchain heteroatom contacts', separated: 'No interchain contacts within filters' }[phase];
      if (limitNotice) limitNotice.textContent = clashLimited ? 'Rotation limited by close contact' : '';
      lastStatus = status;
    }
    if (output) output.textContent = `${Math.round(arrangement)} / 100`;
    if (slider && document.activeElement !== slider) slider.value = String(Math.round(arrangement));
  }
  function updateControls() {
    if (pauseButton) {
      pauseButton.textContent = paused ? 'Play' : 'Pause';
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.setAttribute('aria-label', paused ? 'Play configuration explorer' : 'Pause configuration explorer');
    }
    modeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.labMode === mode)));
  }
  function running() { return !paused && !document.hidden && mode === 'auto'; }
  function frame(time) {
    raf = 0;
    if (!running()) { lastTime = 0; return; }
    if (lastTime) elapsed += Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    arrangement = 50 - 50 * Math.cos(elapsed * Math.PI * 2 / 18);
    if (time - lastDraw >= (width < 760 ? 41 : 32)) { render(); lastDraw = time; }
    raf = requestAnimationFrame(frame);
  }
  function reconcile() {
    if (running() && !raf) { lastTime = 0; raf = requestAnimationFrame(frame); }
    else if (!running() && raf) { cancelAnimationFrame(raf); raf = 0; lastTime = 0; }
  }
  function setMode(next) {
    mode = next; dragRotation = 0; clashLimited = false;
    if (next === 'hbond') { arrangement = 0; paused = true; }
    else if (next === 'contacts') { arrangement = 100; paused = true; }
    else { elapsed = 0; arrangement = 0; paused = false; }
    updateControls(); render(); reconcile();
  }
  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.labMode)));
  if (slider) slider.addEventListener('input', () => {
    arrangement = clamp(Number(slider.value) || 0, 0, 100); dragRotation = 0; clashLimited = false; paused = true; mode = 'manual';
    updateControls(); render(); reconcile();
  });
  if (pauseButton) pauseButton.addEventListener('click', () => {
    paused = !paused;
    if (!paused) { mode = 'auto'; dragRotation = 0; clashLimited = false; elapsed = Math.acos(clamp(1 - arrangement / 50, -1, 1)) * 18 / (Math.PI * 2); }
    updateControls(); render(); reconcile();
  });
  if (replayButton) replayButton.addEventListener('click', () => setMode('auto'));
  function selectAt(x, y) {
    const hits = hitAtoms.filter((a) => Math.hypot(x - a.x, y - a.y) <= a.radius + 7).sort((a, b) => b.z - a.z);
    selectedAtom = hits.length ? { copy: hits[0].copy, index: hits[0].index } : null;
    if (inspector) {
      inspector.hidden = !selectedAtom;
      inspector.textContent = selectedAtom ? `${names[atoms[selectedAtom.index].element] || atoms[selectedAtom.index].element} (${atoms[selectedAtom.index].element}) · chain ${selectedAtom.copy + 1}${atoms[selectedAtom.index].role ? ' · ' + atoms[selectedAtom.index].role : ''}` : '';
    }
    render();
  }
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, start: dragRotation, dragging: false };
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.dragging && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      pointer.dragging = true; viewport.setPointerCapture(event.pointerId); paused = true; mode = 'manual'; updateControls(); reconcile();
    }
    if (pointer.dragging) tryRotation(pointer.start + dx * 0.012);
  });
  viewport.addEventListener('pointerup', (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.dragging && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 7) selectAt(event.clientX, event.clientY);
    pointer = null;
  });
  viewport.addEventListener('pointercancel', () => { pointer = null; });
  viewport.addEventListener('lostpointercapture', () => { pointer = null; });
  viewport.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    paused = true; mode = 'manual'; updateControls();
    tryRotation(dragRotation + (event.key === 'ArrowLeft' ? -0.12 : 0.12)); reconcile();
  });
  function resize() {
    width = window.innerWidth; height = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.5 : 2);
    frameCamera();
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); render();
  }
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; render(); });
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => render()).observe(viewport);
  document.addEventListener('visibilitychange', reconcile);
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', () => {
    if (motionQuery.matches) { paused = true; updateControls(); render(); reconcile(); }
  });
  window.INTERACTION_LAB = Object.freeze({
    inspect() {
      const current = evaluate(transform(arrangement, dragRotation));
      const clashes = clashScreen(current);
      const intraHBonds = current.hbonds.filter((b) => b.scope === 'intra').length;
      const intraContacts = current.contacts.filter((c) => c.scope === 'intra').length;
      return {
        model: model.name || '', mode, paused, arrangement, dragRotation, clashLimited, stericSafe: clashes.length === 0,
        pickableAtoms: hitAtoms.map((a) => ({ id: atoms[a.index].id, copy: a.copy, element: atoms[a.index].element, x: a.x, y: a.y, z: a.z })),
        molecules: current.molecules.map((positions, copy) => ({ copy, atoms: positions.map((xyz, index) => ({ id: atoms[index].id, element: atoms[index].element, xyz, role: atoms[index].role })) })),
        hbonds: current.hbonds.map((b) => ({ scope: b.scope, donor: [b.donorCopy, atoms[b.d].id], hydrogen: [b.donorCopy, atoms[b.h].id], acceptor: [b.acceptorCopy, atoms[b.a].id], hADistance: b.hDistance, dADistance: b.dDistance, angle: b.angle })),
        contacts: current.contacts.map((c) => ({ scope: c.scope, a: [c.aCopy, atoms[c.a].id], b: [c.bCopy, atoms[c.b].id], distance: c.distance })),
        clashes: clashes.map((c) => ({ a: [0, atoms[c.a].id], b: [1, atoms[c.b].id], distance: c.distance, minimum: c.minimum })),
        counts: { hbonds: current.hbonds.length, contacts: current.contacts.length, intraHBonds, interHBonds: current.hbonds.length - intraHBonds, intraContacts, interContacts: current.contacts.length - intraContacts }
      };
    }
  });
  updateControls(); resize(); reconcile();
})();
