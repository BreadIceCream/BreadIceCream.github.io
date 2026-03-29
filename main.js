const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const navLinks = Array.from(document.querySelectorAll("#site-nav a"));
const yearNode = document.querySelector("#year");
const revealNodes = Array.from(document.querySelectorAll(".reveal"));
const hero = document.querySelector(".hero");
const heroArt = document.querySelector(".hero-art");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menuToggle.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (prefersReducedMotion) {
  revealNodes.forEach((node) => node.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  revealNodes.forEach((node, index) => {
    node.style.transitionDelay = `${index * 100}ms`;
    revealObserver.observe(node);
  });
}

if (hero && heroArt && !prefersReducedMotion) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    heroArt.style.transform = `translate(${x}px, ${y}px)`;
  });

  hero.addEventListener("pointerleave", () => {
    heroArt.style.transform = "translate(0, 0)";
  });
}
