const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const navLinks = Array.from(document.querySelectorAll("#site-nav a"));
const yearNode = document.querySelector("#year");
const revealNodes = Array.from(document.querySelectorAll(".reveal"));
const hero = document.querySelector(".hero");
const heroArt = document.querySelector(".hero-art");
const heroField = document.querySelector("[data-agent-field]");
const signalPath = document.querySelector("[data-signal-path]");
const orb = document.querySelector("[data-agent-orb]");
const scanBeam = document.querySelector("[data-scan-beam]");
const fieldPoints = document.querySelector("[data-field-points]");
const commandInput = document.querySelector("[data-command-input]");
const commandStream = document.querySelector("[data-command-stream]");
const commandButtons = Array.from(document.querySelectorAll("[data-command]"));
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

function setupRevealSystem() {
  if (prefersReducedMotion) {
    revealNodes.forEach((node) => node.classList.add("visible"));
    return;
  }

  const rhythmPattern = [0, 110, 180, 320, 420, 560];
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

function setupHeroParallax() {
  if (!hero || !heroArt || prefersReducedMotion) {
    return;
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
    heroArt.style.transform = `translate(${x}px, ${y}px)`;
  });

  hero.addEventListener("pointerleave", () => {
    heroArt.style.transform = "translate(0, 0)";
  });
}

function setupAutonomousCursor() {
  if (prefersReducedMotion || window.matchMedia("(max-width: 760px)").matches) {
    return;
  }

  const orbNode = document.createElement("span");
  orbNode.className = "cursor-orb";
  const tailNode = document.createElement("span");
  tailNode.className = "cursor-tail";
  document.body.append(orbNode, tailNode);

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let orbX = pointerX;
  let orbY = pointerY;
  let tailX = pointerX;
  let tailY = pointerY;
  let idleSince = performance.now();
  let autoAngle = 0;

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    idleSince = performance.now();
  });

  const tick = (time) => {
    if (time - idleSince > 1400) {
      autoAngle += 0.016;
      const radius = 22;
      pointerX += Math.cos(autoAngle) * 0.9;
      pointerY += Math.sin(autoAngle) * 0.8;
      pointerX = Math.max(8, Math.min(window.innerWidth - 8, pointerX));
      pointerY = Math.max(8, Math.min(window.innerHeight - 8, pointerY));
    }

    orbX += (pointerX - orbX) * 0.22;
    orbY += (pointerY - orbY) * 0.22;
    tailX += (pointerX - tailX) * 0.12;
    tailY += (pointerY - tailY) * 0.12;

    orbNode.style.left = `${orbX}px`;
    orbNode.style.top = `${orbY}px`;
    tailNode.style.left = `${tailX}px`;
    tailNode.style.top = `${tailY}px`;
    tailNode.style.width = `${28 + Math.sin(time / 170) * 5}px`;

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function setupTextScan() {
  const scanTargets = Array.from(
    document.querySelectorAll("h1, h2, h3, p, li, .btn, .site-nav a")
  );
  scanTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => {
      target.classList.remove("scan-active");
      requestAnimationFrame(() => target.classList.add("scan-active"));
      if (heroField && scanBeam && !prefersReducedMotion) {
        heroField.classList.remove("scanning");
        requestAnimationFrame(() => heroField.classList.add("scanning"));
      }
    });
  });
}

function setCommandStream(message) {
  if (!commandStream) {
    return;
  }

  if (prefersReducedMotion) {
    commandStream.textContent = message;
    return;
  }

  commandStream.textContent = "";
  let index = 0;
  const step = () => {
    commandStream.textContent = message.slice(0, index);
    index += 1;
    if (index <= message.length) {
      setTimeout(step, 14);
    }
  };
  step();
}

function executeCommand(raw) {
  const normalized = raw.trim().toLowerCase().replace(/^\/+/, "");
  if (!normalized) {
    return;
  }

  const mapping = {
    travel: { selector: "#experience", label: "route trace and travel arcs" },
    music: { selector: "#about", label: "rhythm notation mode" },
    finance: { selector: "#contact", label: "signal curve mode" },
    agent: { selector: "#home", label: "agent scan field" },
    projects: { selector: "#projects", label: "photography focus stream" }
  };

  const task = mapping[normalized];
  if (!task) {
    setCommandStream(`unknown command /${normalized}`);
    return;
  }

  const target = document.querySelector(task.selector);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setCommandStream(`executing /${normalized} -> ${task.label} ... done`);
    document.body.dataset.signalMode = normalized === "finance" ? "finance" : "music";
  }
}

