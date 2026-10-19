/* =====================================================================
   CONFIGURACIÓN: lo único que hay que tocar
   ===================================================================== */
const CONFIG = {
  MARCA: "ÁLEX VEGA",                                   // nombre del negocio (logo, pie y <title>)
  MQ_VERTICAL: "(max-width: 800px) and (orientation: portrait)",  // cuándo se usan los fotogramas verticales
  EXT: "webp",
  // Una entrada por sección con secuencia (la clave = data-seq="…" en el HTML)
  SECUENCIAS: {
    hero: {
      TOTAL: 121,                                   // nº de fotogramas (f001…f121) en cada carpeta
      PC: "img/portada/frames/pc",                  // horizontal
      MOVIL: "img/portada/frames/movil",            // vertical (móvil en retrato)
      FIN_VIDEO: 0.86,                              // % del scroll de la sección en que acaba el vídeo
      DIFERIDA: false,                              // false = carga al abrir la página
    },
    transicion: {                                   // nube de magnesio que une la portada con el giro (Pixel)
      TOTAL: 76,
      PC: "img/transicion/frames/pc",
      MOVIL: "img/transicion/frames/movil",
      FIN_VIDEO: 1,
      DIFERIDA: true,
    },
    sobre: {
      TOTAL: 121,
      PC: "img/sobre-mi/frames/pc",
      MOVIL: "img/sobre-mi/frames/movil",
      FIN_VIDEO: 0.86,
      DIFERIDA: true,                               // true = empieza a cargar al acercarse la sección
    },
  },
};
/* ===================================================================== */

