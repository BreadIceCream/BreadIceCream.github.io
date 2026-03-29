const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const navLinks = Array.from(document.querySelectorAll("#site-nav a"));
const yearNode = document.querySelector("#year");
const revealNodes = Array.from(document.querySelectorAll(".reveal"));
const hero = document.querySelector(".hero");
const heroArt = document.querySelector(".hero-art");
const agentMesh = document.querySelector("[data-agent-mesh]");
const projectEntries = Array.from(document.querySelectorAll("[data-viewfinder]"));
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

function createAgentMesh(meshNode) {
  if (!meshNode) {
    return;
  }

  const points = [
    { x: 12, y: 22 },
    { x: 24, y: 56 },
    { x: 38, y: 30 },
    { x: 52, y: 64 },
    { x: 66, y: 32 },
    { x: 84, y: 58 }
  ];
  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [2, 4],
    [3, 5],
    [4, 5]
  ];

  points.forEach((point) => {
    const node = document.createElement("span");
    node.className = "mesh-node";
    node.style.left = `${point.x}%`;
    node.style.top = `${point.y}%`;
    meshNode.appendChild(node);
  });

  links.forEach(([fromIndex, toIndex]) => {
    const from = points[fromIndex];
    const to = points[toIndex];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const link = document.createElement("span");
    link.className = "mesh-link";
    link.style.left = `${from.x}%`;
    link.style.top = `${from.y}%`;
    link.style.width = `${length}%`;
    link.style.transform = `rotate(${angle}deg)`;
    meshNode.appendChild(link);
  });
}

if (agentMesh) {
  createAgentMesh(agentMesh);

  if (!prefersReducedMotion) {
    agentMesh.addEventListener("pointermove", (event) => {
      const rect = agentMesh.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      agentMesh.style.setProperty("--cursor-x", `${Math.max(0, Math.min(100, x))}%`);
      agentMesh.style.setProperty("--cursor-y", `${Math.max(0, Math.min(100, y))}%`);
    });
  }
}

projectEntries.forEach((entry) => {
  entry.addEventListener("mouseenter", () => {
    entry.classList.add("focused");

    if (!prefersReducedMotion) {
      document.body.classList.remove("shutter-flash");
      window.requestAnimationFrame(() => {
        document.body.classList.add("shutter-flash");
      });
    }
  });

  entry.addEventListener("mouseleave", () => {
    entry.classList.remove("focused");
  });
});
