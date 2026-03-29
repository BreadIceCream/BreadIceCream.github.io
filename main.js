const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const navLinks = Array.from(document.querySelectorAll("#site-nav a"));
const yearNode = document.querySelector("#year");
const revealNodes = Array.from(document.querySelectorAll(".reveal"));
const hero = document.querySelector(".hero");
const heroArt = document.querySelector(".hero-art");
const heroField = document.querySelector("[data-agent-field]");
const orb = document.querySelector("[data-agent-orb]");
const commandInput = document.querySelector("[data-command-input]");
const commandStream = document.querySelector("[data-command-stream]");
const commandButtons = Array.from(document.querySelectorAll("[data-command]"));
const textScanTargets = Array.from(document.querySelectorAll("h1, h2, h3, p, li, .btn, .site-nav a"));
const interestsSection = document.querySelector("#interests");
const interestsCanvas = document.querySelector("[data-interests-canvas]");
const fieldPoints = document.querySelector("[data-field-points]");
const interestsNodes = Array.from(document.querySelectorAll("[data-interest-node]"));
const cityButtons = Array.from(document.querySelectorAll("[data-city]"));
const interestSignal = document.querySelector("[data-interest-signal]");
const interestStatus = document.querySelector("[data-interest-status]");
const focusLens = document.querySelector("[data-focus-lens]");
const formulaA = document.querySelector("[data-formula-a]");
const formulaR = document.querySelector("[data-formula-r]");
const formulaT = document.querySelector("[data-formula-t]");
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

  const pattern = [0, 120, 210, 320, 430, 560];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealNodes.forEach((node, index) => {
    node.style.transitionDelay = `${pattern[index % pattern.length]}ms`;
    observer.observe(node);
  });
}

function setupHeroParallax() {
  if (!hero || !heroArt || prefersReducedMotion) {
    return;
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
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
      autoAngle += 0.018;
      pointerX += Math.cos(autoAngle) * 1.1;
      pointerY += Math.sin(autoAngle) * 0.8;
      pointerX = Math.max(10, Math.min(window.innerWidth - 10, pointerX));
      pointerY = Math.max(10, Math.min(window.innerHeight - 10, pointerY));
    }

    orbX += (pointerX - orbX) * 0.24;
    orbY += (pointerY - orbY) * 0.24;
    tailX += (pointerX - tailX) * 0.12;
    tailY += (pointerY - tailY) * 0.12;

    orbNode.style.left = `${orbX}px`;
    orbNode.style.top = `${orbY}px`;
    tailNode.style.left = `${tailX}px`;
    tailNode.style.top = `${tailY}px`;
    tailNode.style.width = `${28 + Math.sin(time / 170) * 4}px`;

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function setupTextScan() {
  textScanTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => {
      target.classList.remove("scan-active");
      requestAnimationFrame(() => target.classList.add("scan-active"));
      if (heroField && !prefersReducedMotion) {
        heroField.classList.remove("scanning");
        requestAnimationFrame(() => heroField.classList.add("scanning"));
      }
    });
  });
}

function setupHeroOrb() {
  if (!heroField || !orb || prefersReducedMotion) {
    return;
  }

  let t = 0;
  const loop = () => {
    t += 0.013;
    const x = 50 + Math.cos(t) * 34 + Math.sin(t * 1.6) * 5;
    const y = 52 + Math.sin(t * 1.2) * 30;
    orb.style.left = `${x}%`;
    orb.style.top = `${y}%`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function setupFieldPoints() {
  if (!fieldPoints) {
    return;
  }

  const total = 90;
  for (let i = 0; i < total; i += 1) {
    const point = document.createElement("span");
    point.className = "field-point";
    if (i % 3 === 0) {
      point.classList.add("micro");
    }
    point.style.left = `${4 + Math.random() * 92}%`;
    point.style.top = `${8 + Math.random() * 84}%`;
    point.style.opacity = `${0.46 + Math.random() * 0.5}`;
    fieldPoints.appendChild(point);
  }
}

function streamMessage(text) {
  if (!commandStream) {
    return;
  }

  if (prefersReducedMotion) {
    commandStream.textContent = text;
    return;
  }

  commandStream.textContent = "";
  let index = 0;
  const step = () => {
    commandStream.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) {
      setTimeout(step, 14);
    }
  };
  step();
}

const COMMAND_ALLOWLIST = {
  "/agent": { selector: "#home", mode: "agent", label: "agent field ready" },
  "/about": { selector: "#about", mode: "agent", label: "about context loaded" },
  "/interests": { selector: "#interests", mode: "travel", label: "interests core online" },
  "/travel": { selector: "#interests", mode: "travel", label: "travel trajectory mode" },
  "/photography": { selector: "#interests", mode: "photography", label: "lens focus mode" },
  "/music": { selector: "#interests", mode: "music", label: "frequency mode" },
  "/finance": { selector: "#interests", mode: "finance", label: "compound curve mode" },
  "/projects": { selector: "#projects", mode: "music", label: "project stream selected" },
  "/experience": { selector: "#experience", mode: "travel", label: "experience route selected" },
  "/contact": { selector: "#contact", mode: "finance", label: "contact endpoint selected" }
};

function applyInterestMode(mode) {
  if (!document.body) {
    return;
  }
  document.body.dataset.interestMode = mode;
  interestsNodes.forEach((node) => {
    node.classList.toggle("active", node.getAttribute("data-interest-node") === mode);
  });
  if (interestStatus) {
    const labelMap = {
      travel: "mode://travel -> route tracing online",
      photography: "mode://photography -> lens focus and reveal",
      music: "mode://music -> frequency pacing online",
      finance: "mode://finance -> growth-signal online",
      agent: "mode://agent -> scan channel online"
    };
    interestStatus.textContent = labelMap[mode] || "mode://travel -> route tracing online";
  }
}

function getInterestProgress() {
  if (!interestsSection) {
    return 0;
  }
  const rect = interestsSection.getBoundingClientRect();
  const start = window.innerHeight * 0.86;
  const end = -rect.height * 0.3;
  const progress = (start - rect.top) / (start - end);
  return Math.max(0, Math.min(1, progress));
}

function executeCommand(raw) {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return;
  }

  const command = normalized.startsWith("/") ? normalized : `/${normalized}`;
  const task = COMMAND_ALLOWLIST[command];
  if (!task) {
    streamMessage(`rejected ${command} (allowlist only)`);
    return;
  }

  const target = document.querySelector(task.selector);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  applyInterestMode(task.mode);
  streamMessage(`execute ${command} -> ${task.label}`);
}

