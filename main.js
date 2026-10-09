(() => {
  // contato da bio: bruno.gomes@cohub.digital | @cohub.digital
  const EMAIL = 'bruno.gomes@cohub.digital';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desk = () => innerWidth > 760;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;

  /* ================= fits do provador (legendas dos posts) ================= */
  const FITS = [
    { cap: 'outfit rosa é tendência demais fi', credit: '#outfits #rosa #modamasculina', c: '#d3a9c3' },
    { cap: '// 💖🌸', credit: '@bershka #bershkastyle', c: '#e3c6cf' },
    { cap: 'o óculos laranja é pra combinar com o carro de fundo.', credit: 'outfit full: @bershka', c: '#b3ab8c' },
    { cap: 'me amarro nessa cor de roupa.', credit: '@brnogomes', c: '#d8c2a2' },
    { cap: 'conjunto com caimento perfeito? temos!', credit: '@bershka #bershkastyle', c: '#9fb0d0' }
  ];

  /* ================= texto em palavras ================= */
  $$('[data-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((t, i) => {
      const w = document.createElement('span');
      w.className = 'w'; w.textContent = t; w.style.setProperty('--d', (i * .08) + 's');
      el.append(w, ' ');
    });
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('[data-words]').forEach(el => io.observe(el));

  /* ================= preloader ================= */
  const loader = $('.loader');
  const count = $('[data-count]');
  let shown = 0, target = 30, ready = false;
  const hero = new Image(); hero.src = 'img/fit-rosa.webp';
  const finish = () => { ready = true; target = 100; };
  hero.decode ? hero.decode().then(finish, finish) : (hero.onload = finish);
  setTimeout(finish, 2600);
  const tick = () => {
    if (!ready) target = Math.min(90, target + .4);
    shown += (target - shown) * .12;
    count.textContent = Math.round(shown);
    if (ready && shown > 99.2) {
      count.textContent = 100;
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
        startFits();
      }, 250);
      return;
    }
    requestAnimationFrame(tick);
  };
  reduce ? (loader.remove(), document.body.classList.remove('is-loading'), setTimeout(startFits, 0)) : requestAnimationFrame(tick);

  /* ================= smooth scroll ================= */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0 }); }
    }));
  }
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ================= provador ================= */
  const heroEl = $('.hero');
  const fits = $$('.hero__fit');
  const idxEl = $('[data-fit-idx]'), capEl = $('[data-fit-cap]'), creditEl = $('[data-fit-credit]');
  let cur = 0, auto = null, touched = false;

  const show = n => {
    const next = (n + fits.length) % fits.length;
    if (next === cur) return;
    fits[cur].classList.remove('is-on'); fits[cur].classList.add('is-out');
    const old = fits[cur];
    setTimeout(() => old.classList.remove('is-out'), 700);
    cur = next;
    fits[cur].classList.add('is-on');
    const f = FITS[cur];
    heroEl.style.setProperty('--fit', f.c);
    document.querySelector('meta[name=theme-color]').content = f.c;
    idxEl.textContent = String(cur + 1).padStart(2, '0');
    $$('.hero__dots i').forEach((d, k) => d.classList.toggle('is-on', k === cur));
    capEl.textContent = f.cap; creditEl.textContent = f.credit;
    if (motion) gsap.fromTo('.hero__label', { rotate: -4, y: -10 }, { rotate: 3, y: 0, duration: 1.1, ease: 'elastic.out(1, .4)' });
  };
  const stopAuto = () => { touched = true; clearInterval(auto); };
  function startFits() {
    // pré-carrega os outros recortes
    fits.forEach(i => { i.loading = 'eager'; });
    if (!reduce) auto = setInterval(() => { if (!touched && scrollY < innerHeight * .6) show(cur + 1); }, 4200);
    if (motion) {
      gsap.from('.hero__line', { yPercent: 110, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1 });
      gsap.from('.hero__stage', { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out', delay: .15, clearProps: 'opacity' });
      gsap.from('.hero__label, .hero__bio, .hero__ctrl', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: .4, stagger: .08 });
    }
  }
  $('[data-fit-next]').addEventListener('click', () => { stopAuto(); show(cur + 1); });
  $('[data-fit-prev]').addEventListener('click', () => { stopAuto(); show(cur - 1); });
  addEventListener('keydown', e => {
    if (scrollY > innerHeight * .6 || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') { stopAuto(); show(cur + 1); }
    if (e.key === 'ArrowLeft') { stopAuto(); show(cur - 1); }
  });
  // arrastar / swipe
  let sx = null, sy = null;
  heroEl.addEventListener('pointerdown', e => { if (e.target.closest('button,a')) return; sx = e.clientX; sy = e.clientY; });
  heroEl.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { stopAuto(); show(cur + (dx < 0 ? 1 : -1)); }
    else if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && e.target.closest('.hero__stage')) { stopAuto(); show(cur + 1); }
  });
  // paralaxe do mouse
  if (motion && fine) {
    const qx = [gsap.quickTo('.hero__name', 'x', { duration: 1 }), gsap.quickTo('.hero__stage', 'x', { duration: 1.2 })];
    const qy = [gsap.quickTo('.hero__name', 'y', { duration: 1 }), gsap.quickTo('.hero__stage', 'y', { duration: 1.2 })];
    heroEl.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      qx[0](x * -40); qy[0](y * -20); qx[1](x * 24); qy[1](y * 10);
    });
  }
  // saída do hero: nome se separa
  if (motion) {
    gsap.to('.hero__line:first-child', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__line:last-child', { xPercent: 18, ease: 'none', scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__stage', { yPercent: 12, scale: .94, ease: 'none', scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ================= header muda de cor sobre seções claras ================= */
  const hd = $('.hd');
  const hdZones = $$('[data-hd]');
  let hdQueued = false;
  const hdCheck = () => {
    hdQueued = false;
    let theme = 'dark';
    hdZones.forEach(z => { const r = z.getBoundingClientRect(); if (r.top <= 30 && r.bottom > 30) theme = z.dataset.hd; });
    hd.classList.toggle('is-dark', theme === 'light');
    const y = scrollY;
    hd.classList.toggle('is-solid', y > innerHeight * .8);
    hd.classList.toggle('is-hidden', y > lastY && y > 160 && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  let lastY = 0;
  addEventListener('scroll', () => { if (!hdQueued) { hdQueued = true; requestAnimationFrame(hdCheck); } }, { passive: true });
  hdCheck();

  /* ================= marquee segue a direção do scroll ================= */
  const mq = $('.marquee__track');
  if (lenis) lenis.on('scroll', ({ direction }) => { if (direction) mq.style.animationDirection = direction > 0 ? 'normal' : 'reverse'; });

  /* ================= rotação horizontal ================= */
  if (motion) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
      const track = $('.rot__track');
      const dist = () => track.scrollWidth - (innerWidth - track.getBoundingClientRect().left) + 0;
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.rot', pin: '.rot__pin', start: 'top top', end: () => '+=' + dist(), scrub: .6, invalidateOnRefresh: true,
          onUpdate: s => { $('.rot__progress span').style.width = (s.progress * 100) + '%'; }
        }
      });
      // cada look entra girando de leve
      $$('.look').forEach(l => gsap.from(l, {
        rotate: 4, y: 40, ease: 'none',
        scrollTrigger: { trigger: l, containerAnimation: tw, start: 'left right', end: 'left 60%', scrub: true }
      }));
    });
  }
  // carrossel empilhado: hover/toque traz a próxima foto pra frente
  $$('[data-cycle]').forEach(st => {
    const imgs = $$('img', st);
    let i = 0;
    const place = () => imgs.forEach((im, k) => { im.dataset.pos = (k - i + imgs.length) % imgs.length; });
    const step = () => { i = (i + 1) % imgs.length; place(); };
    place();
    st.addEventListener('click', step);
    if (fine) { let t; st.addEventListener('mouseenter', () => { step(); t = setInterval(step, 900); }); st.addEventListener('mouseleave', () => clearInterval(t)); }
  });

  /* ================= vídeos ================= */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduce) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); }
    else v.pause();
  }), { threshold: .15 });
  $$('video[data-autoplay]').forEach(v => vio.observe(v));

  // som nos reels de humor: um por vez
  const loud = fig => {
    $$('.reel--sound').forEach(r => {
      const on = r === fig && !r.classList.contains('is-loud');
      const v = $('video', r);
      if (r === fig) { v.muted = !on; if (on) { v.currentTime = 0; v.play().catch(() => {}); } }
      else v.muted = true;
      r.classList.toggle('is-loud', r === fig && on);
      $('use', r).setAttribute('href', (r === fig && on) ? '#sound' : '#mute');
      $('.reel__snd', r).setAttribute('aria-label', (r === fig && on) ? 'Desligar som' : 'Ligar som');
    });
  };
  $$('.reel--sound').forEach(r => {
    $('.reel__snd', r).addEventListener('click', () => loud(r));
    $('video', r).addEventListener('click', () => loud(r));
  });
  if (motion) {
    $$('.hum__row .reel').forEach((r, i) => gsap.from(r, {
      y: 120, rotate: i % 2 ? 6 : -6, opacity: 0, duration: 1.1, ease: 'expo.out', delay: i * .07,
      scrollTrigger: { trigger: '.hum__row', start: 'top 85%' }
    }));
  }

  /* ================= futebol: janela abre pra tela cheia ================= */
  if (motion) {
    gsap.fromTo('.fut__frame',
      { clipPath: () => desk() ? 'inset(18% 30% 18% 30% round 8px)' : 'inset(10% 8% 10% 8% round 8px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: '.fut__window', start: 'top top', end: '55% top', scrub: true } });
    gsap.from('.fut__big', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.fut__window', start: '30% top', end: '60% top', scrub: true } });
    $$('.fut__grid > *').forEach(el => gsap.from(el, { y: 80, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
  }
  const stat = $('[data-to]');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    sio.disconnect();
    const to = +stat.dataset.to, t0 = performance.now();
    const run = t => { const p = Math.min(1, (t - t0) / 1600); stat.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(run); };
    reduce ? (stat.textContent = to) : requestAnimationFrame(run);
  }), { threshold: .6 });
  sio.observe(stat);

  /* ================= dicas: cards empilham ================= */
  const cards = $$('.card');
  cards.forEach((c, i) => c.style.setProperty('--i', i));
  if (motion) {
    cards.forEach((c, i) => {
      if (i === cards.length - 1 || !desk()) return;
      gsap.to(c, { scale: .93, filter: 'brightness(.7)', ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top 75%', end: 'top 15%', scrub: true } });
    });
    gsap.from('.inter__img img', { scale: 1.25, ease: 'none', scrollTrigger: { trigger: '.inter', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ================= publis: preview segue o cursor ================= */
  const peek = $('.pub__peek'), pv = $('video', peek);
  if (fine) {
    let px = 0, py = 0, tx = 0, ty = 0, raf = null;
    const loop = () => { px += (tx - px) * .15; py += (ty - py) * .15; peek.style.transform = `translate(${px}px, ${py}px) rotate(${(tx - px) * .05}deg)`; raf = requestAnimationFrame(loop); };
    $$('.brand').forEach(b => {
      b.addEventListener('mouseenter', () => {
        const src = b.dataset.preview;
        if (!pv.src.endsWith(src)) { pv.src = src; }
        pv.play().catch(() => {});
        peek.classList.add('is-on');
        if (!raf) loop();
      });
      b.addEventListener('mouseleave', () => { peek.classList.remove('is-on'); pv.pause(); });
      b.addEventListener('mousemove', e => { tx = e.clientX + 30; ty = e.clientY - 180; });
    });
  }

  /* ================= menu mobile ================= */
  const menu = $('#menu'), menuBtn = $('.hd__menu');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) { menu.hidden = false; lenis && lenis.stop(); }
    else { lenis && lenis.start(); }
  };
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ================= carrossel da rotação no toque: contador ================= */
  const rotTrack = $('.rot__track'), rotN = $('[data-rot-n]');
  rotTrack.addEventListener('scroll', () => {
    if (desk()) return;
    const items = $$('.look', rotTrack), mid = rotTrack.scrollLeft + rotTrack.clientWidth / 2;
    let best = 0, bd = 1e9;
    items.forEach((it, k) => { const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = k; } });
    rotN.textContent = String(best + 1).padStart(2, '0');
  }, { passive: true });

  /* ================= publis no celular: toque abre o vídeo ================= */
  $$('.brand').forEach(b => {
    const wrap = document.createElement('div');
    wrap.className = 'brand__vid';
    wrap.innerHTML = '<div><video muted loop playsinline preload="none"></video></div>';
    b.append(wrap);
    const v = $('video', wrap);
    b.addEventListener('click', () => {
      if (desk() && fine) return;
      const open = !b.classList.contains('is-open');
      $$('.brand.is-open').forEach(o => { if (o !== b) { o.classList.remove('is-open'); $('.brand__vid video', o).pause(); } });
      b.classList.toggle('is-open', open);
      if (open) { if (!v.src) v.src = b.dataset.preview; v.play().catch(() => {}); } else v.pause();
      setTimeout(() => hasGsap && ScrollTrigger.refresh(), 550);
    });
  });

  /* ================= contato ================= */
  const mailBtn = $('[data-copy]');
  mailBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(mailBtn.dataset.copy); mailBtn.classList.add('is-copied'); setTimeout(() => mailBtn.classList.remove('is-copied'), 1600); }
    catch { location.href = 'mailto:' + EMAIL; }
  });

  const form = $('[data-brief]'), err = $('[data-err]');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const marca = (d.get('marca') || '').trim(), nome = (d.get('nome') || '').trim();
    if (!marca || !nome) { err.hidden = false; (marca ? form.nome : form.marca).focus(); return; }
    err.hidden = true;
    const formatos = d.getAll('formato');
    const body = [
      'Oi, Bruno! Tudo certo?',
      '',
      `Aqui é ${nome}, da ${marca}.`,
      `Pilar: ${d.get('pilar')}`,
      formatos.length ? `Formato: ${formatos.join(', ')}` : '',
      '',
      (d.get('ideia') || '').trim() ? 'A ideia:\n' + d.get('ideia').trim() : '',
      '',
      '(enviado pelo site)'
    ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
    const subject = `Briefing ${marca} x @brnogomes`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  addEventListener('load', () => hasGsap && ScrollTrigger.refresh());
})();
