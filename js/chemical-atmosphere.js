/* Decoration only. Chemical connectivity lives in the source SVG/model. */
(() => {
  const layer = document.getElementById('chemical-atmosphere');
  const hero = document.getElementById('home');
  const pause = document.getElementById('field-pause');
  if (!layer || !hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let inView = true, queued = 0, x = 0, y = 0, lastMotion = null;
  const allowed = () => !reduced.matches && fine.matches && inView && !document.hidden && !document.body.classList.contains('scene-unavailable') && pause?.getAttribute('aria-pressed') === 'false';
  const reset = () => { x = 0; y = 0; layer.style.setProperty('--chem-pan-x', '0px'); layer.style.setProperty('--chem-pan-y', '0px'); };
  const sync = () => {
    const motion = allowed() ? 'on' : 'off';
    if (motion === lastMotion) return;
    lastMotion = motion; layer.dataset.motion = motion;
    if (motion === 'off') reset();
  };
  // No per-frame WebGL or molecule evaluation; update only after pointer input.
  hero.addEventListener('pointermove', (event) => {
    if (!allowed() || event.pointerType === 'touch') return;
    x = (event.clientX / innerWidth - .5) * 16;
    y = (event.clientY / innerHeight - .5) * 10;
    if (queued) return;
    queued = requestAnimationFrame(() => {
      queued = 0;
      if (!allowed()) return;
      layer.style.setProperty('--chem-pan-x', `${x.toFixed(1)}px`);
      layer.style.setProperty('--chem-pan-y', `${y.toFixed(1)}px`);
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', reset, { passive: true });
  reduced.addEventListener('change', sync); fine.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if (pause) new MutationObserver(sync).observe(pause, { attributes: true, attributeFilter: ['aria-pressed'] });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(hero);
  sync();
})();
