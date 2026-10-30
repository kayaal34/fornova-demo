const wipe = document.querySelector("[data-wipe]");
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
  const box = seal.getBoundingClientRect();
  wipe.style.setProperty("--x", `${box.left + box.width / 2}px`);
  wipe.style.setProperty("--y", `${box.top + box.height * 0.27}px`);
  wipe.getBoundingClientRect();
  wipe.classList.add("is-on");
  // Geri tuşu açılışa dönmesin.
  setTimeout(() => location.replace(`${lang}/`), reduced ? 0 : 480);
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
