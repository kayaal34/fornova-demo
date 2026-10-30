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
}
