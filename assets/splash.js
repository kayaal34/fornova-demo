const seal = document.querySelector(".seal");
const choose = document.querySelector("[data-choose]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  // Sitenin üstündeki kapak logoyu aynı yerde gösterip açılır.
  if (!reduced) {
    const box = seal.getBoundingClientRect();
    try {
      sessionStorage.setItem("fornova-doors", JSON.stringify({ x: box.left, y: box.top, w: box.width }));
    } catch {}
  }
  document.documentElement.classList.add("is-done", "is-leaving");
  setTimeout(() => location.replace(`${lang}/`), reduced ? 0 : 240);
}

const saved = savedLang();

if (saved) {
  // Dili seçmiş ziyaretçiye tekrar sorulmaz; dokunmak beklemeyi atlar.
  choose.hidden = true;
  const leave = () => go(saved);
  setTimeout(leave, reduced ? 300 : 3000);
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
