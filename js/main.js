/* ============================================================
   Zuping Xiong — Personal Academic Website · interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- gallery data ----------------
     Photos taken from the original site; captions left blank
     so the user can add their own descriptions. */
  const GALLERY = [
    { src: "assets/gallery/Frsv2Cni2TUQ9DKNPBnRrAEnWWSV.png", cap: "" },
    { src: "assets/gallery/lliZA9sFpk1p1rJc0yRAPoMuKxrJ.jpg", cap: "" },
    { src: "assets/gallery/FvnDNBp2WvZDkvEQB0o1rwng2nTU.jpg", cap: "" },
    { src: "assets/gallery/FgAY1PyH1N7rFP2aS1RkbdGf_kGE.jpg", cap: "" },
    { src: "assets/gallery/FjLGqXNuQpuFP2i_H7Sam_trNgzT.jpg", cap: "" },
    { src: "assets/gallery/FscNWplVzxrYqMjDAUu0dI7OccbF.jpg", cap: "" },
    { src: "assets/gallery/FpUpseUplFlEzdTl_WUsT4FT3hVr.jpg", cap: "" },
    { src: "assets/gallery/FlIJq7ZyyAUcpUg4GC7UhDUDFoYn.png", cap: "" },
    { src: "assets/gallery/Fg-Kr75cFwshh248uMyn0yPJJoSc.jpg", cap: "" },
    { src: "assets/gallery/FnrUPsjxIskMZY0cpl2OGrGMAaLJ.jpg", cap: "" },
    { src: "assets/gallery/Foh71UDhcYCyDouBAsvCvcNAn9Lm.jpg", cap: "" },
    { src: "assets/gallery/FsvhFuDwjsmgQLcY0qKgWYpK3NrG.jpg", cap: "" },
    { src: "assets/gallery/FgMOyTad4sgU_5G6qHf-XMkFQ6Qv.jpg", cap: "" },
    { src: "assets/gallery/ltfZeDQtESP2UWfnDu6oo0VgAW8-.jpg", cap: "" },
    { src: "assets/gallery/FpGWaVCLRUAsBNTPPZexEPzx6G6K.png", cap: "" },
    { src: "assets/gallery/FvtiKzZJJKSCe_0qt3OCgo_3VHFz.jpg", cap: "" },
    { src: "assets/gallery/Fnpw8V-URjSuqURwEj-hZwHT1hQf.png", cap: "" },
    { src: "assets/gallery/lmuPnGAVaJZqsLdlAilxUqGYYwLX.jpg", cap: "" },
    { src: "assets/gallery/FhyTKCpV-4ySxdDBoaM9WF-i-4I-.jpg", cap: "" },
    { src: "assets/gallery/looTgEqvXfptXmW2u8yKsYOGhtBH.jpg", cap: "" },
    { src: "assets/gallery/lu551NUkSZVHZ2UquqqFl3L4jQNT.jpg", cap: "" },
    { src: "assets/gallery/Fredt5bYfXdWS_rkMapxW7SdBmE3.jpg", cap: "" },
    { src: "assets/gallery/lg0Ek8BWKQUBF9OZQGMzrFFZv7zT.jpg", cap: "" },
    { src: "assets/gallery/FrWHSiE28i6Kdlrzh4lZaaThqWad.jpg", cap: "" },
    { src: "assets/gallery/FssG3YlERCi5BxAtQgpYco-7Oo15.jpg", cap: "" },
    { src: "assets/gallery/FswSrLfA8SROodmC4xTkFMsyxlFR.jpg", cap: "" },
    { src: "assets/gallery/lsJADwKHtOlSJctDdIsB8-6od7H4.jpg", cap: "" },
    { src: "assets/gallery/FmLxs4MgmUPMtkEe8zeS2HIncGX2.jpg", cap: "" },
    { src: "assets/gallery/Fgf4b1JTK8h5G8FlDWVgTmDdyCg0.jpg", cap: "" },
    { src: "assets/gallery/Fth4-vlAPzn1mHiq6-G6Kvbb_Frn.png", cap: "" },
    { src: "assets/gallery/FsEa3ecXDbc0JEFW_sVxxkSbBzg4.png", cap: "" },
    { src: "assets/gallery/FqyjvoPPH_vrX2vmdGY5ZwEjY8eO.png", cap: "" },
    { src: "assets/gallery/FmPvsruouz1KTPYDNgF2xjFbAeZ1.png", cap: "" },
    { src: "assets/gallery/ljDwaz0dEq8Bqir7KbjSHVkajKHD.jpg", cap: "" }
  ];

  /* ---------------- materials-chemistry background ----------------
     A dark lab sky: faint stars + drifting polymer chains +
     glowing clusteroluminescence blobs + floating benzene rings. */
  const canvas = document.getElementById("starfield");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let stars = [], clusters = [], chains = [], hexes = [],
        W = 0, H = 0, raf = null, t = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const R = (a, b) => a + Math.random() * (b - a);
    const PALETTE = [[109,124,255], [34,211,238], [167,139,250], [52,211,153], [251,191,36]];

    function hexPath(r) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + i * Math.PI / 3;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.closePath();
    }

    function resize() {
      W = canvas.width = innerWidth * DPR;
      H = canvas.height = innerHeight * DPR;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      stars = Array.from({ length: Math.min(110, Math.floor((innerWidth * innerHeight) / 11000)) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: (Math.random() * 1.3 + 0.3) * DPR,
        v: Math.random() * 0.22 + 0.04,
        a: Math.random() * 0.5 + 0.12
      }));
      clusters = Array.from({ length: Math.max(6, Math.min(12, Math.floor(innerWidth / 150))) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: R(26, 58) * DPR,
        c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        ph: Math.random() * Math.PI * 2,
        vy: R(0.05, 0.14) * DPR,
        vx: R(-0.06, 0.06) * DPR
      }));
      chains = Array.from({ length: 4 }, () => ({
        y0: R(0.15, 0.85) * H,
        f: R(1.6, 3.2),
        amp: R(34, 78) * DPR,
        ph: Math.random() * Math.PI * 2,
        v: R(0.004, 0.011),
        c: PALETTE[Math.floor(Math.random() * 3)]
      }));
      hexes = Array.from({ length: 6 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: R(11, 26) * DPR,
        rot: Math.random() * Math.PI,
        vr: R(-0.004, 0.004),
        vy: R(0.03, 0.09) * DPR,
        c: PALETTE[Math.floor(Math.random() * PALETTE.length)]
      }));
    }

    function drawCluster(cl, tt) {
      const pulse = 1 + Math.sin(tt * 0.012 + cl.ph) * 0.12;
      const r = cl.r * pulse;
      let g = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, r);
      g.addColorStop(0, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0.5)");
      g.addColorStop(0.55, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0.13)");
      g.addColorStop(1, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cl.x, cl.y, r, 0, Math.PI * 2); ctx.fill();
      g = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, r * 0.45);
      g.addColorStop(0, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0.32)");
      g.addColorStop(1, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cl.x, cl.y, r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath(); ctx.arc(cl.x, cl.y, r * 0.12, 0, Math.PI * 2); ctx.fill();
    }

    function chainY(ch, x, tt) {
      return ch.y0 + Math.sin((x / W) * Math.PI * 2 * ch.f + ch.ph) * ch.amp +
             Math.sin(tt * 0.006 + ch.ph * 3) * 14 * DPR;
    }

    function drawChain(ch, tt) {
      ch.ph += ch.v;
      const step = 46 * DPR;
      ctx.strokeStyle = "rgba(" + ch.c[0] + "," + ch.c[1] + "," + ch.c[2] + ",0.13)";
      ctx.lineWidth = 2.2 * DPR;
      ctx.beginPath();
      for (let x = -step, first = true; x < W + step * 2; x += step) {
        const y = chainY(ch, x, tt);
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      for (let x = 0; x < W + step; x += step) {
        const y = chainY(ch, x, tt);
        ctx.fillStyle = "#0a0f22";
        ctx.beginPath(); ctx.arc(x, y, 4.6 * DPR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(" + ch.c[0] + "," + ch.c[1] + "," + ch.c[2] + ",0.28)";
        ctx.lineWidth = 1.8 * DPR;
        ctx.beginPath(); ctx.arc(x, y, 4.6 * DPR, 0, Math.PI * 2); ctx.stroke();
      }
    }

    function drawHex(hx) {
      hx.y -= hx.vy; hx.rot += hx.vr;
      if (hx.y < -40) { hx.y = H + 40; hx.x = Math.random() * W; }
      ctx.save();
      ctx.translate(hx.x, hx.y);
      ctx.rotate(hx.rot);
      ctx.strokeStyle = "rgba(" + hx.c[0] + "," + hx.c[1] + "," + hx.c[2] + ",0.16)";
      ctx.lineWidth = 1.6 * DPR;
      hexPath(hx.r); ctx.stroke();
      ctx.strokeStyle = "rgba(" + hx.c[0] + "," + hx.c[1] + "," + hx.c[2] + ",0.1)";
      hexPath(hx.r * 0.6); ctx.stroke();
      ctx.restore();
    }

    function tick() {
      t += 1;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.y -= s.v * DPR;
        if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
        s.a += (Math.random() - 0.5) * 0.03;
        s.a = Math.max(0.08, Math.min(0.7, s.a));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160,180,255," + s.a.toFixed(2) + ")";
        ctx.fill();
      }
      for (const cl of clusters) {
        cl.x += cl.vx; cl.y += cl.vy;
        if (cl.y > H + 80) { cl.y = -80; cl.x = Math.random() * W; }
        if (cl.x > W + 80) cl.x = -80;
        if (cl.x < -80) cl.x = W + 80;
        drawCluster(cl, t);
      }
      for (const ch of chains) drawChain(ch, t);
      for (const hx of hexes) drawHex(hx);
      raf = requestAnimationFrame(tick);
    }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    if (reduced) { /* static render */
      ctx.fillStyle = "rgba(160,180,255,.3)";
      stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); });
      clusters.forEach(cl => drawCluster(cl, 0));
      chains.forEach(ch => drawChain(ch, 0));
      hexes.forEach(hx => {
        ctx.save(); ctx.translate(hx.x, hx.y); ctx.rotate(hx.rot);
        ctx.strokeStyle = "rgba(160,180,255,.15)";
        hexPath(hx.r); ctx.stroke(); ctx.restore();
      });
    } else {
      tick();
    }
    addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); if (!reduced) tick(); });
  }

  /* ---------------- nav ---------------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", scrollY > 10);
  }, { passive: true });
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    links.classList.toggle("open");
  });
  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      links.classList.remove("open");
    })
  );

  /* ---------------- scrollspy ---------------- */
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.querySelectorAll("a").forEach(a =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + id)
      );
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("section[id], header[id]").forEach(s => spy.observe(s));

  /* ---------------- reveal ---------------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

  /* ---------------- counters ---------------- */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1100, t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + "+";
        if (p < 1) requestAnimationFrame(step);
      })(t0);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".num[data-count]").forEach(el => counterObs.observe(el));

  /* ---------------- publication tabs ---------------- */
  document.querySelectorAll(".pub-tab[data-tab]").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".pub-tab[data-tab]").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".pub-group").forEach(g => g.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  /* ---------------- gallery ---------------- */
  const gBox = document.getElementById("galleryBox");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");

  function renderGallery() {
    if (!GALLERY.length) {
      gBox.innerHTML = '<p style="color:var(--faint);font-size:14px;grid-column:1/-1">Photos coming soon…</p>';
      return;
    }
    gBox.innerHTML = GALLERY.map(it =>
      '<figure class="g-item" data-cap="' + it.cap.replace(/"/g, "&quot;") + '">' +
      '<img src="' + it.src + '" alt="' + it.cap.replace(/"/g, "&quot;") + '" loading="lazy">' +
      (it.cap ? '<figcaption class="cap">' + it.cap + "</figcaption>" : "") +
      "</figure>"
    ).join("");
    gBox.querySelectorAll(".g-item").forEach(f => {
      f.addEventListener("click", () => {
        lbImg.src = f.querySelector("img").src;
        lbCap.textContent = f.dataset.cap || "";
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
      });
    });
  }
  if (gBox) renderGallery();
  function closeLB() { lightbox.classList.remove("open"); lightbox.setAttribute("aria-hidden", "true"); }
  if (lightbox) {
    lightbox.addEventListener("click", closeLB);
    document.getElementById("lbClose").addEventListener("click", closeLB);
    addEventListener("keydown", e => { if (e.key === "Escape") closeLB(); });
  }

  /* ---------------- contact form (mailto) ---------------- */
  const form = document.getElementById("msgForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const n = encodeURIComponent(form.name.value.trim());
      const em = encodeURIComponent(form.email.value.trim());
      const m = encodeURIComponent(form.message.value.trim());
      location.href = "mailto:xiongzuping@ust.hk" +
        "?subject=" + encodeURIComponent("[Website] Message from ") + n +
        "&body=" + m + "%0D%0A%0D%0AFrom: " + n + " (" + em + ")";
    });
  }
})();
