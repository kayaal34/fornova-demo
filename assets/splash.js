const seal = document.querySelector(".seal");
const choose = document.querySelector("[data-choose]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const { v } = document.documentElement.dataset;

function savedLang() {
  try {
    const lang = localStorage.getItem("fornova-lang");
    return lang === "ru" || lang === "tr" ? lang : null;
  } catch {
    return null;
  }
}

let gone = false;

function go(lang) {
  if (gone) return;
  gone = true;
  // Sitenin üstündeki krem örtü logoyu aynı yerde gösterip çekilir.
  if (!reduced) {
    const box = seal.getBoundingClientRect();
    try {
      sessionStorage.setItem("fornova-enter", JSON.stringify({ x: box.left, y: box.top, w: box.width, to: lang, t: Date.now() }));
    } catch {}
  }
  document.documentElement.classList.add("is-done", "is-leaving");
  setTimeout(() => location.replace(`${lang}/`), reduced ? 0 : 130);
}

const saved = savedLang();

if (saved) {
  // Dili seçmiş ziyaretçiye tekrar sorulmaz; dokunmak beklemeyi atlar.
  choose.hidden = true;
  const leave = () => go(saved);
  setTimeout(leave, reduced ? 300 : 1700);
  addEventListener("pointerdown", leave, { once: true });
  addEventListener("keydown", leave, { once: true });
} else {
  // Ekrana dokunmak veya tuşa basmak animasyonu anında bitirir.
  const finish = () => document.documentElement.classList.add("is-done");
  addEventListener("pointerdown", finish, { once: true });
  addEventListener("keydown", finish, { once: true });

  choose.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      try {
        localStorage.setItem("fornova-lang", link.hreflang);
      } catch {}
      go(link.hreflang);
    });
  });
}

// Dil seçilince beklemesin diye site önceden indirilir.
for (const href of ["ru/", "tr/", `assets/styles.css?v=${v}`, `assets/site.js?v=${v}`, `assets/app.js?v=${v}`, "assets/img/hero-1.webp", "assets/img/hero-1-640.webp"]) {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  document.head.append(link);
}

// Geri tuşuyla dönünce animasyon baştan oynar.
addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});