(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v) => Math.max(0, Math.min(1, v));

  // --- Marca (un solo sitio) ---
  document.querySelectorAll("[data-marca]").forEach((el) => (el.textContent = CONFIG.MARCA));
  document.title = document.title.replace(/^[^·|]+/, CONFIG.MARCA + " ");

  // --- Cabecera y menú móvil ---
  const cab = document.querySelector(".cabecera");
  const btn = document.querySelector(".menu-btn");
  const solida = () => cab.classList.toggle("solida", scrollY > 40);
  addEventListener("scroll", solida, { passive: true }); solida();
  const cerrar = () => { cab.classList.remove("abierta"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Abrir menú"); };
  btn.addEventListener("click", () => {
    const abierta = cab.classList.toggle("abierta");
    btn.setAttribute("aria-expanded", abierta); btn.setAttribute("aria-label", abierta ? "Cerrar menú" : "Abrir menú");
  });
  document.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", cerrar));
  addEventListener("keydown", (e) => e.key === "Escape" && cerrar());

  // --- Revelado de secciones ---
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  document.getElementById("anio").textContent = new Date().getFullYear();

  // --- 3. Objetivos: índice para la baraja del móvil ---
  document.querySelectorAll(".obj").forEach((el, i) => el.style.setProperty("--i", i));

  // --- 5. Resultados: pestañas, barra deslizable y contadores ---
  const comps = [...document.querySelectorAll(".comp")], tabs = [...document.querySelectorAll(".res__tab")];
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => { x.classList.toggle("on", x === t); x.setAttribute("aria-pressed", x === t); });
    comps.forEach((c) => c.classList.toggle("on", c.dataset.i === t.dataset.i));
  }));
  comps.forEach((c) => { const r = c.querySelector(".comp__rango"); r.addEventListener("input", () => c.style.setProperty("--pos", r.value + "%")); });
  const contar = (el) => {
    const fin = +el.dataset.cuenta, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    const fmt = (v) => pre + v.toFixed(dec).replace(".", ",") + suf;
    if (reduce) { el.textContent = fmt(fin); return; }
    const t0 = performance.now(), dur = 1600;
    const paso = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(fin * e); if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  };
  const ioC = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { contar(e.target); ioC.unobserve(e.target); } }), { threshold: 0.6 });
  document.querySelectorAll("[data-cuenta]").forEach((el) => ioC.observe(el));
  // pista: la barra se mueve sola una vez al aparecer
  const marco = document.querySelector(".res__marco");
  if (marco && !reduce) new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return; o.disconnect();
    const c = comps.find((x) => x.classList.contains("on")), r = c.querySelector(".comp__rango"), t0 = performance.now();
    const anim = (t) => { const k = Math.min(1, (t - t0) / 2200), v = 50 + Math.sin(k * Math.PI * 2) * 28 * (1 - k * 0.3);
      c.style.setProperty("--pos", v.toFixed(1) + "%"); r.value = v; if (k < 1) requestAnimationFrame(anim); else { c.style.setProperty("--pos", "50%"); r.value = 50; } };
    requestAnimationFrame(anim);
  }, { threshold: 0.5 }).observe(marco);

  // 6. Planes: entrada escalonada, carrusel en móvil (empieza en el destacado) e inclinación 3D en PC
  const planesS = document.querySelector(".planes");
  if (planesS) {
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { planesS.classList.add("en-vista"); o.disconnect(); } }), { threshold: 0.18 }).observe(planesS);
    const rej = planesS.querySelector(".planes__rejilla"), cartas = [...rej.querySelectorAll(".plan")], puntos = [...planesS.querySelectorAll(".planes__puntos i")];
    const marcar = () => {
      const c = rej.scrollLeft + rej.clientWidth / 2; let m = 0, d = 1e9;
      cartas.forEach((k, i) => { const x = Math.abs(k.offsetLeft + k.offsetWidth / 2 - c); if (x < d) { d = x; m = i; } });
      puntos.forEach((p, i) => p.classList.toggle("on", i === m));
    };
    const centrar = () => { if (innerWidth <= 800) { const t = cartas[1]; rej.scrollLeft = t.offsetLeft - (rej.clientWidth - t.offsetWidth) / 2; } marcar(); };
    rej.addEventListener("scroll", marcar, { passive: true }); addEventListener("resize", centrar); centrar();
    // PC: las tarjetas salen apiladas en el centro y se abren en abanico con el scroll; al terminar, destello en el destacado
    if (!reduce) {
      const lado = [-1, 0, 1], ease = (t) => 1 - Math.pow(1 - t, 3);
      const movPlanes = () => {
        if (innerWidth <= 800) { cartas.forEach((k) => { k.style.translate = k.style.rotate = k.style.opacity = ""; }); return; }
        const r = rej.getBoundingClientRect(); if (r.top > innerHeight * 1.2 || r.bottom < -200) return;
        const q = clamp((innerHeight * 0.98 - r.top) / (innerHeight * 0.72)), e = ease(q);
        cartas.forEach((k, i) => {
          const l = lado[i];
          if (l) { k.style.translate = `${(-l * (1 - e) * 104).toFixed(2)}% ${((1 - e) * 26).toFixed(1)}px`; k.style.rotate = `${(l * (1 - e) * 9).toFixed(2)}deg`; k.style.opacity = (0.15 + 0.85 * clamp(q * 1.4)).toFixed(3); }
          else { k.style.translate = `0 ${((1 - e) * 40).toFixed(1)}px`; k.style.opacity = clamp(q * 2.2).toFixed(3); }
        });
        planesS.classList.toggle("abierto", q >= 0.995);
      };
      let tP = false; addEventListener("scroll", () => { if (!tP) { tP = true; requestAnimationFrame(() => { tP = false; movPlanes(); }); } }, { passive: true });
      addEventListener("resize", movPlanes); movPlanes();
    }
    // PRUEBA Pixel: Álex sube más despacio que las tarjetas y «ELIGE» cruza la sección de lado a lado
    const eli = planesS.querySelector(".planes__elige"), alx = planesS.querySelector(".planes__alex");
    const vid = planesS.querySelector(".planes__video");
    if (vid) { vid.loop = false; if (reduce) { vid.poster = "img/planes/alex-aparece-final.jpg"; vid.preload = "none"; } }
    if (!reduce && eli && alx) {
      const fondo = () => {
        const r = planesS.getBoundingClientRect(); if (r.top > innerHeight || r.bottom < 0) return;
        const p = clamp((innerHeight - r.top) / (innerHeight + r.height));
        eli.style.setProperty("--ex", `${((0.5 - p) * innerWidth * 0.9).toFixed(1)}px`);
        alx.style.setProperty("--ay", `${((p - 0.5) * -r.height * 0.28).toFixed(1)}px`);
        // aparece antes que las tarjetas: completo cuando la parte alta de la sección llega a ~35% de la pantalla
        const a = clamp((innerHeight * 1.0 - r.top) / (innerHeight * 0.65));
        alx.style.setProperty("--ap", (a * a * (3 - 2 * a)).toFixed(3));
        if (vid && !vid.dataset.ok && a > 0.35) { vid.dataset.ok = "1"; vid.play().catch(() => { vid.currentTime = vid.duration || 6; }); }
      };
      let tF = false; addEventListener("scroll", () => { if (!tF) { tF = true; requestAnimationFrame(() => { tF = false; fondo(); }); } }, { passive: true });
      addEventListener("resize", fondo); fondo();
    }
    if (!reduce) cartas.forEach((k) => {
      k.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const b = k.getBoundingClientRect(), nx = (e.clientX - b.left) / b.width - .5, ny = (e.clientY - b.top) / b.height - .5;
        k.style.setProperty("--ty", (nx * 8).toFixed(2) + "deg"); k.style.setProperty("--tx", (-ny * 7).toFixed(2) + "deg");
        k.style.setProperty("--gx", ((nx + .5) * 100).toFixed(0) + "%"); k.style.setProperty("--gy", ((ny + .5) * 100).toFixed(0) + "%");
      });
      k.addEventListener("pointerleave", () => { k.style.setProperty("--tx", "0deg"); k.style.setProperty("--ty", "0deg"); });
    });
  }
  if (reduce) return;                               // sin animación: pósters + textos (CSS)

  /* -------------------------------------------------------------------
     Motor de secuencias: fotogramas en <canvas> enganchados al scroll.
     HTML: <section class="seq" data-seq="clave"> > .seq__sticky >
           .seq__poster, canvas.seq__canvas, .frase[data-in][data-out], .seq__final[data-desde]
     ------------------------------------------------------------------- */
  const mq = matchMedia(CONFIG.MQ_VERTICAL);
  let cargaInicial = document.readyState === "complete" ? Promise.resolve()
    : new Promise((r) => addEventListener("load", r, { once: true }));

  function crearSecuencia(seccion, cfg) {
    const sticky = seccion.querySelector(".seq__sticky");
    const canvas = seccion.querySelector(".seq__canvas"), g = canvas.getContext("2d");
    const frases = [...seccion.querySelectorAll(".frase")];
    const final = seccion.querySelector(".seq__final");
    const desde = final ? +final.dataset.desde : 2;
    const barra = seccion.querySelector(".progreso i");
    const N = cfg.TOTAL;
    let vertical = mq.matches, imgs = [], actual = 1, pintado = 0, p = 0, pedida = false, version = 0;
    const src = (i) => `${vertical ? cfg.MOVIL : cfg.PC}/f${String(i).padStart(3, "0")}.${CONFIG.EXT}`;
    const listo = (im) => im && im.complete && im.naturalWidth;

    const pintar = (i) => {
      let k = i; while (k > 1 && !listo(imgs[k])) k--;   // si no ha llegado, el más cercano hacia atrás
      if (!listo(imgs[k])) { k = i; while (k < N && !listo(imgs[k])) k++; }
      const im = imgs[k]; if (!listo(im) || k === pintado) return;
      const cw = canvas.width, ch = canvas.height, r = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const w = im.naturalWidth * r, h = im.naturalHeight * r;
      g.drawImage(im, (cw - w) / 2, (ch - h) * 0.15, w, h);   // si sobra alto, se recorta sobre todo por abajo (no se cortan cabezas) pintado = k;
      canvas.classList.add("lista");
    };
    const ajustar = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * d); canvas.height = Math.round(canvas.clientHeight * d);
      pintado = 0; pintar(actual);
    };
    const cargar = (i, v) => new Promise((ok) => {
      const im = new Image(); im.decoding = "async";
      im.onload = im.onerror = () => { ok(); if (v === version && Math.abs(i - actual) < 3) { pintado = 0; pintar(actual); } };
      im.src = src(i); imgs[i] = im;
    });
    const cargarTodo = async () => {
      const v = ++version; imgs = new Array(N + 1); pintado = 0;
      await cargar(1, v); actualizar();
      await cargaInicial;
      // 1 de cada 8 primero (se ve algo en todo el recorrido) y luego el resto en tandas de 12
      const todos = Array.from({ length: N - 1 }, (_, i) => i + 2);
      const claves = todos.filter((i) => i % 8 === 1), resto = todos.filter((i) => i % 8 !== 1);
      await Promise.all(claves.map((i) => cargar(i, v)));
      for (let i = 0; i < resto.length && v === version; i += 12) await Promise.all(resto.slice(i, i + 12).map((i) => cargar(i, v)));
    };
    const empezar = () => { if (pedida) return; pedida = true; ajustar(); cargarTodo(); };

    function actualizar() {
      const r = seccion.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50) return;     // fuera de pantalla: nada que pintar
      p = clamp(-r.top / (r.height - sticky.clientHeight - solape(seccion)));
      actual = 1 + Math.round(clamp(p / cfg.FIN_VIDEO) * (N - 1)); if (pedida) pintar(actual);
      frases.forEach((el) => {
        const a = +el.dataset.in, b = +el.dataset.out;
        const o = a === 0 ? clamp((b - p) / 0.03) : clamp(Math.min((p - a) / 0.03, (b - p) / 0.03));
        el.style.opacity = o; el.style.translate = `0 ${((1 - o) * 24).toFixed(1)}px`;
      });
      if (final) {
        const h = clamp((p - desde) / 0.07);
        final.style.opacity = h; final.style.translate = `0 ${((1 - h) * 20).toFixed(1)}px`;
        final.classList.toggle("on", h > 0.02);
        sticky.style.setProperty("--fin", h.toFixed(3));
      }
      if (barra) barra.style.transform = `scaleY(${p})`;
    }

    if (cfg.DIFERIDA) new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { empezar(); o.disconnect(); } }, { rootMargin: "120% 0px" }).observe(seccion);
    else empezar();
    addEventListener("resize", () => { if (pedida) ajustar(); actualizar(); });
    mq.addEventListener("change", (e) => { vertical = e.matches; canvas.classList.remove("lista"); if (pedida) { ajustar(); cargarTodo(); } });
    actualizar();
    return actualizar;
  }

  /* Transición entre secuencias seguidas: la siguiente se monta encima (margin-top negativo en CSS)
     y se abre en un círculo con aro de luz lima mientras la anterior se acerca y se apaga. */
  function solape(sec) {
    const sig = sec.nextElementSibling;
    return sig && sig.matches(".seq--entra") ? Math.max(0, -parseFloat(getComputedStyle(sig).marginTop)) : 0;
  }
  function crearTransicion(sig) {
    const ant = sig.previousElementSibling, sa = ant.querySelector(".seq__sticky"), sb = sig.querySelector(".seq__sticky");
    const fundido = sig.dataset.entra === "fundido";
    const aro = document.createElement("div"); aro.className = "trans__aro"; aro.setAttribute("aria-hidden", "true"); if (!fundido) sa.appendChild(aro);
    const capas = [...sa.querySelectorAll(".seq__poster,.seq__canvas")], textos = [...sa.querySelectorAll(".seq__final,.frases")];
    const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    return () => {
      const top = sig.getBoundingClientRect().top, H = innerHeight;
      sb.classList.toggle("seq__sticky--fija", top > 0 && top <= H + 50);   // fija por CSS: sin saltos con la rueda del ratón
      if (top > H + 50 || top < -50) { sb.style.clipPath = ""; sb.style.opacity = top > H ? "0" : ""; return; }
      const t = clamp(1 - top / H), e = ease(t);
      const w = sb.clientWidth, h = sb.clientHeight, R = e * Math.hypot(w, h) * 0.56;
      if (fundido) { const f = clamp(t * 2.5); sb.style.opacity = f >= 1 ? "" : f.toFixed(3); textos.forEach((x) => { x.style.filter = `opacity(${clamp(1 - t * 2.2).toFixed(3)})`; }); return; }
      sb.style.clipPath = t >= 1 ? "none" : `circle(${R.toFixed(1)}px at 50% 55%)`;
      capas.forEach((c) => { c.style.transform = `scale(${(1 + e * 0.22).toFixed(4)})`; c.style.filter = `brightness(${(1 - e * 0.65).toFixed(3)}) blur(${(e * 6).toFixed(1)}px)`; });
      textos.forEach((x) => { x.style.filter = `opacity(${clamp(1 - t * 2.2).toFixed(3)})`; });
      aro.style.width = aro.style.height = `${(2 * R).toFixed(1)}px`;
      aro.style.opacity = t > 0 && t < 1 ? Math.min(1, t * 6, (1 - t) * 4).toFixed(3) : 0;
    };
  }
  const secuencias = [...document.querySelectorAll(".seq[data-seq]")]
    .filter((s) => CONFIG.SECUENCIAS[s.dataset.seq])
    .map((s) => crearSecuencia(s, CONFIG.SECUENCIAS[s.dataset.seq]));
  document.querySelectorAll(".seq--entra").forEach((s) => { const f = crearTransicion(s); secuencias.push(f); f(); });
  // 3. Objetivos (PC): el carril se desplaza en horizontal con el scroll y se ilumina la tarjeta central
  const carril = document.querySelector(".objetivos__carril");
  if (carril) {
    const pista = carril.querySelector(".objetivos__pista"), barraO = carril.querySelector(".objetivos__barra i");
    const objs = [...pista.querySelectorAll(".obj")];
    const movObj = () => {
      if (innerWidth <= 800) {                       // móvil: se ilumina la última carta que ha quedado arriba de la baraja
        let act = null; objs.forEach((o) => { const t = o.getBoundingClientRect().top; if (t < innerHeight * 0.55) act = o; });
        objs.forEach((o) => o.classList.toggle("activa", o === act)); return;
      }
      const r = carril.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const q = clamp(-r.top / (r.height - innerHeight)), dx = Math.max(0, pista.scrollWidth - innerWidth);
      pista.style.transform = `translateX(${(-q * dx).toFixed(1)}px)`;
      if (barraO) barraO.style.transform = `scaleX(${q.toFixed(3)})`;
      const c = innerWidth / 2; let mejor = null, d = 1e9;
      objs.forEach((o) => { const b = o.getBoundingClientRect(), k = Math.abs(b.left + b.width / 2 - c); if (k < d) { d = k; mejor = o; } });
      objs.forEach((o) => o.classList.toggle("activa", o === mejor));
    };
    // Profundidad: la foto de la tarjeta activa se desliza un poco con el scroll (parallax suave)
    const profObj = () => objs.forEach((o) => {
      const b = o.getBoundingClientRect(), k = innerWidth <= 800 ? (b.top + b.height / 2) / innerHeight - .5 : (b.left + b.width / 2) / innerWidth - .5;
      o.style.setProperty("--sy", (clamp(k + .5) * 2 - 1) * -14 + "px");
    });
    // Profundidad al tocar o mover el ratón: la tarjeta se inclina, la foto se acerca y se mueve en sentido contrario
    objs.forEach((o) => {
      const mover = (x, y) => {
        const b = o.getBoundingClientRect(), nx = clamp((x - b.left) / b.width) - .5, ny = clamp((y - b.top) / b.height) - .5;
        o.style.setProperty("--ty", (nx * 7).toFixed(2) + "deg"); o.style.setProperty("--tx", (-ny * 6).toFixed(2) + "deg");
        o.style.setProperty("--mx", (-nx * 22).toFixed(1) + "px"); o.style.setProperty("--my", (-ny * 16).toFixed(1) + "px");
        o.style.setProperty("--gx", ((nx + .5) * 100).toFixed(0) + "%"); o.style.setProperty("--gy", ((ny + .5) * 100).toFixed(0) + "%");
      };
      const soltar = () => { o.classList.remove("pulsa"); ["--tx", "--ty", "--mx", "--my"].forEach((v) => o.style.setProperty(v, v.includes("t") && !v.includes("m") ? "0deg" : "0px")); };
      o.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") mover(e.clientX, e.clientY); });
      o.addEventListener("pointerleave", soltar);
      o.addEventListener("pointerdown", (e) => { o.classList.add("pulsa"); mover(e.clientX, e.clientY); });
      o.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) mover(t.clientX, t.clientY); }, { passive: true });
      ["pointerup", "pointercancel", "touchend"].forEach((ev) => o.addEventListener(ev, () => setTimeout(soltar, 260)));
    });
    secuencias.push(movObj, profObj); addEventListener("resize", movObj); movObj(); profObj();
  }
  // 4. Método: la línea lima se rellena hasta el centro de la pantalla y enciende cada paso al alcanzarlo
  const pasos = document.querySelector(".pasos");
  if (pasos) {
    const items = [...pasos.querySelectorAll(".paso")];
    const movPasos = () => {
      const r = pasos.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const y = innerHeight * 0.6 - r.top; pasos.style.setProperty("--lin", clamp(y / r.height).toFixed(4));
      items.forEach((it) => { const b = it.getBoundingClientRect(), punto = b.top - r.top + (innerWidth <= 800 ? 12 : b.height / 2); it.classList.toggle("on", y >= punto); });
    };
    secuencias.push(movPasos); movPasos();
  }
  let tick = false;
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; secuencias.forEach((f) => f()); }); } }, { passive: true });
})();

