const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const navLinks = Array.from(document.querySelectorAll("#site-nav a"));
const yearNode = document.querySelector("#year");
const revealNodes = Array.from(document.querySelectorAll(".reveal"));
const hero = document.querySelector(".hero");
const heroArt = document.querySelector(".hero-art");
const agentMesh = document.querySelector("[data-agent-mesh]");
const marketStrip = document.querySelector("[data-market-strip]");
const projectEntries = Array.from(document.querySelectorAll("[data-viewfinder]"));
const rhythmNotation = document.querySelector("[data-rhythm]");
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
  const rhythmPattern = [0, 140, 220, 360, 440, 560];
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealNodes.forEach((node, index) => {
    node.style.transitionDelay = `${rhythmPattern[index % rhythmPattern.length]}ms`;
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

function setupAgentMesh(meshNode) {
  if (!meshNode) {
    return;
  }

  const points = [
    { x: 10, y: 26 },
    { x: 20, y: 60 },
    { x: 35, y: 34 },
    { x: 47, y: 70 },
    { x: 63, y: 30 },
    { x: 77, y: 64 },
    { x: 88, y: 40 }
  ];
  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [4, 6],
    [5, 6]
  ];

  links.forEach(([fromIndex, toIndex], index) => {
    const from = points[fromIndex];
    const to = points[toIndex];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const link = document.createElement("span");
    link.className = "mesh-link";
    link.dataset.from = String(fromIndex);
    link.dataset.to = String(toIndex);
    link.dataset.linkIndex = String(index);
    link.style.left = `${from.x}%`;
    link.style.top = `${from.y}%`;
    link.style.width = `${length}%`;
    link.style.transform = `rotate(${angle}deg)`;
    meshNode.appendChild(link);
  });

  points.forEach((point, index) => {
    const node = document.createElement("span");
    node.className = "mesh-node";
    node.dataset.nodeIndex = String(index);
    node.style.left = `${point.x}%`;
    node.style.top = `${point.y}%`;
    meshNode.appendChild(node);
  });

  if (prefersReducedMotion) {
    return;
  }

  const linkNodes = Array.from(meshNode.querySelectorAll(".mesh-link"));

  meshNode.addEventListener("pointermove", (event) => {
    const rect = meshNode.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    meshNode.style.setProperty("--cursor-x", `${Math.max(0, Math.min(100, x))}%`);
    meshNode.style.setProperty("--cursor-y", `${Math.max(0, Math.min(100, y))}%`);

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    points.forEach((point, index) => {
      const dx = point.x - x;
      const dy = point.y - y;
      const dist = dx * dx + dy * dy;
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = index;
      }
    });

    linkNodes.forEach((link) => {
      const from = Number(link.dataset.from);
      const to = Number(link.dataset.to);
      const active = from === nearestIndex || to === nearestIndex;
      link.classList.toggle("active", active);
    });

    meshNode.classList.remove("pulse");
    window.requestAnimationFrame(() => {
      meshNode.classList.add("pulse");
    });
  });

  meshNode.addEventListener("pointerleave", () => {
    linkNodes.forEach((link) => link.classList.remove("active"));
    meshNode.style.setProperty("--cursor-x", "50%");
    meshNode.style.setProperty("--cursor-y", "50%");
  });
}

function setupMarketStrip(stripNode) {
  if (!stripNode) {
    return;
  }

  const line = document.createElement("span");
  line.className = "market-line";
  stripNode.appendChild(line);

  for (let i = 0; i < 28; i += 1) {
    const tick = document.createElement("span");
    tick.className = "market-tick";
    tick.style.left = `${(i / 27) * 100}%`;
    tick.style.height = `${12 + Math.round(Math.sin(i * 0.9) * 9 + Math.random() * 9)}px`;
    stripNode.appendChild(tick);
  }

  if (!prefersReducedMotion) {
    const toggleTrend = () => {
      stripNode.classList.toggle("rising");
    };
    setInterval(toggleTrend, 1900);
  }
}

if (agentMesh) {
  setupAgentMesh(agentMesh);
}

if (marketStrip) {
  setupMarketStrip(marketStrip);
}

if (rhythmNotation && !prefersReducedMotion) {
  const rhythmObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          rhythmNotation.classList.add("playing");
        }
      });
    },
    { threshold: 0.35 }
  );
  rhythmObserver.observe(rhythmNotation);
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
