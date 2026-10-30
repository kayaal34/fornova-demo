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
  burger.addEventListener("click", (event) => {
    if (event.target.closest("a")) burger.open = false;
  });
  document.addEventListener("click", (event) => {
    if (!burger.contains(event.target)) burger.open = false;
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

  // Foto şeridi yavaşça kayar; dokununca durur, bırakınca bir süre sonra devam eder.
  const rail = document.querySelector("[data-rail]");
  if (rail && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const SPEED = 0.035;
    const RESUME = 1200;
    let pos = 0;
    let paused = false;
    let timer;
    let last = performance.now();

    const half = () => rail.scrollWidth / 2;

    const hold = () => {
      paused = true;
      clearTimeout(timer);
    };
    const release = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        pos = rail.scrollLeft;
        paused = false;
      }, RESUME);
    };

    function step(now) {
      const elapsed = Math.min(now - last, 50);
      last = now;
      if (!paused) {
        pos += elapsed * SPEED;
        if (pos >= half()) pos -= half();
        rail.scrollLeft = pos;
      }
      requestAnimationFrame(step);
    }

    // Elle kaydırırken de şeridin sonu gelmesin.
    rail.addEventListener(
      "scroll",
      () => {
        if (!paused) return;
        if (rail.scrollLeft >= half()) rail.scrollLeft -= half();
        else if (rail.scrollLeft <= 0) rail.scrollLeft += half();
      },
      { passive: true },
    );
    rail.addEventListener("pointerdown", hold);
    rail.addEventListener("touchstart", hold, { passive: true });
    rail.addEventListener("pointerup", release);
    rail.addEventListener("pointercancel", release);
    rail.addEventListener("touchend", release, { passive: true });
    rail.addEventListener("mouseenter", hold);
    rail.addEventListener("mouseleave", release);
    requestAnimationFrame(step);
  }
}
