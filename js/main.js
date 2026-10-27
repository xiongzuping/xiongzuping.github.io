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
     A dark lab sky: faint stars, polymer chains carrying amide /
     urethane / carbamate groups with labelled N·O atoms, pulsing
     N–H···O=C hydrogen-bond bridges between chains, glowing
     clusteroluminescence aggregates, benzene rings, π-stacking
     ring pairs whose double-bond π clouds overlap as the rings
     breathe toward each other, and light motes that flock to the
     pointer and glow once they cluster (interactive CTE). */
  const canvas = document.getElementById("starfield");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let stars = [], clusters = [], chains = [], rings = [], pairs = [], groups = [],
        W = 0, H = 0, raf = null, t = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const R = (a, b) => a + Math.random() * (b - a);
    const PALETTE = [[109,124,255],[34,211,238],[167,139,250],[52,211,153],[251,191,36]];
    const CN = "96,165,250", CO = "248,113,113", CC = "148,163,184";
    const FONT = Math.round(6.5 * DPR) + 'px Arial, sans-serif';

    /* benzene ring: regular hexagon + Kekulé double bonds */
    function hexPath(r) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + i * Math.PI / 3;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.closePath();
    }
    function ringBody(x, y, r, rot, c) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = "rgba(" + c + ",.3)";
      ctx.lineWidth = 1.7 * DPR;
      hexPath(r); ctx.stroke();
      const verts = [];
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + i * Math.PI / 3;
        verts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      ctx.strokeStyle = "rgba(" + c + ",.42)";
      ctx.lineWidth = 2.2 * DPR;
      for (let i = 0; i < 6; i += 2) {
        const A = verts[i], B = verts[(i + 1) % 6];
        /* double bond inset from both vertices (textbook Kekulé style) */
        const ax = A[0] + (B[0] - A[0]) * 0.22, ay = A[1] + (B[1] - A[1]) * 0.22;
        const bx = A[0] + (B[0] - A[0]) * 0.78, by = A[1] + (B[1] - A[1]) * 0.78;
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const d = Math.hypot(mx, my) || 1, nx = -mx / d, ny = -my / d;
        for (let k = 0; k < 2; k++) {
          const off = (2.2 + 2.8 * k) * DPR;
          ctx.beginPath();
          ctx.moveTo(ax + nx * off, ay + ny * off);
          ctx.lineTo(bx + nx * off, by + ny * off);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    function drawBenzene(b) {
      b.y -= b.vy; b.rot += b.vr;
      if (b.y < -30) { b.y = H + 30; b.x = Math.random() * W; }
      ringBody(b.x, b.y, b.r, b.rot, b.c);
    }
    /* one ring of a π-stacking pair: π clouds sit on the three C=C double
       bonds of the ring (Kekulé alternation) along the ring normal; the
       cloud on the bond facing the gap brightens as the pair overlaps */
    function drawPiRing(x, y, r, rot, c, dir, ov) {
      ringBody(x, y, r, rot, c);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      /* midpoints of the three double bonds (edges v0-v1, v2-v3, v4-v5) */
      const mids = [
        [0.433 * r, 0.75 * r], [-0.866 * r, 0], [0.433 * r, -0.75 * r]
      ];
      for (const m of mids) {
        const d = Math.hypot(m[0], m[1]) || 1;
        const ox = m[0] / d, oy = m[1] / d;   /* outward normal */
        const facing = dir * m[1] > 0;        /* this double bond faces the gap */
        const al = facing ? ov : 0.12;
        const lx = m[0] + ox * r * 0.3, ly = m[1] + oy * r * 0.3;
        const ang = Math.atan2(oy, ox);
        ctx.fillStyle = "rgba(" + c + "," + (0.06 + 0.24 * al).toFixed(3) + ")";
        ctx.beginPath(); ctx.ellipse(lx, ly, r * 0.45, r * 0.55, ang, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(" + c + "," + (0.24 + 0.32 * al).toFixed(3) + ")";
        ctx.lineWidth = 1.1 * DPR;
        ctx.beginPath(); ctx.ellipse(lx, ly, r * 0.45, r * 0.55, ang, 0, Math.PI * 2); ctx.stroke();
        if (facing) {
          /* bright core where the electron density concentrates */
          ctx.fillStyle = "rgba(" + c + "," + (0.1 + 0.3 * ov).toFixed(3) + ")";
          ctx.beginPath(); ctx.ellipse(lx, ly, r * 0.2, r * 0.24, ang, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }
    /* π-stacking pair: gap breathes; lobes, glow and merge-nodes track it.
       gap0 is tuned so facing lobes just touch at rest (r: ring radius). */
    function drawPiPair(pr, t) {
      pr.y -= pr.vy; pr.rot += pr.vr;
      if (pr.y < -90) { pr.y = H + 90; pr.x = Math.random() * W; }
      const s = Math.sin(t * 0.012 + pr.ph);
      const gap = pr.gap0 - s * pr.amp;
      const ov = 0.5 + 0.5 * s; /* π-overlap factor 0..1 */
      const g = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, pr.r * 1.9);
      g.addColorStop(0, "rgba(" + pr.c + "," + (0.08 + 0.42 * ov).toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + pr.c + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(pr.x, pr.y, pr.r * 1.7, pr.r * 0.8 + gap * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      drawPiRing(pr.x, pr.y - gap / 2, pr.r, pr.rot, pr.c, 1, ov);
      drawPiRing(pr.x, pr.y + gap / 2, pr.r, pr.rot, pr.c, -1, ov);
      /* bright node where the opposing π clouds merge */
      ctx.fillStyle = "rgba(224,242,254," + (0.15 + 0.7 * ov).toFixed(3) + ")";
      {
        const lx = 0.433 * pr.r, ly = 0;
        const wx = pr.x + Math.cos(pr.rot) * lx - Math.sin(pr.rot) * ly;
        const wy = pr.y + Math.sin(pr.rot) * lx + Math.cos(pr.rot) * ly;
        ctx.beginPath(); ctx.arc(wx, wy, 2.6 * DPR, 0, Math.PI * 2); ctx.fill();
      }
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
      /* two close chain pairs so N–H···O=C bridges can form */
      const seqs = [["O","C","N"], ["C","N"], ["O","C","N"], ["C","O"]];
      const ys = [];
      const yA = R(0.22, 0.32) * H;
      ys.push(yA, yA + R(100, 150) * DPR);
      const yC = R(0.58, 0.68) * H;
      ys.push(yC, yC + R(100, 150) * DPR);
      chains = ys.map((y0, i) => ({
        y0, f: R(1.5, 3), amp: R(30, 60) * DPR,
        ph: Math.random() * Math.PI * 2, v: R(0.003, 0.009),
        seq: seqs[i], c: PALETTE[i], hs: [], os: []
      }));
      rings = Array.from({ length: 3 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: R(12, 26) * DPR,
        rot: Math.random() * Math.PI,
        vr: R(-0.004, 0.004),
        vy: R(0.03, 0.09) * DPR,
        c: PALETTE[Math.floor(Math.random() * PALETTE.length)].join(",")
      }));
      /* π-stacking pairs: two rings per pair, gap breathes, lobes overlap */
      pairs = Array.from({ length: 2 }, () => {
        const r = R(14, 20) * DPR;
        return {
          x: Math.random() * W, y: Math.random() * H, r,
          rot: 0, vr: 0,
          vy: R(0.03, 0.08) * DPR,
          gap0: 3 * r, amp: 0.5 * r,
          ph: Math.random() * Math.PI * 2,
          c: PALETTE[Math.floor(Math.random() * PALETTE.length)].join(",")
        };
      });
      groups = [
        { kind: "amide", x: R(0.15, 0.3) * W, y: R(0.15, 0.45) * H, s: DPR, rot: R(-0.25, 0.25), vr: R(-0.002, 0.002), vy: R(0.02, 0.05) * DPR },
        { kind: "biuret", x: R(0.42, 0.6) * W, y: R(0.5, 0.8) * H, s: DPR, rot: R(-0.25, 0.25), vr: R(-0.002, 0.002), vy: R(0.02, 0.05) * DPR },
        { kind: "urethane", x: R(0.7, 0.88) * W, y: R(0.2, 0.45) * H, s: DPR, rot: R(-0.25, 0.25), vr: R(-0.002, 0.002), vy: R(0.02, 0.05) * DPR }
      ];
    }

    function drawCluster(cl, tt) {
      const pulse = 1 + Math.sin(tt * 0.012 + cl.ph) * 0.12;
      const r = cl.r * pulse;
      let g = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, r);
      g.addColorStop(0, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0.5)");
      g.addColorStop(0.55, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0.12)");
      g.addColorStop(1, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cl.x, cl.y, r, 0, Math.PI * 2); ctx.fill();
      g = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, r * 0.45);
      g.addColorStop(0, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0.3)");
      g.addColorStop(1, "rgba(" + cl.c[0] + "," + cl.c[1] + "," + cl.c[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cl.x, cl.y, r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath(); ctx.arc(cl.x, cl.y, r * 0.12, 0, Math.PI * 2); ctx.fill();
      /* the "cluster": a ring of tiny emissive dots */
      ctx.fillStyle = "rgba(255,255,255,0.26)";
      for (let k = 0; k < 6; k++) {
        const a = tt * 0.004 + cl.ph + k * Math.PI / 3;
        ctx.beginPath();
        ctx.arc(cl.x + Math.cos(a) * r * 0.5, cl.y + Math.sin(a) * r * 0.5, 1.7 * DPR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function chainY(ch, x, tt) {
      return ch.y0 + Math.sin((x / W) * Math.PI * 2 * ch.f + ch.ph) * ch.amp +
             Math.sin(tt * 0.006 + ch.ph * 3) * 10 * DPR;
    }
    function chainNormal(ch, x) {
      const d = Math.cos((x / W) * Math.PI * 2 * ch.f + ch.ph) * ch.amp * (Math.PI * 2 * ch.f / W);
      const len = Math.hypot(d, 1);
      return [-d / len, 1 / len];
    }
    function drawChain(ch, tt) {
      ch.ph += ch.v;
      ch.hs = []; ch.os = [];
      const step = 48 * DPR;
      const col = ch.c.join(",");
      ctx.strokeStyle = "rgba(" + col + ",.12)";
      ctx.lineWidth = 2.2 * DPR;
      ctx.beginPath();
      let first = true;
      for (let x = -step; x < W + step * 2; x += step) {
        const y = chainY(ch, x, tt);
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      let i = 0;
      for (let x = 0; x < W + step; x += step, i++) {
        const label = ch.seq[i % ch.seq.length];
        const y = chainY(ch, x, tt);
        const n = chainNormal(ch, x);
        if (n[1] > 0) { n[0] = -n[0]; n[1] = -n[1]; }
        const colA = label === "N" ? CN : label === "O" ? CO : CC;
        ctx.fillStyle = "#0a0f22";
        ctx.beginPath(); ctx.arc(x, y, 4.4 * DPR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(" + colA + "," + (label === "C" ? 0.3 : 0.55) + ")";
        ctx.lineWidth = 1.7 * DPR;
        ctx.beginPath(); ctx.arc(x, y, 4.4 * DPR, 0, Math.PI * 2); ctx.stroke();
        ctx.font = FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        if (label === "C") {
          /* carbonyl C=O: parallel double bond from node edge to O edge */
          const tx = x + n[0] * 11 * DPR, ty = y + n[1] * 11 * DPR;
          const px = -n[1], py = n[0];
          const sx = x + n[0] * 5 * DPR, sy = y + n[1] * 5 * DPR;
          const ex = tx - n[0] * 3.5 * DPR, ey = ty - n[1] * 3.5 * DPR;
          ctx.strokeStyle = "rgba(" + CO + ",.5)";
          ctx.lineWidth = 1.4 * DPR;
          for (let s = -1; s <= 1; s += 2) {
            ctx.beginPath();
            ctx.moveTo(sx + px * s * 1.8 * DPR, sy + py * s * 1.8 * DPR);
            ctx.lineTo(ex + px * s * 1.8 * DPR, ey + py * s * 1.8 * DPR);
            ctx.stroke();
          }
          ctx.fillStyle = "#0a0f22";
          ctx.beginPath(); ctx.arc(tx, ty, 3 * DPR, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(" + CO + ",.7)";
          ctx.lineWidth = 1.4 * DPR;
          ctx.beginPath(); ctx.arc(tx, ty, 3 * DPR, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = "rgba(252,165,165,.55)";
          ctx.fillText("O", tx + n[0] * 7 * DPR, ty + n[1] * 7 * DPR);
          ch.os.push([tx, ty]);
        } else if (label === "N") {
          /* amide N–H */
          const hx = x + n[0] * 8 * DPR, hy = y + n[1] * 8 * DPR;
          ctx.strokeStyle = "rgba(226,232,240,.4)";
          ctx.lineWidth = 1 * DPR;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(hx, hy); ctx.stroke();
          ctx.fillStyle = "rgba(226,232,240,.7)";
          ctx.beginPath(); ctx.arc(hx, hy, 2.2 * DPR, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(147,197,253,.6)";
          ctx.fillText("N", x, y + 10 * DPR);
          ch.hs.push([hx, hy]);
        } else {
          ctx.fillStyle = "rgba(252,165,165,.55)";
          ctx.fillText("O", x, y + 10 * DPR);
        }
      }
    }

    /* N–H···O=C hydrogen bonds bridging neighbouring chains */
    function drawHBonds(tt) {
      const cand = [];
      for (let i = 0; i < chains.length; i++) {
        for (let j = i + 1; j < chains.length; j++) {
          const A = chains[i], B = chains[j];
          for (const h of A.hs) for (const o of B.os) {
            const d = Math.hypot(h[0] - o[0], h[1] - o[1]);
            if (d < 150 * DPR) cand.push([d, h, o]);
          }
          for (const h of B.hs) for (const o of A.os) {
            const d = Math.hypot(h[0] - o[0], h[1] - o[1]);
            if (d < 150 * DPR) cand.push([d, h, o]);
          }
        }
      }
      cand.sort((a, b) => a[0] - b[0]);
      const n = Math.min(5, cand.length);
      for (let k = 0; k < n; k++) {
        const h = cand[k][1], o = cand[k][2];
        const pulse = 0.5 + 0.5 * Math.sin(tt * 0.016 + k * 2.1);
        ctx.save();
        ctx.strokeStyle = "rgba(103,232,249," + (0.16 + pulse * 0.14) + ")";
        ctx.lineWidth = 1.3 * DPR;
        ctx.setLineDash([3.5 * DPR, 5 * DPR]);
        ctx.shadowColor = "rgba(103,232,249,.9)";
        ctx.shadowBlur = 5 * DPR;
        ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(o[0], o[1]); ctx.stroke();
        ctx.restore();
      }
    }

    /* floating functional-group fragments: amide / biuret / urethane */
    function drawGroup(g, tt, staticMode) {
      if (!staticMode) {
        g.y -= g.vy; g.rot += g.vr;
        if (g.y < -70) { g.y = H + 70; g.x = Math.random() * W; }
      }
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      const s = g.s;
      const atom = (x, y, r, c, label, labCol, dy) => {
        ctx.fillStyle = "#0a0f22";
        ctx.beginPath(); ctx.arc(x * s, y * s, r * s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(" + c + ",.6)";
        ctx.lineWidth = 1.3 * s;
        ctx.beginPath(); ctx.arc(x * s, y * s, r * s, 0, Math.PI * 2); ctx.stroke();
        if (label) {
          ctx.font = Math.round(6 * s) + 'px Arial, sans-serif';
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = labCol;
          ctx.fillText(label, x * s, (y + (dy || 0)) * s);
        }
      };
      const bond = (x1, y1, x2, y2) => {
        ctx.strokeStyle = "rgba(148,163,184,.45)";
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath(); ctx.moveTo(x1 * s, y1 * s); ctx.lineTo(x2 * s, y2 * s); ctx.stroke();
      };
      const dbl = (x1, y1, x2, y2, r1, r2) => {
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
        const ux = dx / L, uy = dy / L, px = -uy * 1.8, py = ux * 1.8;
        ctx.strokeStyle = "rgba(248,113,113,.5)";
        ctx.lineWidth = 1.2 * s;
        for (const sg of [1, -1]) {
          ctx.beginPath();
          ctx.moveTo((x1 + ux * (r1 + 0.5) + px * sg) * s, (y1 + uy * (r1 + 0.5) + py * sg) * s);
          ctx.lineTo((x2 - ux * (r2 + 0.5) + px * sg) * s, (y2 - uy * (r2 + 0.5) + py * sg) * s);
          ctx.stroke();
        }
      };
      const hdot = (x, y, dx, dy) => {
        if (dx === undefined) { dx = -7; dy = -11; }
        ctx.strokeStyle = "rgba(226,232,240,.4)";
        ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.moveTo(x * s, y * s); ctx.lineTo((x + dx) * s, (y + dy) * s); ctx.stroke();
        ctx.fillStyle = "rgba(226,232,240,.65)";
        ctx.beginPath(); ctx.arc((x + dx) * s, (y + dy) * s, 2.6 * s, 0, Math.PI * 2); ctx.fill();
      };
      /* R-substituent stub: open bond + continuation ring, completes valences */
      const rstub = (x, y, dx, dy) => {
        bond(x, y, x + dx, y + dy);
        ctx.strokeStyle = "rgba(148,163,184,.55)";
        ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.arc((x + dx) * s, (y + dy) * s, 3 * s, 0, Math.PI * 2); ctx.stroke();
      };
      if (g.kind === "amide") {
        /* amide bond R'–N(H)–C(=O)–R */
        bond(0, 0, 28, 0);
        atom(0, 0, 7, CN, "N", "rgba(147,197,253,.6)", 9);
        atom(28, 0, 7, CC, "", null, 0);
        dbl(28, 0, 20, -18, 7, 4);
        atom(20, -19, 4, CO, "O", "rgba(252,165,165,.55)", -10);
        hdot(0, 0);
        rstub(0, 0, -19, 11);
        rstub(28, 0, 17, 10);
      } else if (g.kind === "biuret") {
        /* biuret H2N–CO–NH–CO–NH2 */
        bond(0, 0, 26, -6); bond(26, -6, 52, 0); bond(52, 0, 78, -6); bond(78, -6, 104, 0);
        atom(0, 0, 7, CN, "", null, 0);
        atom(26, -6, 7, CC, "", null, 0);
        atom(52, 0, 7, CN, "N", "rgba(147,197,253,.6)", 9);
        atom(78, -6, 7, CC, "", null, 0);
        atom(104, 0, 7, CN, "", null, 0);
        dbl(26, -6, 18, -24, 7, 4);
        atom(18, -25, 4, CO, "O", "rgba(252,165,165,.55)", -10);
        dbl(78, -6, 70, -24, 7, 4);
        atom(70, -25, 4, CO, "O", "rgba(252,165,165,.55)", -10);
        hdot(0, 0); hdot(0, 0, -9, 9);
        hdot(52, 0, -6, 14);
        hdot(104, 0); hdot(104, 0, 9, 9);
      } else { /* urethane (carbamate): R–O–C(=O)–N(H)–R */
        bond(0, 0, 26, 0); bond(26, 0, 52, 0);
        atom(0, 0, 7, CO, "O", "rgba(252,165,165,.55)", 9);
        atom(26, 0, 7, CC, "", null, 0);
        atom(52, 0, 7, CN, "N", "rgba(147,197,253,.6)", 9);
        dbl(26, 0, 18, -18, 7, 4);
        atom(18, -19, 4, CO, "O", "rgba(252,165,165,.55)", -10);
        hdot(52, 0);
        rstub(0, 0, -20, 0);
        rstub(52, 0, 20, 0);
      }
      ctx.restore();
    }

    /* ---------------- interactive clusteroluminescence ----------------
       Light motes drift across the page; the pointer attracts nearby
       motes, and once they crowd together the aggregate starts to glow
       (density-triggered emission, like clusteroluminescence) and fires
       a soft pulse ring each time a tight cluster forms. */
    const motes = [], pulses = [];
    const MOTE_N = Math.min(120, Math.max(70, Math.floor((innerWidth * innerHeight) / 9000)));
    const MOTE_R = 240 * DPR;    /* attraction radius */
    const MOTE_D = 55 * DPR;     /* crowding distance for emission */
    let pmx = -1e4, pmy = -1e4, pActive = 0, pulseCd = 0;

    function spawnMotes() {
      while (motes.length < MOTE_N) {
        motes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: 0, vy: 0,
          c: Math.random() < 0.5 ? "34,211,238" : "109,124,255",
          s: (0.6 + Math.random() * 1.1) * DPR,
          ph: Math.random() * Math.PI * 2
        });
      }
    }
    addEventListener("pointermove", (e) => {
      pmx = e.clientX * DPR; pmy = e.clientY * DPR; pActive = 1;
    });
    addEventListener("pointerdown", (e) => {
      pmx = e.clientX * DPR; pmy = e.clientY * DPR; pActive = 1;
    });
    addEventListener("pointerleave", () => { pActive = 0; });

    function drawMotes(tt) {
      spawnMotes();
      pActive = Math.max(0, pActive - 0.004);  /* pull fades ~4 s after rest */
      /* drift toward the pointer + gentle Brownian jitter */
      const r2a = MOTE_R * MOTE_R;
      for (const m of motes) {
        const dx = pmx - m.x, dy = pmy - m.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2a && d2 > 0.01 && pActive > 0) {
          const d = Math.sqrt(d2);
          const f = 0.03 * pActive * (1 - d / MOTE_R);
          m.vx += (dx / d) * f; m.vy += (dy / d) * f;
        }
        m.vx += (Math.random() - 0.5) * 0.03 * DPR;
        m.vy += (Math.random() - 0.5) * 0.03 * DPR;
        m.vx *= 0.9; m.vy *= 0.9;
        m.x += m.vx; m.y += m.vy;
        if (m.x < -24) m.x = W + 24; if (m.x > W + 24) m.x = -24;
        if (m.y < -24) m.y = H + 24; if (m.y > H + 24) m.y = -24;
      }
      /* crowd count: neighbours within MOTE_D raise each mote's emission */
      const d2n = MOTE_D * MOTE_D;
      const crowd = new Float32Array(motes.length);
      for (let i = 0; i < motes.length; i++) {
        for (let j = i + 1; j < motes.length; j++) {
          const dx = motes[i].x - motes[j].x, dy = motes[i].y - motes[j].y;
          if (dx * dx + dy * dy < d2n) { crowd[i]++; crowd[j]++; }
        }
      }
      let near = 0;
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        const g = Math.min(1, crowd[i] / 4);
        if (g > 0) {
          const dx = m.x - pmx, dy = m.y - pmy;
          if (dx * dx + dy * dy < 6400 * DPR * DPR) near++;
        }
        const tw = 0.5 + 0.5 * Math.sin(tt * 0.02 + m.ph);
        const a = 0.1 + 0.55 * g + 0.12 * tw * (1 - g);
        ctx.fillStyle = "rgba(" + m.c + "," + Math.min(0.95, a).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(m.x, m.y, m.s * (1 + 1.1 * g), 0, Math.PI * 2); ctx.fill();
      }
      /* aggregate glow around the pointer while motes crowd there */
      if (near > 3 && pActive > 0.03) {
        const ga = Math.min(0.45, 0.06 + 0.035 * near);
        const g = ctx.createRadialGradient(pmx, pmy, 0, pmx, pmy, 120 * DPR);
        g.addColorStop(0, "rgba(165,240,255," + ga.toFixed(3) + ")");
        g.addColorStop(0.55, "rgba(129,140,248," + (ga * 0.5).toFixed(3) + ")");
        g.addColorStop(1, "rgba(129,140,248,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(pmx, pmy, 120 * DPR, 0, Math.PI * 2); ctx.fill();
        /* tight cluster: white-hot core + emission pulse ring */
        if (near >= 10) {
          const cg = ctx.createRadialGradient(pmx, pmy, 0, pmx, pmy, 26 * DPR);
          cg.addColorStop(0, "rgba(255,255,255," + (0.35 + 0.25 * Math.sin(tt * 0.05)).toFixed(3) + ")");
          cg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(pmx, pmy, 26 * DPR, 0, Math.PI * 2); ctx.fill();
          if (tt > pulseCd) {
            pulseCd = tt + 140;
            pulses.push({ x: pmx, y: pmy, t0: tt });
          }
        }
      }
      /* expanding pulse rings emitted when a cluster forms */
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], age = (tt - p.t0) / 55;
        if (age >= 1) { pulses.splice(i, 1); continue; }
        ctx.strokeStyle = "rgba(103,232,249," + (0.45 * (1 - age)).toFixed(3) + ")";
        ctx.lineWidth = 1.6 * DPR * (1 - age) + 0.3;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6 * DPR + age * 60 * DPR, 0, Math.PI * 2); ctx.stroke();
      }
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
        if (cl.y > H + 90) { cl.y = -90; cl.x = Math.random() * W; }
        if (cl.x > W + 90) cl.x = -90;
        if (cl.x < -90) cl.x = W + 90;
        drawCluster(cl, t);
      }
      for (const ch of chains) drawChain(ch, t);
      drawHBonds(t);
      for (const b of rings) drawBenzene(b);
      for (const pr of pairs) drawPiPair(pr, t);
      for (const g of groups) drawGroup(g, t, false);
      drawMotes(t);
      raf = requestAnimationFrame(tick);
    }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    if (reduced) { /* static render */
      ctx.fillStyle = "rgba(160,180,255,.3)";
      stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); });
      clusters.forEach(cl => drawCluster(cl, 0));
      chains.forEach(ch => drawChain(ch, 0));
      drawHBonds(0);
      rings.forEach(b => drawBenzene(b));
      pairs.forEach(pr => drawPiPair(pr, 0));
      groups.forEach(g => drawGroup(g, 0, true));
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