// ===== 7. Opiniones: en PC la pista avanza de lado con el scroll; la tarjeta del centro se enciende =====
(() => {
  const sec = document.querySelector(".opiniones"); if (!sec) return;
  const pista = sec.querySelector(".opiniones__pista"), ops = [...pista.querySelectorAll(".op")], barra = sec.querySelector(".opiniones__barra");
  const lim = (v) => Math.max(0, Math.min(1, v));
  const activar = () => {
    const c = innerWidth / 2; let m = 0, d = 1e9;
    ops.forEach((o, i) => { const r = o.getBoundingClientRect(), x = Math.abs(r.left + r.width / 2 - c); if (x < d) { d = x; m = i; } });
    ops.forEach((o, i) => o.classList.toggle("activa", i === m));
    return m;
  };
  const mover = () => {
    if (innerWidth <= 800) {
      pista.style.transform = "";
      const max = pista.scrollWidth - pista.clientWidth; barra.style.setProperty("--pb", max > 0 ? (0.25 + 0.75 * pista.scrollLeft / max).toFixed(3) : 1);
      activar(); return;
    }
    const r = sec.getBoundingClientRect(), largo = sec.offsetHeight - innerHeight;
    if (r.top > innerHeight || r.bottom < 0) return;
    const p = lim(-r.top / largo), ease = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const prim = ops[0], ult = ops[ops.length - 1];
    const ini = innerWidth / 2 - (prim.offsetLeft + prim.offsetWidth / 2), fin = innerWidth / 2 - (ult.offsetLeft + ult.offsetWidth / 2);
    pista.style.transform = `translate3d(${(ini + (fin - ini) * ease).toFixed(1)}px,0,0)`;
    barra.style.setProperty("--pb", (0.25 + 0.75 * p).toFixed(3));
    activar();
  };
  let t = false; const pedir = () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; mover(); }); } };
  addEventListener("scroll", pedir, { passive: true }); pista.addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", mover); mover();
})();

