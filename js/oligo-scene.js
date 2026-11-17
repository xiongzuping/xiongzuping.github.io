/*
 * Oligopeptide studio. The molecule, donor assignments and constructed packing
 * poses come exclusively from INTERACTION_MODEL. Camera motion never changes
 * molecular geometry. Contact filters are illustrative, not energy calculations.
 * Local Three.js 0.180.0; no network service or external asset is used at runtime.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const canvas = document.getElementById('oligo-canvas');
const viewport = document.getElementById('interaction-window');
const fallback = document.getElementById('scene-fallback');
const model = window.INTERACTION_MODEL;
const fail = (message) => {
  if (canvas) { canvas.hidden = true; canvas.dataset.ready = 'false'; }
  if (fallback) {
    fallback.hidden = false; fallback.dataset.reason = message;
    const caption = fallback.querySelector('p'), note = fallback.querySelector('small');
    if (caption) caption.textContent = 'Static molecular view';
    if (note) note.textContent = 'Interactive 3D is unavailable in this browser session.';
  }
  document.body.classList.add('scene-unavailable');
};

if (canvas && viewport && model) {
  try { createStudio(); }
  catch (error) { console.warn('Molecular view unavailable:', error.message); fail('webgl-unavailable'); }
}

function createStudio() {
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
  const v = (p) => new THREE.Vector3(...p);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const atomById = new Map();
  const atoms = model.atoms.map((a, i) => {
    atomById.set(String(a.id), i);
    if (a.xyz.length !== 3 || !a.xyz.every(Number.isFinite)) throw new Error('Invalid molecular coordinate');
    return { ...a, role: a.role || (model.atomroles || model.atomRoles || {})[a.id] || '' };
  });
  const index = (id) => {
    const i = atomById.get(String(id));
    if (i === undefined) throw new Error('Unmapped molecular atom');
    return i;
  };
  const bonds = model.bonds.map((b) => ({ a: index(b.a), b: index(b.b), order: b.order }));
  const donors = model.donors.map(([d, h]) => [index(d), index(h)]);
  const acceptors = model.acceptors.map(index);
  const hetero = model.contacts.map(index).filter((i) => ['N', 'O'].includes(atoms[i].element));
  const poses = model.poses.map((p) => ({
    // Applying Rx, Ry, then Rz equals the ZYX Euler quaternion convention.
    rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation, 'ZYX')),
    translation: v(p.translation)
  }));
  if (poses.length < 2) throw new Error('Two reference arrangements are required');
  const adjacency = atoms.map(() => []);
  bonds.forEach(({ a, b }) => { adjacency[a].push(b); adjacency[b].push(a); });
  const closeGraph = atoms.map((_, start) => {
    const seen = new Set([start]); let frontier = [start];
    for (let d = 0; d < 3; d++) {
      const next = [];
      frontier.forEach((a) => adjacency[a].forEach((b) => { if (!seen.has(b)) { seen.add(b); next.push(b); } }));
      frontier = next;
    }
    return seen;
  });
  const contactKey = (ca, a, cb, b) => {
    const first = `${ca}:${a}`, second = `${cb}:${b}`;
    return first < second ? `${first}|${second}` : `${second}|${first}`;
  };
  function transform(value) {
    const p = clamp(value / 100) * (poses.length - 1), i = Math.min(poses.length - 2, Math.floor(p)), t = p - i;
    const q = poses[i].rotation.clone().slerp(poses[i + 1].rotation, t);
    const shift = poses[i].translation.clone().lerp(poses[i + 1].translation, t);
    return [atoms.map((a) => a.xyz.slice()), atoms.map((a) => v(a.xyz).applyQuaternion(q).add(shift).toArray())];
  }
  function evaluate(molecules) {
    const hbonds = [], contacts = [], excluded = new Set();
    for (let dc = 0; dc < 2; dc++) for (let ac = 0; ac < 2; ac++) {
      for (const [d, h] of donors) for (const a of acceptors) {
        if (dc === ac && closeGraph[d].has(a)) continue;
        const D = molecules[dc][d], H = molecules[dc][h], A = molecules[ac][a];
        const hd = dist(H, A), dd = dist(D, A);
        if (hd > 2.6 || dd > 3.5 || hd < 1.6) continue;
        const u = v(D).sub(v(H)), w = v(A).sub(v(H));
        const angle = THREE.MathUtils.radToDeg(u.angleTo(w));
        if (angle >= 140) {
          hbonds.push({ donorCopy: dc, acceptorCopy: ac, d, h, a, hDistance: hd, dDistance: dd, angle, scope: dc === ac ? 'intra' : 'inter' });
          excluded.add(contactKey(dc, d, ac, a));
        }
      }
    }
    for (let ca = 0; ca < 2; ca++) for (let cb = ca; cb < 2; cb++) {
      for (const a of hetero) for (const b of hetero) {
        if (ca === cb && (a >= b || closeGraph[a].has(b))) continue;
        const distance = dist(molecules[ca][a], molecules[cb][b]);
        if (distance >= 2.7 && distance <= 3.7 && !excluded.has(contactKey(ca, a, cb, b))) {
          contacts.push({ aCopy: ca, bCopy: cb, a, b, distance, scope: ca === cb ? 'intra' : 'inter' });
        }
      }
    }
    return { molecules, hbonds, contacts };
  }
  const radii = { H: 1.2, C: 1.70, N: 1.55, O: 1.52, S: 1.8 };
  function clashes(configuration) {
    const assigned = new Set(configuration.hbonds.filter((b) => b.scope === 'inter').map((b) => contactKey(b.donorCopy, b.h, b.acceptorCopy, b.a)));
    const result = [];
    for (let a = 0; a < atoms.length; a++) for (let b = 0; b < atoms.length; b++) {
      const distance = dist(configuration.molecules[0][a], configuration.molecules[1][b]);
      const minimum = assigned.has(contactKey(0, a, 1, b)) ? 1.6 : .75 * ((radii[atoms[a].element] || 1.7) + (radii[atoms[b].element] || 1.7));
      if (distance < minimum - 1e-6) result.push({ a: [0, atoms[a].id], b: [1, atoms[b].id], distance, minimum });
    }
    return result;
  }

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 250);
  const rig = new THREE.Group(); scene.add(rig);
  const chemicalGroup = new THREE.Group(); rig.add(chemicalGroup);
  const light = (color, intensity, xyz) => {
    const l = new THREE.DirectionalLight(color, intensity); l.position.set(...xyz); scene.add(l); return l;
  };
  scene.add(new THREE.HemisphereLight(0xbeddf6, 0x071020, 1.1));
  light(0xf2f5ff, 3.2, [8, 11, 13]);
  light(0x4fb9ed, 2.6, [-8, 2, -4]);
  light(0xc3adf6, 1.7, [7, -3, -7]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .035);
  scene.environment = environment.texture;
  scene.environmentIntensity = .55;
  room.dispose(); pmrem.dispose();

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .62, .55, .85);
  bloomComposer.addPass(bloom);
  const antialiasedTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: Math.min(4, renderer.capabilities.maxSamples) });
  const composer = new EffectComposer(renderer, antialiasedTarget);
  composer.addPass(new RenderPass(scene, camera));
  const combine = new ShaderPass(new THREE.ShaderMaterial({
    uniforms: { baseTexture: { value: null }, bloomTexture: { value: null } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv;
      void main(){vec4 base=texture2D(baseTexture,vUv);vec3 glow=texture2D(bloomTexture,vUv).rgb;
        float halo=clamp(max(glow.r,max(glow.g,glow.b))*.65,0.0,.76);
        float alpha=max(base.a,halo);
        gl_FragColor=vec4((base.rgb+glow*.75)/max(alpha,.0001),alpha);}`,
    depthTest: false, depthWrite: false
  }), 'baseTexture');
  composer.addPass(combine); composer.addPass(new OutputPass());
  const bloomMaskMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = false;
  controls.rotateSpeed = .6; controls.autoRotate = false;
  controls.minPolarAngle = .25; controls.maxPolarAngle = Math.PI - .25;
  // Horizontal touch drag orbits; vertical touch gestures continue to scroll the page.
  canvas.style.touchAction = 'pan-y';

  const palette = { C: 0x657b86, N: 0x2f74cc, O: 0xd34b60, H: 0xdce7ed, S: 0xe9cb73 };
  const sizes = { C: .31, N: .33, O: .32, H: .155, S: .36 };
  const atomGeometry = new THREE.SphereGeometry(1, 32, 24);
  const bondGeometry = new THREE.CylinderGeometry(1, 1, 1, 12, 1, false);
  const atomSets = [], pickMeshes = [];
  for (const element of [...new Set(atoms.map((a) => a.element))]) {
    const indices = [];
    for (let copy = 0; copy < 2; copy++) atoms.forEach((a, i) => { if (a.element === element) indices.push({ copy, i }); });
    const material = new THREE.MeshPhysicalMaterial({ color: palette[element] || palette.C, metalness: element === 'C' ? .3 : .12, roughness: element === 'H' ? .29 : .22, clearcoat: 1, clearcoatRoughness: .18, envMapIntensity: 1.15 });
    const mesh = new THREE.InstancedMesh(atomGeometry, material, indices.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false;
    mesh.userData.instances = indices; mesh.userData.element = element;
    chemicalGroup.add(mesh); atomSets.push(mesh); pickMeshes.push(mesh);
  }
  const bondMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd2dee7, metalness: .36, roughness: .27, clearcoat: .8, envMapIntensity: .9 });
  const bondCapacity = bonds.reduce((n, b) => n + b.order * 4, 0);
  const bondMesh = new THREE.InstancedMesh(bondGeometry, bondMaterial, bondCapacity);
  bondMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bondMesh.frustumCulled = false; chemicalGroup.add(bondMesh);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8, 1, false);
  const contactSets = [
    { color: new THREE.Color(.22, 2.0, 2.35), radius: .038, opacity: .96 },
    { color: new THREE.Color(1.30, .40, 2.15), radius: .034, opacity: .78 },
    { color: new THREE.Color(.45, .28, .65), radius: .021, opacity: .38 },
    { color: new THREE.Color(.18, .72, .88), radius: .024, opacity: .48 }
  ].map((spec) => {
    const material = new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: spec.opacity, depthWrite: false, toneMapped: false });
    const mesh = new THREE.InstancedMesh(cylinder, material, 640);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = 0;
    chemicalGroup.add(mesh); return { ...spec, mesh, used: 0 };
  });
  const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128;
  const gc = glowCanvas.getContext('2d');
  const gradient = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,.62)'); gradient.addColorStop(.13, 'rgba(255,255,255,.3)');
  gradient.addColorStop(.4, 'rgba(255,255,255,.08)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
  gc.fillStyle = gradient; gc.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const glows = Array.from({ length: 32 }, () => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x67daee, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: .18, toneMapped: false }));
    sprite.visible = false; chemicalGroup.add(sprite); return sprite;
  });
  const selectedHalo = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xc9f7ff, transparent: true, opacity: .12, depthWrite: false, blending: THREE.AdditiveBlending }));
  selectedHalo.visible = false; chemicalGroup.add(selectedHalo);
  const matrix = new THREE.Matrix4(), midpoint = new THREE.Vector3(), delta = new THREE.Vector3(), unitY = new THREE.Vector3(0, 1, 0), orientation = new THREE.Quaternion(), scaleVec = new THREE.Vector3();
  const tmpColor = new THREE.Color();
  function segment(mesh, instance, start, end, radius) {
    midpoint.copy(start).add(end).multiplyScalar(.5); delta.copy(end).sub(start);
    const length = delta.length(); orientation.setFromUnitVectors(unitY, delta.normalize());
    scaleVec.set(radius, length, radius); matrix.compose(midpoint, orientation, scaleVec); mesh.setMatrixAt(instance, matrix);
  }
  function dash(start, end, kind, intra = false) {
    const set = contactSets[kind], a = v(start), b = v(end), distance = a.distanceTo(b);
    const isHydrogenBond = kind === 0 || kind === 3;
    const count = Math.max(3, Math.ceil(distance / (isHydrogenBond ? .40 : .29)));
    for (let i = 0; i < count && set.used < 640; i++) {
      const t0 = (i + .12) / count, t1 = (i + (isHydrogenBond ? .58 : .33)) / count;
      segment(set.mesh, set.used++, a.clone().lerp(b, t0), a.clone().lerp(b, t1), set.radius);
    }
  }
  let state, arrangement = 0, mode = 'auto', elapsed = 0, paused = motionQuery.matches;
  let selected = null, width = 1, height = 1, visible = true, raf = 0, lastTime = 0, lastDraw = 0, orbiting = false, pointerStart = null;
  const slider = document.getElementById('arrangement-range');
  const output = document.getElementById('arrangement-output');
  const pauseButton = document.getElementById('field-pause');
  const resetButton = document.getElementById('field-replay');
  const inspector = document.getElementById('atom-inspector');
  const modeButtons = [...document.querySelectorAll('[data-lab-mode]')];
  const names = { C: 'Carbon', N: 'Nitrogen', O: 'Oxygen', H: 'Hydrogen', S: 'Sulfur' };
  function counts() {
    const intraHBonds = state.hbonds.filter((b) => b.scope === 'intra').length, intraContacts = state.contacts.filter((b) => b.scope === 'intra').length;
    return { hbonds: state.hbonds.length, contacts: state.contacts.length, intraHBonds, interHBonds: state.hbonds.length - intraHBonds, intraContacts, interContacts: state.contacts.length - intraContacts };
  }
  function updateStatus() {
    const c = counts();
    const phase = c.interHBonds && c.interContacts ? 'mixed' : c.interHBonds ? 'hbond' : c.interContacts ? 'contacts' : 'separated';
    Object.assign(canvas.dataset, { ready: 'true', renderer: 'webgl', phase, hbonds: String(c.hbonds), contacts: String(c.contacts), hbondIntra: String(c.intraHBonds), hbondInter: String(c.interHBonds), contactIntra: String(c.intraContacts), contactInter: String(c.interContacts), mode, arrangement: arrangement.toFixed(2) });
    document.body.classList.add('field-ready', 'oligo-ready'); document.body.dataset.fieldPhase = phase;
    const text = (id, value) => { const el = document.getElementById(id); if (el && el.textContent !== value) el.textContent = value; };
    text('hbond-count', String(c.hbonds)); text('contact-count', String(c.contacts));
    text('contact-scope', `Within chains: ${c.intraHBonds + c.intraContacts} · Between chains: ${c.interHBonds + c.interContacts}`);
    text('field-phase', { hbond: 'Hydrogen-bond alignment', contacts: 'Alternative close contacts', mixed: 'Competing & coexisting', separated: 'Rearranging the assembly' }[phase]);
    if (output) output.textContent = `${Math.round(arrangement)} / 100`;
    if (slider && document.activeElement !== slider) slider.value = String(Math.round(arrangement));
    if (pauseButton) { pauseButton.textContent = paused ? 'Play' : 'Pause'; pauseButton.setAttribute('aria-pressed', String(paused)); pauseButton.setAttribute('aria-label', paused ? 'Play molecular arrangement' : 'Pause molecular arrangement'); }
    modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.labMode === mode)));
  }
  function updateGeometry() {
    state = evaluate(transform(arrangement));
    atomSets.forEach((mesh) => {
      mesh.userData.instances.forEach(({ copy, i }, j) => {
        const radius = sizes[atoms[i].element] || .31;
        matrix.makeScale(radius, radius, radius); matrix.setPosition(...state.molecules[copy][i]); mesh.setMatrixAt(j, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
    let bIndex = 0;
    for (let copy = 0; copy < 2; copy++) {
      for (const bond of bonds) {
        const a = v(state.molecules[copy][bond.a]), b = v(state.molecules[copy][bond.b]);
        const direction = b.clone().sub(a).normalize();
        const reference = Math.abs(direction.z) < .85 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
        const perpendicular = new THREE.Vector3().crossVectors(direction, reference).normalize();
        const offsets = bond.order === 2 ? [-.09, .09] : bond.order === 3 ? [-.16, 0, .16] : [0];
        const hydrogen = atoms[bond.a].element === 'H' || atoms[bond.b].element === 'H';
        for (const offset of offsets) {
          const start = a.clone().addScaledVector(perpendicular, offset), end = b.clone().addScaledVector(perpendicular, offset), middle = start.clone().lerp(end, .5);
          segment(bondMesh, bIndex, start, middle, hydrogen ? .035 : bond.order > 1 ? .047 : .066);
          tmpColor.set(palette[atoms[bond.a].element] || palette.C).lerp(new THREE.Color(0xc4d3de), .48); bondMesh.setColorAt(bIndex++, tmpColor);
          segment(bondMesh, bIndex, middle, end, hydrogen ? .035 : bond.order > 1 ? .047 : .066);
          tmpColor.set(palette[atoms[bond.b].element] || palette.C).lerp(new THREE.Color(0xc4d3de), .48); bondMesh.setColorAt(bIndex++, tmpColor);
        }
      }
    }
    bondMesh.count = bIndex; bondMesh.instanceMatrix.needsUpdate = true; if (bondMesh.instanceColor) bondMesh.instanceColor.needsUpdate = true;
    contactSets.forEach((s) => { s.used = 0; }); glows.forEach((g) => { g.visible = false; });
    let glowIndex = 0;
    const addGlow = (a, b, color, size, strength = 1) => {
      if (glowIndex >= glows.length) return;
      const sprite = glows[glowIndex++]; sprite.visible = true;
      sprite.position.copy(v(a).lerp(v(b), .5)); sprite.scale.setScalar(size); sprite.material.color.set(color);
      sprite.material.opacity = .40 * clamp(strength);
    };
    state.hbonds.forEach((h) => {
      const a = state.molecules[h.donorCopy][h.h], b = state.molecules[h.acceptorCopy][h.a];
      dash(a, b, h.scope === 'intra' ? 3 : 0);
      if (h.scope === 'inter') addGlow(a, b, 0x5edcfa, 4.6, Math.min((2.6 - h.hDistance) / .3, (3.5 - h.dDistance) / .35, (h.angle - 140) / 15));
    });
    state.contacts.forEach((c) => {
      const a = state.molecules[c.aCopy][c.a], b = state.molecules[c.bCopy][c.b];
      dash(a, b, c.scope === 'intra' ? 2 : 1);
      if (c.scope === 'inter') addGlow(a, b, 0xbb8aff, 4.6, Math.min((3.7 - c.distance) / .25, (c.distance - 2.7) / .20));
    });
    contactSets.forEach((s) => { s.mesh.count = s.used; s.mesh.instanceMatrix.needsUpdate = true; });
    if (selected) {
      selectedHalo.visible = true; selectedHalo.position.set(...state.molecules[selected.copy][selected.i]); selectedHalo.scale.setScalar((sizes[atoms[selected.i].element] || .31) * 1.6);
    } else selectedHalo.visible = false;
    updateStatus();
  }

  // Orient the long molecular axis across the stage; camera framing stays fixed
  // throughout an arrangement cycle, so approaching chains do not zoom artificially.
  const samples = [];
  for (let i = 0; i <= 20; i++) transform(i * 5).forEach((copy) => copy.forEach((p) => samples.push(v(p))));
  const center = samples.reduce((sum, p) => sum.add(p), new THREE.Vector3()).multiplyScalar(1 / samples.length);
  const centered = samples.map((p) => p.clone().sub(center));
  function principal(seed, orthogonal = null) {
    let axis = seed.normalize();
    for (let n = 0; n < 25; n++) {
      const next = centered.reduce((sum, p) => sum.addScaledVector(p, p.dot(axis)), new THREE.Vector3());
      if (orthogonal) next.addScaledVector(orthogonal, -next.dot(orthogonal));
      if (next.lengthSq() < 1e-10) break; axis = next.normalize();
    }
    return axis;
  }
  const e1 = principal(new THREE.Vector3(1, .3, .1));
  const seed2 = Math.abs(e1.y) < .8 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
  const e2 = principal(seed2, e1), e3 = new THREE.Vector3().crossVectors(e1, e2).normalize();
  e2.crossVectors(e3, e1).normalize();
  const basis = new THREE.Matrix4().makeBasis(e1, e2, e3).invert();
  const baseRotation = new THREE.Quaternion().setFromRotationMatrix(basis);
  chemicalGroup.position.copy(center).negate();
  // The group's translation must be rotated as well; move the model into a nested
  // centred object, then apply view orientation to its parent.
  const orientedPoints = samples.map((p) => p.clone().sub(center).applyQuaternion(baseRotation));
  let cameraDistance = 25, hasSized = false, oldAspect = null;
  function fitCamera() {
    const mobile = width < 580;
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(.14, -.12, mobile ? .95 : -.16));
    rig.quaternion.copy(tilt).multiply(baseRotation);
    const projected = samples.map((p) => p.clone().sub(center).applyQuaternion(rig.quaternion));
    const bounds = new THREE.Box3().setFromPoints(projected); const size = bounds.getSize(new THREE.Vector3());
    const vfov = THREE.MathUtils.degToRad(camera.fov), horizontal = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    // Reserve breathing room around terminal groups and the floating control dock.
    cameraDistance = Math.max(size.y / (2 * Math.tan(vfov / 2)), size.x / (2 * Math.tan(horizontal / 2))) * (mobile ? 1.20 : 1.10) + size.z * .48 + 1.3;
    camera.position.set(0, 0, cameraDistance); controls.target.set(0, 0, 0); controls.update();
    camera.near = .1; camera.far = Math.max(200, cameraDistance * 6); camera.updateProjectionMatrix();
  }
  function draw() {
    if (!hasSized || !visible || document.hidden) return;
    scene.updateMatrixWorld(true);
    // Only geometric contact markers and their artistic fields bloom. Atoms and
    // bonds occlude the light, but their white specular highlights never glow.
    const saved = atomSets.map((mesh) => mesh.material);
    atomSets.forEach((mesh) => { mesh.material = bloomMaskMaterial; });
    bondMesh.material = bloomMaskMaterial;
    bloomComposer.render();
    atomSets.forEach((mesh, i) => { mesh.material = saved[i]; });
    bondMesh.material = bondMaterial;
    combine.uniforms.bloomTexture.value = bloomComposer.readBuffer.texture;
    composer.render();
  }
  function refresh() { updateGeometry(); draw(); }
  function running() { return !paused && mode === 'auto' && visible && !document.hidden && !orbiting; }
  function frame(now) {
    raf = 0;
    if (!running()) { lastTime = 0; return; }
    if (lastTime) elapsed += Math.min(.1, (now - lastTime) / 1000);
    lastTime = now;
    if (now - lastDraw >= (width < 580 ? 40 : 32)) {
      arrangement = 50 - 50 * Math.cos(elapsed * Math.PI * 2 / 24);
      // Very gentle camera drift adds spatial depth without changing contact geometry.
      if (!motionQuery.matches) {
        const azimuth = Math.sin(elapsed * .13) * .075, elevation = Math.cos(elapsed * .11) * .025;
        camera.position.set(Math.sin(azimuth) * cameraDistance, elevation * cameraDistance, Math.cos(azimuth) * cameraDistance);
        camera.lookAt(controls.target);
      }
      refresh(); lastDraw = now;
    }
    raf = requestAnimationFrame(frame);
  }
  function reconcile() {
    if (running() && !raf) { lastTime = 0; raf = requestAnimationFrame(frame); }
    else if (!running() && raf) { cancelAnimationFrame(raf); raf = 0; lastTime = 0; }
  }
  function setMode(next) {
    mode = next;
    if (next === 'hbond') { arrangement = 0; paused = true; }
    else if (next === 'contacts') { arrangement = 100; paused = true; }
    else { arrangement = 0; elapsed = 0; paused = false; }
    refresh(); reconcile();
  }
  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.labMode)));
  if (slider) slider.addEventListener('input', () => { arrangement = clamp(Number(slider.value), 0, 100); paused = true; mode = 'manual'; refresh(); reconcile(); });
  if (pauseButton) pauseButton.addEventListener('click', () => {
    paused = !paused;
    if (!paused) { mode = 'auto'; elapsed = Math.acos(clamp(1 - arrangement / 50, -1, 1)) * 24 / (2 * Math.PI); }
    refresh(); reconcile();
  });
  if (resetButton) resetButton.addEventListener('click', () => { selected = null; if (inspector) inspector.hidden = true; fitCamera(); setMode('auto'); });
  controls.addEventListener('start', () => { orbiting = true; paused = true; if (mode === 'auto') mode = 'manual'; updateStatus(); reconcile(); });
  controls.addEventListener('change', draw);
  controls.addEventListener('end', () => { orbiting = false; draw(); reconcile(); });
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  canvas.addEventListener('pointerdown', (event) => { pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointerup', (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y); pointerStart = null;
    if (moved > 6) return;
    const rect = canvas.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    scene.updateMatrixWorld(true); raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickMeshes, false)[0];
    selected = hit && Number.isInteger(hit.instanceId) ? hit.object.userData.instances[hit.instanceId] : null;
    if (inspector) {
      inspector.hidden = !selected;
      inspector.textContent = selected ? `${names[atoms[selected.i].element]} · chain ${selected.copy + 1}${atoms[selected.i].role ? ' · ' + atoms[selected.i].role : ''}` : '';
    }
    refresh();
  });
  canvas.addEventListener('pointercancel', () => { pointerStart = null; });
  viewport.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.target !== viewport) return;
    event.preventDefault(); paused = true; mode = 'manual';
    const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    if (event.key === 'ArrowLeft') spherical.theta -= .10;
    if (event.key === 'ArrowRight') spherical.theta += .10;
    if (event.key === 'ArrowUp') spherical.phi = clamp(spherical.phi - .10, .25, Math.PI - .25);
    if (event.key === 'ArrowDown') spherical.phi = clamp(spherical.phi + .10, .25, Math.PI - .25);
    camera.position.setFromSpherical(spherical).add(controls.target); controls.update(); updateStatus(); draw(); reconcile();
  });
  function resize() {
    const rect = viewport.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, width < 580 ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr); renderer.setSize(width, height, false);
    composer.setPixelRatio(dpr); composer.setSize(width, height);
    bloomComposer.setPixelRatio(dpr); bloomComposer.setSize(width, height);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    if (!hasSized || Math.abs(camera.aspect - oldAspect) > .04) fitCamera();
    oldAspect = camera.aspect; hasSized = true; draw();
  }
  new ResizeObserver(resize).observe(viewport);
  window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) draw(); reconcile(); }, { rootMargin: '80px' }).observe(viewport);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) draw(); reconcile(); });
  motionQuery.addEventListener('change', () => { if (motionQuery.matches) { paused = true; updateStatus(); reconcile(); } });
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); paused = true; reconcile(); fail('webgl-context-lost'); });

  function pickableAtoms() {
    scene.updateMatrixWorld(true); const rect = canvas.getBoundingClientRect();
    return state.molecules.flatMap((molecule, copy) => molecule.map((xyz, i) => {
      const point = v(xyz).applyMatrix4(chemicalGroup.matrixWorld).project(camera);
      return { id: atoms[i].id, copy, element: atoms[i].element, x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2, z: -point.z };
    }));
  }
  window.INTERACTION_LAB = Object.freeze({
    inspect() {
      const collisions = clashes(state);
      return {
        renderer: 'webgl', model: model.name, mode, paused, arrangement, orbit: camera.position.toArray(), stericSafe: collisions.length === 0,
        molecules: state.molecules.map((positions, copy) => ({ copy, atoms: positions.map((xyz, i) => ({ id: atoms[i].id, element: atoms[i].element, xyz, role: atoms[i].role })) })),
        hbonds: state.hbonds.map((h) => ({ scope: h.scope, donor: [h.donorCopy, atoms[h.d].id], hydrogen: [h.donorCopy, atoms[h.h].id], acceptor: [h.acceptorCopy, atoms[h.a].id], hADistance: h.hDistance, dADistance: h.dDistance, angle: h.angle })),
        contacts: state.contacts.map((c) => ({ scope: c.scope, a: [c.aCopy, atoms[c.a].id], b: [c.bCopy, atoms[c.b].id], distance: c.distance })),
        counts: counts(), clashes: collisions, pickableAtoms: pickableAtoms(), webgl: { version: renderer.capabilities.isWebGL2 ? 2 : 1, drawCalls: renderer.info.render.calls }
      };
    }
  });
  updateGeometry(); resize();
  if (fallback) fallback.hidden = true;
  canvas.hidden = false; document.body.classList.remove('scene-unavailable');
  reconcile();
}
