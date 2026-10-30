const wipe = document.querySelector("[data-wipe]");
const seal = document.querySelector(".seal");
const { transition } = document.body.dataset;

const finish = () => document.documentElement.classList.add("is-done");
addEventListener("pointerdown", finish, { once: true });

function leave() {
  const box = seal.getBoundingClientRect();
  if (transition === "wipe") {
    wipe.style.setProperty("--x", `${box.left + box.width / 2}px`);
    wipe.style.setProperty("--y", `${box.top + box.height * 0.27}px`);
    wipe.getBoundingClientRect();
    wipe.classList.add("is-on");
    return 480;
  }
  if (transition === "shrink") {
    // Logo sitenin üst menüsündeki yerine uçar.
    const scale = 150 / box.width;
    const x = 24 + (box.width * scale) / 2 - (box.left + box.width / 2);
    const y = 34 - (box.top + box.height / 2);
    wipe.remove();
    document.documentElement.classList.add("is-shrinking");
    seal.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    return 620;
  }
  document.documentElement.classList.add("is-fading");
  return 420;
}

document.querySelectorAll(".choose a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setTimeout(() => location.assign(link.href), leave());
  });
});

// Geri tuşuyla dönünce animasyon baştan oynasın.
addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});