// ===== 8. Preguntas frecuentes: acordeón suave y marcador de dudas resueltas =====
(() => {
  const sec = document.querySelector(".faq"); if (!sec) return;
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { sec.classList.add("en-vista"); o.disconnect(); } }), { threshold: 0.15 }).observe(sec);
  const cifra = sec.querySelector(".faq__cifra"), vistas = new Set(), items = [...sec.querySelectorAll(".pregunta")];
  items.forEach((it, i) => {
    const b = it.querySelector(".pregunta__boton");
    b.addEventListener("click", () => {
      const abrir = !it.classList.contains("abierta");
      items.forEach((o) => { o.classList.remove("abierta"); o.querySelector(".pregunta__boton").setAttribute("aria-expanded", "false"); });
      if (abrir) {
        it.classList.add("abierta"); b.setAttribute("aria-expanded", "true");
        if (!vistas.has(i)) {
          vistas.add(i); cifra.textContent = vistas.size;
          cifra.classList.remove("salta"); void cifra.offsetWidth; cifra.classList.add("salta");
          cifra.classList.toggle("llena", vistas.size === items.length);
        }
      }
    });
  });
})();

// ===== 9. Contacto: el título entra grande y se asienta; formulario de demostración (no envía nada) =====
(() => {
  const sec = document.querySelector(".contacto"); if (!sec) return;
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { sec.classList.add("en-vista"); o.disconnect(); } }), { threshold: 0.2 }).observe(sec);
  const tit = sec.querySelector(".contacto__titulo"), lim = (v) => Math.max(0, Math.min(1, v));
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const mover = () => { const r = tit.getBoundingClientRect(); if (r.top > innerHeight * 1.5 || r.bottom < -200) return;
      const q = lim((innerHeight * 1.0 - r.top) / (innerHeight * 0.55)), e = 1 - Math.pow(1 - q, 3); sec.style.setProperty("--ct", e.toFixed(3)); };
    let t = false; addEventListener("scroll", () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; mover(); }); } }, { passive: true });
    addEventListener("resize", mover); mover();
  }
  const f = sec.querySelector(".formu"), estado = f.querySelector(".formu__estado");
  f.addEventListener("submit", (ev) => {
    ev.preventDefault(); if (f.classList.contains("enviando") || f.classList.contains("ok")) return;
    let bien = true;
    f.querySelectorAll("[required]").forEach((c) => {
      const caja = c.closest(".campo, .casilla"), v = c.type === "checkbox" ? c.checked : c.value.trim() !== "";
      caja.classList.remove("error"); if (!v) { void caja.offsetWidth; caja.classList.add("error"); bien = false; }
    });
    if (!bien) { f.classList.add("mal"); estado.textContent = "Rellena los campos marcados para reservar."; return; }
    f.classList.remove("mal"); f.classList.add("enviando"); estado.textContent = "";
    setTimeout(() => { f.classList.remove("enviando"); f.classList.add("ok"); estado.textContent = "¡Recibido! Te escribo en menos de 24 horas."; }, 1100);
  });
  f.addEventListener("input", (e) => { const c = e.target.closest(".campo, .casilla"); if (c) c.classList.remove("error"); });
  const wa = sec.querySelector(".contacto__wa"); wa.addEventListener("click", () => { wa.animate([{ scale: 1 }, { scale: .94 }, { scale: 1.04 }, { scale: 1 }], { duration: 450, easing: "ease-out" }); });
})();