function setupCommandNavigation() {
  if (commandInput) {
    commandInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        executeCommand(commandInput.value.startsWith("/") ? commandInput.value : `/${commandInput.value}`);
        commandInput.value = "";
      }
    });
  }

  commandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.getAttribute("data-command") || "";
      executeCommand(command);
    });
  });
}

function setupFieldPoints() {
  if (!fieldPoints) {
    return;
  }

  const points = [
    [8, 68],
    [18, 36],
    [30, 74],
    [43, 26],
    [56, 64],
    [68, 40],
    [84, 72],
    [92, 34]
  ];

  points.forEach(([x, y], index) => {
    const point = document.createElement("span");
    point.className = "field-point";
    point.style.left = `${x}%`;
    point.style.top = `${y}%`;
    point.style.opacity = `${0.45 + (index % 3) * 0.15}`;
    fieldPoints.appendChild(point);
  });
}

function setupAgentOrbMotion() {
  if (!heroField || !orb || prefersReducedMotion) {
    return;
  }

  let t = 0;
  const loop = () => {
    t += 0.012;
    const x = 50 + Math.cos(t) * 34 + Math.sin(t * 1.8) * 6;
    const y = 54 + Math.sin(t * 1.3) * 28;
    orb.style.left = `${x}%`;
    orb.style.top = `${y}%`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  heroField.addEventListener("pointermove", (event) => {
    const rect = heroField.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    orb.style.left = `${Math.max(2, Math.min(98, x))}%`;
    orb.style.top = `${Math.max(6, Math.min(94, y))}%`;
    heroField.classList.remove("scanning");
    requestAnimationFrame(() => heroField.classList.add("scanning"));
  });
}

function setupSignalPath() {
  if (!signalPath) {
    return;
  }

  let phase = 0;
  const buildPath = (mode) => {
    const width = 560;
    const height = 130;
    const baseline = mode === "finance" ? 78 : 64;
    const amplitude = mode === "finance" ? 12 : 20;
    const frequency = mode === "finance" ? 2.1 : 3.6;
    const points = [];

    for (let x = 0; x <= width; x += 14) {
      const t = (x / width) * Math.PI * frequency + phase;
      const growth = mode === "finance" ? Math.pow(x / width, 1.7) * 24 : 0;
      const y = baseline + Math.sin(t) * amplitude - growth;
      points.push(`${x},${Math.max(8, Math.min(height - 8, y)).toFixed(2)}`);
    }

    return `M${points.join(" L")}`;
  };

  const tick = () => {
    const mode = document.body.dataset.signalMode === "finance" ? "finance" : "music";
    phase += mode === "finance" ? 0.04 : 0.07;
    signalPath.setAttribute("d", buildPath(mode));
    if (!prefersReducedMotion) {
      requestAnimationFrame(tick);
    }
  };

  signalPath.setAttribute("d", buildPath("music"));
  if (!prefersReducedMotion) {
    requestAnimationFrame(tick);
  }
}

function setupPhotographyReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-focus", entry.isIntersecting);
      });
    },
    { threshold: 0.45 }
  );

  projectEntries.forEach((entry) => observer.observe(entry));

  projectEntries.forEach((entry) => {
    entry.addEventListener("mouseenter", () => {
      entry.classList.add("focused");
      if (!prefersReducedMotion) {
        document.body.classList.remove("shutter-flash");
        requestAnimationFrame(() => document.body.classList.add("shutter-flash"));
      }
    });
    entry.addEventListener("mouseleave", () => entry.classList.remove("focused"));
  });
}

function setupRhythmNotation() {
  if (!rhythmNotation || prefersReducedMotion) {
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          rhythmNotation.classList.add("playing");
        }
      });
    },
    { threshold: 0.35 }
  );
  observer.observe(rhythmNotation);
}

setupRevealSystem();
setupHeroParallax();
setupAutonomousCursor();
setupTextScan();
setupCommandNavigation();
setupFieldPoints();
setupAgentOrbMotion();
setupSignalPath();
setupPhotographyReveal();
setupRhythmNotation();
