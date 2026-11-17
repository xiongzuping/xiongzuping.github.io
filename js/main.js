/* ============================================================
   Zuping Xiong — Personal Academic Website · interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- gallery data ----------------
     Photos taken from the original site; captions left blank
     so the user can add their own descriptions. */
  const GALLERY = [
    { src: "assets/gallery/FvtiKzZJJKSCe_0qt3OCgo_3VHFz.jpg", width: 1448, height: 1086, cap: "", feat: true },
    { src: "assets/gallery/Fg-Kr75cFwshh248uMyn0yPJJoSc.jpg", width: 1708, height: 1280, cap: "" },
    { src: "assets/gallery/FsvhFuDwjsmgQLcY0qKgWYpK3NrG.jpg", width: 1702, height: 1276, cap: "" },
    { src: "assets/gallery/ltfZeDQtESP2UWfnDu6oo0VgAW8-.jpg", width: 4032, height: 3024, cap: "" },
    { src: "assets/gallery/Fnpw8V-URjSuqURwEj-hZwHT1hQf.png", width: 1406, height: 984, cap: "" },
    // This original JPEG ends early; its decoder fills the missing bottom rows with grey.
    { src: "assets/gallery/lmuPnGAVaJZqsLdlAilxUqGYYwLX.jpg", width: 5712, height: 4284, visibleHeight: 3664, cap: "" },
    { src: "assets/gallery/FhyTKCpV-4ySxdDBoaM9WF-i-4I-.jpg", width: 2508, height: 1864, cap: "" },
    { src: "assets/gallery/looTgEqvXfptXmW2u8yKsYOGhtBH.jpg", width: 6960, height: 4640, cap: "" },
    { src: "assets/gallery/lu551NUkSZVHZ2UquqqFl3L4jQNT.jpg", width: 5712, height: 4284, cap: "" },
    { src: "assets/gallery/Fredt5bYfXdWS_rkMapxW7SdBmE3.jpg", width: 1706, height: 1279, cap: "" },
    { src: "assets/gallery/lg0Ek8BWKQUBF9OZQGMzrFFZv7zT.jpg", width: 4284, height: 5712, cap: "" },
    { src: "assets/gallery/Frsv2Cni2TUQ9DKNPBnRrAEnWWSV.png", width: 943, height: 1199, cap: "" },
    { src: "assets/gallery/lliZA9sFpk1p1rJc0yRAPoMuKxrJ.jpg", width: 3024, height: 4032, cap: "" },
    { src: "assets/gallery/FvnDNBp2WvZDkvEQB0o1rwng2nTU.jpg", width: 1206, height: 2113, cap: "" },
    { src: "assets/gallery/FgAY1PyH1N7rFP2aS1RkbdGf_kGE.jpg", width: 1600, height: 900, cap: "" },
    { src: "assets/gallery/FjLGqXNuQpuFP2i_H7Sam_trNgzT.jpg", width: 1160, height: 644, cap: "" },
    { src: "assets/gallery/FscNWplVzxrYqMjDAUu0dI7OccbF.jpg", width: 1440, height: 1920, cap: "" },
    { src: "assets/gallery/FpUpseUplFlEzdTl_WUsT4FT3hVr.jpg", width: 1920, height: 2560, cap: "" },
    { src: "assets/gallery/FlIJq7ZyyAUcpUg4GC7UhDUDFoYn.png", width: 1200, height: 1066, cap: "" },
    { src: "assets/gallery/FnrUPsjxIskMZY0cpl2OGrGMAaLJ.jpg", width: 1706, height: 1279, cap: "" },
    { src: "assets/gallery/Foh71UDhcYCyDouBAsvCvcNAn9Lm.jpg", width: 1279, height: 1706, cap: "" },
    { src: "assets/gallery/FgMOyTad4sgU_5G6qHf-XMkFQ6Qv.jpg", width: 2048, height: 1536, cap: "" },
    { src: "assets/gallery/FpGWaVCLRUAsBNTPPZexEPzx6G6K.png", width: 423, height: 279, cap: "" },
    { src: "assets/gallery/FrWHSiE28i6Kdlrzh4lZaaThqWad.jpg", width: 2048, height: 1536, cap: "" },
    { src: "assets/gallery/FssG3YlERCi5BxAtQgpYco-7Oo15.jpg", width: 1279, height: 2275, cap: "" },
    { src: "assets/gallery/FswSrLfA8SROodmC4xTkFMsyxlFR.jpg", width: 1279, height: 1706, cap: "" },
    { src: "assets/gallery/lsJADwKHtOlSJctDdIsB8-6od7H4.jpg", width: 4284, height: 5712, cap: "" },
    { src: "assets/gallery/FmLxs4MgmUPMtkEe8zeS2HIncGX2.jpg", width: 1702, height: 1276, cap: "" },
    { src: "assets/gallery/Fgf4b1JTK8h5G8FlDWVgTmDdyCg0.jpg", width: 1536, height: 2049, cap: "" },
    { src: "assets/gallery/Fth4-vlAPzn1mHiq6-G6Kvbb_Frn.png", width: 500, height: 648, cap: "" },
    { src: "assets/gallery/FsEa3ecXDbc0JEFW_sVxxkSbBzg4.png", width: 400, height: 636, cap: "" },
    { src: "assets/gallery/FqyjvoPPH_vrX2vmdGY5ZwEjY8eO.png", width: 1316, height: 1038, cap: "" },
    { src: "assets/gallery/FmPvsruouz1KTPYDNgF2xjFbAeZ1.png", width: 1789, height: 1342, cap: "" },
    { src: "assets/gallery/ljDwaz0dEq8Bqir7KbjSHVkajKHD.jpg", width: 5184, height: 7776, cap: "" }
  ];

  // The peptide illustration is isolated in peptide-assembly.js.

  /* ---------------- nav ---------------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  const compactNav = matchMedia("(max-width: 1100px)");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open && compactNav.matches));
    links.hidden = compactNav.matches && !open;
  }
  function syncMenu() {
    const active = document.activeElement;
    nav.dataset.menuReady = "";
    setMenu(false);
    if (compactNav.matches && links.contains(active)) burger.focus();
    if (!compactNav.matches && active === burger) links.querySelector("a").focus();
  }
  syncMenu();
  compactNav.addEventListener("change", syncMenu);
  addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", scrollY > 10);
  }, { passive: true });
  burger.addEventListener("click", () => setMenu(links.hidden));
  nav.addEventListener("keydown", event => {
    if (event.key === "Escape" && compactNav.matches && !links.hidden) {
      setMenu(false);
      burger.focus();
    }
  });
  links.addEventListener("click", event => {
    const link = event.target.closest("a[href^='#']");
    if (!link || !compactNav.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setMenu(false);
    const section = document.getElementById(link.hash.slice(1));
    if (section) {
      section.tabIndex = -1;
      section.focus({ preventScroll: true });
    }
  });
  nav.addEventListener("focusout", event => {
    if (compactNav.matches && event.relatedTarget && !nav.contains(event.relatedTarget)) setMenu(false);
  });
  document.addEventListener("pointerdown", event => {
    if (compactNav.matches && !nav.contains(event.target) && !links.hidden) setMenu(false);
  });

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

  /* ---------------- emission videos: play only while on screen ---------------- */
  const emitVids = document.querySelectorAll(".emit-video");
  if (emitVids.length) {
    const vidObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const v = e.target;
        if (e.isIntersecting) {
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.12 });
    emitVids.forEach(v => vidObs.observe(v));
  }

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

  // Choose consecutive rows with similar heights. Including the last row in the
  // cost avoids a single oversized image or an unfinished strip at the bottom.
  const galleryRatios = GALLERY.map(photo => photo.width / (photo.visibleHeight || photo.height));
  function galleryRowEnds(width, gap) {
    const targetHeight = Math.min(247, Math.max(144, width / 3.35));
    const count = GALLERY.length;
    const cost = Array(count + 1).fill(Infinity);
    const next = Array(count);
    cost[count] = 0;
    for (let start = count - 1; start >= 0; start--) {
      let aspectSum = 0;
      let narrowest = Infinity;
      for (let end = start; end < count; end++) {
        aspectSum += galleryRatios[end];
        narrowest = Math.min(narrowest, galleryRatios[end]);
        const height = (width - (end - start) * gap) / aspectSum;
        if (height <= 0) break;
        // Avoid squeezing a portrait to a sliver beside wider photos on a phone.
        const cramped = Math.max(0, Math.log(92 / (height * narrowest)));
        const penalty = Math.log(height / targetHeight) ** 2 + 6 * cramped ** 2 + cost[end + 1];
        if (penalty < cost[start]) {
          cost[start] = penalty;
          next[start] = end + 1;
        }
      }
    }
    const ends = [];
    for (let i = 0; i < count; i = next[i]) ends.push(next[i]);
    return ends;
  }

  function renderGallery() {
    if (!GALLERY.length) {
      gBox.innerHTML = '<p style="color:var(--faint);font-size:14px;grid-column:1/-1">Photos coming soon…</p>';
      return;
    }
    gBox.innerHTML = GALLERY.map((it, i) =>
      '<figure class="g-item' + (it.feat ? " g-feat" : "") + (it.visibleHeight ? " g-valid-rows" : "") + '" style="--photo-ratio:' + galleryRatios[i] + '" data-cap="' + it.cap.replace(/"/g, "&quot;") + '">' +
      '<img src="' + it.src + '" width="' + it.width + '" height="' + it.height + '" alt="' + it.cap.replace(/"/g, "&quot;") + '" loading="lazy">' +
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
    // Keep the original figure and image nodes when the viewport changes.
    const photos = Array.from(gBox.querySelectorAll(".g-item"));
    let previousRows = "";
    function fitRows(width) {
      if (width <= 0) return;
      const gap = parseFloat(getComputedStyle(gBox).rowGap);
      const ends = galleryRowEnds(width, gap);
      const signature = ends.join(",");
      if (signature === previousRows) return;
      previousRows = signature;
      const rows = document.createDocumentFragment();
      let start = 0;
      for (const end of ends) {
        const row = document.createElement("div");
        row.className = "g-row";
        row.append(...photos.slice(start, end));
        rows.append(row);
        start = end;
      }
      gBox.replaceChildren(rows);
    }
    fitRows(gBox.clientWidth);
    let pendingFit = 0, pendingWidth = gBox.clientWidth;
    new ResizeObserver(([entry]) => {
      pendingWidth = entry.contentRect.width;
      if (pendingFit) return;
      // Reparenting rows inside observer delivery can trigger a WebKit resize loop.
      pendingFit = requestAnimationFrame(() => { pendingFit = 0; fitRows(pendingWidth); });
    }).observe(gBox);
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

/* ---------------- site visit counter (Cloudflare Worker) ---------------- */
(function () {
  "use strict";
  const COUNTER_URL = (window.COUNTER_URL) || "https://xzp-counter.zuping.workers.dev";
  const el = document.getElementById("siteCounter");
  if (!el) return;

  let vid = null;
  try {
    vid = localStorage.getItem("xzp_vid");
    if (!vid) {
      vid = crypto.randomUUID().replaceAll("-", "");
      localStorage.setItem("xzp_vid", vid);
    }
  } catch (e) { /* storage unavailable — count PV only */ }

  const q = vid ? "?vid=" + encodeURIComponent(vid) : "";
  fetch(COUNTER_URL + "/hit" + q)
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(d => {
      const fmt = n => Number(n || 0).toLocaleString("en-US");
      const pv = document.getElementById("scPv");
      const uv = document.getElementById("scUv");
      const today = document.getElementById("scToday");
      if (pv) pv.textContent = fmt(d.pv);
      if (uv) uv.textContent = fmt(d.uv);
      if (today) today.textContent = fmt(d.pvToday);
      el.hidden = false;
    })
    .catch(() => { /* offline or blocked: keep the chip hidden */ });
})();
