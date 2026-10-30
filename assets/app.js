const cats = [...document.querySelectorAll("[data-cat]")];
const tabs = document.querySelector("[data-tabs]");
const tabLinks = [...tabs.querySelectorAll("a")];
const input = document.querySelector("[data-search-input]");
const empty = document.querySelector("[data-empty]");
const nav = document.querySelector("[data-nav]");
const pill = document.querySelector("[data-pill]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function movePill() {
  const a = tabs.querySelector(".is-active");
  if (!a) return;
  pill.style.width = `${a.offsetWidth}px`;
  pill.style.transform = `translateX(${a.offsetLeft}px)`;
}

function activate(id) {
  tabLinks.forEach((a) => {
    const on = a.getAttribute("href") === `#${id}`;
    a.classList.toggle("is-active", on);
    if (on) {
      a.setAttribute("aria-current", "true");
      // Sadece sekme şeridi kayar, sayfa kaymaz.
      tabs.scrollTo({ left: a.offsetLeft - (tabs.clientWidth - a.offsetWidth) / 2, behavior: "smooth" });
    } else {
      a.removeAttribute("aria-current");
    }
  });
  movePill();
}

let current = cats[0].id;

function syncTabs() {
  const line = innerHeight * 0.4;
  const visible = cats.filter((c) => !c.hidden);
  const active = visible.filter((c) => c.getBoundingClientRect().top <= line).pop() ?? visible[0];
  if (active && active.id !== current) {
    current = active.id;
    activate(current);
  }
}

// Çay bardağı: kart ekrandan geçerken dolar
const teaCard = document.querySelector("[data-tea-card]");
const tea = document.querySelector("[data-tea]");
const glass = document.querySelector(".glass");
const cue = document.querySelector("[data-tea-cue]");
const cueStart = cue.textContent;
const EMPTY_Y = 440;
const FULL_Y = 112;

function syncTea() {
  const box = teaCard.getBoundingClientRect();
  const fill = reduced ? 1 : Math.min(Math.max((innerHeight - box.top) / (box.height + innerHeight * 0.2), 0), 1);
  tea.setAttribute("transform", `translate(0 ${EMPTY_Y - (EMPTY_Y - FULL_Y) * fill})`);
  const full = fill >= 0.98;
  glass.classList.toggle("is-full", full);
  cue.textContent = full ? cue.dataset.done : cueStart;
}

let ticking = false;

function onFrame() {
  ticking = false;
  syncTabs();
  syncTea();
}

addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  },
  { passive: true },
);
addEventListener("resize", () => {
  movePill();
  onFrame();
});
document.fonts?.ready.then(movePill);
movePill();
onFrame();

const normalize = (s) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/ё/g, "е")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const menuSection = document.querySelector("#menu");
const bar = document.querySelector(".menu__bar");

input.addEventListener("input", () => {
  const query = normalize(input.value.trim());
  let total = 0;
  cats.forEach((cat) => {
    let shown = 0;
    cat.querySelectorAll(".row").forEach((row) => {
      const match = !query || normalize(row.dataset.search).includes(query);
      row.hidden = !match;
      if (match) shown++;
    });
    cat.hidden = shown === 0;
    total += shown;
  });
  empty.hidden = total > 0;
  document.querySelector(".cats").classList.toggle("is-filtered", Boolean(query));
  // Liste kısalınca sonuçlar ekranda kalsın.
  const top = document.querySelector(".cats").getBoundingClientRect().top + scrollY;
  const offset = nav.offsetHeight + (getComputedStyle(bar).display === "contents" ? tabs : bar).offsetHeight;
  if (scrollY > top - offset) scrollTo({ top: top - offset, behavior: "auto" });
  onFrame();
  menuSection.dataset.filtered = query ? "1" : "";
});