function setupCommandNavigation() {
  if (commandInput) {
    commandInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        executeCommand(commandInput.value);
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

function setupInterestsInteractions() {
  if (!interestsCanvas || !interestSignal || !interestsSection) {
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          interestsCanvas.classList.add("visible");
        }
      });
    },
    { threshold: 0.22 }
  );
  sectionObserver.observe(interestsSection);

  interestsNodes.forEach((node) => {
    node.addEventListener("mouseenter", () => {
      const mode = node.getAttribute("data-interest-node") || "travel";
      applyInterestMode(mode);
    });
  });

  cityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      cityButtons.forEach((it) => it.classList.remove("active"));
      button.classList.add("active");
      if (interestStatus) {
        const city = button.getAttribute("data-city");
        interestStatus.textContent = `mode://${document.body.dataset.interestMode || "travel"} -> locating ${city}`;
      }
    });
  });

  if (focusLens && !prefersReducedMotion) {
    interestsCanvas.addEventListener("pointermove", (event) => {
      const rect = interestsCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      focusLens.style.left = `${x}px`;
      focusLens.style.top = `${y}px`;
    });

    interestsCanvas.addEventListener("pointerleave", () => {
      focusLens.style.left = "14%";
      focusLens.style.top = "50%";
    });
  }

  const updateFocusBlur = () => {
    const progress = getInterestProgress();
    const blur = (1 - progress) * 12;
    interestsCanvas.style.setProperty("--focus-blur", `${blur.toFixed(2)}px`);
  };
  updateFocusBlur();
  window.addEventListener("scroll", updateFocusBlur, { passive: true });
}

function setupInterestSignal() {
  if (!interestSignal) {
    return;
  }

  let phase = 0;
  const buildPath = (mode) => {
    const width = 640;
    const height = 180;
    const points = [];
    let baseline = 96;
    let amplitude = 22;
    let frequency = 2.3;

    if (mode === "music") {
      baseline = 92;
      amplitude = 30;
      frequency = 5.8;
    } else if (mode === "finance") {
      baseline = 112;
      amplitude = 14;
      frequency = 2.2;
    } else if (mode === "photography") {
      baseline = 92;
      amplitude = 24;
      frequency = 3.4;
    }

    for (let x = 0; x <= width; x += 16) {
      const t = (x / width) * Math.PI * frequency + phase;
      const growth = mode === "finance" ? Math.pow(x / width, 1.85) * 42 : 0;
      const focusDrop = mode === "photography" ? Math.exp(-Math.pow((x - 320) / 120, 2)) * 18 : 0;
      const y = baseline + Math.sin(t) * amplitude - growth - focusDrop;
      points.push(`${x},${Math.max(16, Math.min(height - 12, y)).toFixed(2)}`);
    }
    return `M${points.join(" L")}`;
  };

  const animate = () => {
    const mode = document.body.dataset.interestMode || "travel";
    phase += mode === "music" ? 0.16 : mode === "finance" ? 0.052 : mode === "photography" ? 0.1 : 0.072;
    interestSignal.setAttribute("d", buildPath(mode));
    if (!prefersReducedMotion) {
      requestAnimationFrame(animate);
    }
  };

  interestSignal.setAttribute("d", buildPath("travel"));
  if (!prefersReducedMotion) {
    requestAnimationFrame(animate);
  }
}

function setupCompoundFormula() {
  if (!formulaA || !formulaR || !formulaT) {
    return;
  }

  let lastStep = -1;
  const basePrincipal = 1000;
  const modeRate = {
    travel: 0.07,
    photography: 0.095,
    music: 0.115,
    finance: 0.13,
    agent: 0.088
  };

  const update = () => {
    const mode = document.body.dataset.interestMode || "travel";
    const progress = getInterestProgress();
    const rateBase = modeRate[mode] || 0.08;
    const timeBase = 2 + progress * 9;
    const step = Math.floor((performance.now() / 260) % 7);
    const jumpRate = rateBase + step * 0.004;
    const jumpTime = timeBase + (step % 3) * 0.45;
    const amount = basePrincipal * Math.pow(1 + jumpRate, jumpTime);

    if (step !== lastStep || !prefersReducedMotion) {
      formulaA.textContent = amount.toFixed(2);
      formulaR.textContent = jumpRate.toFixed(3);
      formulaT.textContent = jumpTime.toFixed(2);
      lastStep = step;
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(update);
    }
  };

  update();
}

setupRevealSystem();
setupHeroParallax();
setupAutonomousCursor();
setupFieldPoints();
setupTextScan();
setupHeroOrb();
setupCommandNavigation();
setupInterestsInteractions();
setupInterestSignal();
setupCompoundFormula();
applyInterestMode("travel");
