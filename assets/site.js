// Ana sayfa ve Hakkımızda sayfasının ortak davranışları
{
  const nav = document.querySelector("[data-nav]");
  const stick = () => nav.classList.toggle("is-stuck", scrollY > 8);
  addEventListener("scroll", stick, { passive: true });
  stick();

  // Açılış bir daha dil sormasın diye seçim saklanır.
  document.querySelector(".langs a").addEventListener("click", (event) => {
    try {
      localStorage.setItem("fornova-lang", event.currentTarget.hreflang);
    } catch {}
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