/* ===== Ruta: mapa ficticio con muñequito corriendo ===== */
(function(){
  var sec=document.querySelector('.ruta'); if(!sec) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frases=[].slice.call(sec.querySelectorAll('.ruta__frase')),etq=sec.querySelector('.ruta__etiqueta');
  var svgs=[].slice.call(sec.querySelectorAll('.ruta__svg')).map(function(svg){
    var linea=svg.querySelector('.ruta__linea'),glow=svg.querySelector('.ruta__glow');
    var L=linea.getTotalLength();
    [linea,glow].forEach(function(p){p.style.strokeDasharray=L+' '+L;});
    return {svg:svg,linea:linea,glow:glow,L:L,mu:svg.querySelector('.mu'),giro:svg.querySelector('.mu__giro'),
      fr:[].slice.call(svg.querySelectorAll('.mu__f[data-f]')),cel:svg.querySelector('.mu__celebra'),
      esc:svg.classList.contains('ruta__svg--movil')?1.35:.9,dir:1,last:-1};
  });
  function lim(v){return v<0?0:v>1?1:v;}
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
  var tick=false;
  function pinta(){
    tick=false;
    var r=sec.getBoundingClientRect(),vh=innerHeight;
    var re=lim((vh-r.top)/vh); sec.style.setProperty('--re',ease(re).toFixed(3));
    var p=reduce?1:lim(-r.top/(sec.offsetHeight-vh));
    var t=lim(p/.88), dist=ease(t);
    var lleg=t>=1;
    sec.classList.toggle('llegado',lleg);
    frases.forEach(function(f){var a=+f.dataset.in,b=+f.dataset.out;f.classList.toggle('ver',p>=a&&p<b);});
    svgs.forEach(function(s){
      if(!s.svg.getClientRects().length) return;
      var c=s.svg.querySelector('.ruta__centro').getBoundingClientRect(),fr=s.svg.getBoundingClientRect();
      etq.style.left=(c.left+c.width/2-fr.left)+'px'; etq.style.top=(c.top+c.height/2-fr.top)+'px';
      var len=s.L*dist;
      s.linea.style.strokeDashoffset=s.glow.style.strokeDashoffset=(s.L-len);
      var pt=s.linea.getPointAtLength(len),pt2=s.linea.getPointAtLength(Math.min(s.L,len+4));
      var dx=pt2.x-pt.x; if(Math.abs(dx)>.5) s.dir=dx<0?-1:1;
      var bob=lleg?0:Math.abs(Math.sin(len/22))*-6;
      s.mu.setAttribute('transform','translate('+pt.x+' '+(pt.y+bob)+') scale('+s.esc+')');
      s.giro.setAttribute('transform','scale('+(lleg?1:s.dir)+' 1) translate(-60 -148)');
      var idx=lleg?-1:Math.floor(len/38)%4;
      if(idx!==s.last){ s.fr.forEach(function(g,i){g.classList.toggle('ver',i===idx);}); s.cel.classList.toggle('ver',idx===-1); s.last=idx; }
    });
  }
  function pide(){ if(!tick){tick=true;requestAnimationFrame(pinta);} }
  addEventListener('scroll',pide,{passive:true}); addEventListener('resize',pide); pinta();
})();

