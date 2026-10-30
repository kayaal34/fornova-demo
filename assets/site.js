// Ana sayfa ve Hakkımızda sayfasının ortak davranışları
{
  const nav = document.querySelector("[data-nav]");
  const doors = document.querySelector("[data-doors]");
  if (doors) {
    const done = () => doors.remove();
    if (document.documentElement.classList.contains("doors-on")) {
      doors.lastElementChild.addEventListener("animationend", done);
      setTimeout(done, 1500);
    } else {
      done();
    }
  }

  // Nazar boncuğuna dokununca sallanır.
  const nazar = document.querySelector(".nazar");
  nazar?.addEventListener("click", () => {
    nazar.getAnimations().forEach((a) => {
      if (a instanceof CSSAnimation === false) a.cancel();
    });
    nazar.animate(
      [
        { transform: "rotate(0)" },
        { transform: "rotate(16deg)", offset: 0.12 },
        { transform: "rotate(-12deg)", offset: 0.32 },
        { transform: "rotate(8deg)", offset: 0.52 },
        { transform: "rotate(-5deg)", offset: 0.7 },
        { transform: "rotate(2deg)", offset: 0.86 },
        { transform: "rotate(0)" },
      ],
      { duration: 2200, easing: "ease-out" },
    );
  });

  const stick = () => nav.classList.toggle("is-stuck", scrollY > 8);
  addEventListener("scroll", stick, { passive: true });
  stick();

  const root = document.documentElement;
  const veil = document.querySelector("[data-veil]");
  const langLink = document.querySelector(".langs a");

  // Yeni dilde perde kalkar, ziyaretçi kaldığı yerden devam eder.
  if (root.classList.contains("veil-on")) {
    scrollTo({ top: window.fornovaY, behavior: "instant" });
    const lifted = () => root.classList.remove("veil-on");
    veil.addEventListener("animationend", (event) => {
      if (event.target === veil) lifted();
    });
    setTimeout(lifted, 1100);
  }

  // Perde kapanırken beklemesin diye diğer dil önceden indirilir.
  const nextPage = document.createElement("link");
  nextPage.rel = "prefetch";
  nextPage.href = langLink.href;
  document.head.append(nextPage);

  // Açılış bir daha dil sormasın diye seçim saklanır.
  langLink.addEventListener("click", (event) => {
    try {
      localStorage.setItem("fornova-lang", langLink.hreflang);
    } catch {}
    if (event.ctrlKey || event.metaKey || event.shiftKey || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    if (root.classList.contains("is-veiling")) return;

    const box = langLink.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    root.style.setProperty("--vx", `${x}px`);
    root.style.setProperty("--vy", `${y}px`);
    root.style.setProperty("--vr", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    veil.querySelector("b").textContent = langLink.getAttribute("aria-label");
    root.classList.add("is-veiling");
    try {
      sessionStorage.setItem("fornova-veil", JSON.stringify({ y: scrollY, to: langLink.hreflang, t: Date.now() }));
    } catch {}
    setTimeout(() => {
      location.href = langLink.href;
    }, 500);
    // Sayfa açılamazsa perde kapalı kalmasın.
    setTimeout(() => root.classList.remove("is-veiling"), 6000);
  });

  // Geri tuşuyla dönünce perde açık kalmasın.
  addEventListener("pageshow", (event) => {
    if (event.persisted) root.classList.remove("is-veiling");
  });

  // Mobil menü bir bağlantıya veya dışına dokununca kapanır.
  const burger = document.querySelector("[data-burger]");
  const closeBurger = () => {
    if (!burger.open || burger.classList.contains("is-closing")) return;
    burger.classList.add("is-closing");
    setTimeout(() => {
      burger.classList.remove("is-closing");
      burger.open = false;
    }, 180);
  };
  burger.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeBurger();
    else if (event.target.closest("summary") && burger.open) {
      event.preventDefault();
      closeBurger();
    }
  });
  document.addEventListener("click", (event) => {
    if (!burger.contains(event.target)) closeBurger();
  });
  addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeBurger();
  });

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -4% 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // Foto şeridi yavaşça kayar. Parmağı takip eder, hızlı atınca hızlı gider
  // ve yavaşlayarak kendi akışına döner. Basılıyken durur.
  const rail = document.querySelector("[data-rail]");
  if (rail) {
    const track = rail.firstElementChild;
    const DRIFT = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.04;
    const FRICTION = 0.0022;
    const MAX_SPEED = 4;
    let half = 0;
    let pos = 0;
    let speed = DRIFT;
    let target = DRIFT;
    let held = null;
    let last = performance.now();
    let visible = true;

    const clamp = (value) => Math.max(-MAX_SPEED, Math.min(MAX_SPEED, value));
    const paint = () => {
      if (half) pos = ((pos % half) + half) % half;
      track.style.transform = `translate3d(${-pos}px, 0, 0)`;
    };

    function step(now) {
      const elapsed = Math.min(now - last, 100);
      last = now;
      if (!held && visible) {
        speed = target + (speed - target) * Math.exp(-FRICTION * elapsed);
        pos += speed * elapsed;
        paint();
      }
      requestAnimationFrame(step);
    }

    const measure = () => {
      half = track.offsetWidth / 2;
    };
    new ResizeObserver(measure).observe(track);
    measure();
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }).observe(rail);

    rail.addEventListener("pointerdown", (event) => {
      held = { id: event.pointerId, x: event.clientX, time: event.timeStamp };
      speed = 0;
      rail.classList.add("is-held");
      rail.setPointerCapture(event.pointerId);
    });
    rail.addEventListener("pointermove", (event) => {
      if (held?.id !== event.pointerId) return;
      const moved = held.x - event.clientX;
      const took = event.timeStamp - held.time;
      pos += moved;
      if (took > 0) speed = 0.7 * (moved / took) + 0.3 * speed;
      held.x = event.clientX;
      held.time = event.timeStamp;
      paint();
    });
    const release = (event) => {
      if (held?.id !== event.pointerId) return;
      // Durup bırakınca fırlamasın.
      speed = event.timeStamp - held.time > 80 ? 0 : clamp(speed);
      held = null;
      last = performance.now();
      rail.classList.remove("is-held");
    };
    rail.addEventListener("pointerup", release);
    rail.addEventListener("pointercancel", release);

    // Bilgisayarda fare üstündeyken yavaşça durur, klavyeyle de gezilir.
    rail.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") target = 0;
    });
    rail.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") target = DRIFT;
    });
    rail.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") speed = 1.2;
      if (event.key === "ArrowLeft") speed = -1.2;
    });

    requestAnimationFrame(step);
  }
}