/* ===== Llamada a la acción final ===== */
(function(){
  var sec=document.querySelector('.cta'); if(!sec) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var movil=matchMedia('(max-width:700px)').matches;
  var chispas=sec.querySelector('.cta__chispas'),rayo=sec.querySelector('.cta__rayo');
  chispas.poster=movil?chispas.dataset.pmovil:chispas.dataset.ppc;
  if(!reduce){chispas.src=movil?chispas.dataset.movil:chispas.dataset.pc; rayo.src=movil?rayo.dataset.movil:rayo.dataset.pc;}
  var pal=[].slice.call(sec.querySelectorAll('.cta__palabra'));
  function lim(v){return v<0?0:v>1?1:v;}
  var tick=false,enRayo=false,enListo=false;
  function pinta(){
    tick=false;
    var r=sec.getBoundingClientRect(),vh=innerHeight;
    var p=reduce?1:lim(-r.top/(sec.offsetHeight-vh));
    pal.forEach(function(w){w.classList.toggle('ver',p>=+w.dataset.in&&p<+w.dataset.out);});
    var R=p>=.5,L=p>=.6;
    if(R!==enRayo){enRayo=R;sec.classList.toggle('rayo',R);
      if(R&&!reduce){try{rayo.currentTime=0;var pr=rayo.play();pr&&pr.catch(function(){});}catch(e){}} else {rayo.pause();}}
    if(L!==enListo){enListo=L;sec.classList.toggle('listo',L);}
    var visible=r.top<vh&&r.bottom>0;
    if(!reduce&&chispas.src){ if(visible&&L){chispas.paused&&chispas.play().catch(function(){});} else if(!chispas.paused) chispas.pause(); }
  }
  function pide(){if(!tick){tick=true;requestAnimationFrame(pinta);}}
  addEventListener('scroll',pide,{passive:true});addEventListener('resize',pide);pinta();

  var wa=sec.querySelector('.cta__wa'),chat=sec.querySelector('.cta__chat'),txt=sec.querySelector('.cta__texto');
  var MSG='Hola Álex, quiero mi primera sesión gratis 👋',timer=null;
  wa.addEventListener('click',function(){
    clearTimeout(timer); txt.textContent=''; chat.classList.remove('escribe','hecho'); chat.classList.add('abierto');
    var chars=Array.from(MSG),i=0;
    timer=setTimeout(function paso(){
      chat.classList.add('escribe');
      txt.textContent=chars.slice(0,++i).join('');
      if(i<chars.length) timer=setTimeout(paso,reduce?0:38); else chat.classList.add('hecho');
    },reduce?0:900);
  });
})();

/* ===== Pie ===== */
(function(){
  var pie=document.querySelector('.pie'); if(!pie) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lim(v){return v<0?0:v>1?1:v;}
  var tick=false;
  function pinta(){tick=false;
    var r=pie.getBoundingClientRect(),vh=innerHeight;
    var f=reduce?1:lim((vh-r.top)/Math.min(r.height,vh*.9));
    f=1-Math.pow(1-f,3);
    pie.style.setProperty('--pf',f.toFixed(3));
  }
  function pide(){if(!tick){tick=true;requestAnimationFrame(pinta);}}
  addEventListener('scroll',pide,{passive:true});addEventListener('resize',pide);pinta();
  var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){pie.classList.add('en-vista');io.disconnect();}});},{threshold:.15});
  io.observe(pie);
  pie.querySelector('.pie__arriba').addEventListener('click',function(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});});
  pie.querySelectorAll('[data-demo]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();});});
})();
