const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const navLinks = Array.from(document.querySelectorAll("#site-nav a"));
const yearNode = document.querySelector("#year");
let revealNodes = [];
const hero = document.querySelector(".hero");
const heroArt = document.querySelector(".hero-art");
const commandInput = document.querySelector("[data-command-input]");
const commandStream = document.querySelector("[data-command-stream]");
const commandButtons = Array.from(document.querySelectorAll("[data-command]"));
let textScanTargets = [];
const interestsNodes = Array.from(document.querySelectorAll("[data-interest-node]"));
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
  revealNodes = Array.from(document.querySelectorAll(".reveal"));
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
  textScanTargets = Array.from(document.querySelectorAll("h1, h2, h3, p, .highlights li, .btn, .site-nav a, .friend-card, [data-viewfinder]"));
  textScanTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => {
      target.classList.remove("scan-active");
      requestAnimationFrame(() => target.classList.add("scan-active"));
    });
  });
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
  "/agent": { selector: "#home", mode: null, label: "BINGO! You discovered the hidden command" },
  "/about": { selector: "#about", mode: null, label: "about context loaded" },
  "/interests": { selector: "#interests", mode: null, label: "interests core online" },
  "/travel": { selector: "#interests", mode: "travel", label: "travel trajectory mode" },
  "/photography": { selector: "#interests", mode: "photography", label: "lens focus mode" },
  "/music": { selector: "#interests", mode: "music", label: "frequency mode" },
  "/finance": { selector: "#interests", mode: "finance", label: "compound curve mode" },
  "/projects": { selector: "#projects", mode: null, label: "project stream selected" },
  "/experience": { selector: "#experience", mode: null, label: "experience route selected" },
  "/contact": { selector: "#contact", mode: null, label: "contact endpoint selected" },
  "/friends": { selector: "#friends", mode: null, label: "inner circle endpoint selected" }
};

function executeCommand(raw) {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return;
  }

  const command = normalized.startsWith("/") ? normalized : `/${normalized}`;
  const task = COMMAND_ALLOWLIST[command];
  if (!task) {
    streamMessage(`rejected ${command}`);
    return;
  }

  const target = document.querySelector(task.selector);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 只有在定义了有效兴趣模式时才打开浮层
  if (task.mode) {
    openOverlay(task.mode);
  } else {
    // 确保非浮层操作时关闭可能存在的旧浮层
    closeOverlay();
  }
  
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

/* ════════════════════════════════════════════════════════════
   Interests Interaction System (v2)
   Each interest has its own panel with unique interactive visuals
   Data is loaded from /data/*.json
   ════════════════════════════════════════════════════════════ */

const overlay = document.getElementById("interest-overlay");
const panels = {
  travel: document.getElementById("panel-travel"),
  photography: document.getElementById("panel-photography"),
  music: document.getElementById("panel-music"),
  finance: document.getElementById("panel-finance")
};

let currentMode = null;
let interestsDataCache = null;
let klineAnimId = null;
let travelGlobeTimer = null;
let currentSongIndex = 0;

/* ─── Overlay open / close ─── */
function openOverlay(mode) {
  currentMode = mode;

  // 高亮卡片
  interestsNodes.forEach((node) => {
    node.classList.toggle("active", node.getAttribute("data-interest-node") === mode);
  });

  // 激活面板
  Object.entries(panels).forEach(([key, panel]) => {
    if (!panel) return;
    if (key === mode) panel.classList.add("active");
    else panel.classList.remove("active");
  });

  // 打开浮层
  if (overlay) {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  // 延迟一帧触发初始化（等 overlay 渲染尺寸）
  requestAnimationFrame(() => {
    if (mode === "travel") initTravel();
    else if (mode === "photography") initPhotography();
    else if (mode === "music") initMusic();
    else if (mode === "finance") initFinance();
  });
}

function closeOverlay() {
  currentMode = null;

  if (overlay) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  interestsNodes.forEach((node) => node.classList.remove("active"));
  Object.values(panels).forEach((panel) => {
    if (panel) panel.classList.remove("active");
  });

  if (klineAnimId) {
    cancelAnimationFrame(klineAnimId);
    klineAnimId = null;
  }
  if (travelGlobeTimer) {
    travelGlobeTimer.stop();
    travelGlobeTimer = null;
  }
}

/* ─── Travel: 3D Globe ─── */
async function initTravel() {
  if (!panels.travel) return;
  const canvas = panels.travel.querySelector(".travel-globe");
  if (!canvas) return;

  if (!interestsDataCache) {
    try {
      const res = await fetch("./data/interests.json");
      interestsDataCache = await res.json();
    } catch (e) {
      console.warn("Failed to load interests data:", e);
      return;
    }
  }

  const cities = interestsDataCache.travel?.cities;
  if (!cities || cities.length === 0) return;

  if (travelGlobeTimer) {
    travelGlobeTimer.stop();
    travelGlobeTimer = null;
  }

  const sortedCities = [...cities].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  let worldData;
  try {
    const res = await fetch("./data/world-110m.json");
    worldData = await res.json();
  } catch (e) {
    console.warn("Failed to load world map data:", e);
    return;
  }

  const context = canvas.getContext("2d");
  
  // Set real dimensions to viewport full size
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  context.scale(dpr, dpr);

  // Setup D3 Orthographic Projection
  const initialScale = Math.min(width, height) / 2.1;
  const projection = d3.geoOrthographic()
    .scale(initialScale)
    .translate([width / 2, height / 2])
    .clipAngle(90);

  const path = d3.geoPath().projection(projection).context(context);
  const land = topojson.feature(worldData, worldData.objects.countries);

  // Pre-calculate flight segments
  const flights = [];
  for (let i = 0; i < sortedCities.length - 1; i++) {
    const p1 = [sortedCities[i].lng, sortedCities[i].lat];
    const p2 = [sortedCities[i + 1].lng, sortedCities[i + 1].lat];
    const interpolate = d3.geoInterpolate(p1, p2);
    // Break flight into small resolution steps
    const steps = 40;
    const arcPoints = d3.range(steps + 1).map(t => interpolate(t / steps));
    flights.push(arcPoints);
  }

  let currentCityIndex = 0;
  let progress = 0; 
  let rawProgress = 0;
  const flightDuration = 1000; // 1s per flight string
  const totalDuration = flightDuration * Math.max(1, sortedCities.length - 1);
  let isManualControl = false;

  // Interactive Rotate and Zoom via d3.zoom
  let lastTransformX = 0;
  let lastTransformY = 0;
  
  const zoom = d3.zoom()
    .scaleExtent([1, 4])
    .on("start", () => {
      isManualControl = true;
      canvas.style.cursor = "grabbing";
    })
    .on("end", () => {
      canvas.style.cursor = "grab";
    })
    .on("zoom", (e) => {
      isManualControl = true;
      const dx = e.transform.x - lastTransformX;
      const dy = e.transform.y - lastTransformY;
      lastTransformX = e.transform.x;
      lastTransformY = e.transform.y;
      
      const r = projection.rotate();
      projection.rotate([r[0] + dx * 0.4, r[1] - dy * 0.4, 0]);
      projection.scale(initialScale * e.transform.k);
    });

  // Attach drag/zoom behavior and set initial cursor
  canvas.style.cursor = "grab";
  d3.select(canvas).call(zoom);

  // Set initial orientation on first city if untouched
  if (sortedCities.length > 0) {
    projection.rotate([-sortedCities[0].lng, -sortedCities[0].lat, 0]);
  }

  travelGlobeTimer = d3.timer((elapsed) => {
    // Basic Globe Render
    context.clearRect(0, 0, width, height);

    // Ocean & Globe Base
    context.beginPath();
    path({type: "Sphere"});
    context.fillStyle = "rgba(240, 243, 238, 0.75)";
    context.fill();
    context.strokeStyle = "rgba(35, 57, 66, 0.1)";
    context.lineWidth = 1;
    context.stroke();

    // Land
    context.beginPath();
    path(land);
    context.fillStyle = "rgba(176, 188, 192, 0.65)";
    context.fill();

    // Flight Progress State
    let elapsedCapped = Math.min(elapsed, totalDuration);
    
    if (sortedCities.length > 1) {
      currentCityIndex = Math.floor(elapsedCapped / flightDuration);
      if (currentCityIndex >= sortedCities.length - 1) currentCityIndex = sortedCities.length - 2;
      
      rawProgress = (elapsedCapped - currentCityIndex * flightDuration) / flightDuration;
      // Apply ease-in-out easing to progress
      progress = d3.easeCubicInOut(Math.min(1, Math.max(0, rawProgress)));

      if (!isManualControl) {
        const p1 = [sortedCities[currentCityIndex].lng, sortedCities[currentCityIndex].lat];
        const p2 = [sortedCities[currentCityIndex + 1].lng, sortedCities[currentCityIndex + 1].lat];
        const interp = d3.geoInterpolate(p1, p2);
        const currentPoint = interp(progress);

        // Spin globe towards current point during animation
        projection.rotate([-currentPoint[0], -currentPoint[1], 0]);
      }
    } else if (!isManualControl) {
      projection.rotate([-sortedCities[0].lng, -sortedCities[0].lat, 0]);
    }

    // Passive Rotation when finish
    if (elapsed > totalDuration && !isManualControl) {
      const extraTime = elapsed - totalDuration;
      const endCity = sortedCities[sortedCities.length - 1];
      projection.rotate([-endCity.lng - extraTime * 0.003, -endCity.lat, 0]);
    }

    // Render Routes
    if (flights.length > 0) {
      context.beginPath();
      // Past full routes
      for (let i = 0; i < currentCityIndex; i++) {
        path({type: "LineString", coordinates: flights[i]});
      }
      // Ongoing partial route
      const currentFlightFull = flights[currentCityIndex];
      const sliceCount = Math.max(2, Math.floor(progress * currentFlightFull.length));
      const currentFlightPart = currentFlightFull.slice(0, sliceCount);
      path({type: "LineString", coordinates: currentFlightPart});
      
      context.strokeStyle = "rgba(28, 134, 176, 0.85)";
      context.lineWidth = 2.5;
      context.setLineDash([8, 5]);
      context.stroke();
      context.setLineDash([]);
    }

    // Render City Markers
    sortedCities.forEach((city, i) => {
      // Hide future cities until reached
      if (i > currentCityIndex + 1) return;
      if (i === currentCityIndex + 1 && rawProgress < 1) return;

      const p = [city.lng, city.lat];
      
      // Calculate front/back visibility
      const center = projection.invert([width/2, height/2]);
      const dist = d3.geoDistance(p, center);
      if (dist > Math.PI / 2 + 0.1) return; // Only draw front 

      const projected = projection(p);

      // Pulse ring for the newest city
      if (i === currentCityIndex + (elapsed >= totalDuration ? 1 : 0) || (elapsed > totalDuration && i === sortedCities.length - 1)) {
        context.beginPath();
        context.arc(projected[0], projected[1], 5 + (Math.sin(elapsed / 180) + 1) * 3, 0, 2 * Math.PI);
        context.fillStyle = "rgba(28, 134, 176, 0.25)";
        context.fill();
        context.strokeStyle = "rgba(28, 134, 176, 0.5)";
        context.lineWidth = 1;
        context.stroke();
      }

      // City core dot
      context.beginPath();
      context.arc(projected[0], projected[1], 5, 0, 2 * Math.PI);
      context.fillStyle = "rgba(28, 134, 176, 0.95)";
      context.fill();

      // City labels
      context.textAlign = "center";
      context.textBaseline = "middle";
      
      context.font = "bold 13px 'Consolas', 'Courier New', monospace";
      context.fillStyle = "#164453";
      context.fillText(city.name, projected[0], projected[1] - 18);
      
      if (city.time) {
        context.font = "11px 'Consolas', 'Courier New', monospace";
        context.fillStyle = "#4a5d6a";
        context.fillText(city.time, projected[0], projected[1] - 6);
      }
    });
  });
}

/* ─── Photography: Album ─── */
async function initPhotography() {
  if (!panels.photography) return;
  const album = panels.photography.querySelector("#scroll-photography");

  if (!interestsDataCache) {
    try {
      const res = await fetch("./data/interests.json");
      interestsDataCache = await res.json();
    } catch (e) {
      console.warn("Failed to load interests data:", e);
      return;
    }
  }

  if (album.children.length > 0) return;

  const photos = interestsDataCache.photography?.photos;
  if (!photos) return;

  photos.forEach((photo, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-item-wrapper";
    
    const card = document.createElement("div");
    card.className = "gallery-item";
    
    // Default scale is 1 (100% of grid cell)
    const cardScale = photo.scale || 1.0;
    card.style.width = `${cardScale * 100}%`;
    card.style.transitionDelay = `${index * 0.1}s`;


    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.location || "Photography";
    img.loading = "lazy";

    const exifInfo = document.createElement("div");
    exifInfo.className = "exif-info";
    
    const locSpan = document.createElement("span");
    locSpan.className = "location";
    locSpan.textContent = photo.location || "";
    
    const specsSpan = document.createElement("span");
    specsSpan.className = "specs";
    // 如果还没加载出来或者没网，显示获取中
    specsSpan.textContent = "Parsing EXIF..."; 

    exifInfo.append(locSpan, specsSpan);
    card.append(img, exifInfo);
    wrapper.appendChild(card);
    album.appendChild(wrapper);

    if (window.exifr) {
      exifr.parse(photo.src, ['FNumber', 'ExposureTime', 'ISO'])
        .then(exif => {
          if (exif) {
            const fNumber = exif.FNumber ? `f/${exif.FNumber}` : "";
            let exposure = "";
            if (exif.ExposureTime) {
              if (exif.ExposureTime < 1) {
                exposure = `1/${Math.round(1 / exif.ExposureTime)}`;
              } else {
                exposure = `${exif.ExposureTime}s`;
              }
            }
            const iso = exif.ISO ? `ISO ${exif.ISO}` : "";
            const specs = [fNumber, exposure, iso].filter(Boolean).join(" · ");
            specsSpan.textContent = specs || "No EXIF Record";
          } else {
            specsSpan.textContent = "No EXIF Record";
          }
        })
        .catch(() => {
          specsSpan.textContent = "No EXIF Record";
        });
    } else {
      specsSpan.textContent = "EXIF Engine Offline";
    }
  });
}

/* ─── Music: Lyrics Convergence ─── */
async function initMusic() {
  if (!panels.music) return;
  const stage = panels.music.querySelector(".lyrics-stage");

  if (!interestsDataCache) {
    try {
      const res = await fetch("./data/interests.json");
      interestsDataCache = await res.json();
    } catch (e) {
      console.warn("Failed to load interests data:", e);
      return;
    }
  }

  stage.innerHTML = "";

  const songs = interestsDataCache.music?.songs;
  if (!songs || songs.length === 0) return;

  // 随机挑选一首，且避免连续两次完全相同
  let randomIndex = Math.floor(Math.random() * songs.length);
  if (songs.length > 1 && randomIndex === currentSongIndex) {
    randomIndex = (randomIndex + 1) % songs.length;
  }
  currentSongIndex = randomIndex;
  const song = songs[currentSongIndex];

  const lyrics = song.lyrics;
  if (!lyrics || lyrics.length === 0) return;

  const titleEl = document.createElement("div");
  titleEl.className = "song-title";
  titleEl.textContent = `♪ ${song.title}`;
  stage.appendChild(titleEl);
  setTimeout(() => titleEl.classList.add("show"), 100);

  const startPositions = [
    { left: "-40%", top: "15%" },
    { left: "115%", top: "28%" },
    { left: "15%",  top: "-25%" },
    { left: "75%",  top: "125%" },
    { left: "-35%", top: "65%" },
    { left: "120%", top: "55%" },
    { left: "35%",  top: "-35%" },
    { left: "85%",  top: "130%" }
  ];

  lyrics.forEach((line, i) => {
    const el = document.createElement("div");
    el.className = "lyric-line";
    el.textContent = line;

    const start = startPositions[i % startPositions.length];
    el.style.left = start.left;
    el.style.top = start.top;

    stage.appendChild(el);

    // 动态间距调整：若歌词很多，则缩小单行高度
    const spacing = lyrics.length > 6 ? 10 : 13;
    const totalHeight = (lyrics.length - 1) * spacing;
    // 确保歌词即使再多，起始位置也不高于 20%，避免冲撞标题
    const startPoint = Math.max(15, 50 - totalHeight / 2);
    const targetTop = startPoint + i * spacing;

    setTimeout(() => {
      el.style.left = "50%";
      el.style.top = `${targetTop}%`;
      el.style.transform = "translate(-50%, -50%)";
      el.classList.add("converge");
    }, 300 + i * 200);
  });
}

/* ─── Finance: K-Line Chart (2s) ─── */
function initFinance() {
  if (!panels.finance) return;
  const canvas = panels.finance.querySelector(".kline-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = rect.height;

  if (klineAnimId) cancelAnimationFrame(klineAnimId);

  const barCount = 40;
  const barWidth = (W * 0.8) / barCount;
  const startX = W * 0.1;
  let price = 100 + Math.random() * 50;
  const bars = [];

  for (let i = 0; i < barCount; i++) {
    const open = price;
    const change = (Math.random() - 0.48) * 8;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 4;
    const low = Math.min(open, close) - Math.random() * 4;
    bars.push({ open, close, high, low });
    price = close;
  }

  const allPrices = bars.flatMap(b => [b.high, b.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const toY = (p) => H * 0.1 + (1 - (p - minPrice) / priceRange) * H * 0.8;

  const DURATION = 500;
  const animStart = performance.now();

  const drawFrame = (now) => {
    const elapsed = now - animStart;
    const progress = Math.min(elapsed / DURATION, 1);
    const visibleBars = Math.floor(progress * barCount);

    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(35, 57, 66, 0.06)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const gy = H * 0.1 + (H * 0.8 / 4) * i;
      ctx.beginPath();
      ctx.moveTo(startX, gy);
      ctx.lineTo(W - startX + barWidth, gy);
      ctx.stroke();

      const priceLabel = (minPrice + (priceRange / 4) * (4 - i)).toFixed(1);
      ctx.fillStyle = "rgba(35, 57, 66, 0.3)";
      ctx.font = "10px Consolas, monospace";
      ctx.textAlign = "right";
      ctx.fillText(priceLabel, startX - 6, gy + 3);
    }

    for (let i = 0; i < visibleBars; i++) {
      const bar = bars[i];
      const x = startX + i * barWidth + barWidth * 0.2;
      const w = barWidth * 0.6;
      const isUp = bar.close >= bar.open;
      const color = isUp ? "rgba(0, 164, 123, 0.85)" : "rgba(220, 53, 69, 0.85)";

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, toY(bar.high));
      ctx.lineTo(x + w / 2, toY(bar.low));
      ctx.stroke();

      ctx.fillStyle = color;
      const bodyTop = toY(Math.max(bar.open, bar.close));
      const bodyBot = toY(Math.min(bar.open, bar.close));
      const bodyH = Math.max(bodyBot - bodyTop, 1);
      ctx.fillRect(x, bodyTop, w, bodyH);
    }

    if (visibleBars >= 5) {
      ctx.strokeStyle = "rgba(95, 149, 162, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const maWindow = 5;
      for (let i = maWindow - 1; i < visibleBars; i++) {
        let sum = 0;
        for (let j = i - maWindow + 1; j <= i; j++) {
          sum += (bars[j].open + bars[j].close) / 2;
        }
        const avg = sum / maWindow;
        const mx = startX + i * barWidth + barWidth * 0.5;
        const my = toY(avg);
        if (i === maWindow - 1) ctx.moveTo(mx, my);
        else ctx.lineTo(mx, my);
      }
      ctx.stroke();
    }

    if (progress < 1) {
      klineAnimId = requestAnimationFrame(drawFrame);
    }
  };

  klineAnimId = requestAnimationFrame(drawFrame);
}

/* ─── Setup Interests Interactions ─── */
function setupInterestsInteractions() {
  let hoverTimeout = null;

  // 悬浮卡片满1秒或直接点击，才打开浮层
  interestsNodes.forEach((node) => {
    const handleOpen = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      const mode = node.getAttribute("data-interest-node") || "travel";
      openOverlay(mode);
    };

    node.addEventListener("mouseenter", () => {
      // 避免重复设置
      if (hoverTimeout) clearTimeout(hoverTimeout); 
      hoverTimeout = setTimeout(handleOpen, 1000);
    });

    node.addEventListener("mouseleave", () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
    });

    node.addEventListener("click", handleOpen);
  });


  // 点击外部空白区域也可关闭
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      // 若点击真正的交互内容（比如相册），不关闭
      if (e.target.closest('.photo-album')) {
        return;
      }
      // 其他空白区域、SVG、Canvas 或背景本身，则关闭
      closeOverlay();
    });
  }

  // ESC 关闭
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && overlay.classList.contains("open")) {
      closeOverlay();
    }
  });
}

/* ─── Dynamic Data Loaders ─── */
async function loadProfileData() {
  try {
    const res = await fetch("./data/profile.json");
    const data = await res.json();
    if (data.hero) {
      document.getElementById("hero-title").textContent = data.hero.name;
      const heroIntro = document.getElementById("hero-intro");
      
      // render nickname if exists
      if (data.hero.nickname) {
        const nicknameEl = document.createElement("p");
        nicknameEl.className = "hero-nickname";
        nicknameEl.textContent = "or you can call me " + data.hero.nickname;
        nicknameEl.style.fontFamily = '"Consolas", "Courier New", monospace';
        nicknameEl.style.color = 'rgba(95, 149, 162, 0.9)';
        nicknameEl.style.fontSize = '0.9rem';
        nicknameEl.style.margin = '-0.5rem 0 0.8rem 0';
        nicknameEl.style.fontWeight = '600';
        heroIntro.parentNode.insertBefore(nicknameEl, heroIntro);
      }
      heroIntro.textContent = data.hero.intro;
    }
    if (data.about) {
      const aboutContainer = document.getElementById("about-container");
      data.about.forEach(pText => {
        const p = document.createElement("p");
        p.textContent = pText;
        aboutContainer.appendChild(p);
      });
    }
    if (data.footer) {
      document.getElementById("footer-name").textContent = data.footer.name;
    }
  } catch (e) {
    console.warn("Error loading profile:", e);
  }
}

async function loadProjectsData() {
  try {
    const res = await fetch("./data/projects.json");
    const data = await res.json();
    const container = document.getElementById("projects-container");
    data.projects.forEach(proj => {
      const art = document.createElement("article");
      art.className = "project-entry";
      art.setAttribute("data-viewfinder", "");
      art.innerHTML = `
        <p class="entry-tag">${proj.tag}</p>
        <h3>${proj.title}</h3>
        <p>${proj.description}</p>
        <a href="${proj.linkHref}">${proj.linkText}</a>
      `;
      container.appendChild(art);
    });
  } catch (e) {
    console.warn("Error loading projects:", e);
  }
}

async function loadExperienceData() {
  try {
    const res = await fetch("./data/experience.json");
    const data = await res.json();
    const container = document.getElementById("experience-container");
    data.experience.forEach(exp => {
      const li = document.createElement("li");
      li.className = "exp-item";
      
      const wrapper = document.createElement("div");
      wrapper.className = "exp-wrapper";
      wrapper.setAttribute("data-viewfinder", "");
      
      wrapper.innerHTML = `
        <div class="exp-header">
          <h3 class="exp-role">${exp.role}</h3>
          <span class="exp-company">${exp.company}</span>
        </div>
        <div class="exp-details">
          <span class="exp-period">${exp.period}</span>
          <p class="exp-desc">${exp.description}</p>
        </div>
      `;
      li.appendChild(wrapper);
      container.appendChild(li);
    });
  } catch (e) {
    console.warn("Error loading experience:", e);
  }
}

async function loadContactData() {
  try {
    const res = await fetch("./data/contact.json");
    const data = await res.json();
    
    const descElement = document.getElementById("contact-desc");
    if (descElement && data.description) {
      descElement.textContent = data.description;
    }

    const container = document.getElementById("contact-container");
    data.contact.forEach(btn => {
      const a = document.createElement("a");
      a.className = btn.primary ? "btn btn-primary" : "btn btn-secondary";
      a.href = btn.href;
      if (btn.icon) {
        a.innerHTML = `<span>${btn.text}</span>${btn.icon}`;
      } else {
        a.textContent = btn.text;
      }
      if (btn.blank) {
        a.target = "_blank";
        a.rel = "noreferrer";
      }
      container.appendChild(a);
    });
  } catch (e) {
    console.warn("Error loading contact:", e);
  }
}

async function loadFriendsData() {
  try {
    const res = await fetch("./data/friends.json");
    const data = await res.json();
    const container = document.getElementById("friends-container");
    if (!container) return;

    data.friends.forEach(friend => {
      const a = document.createElement("a");
      a.className = "friend-card";
      a.href = friend.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("data-viewfinder", "");

      const isImg = friend.avatar && (friend.avatar.startsWith('http') || friend.avatar.startsWith('./') || friend.avatar.includes('/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(friend.avatar));
      const avatarContent = isImg 
        ? `<img src="${friend.avatar}" alt="${friend.name}" class="friend-avatar-img">` 
        : `<span>${friend.avatar || friend.name[0]}</span>`;

      a.innerHTML = `
        <div class="friend-header">
          <div class="friend-avatar">${avatarContent}</div>
          <h3>${friend.name}</h3>
        </div>
        <div class="friend-info">
          <p>${friend.description}</p>
        </div>
        <svg class="friend-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 17L17 7M17 7H7M17 7V17"/>
        </svg>
      `;
      container.appendChild(a);
    });
  } catch (e) {
    console.warn("Error loading friends:", e);
  }
}

async function initSite() {
  await Promise.all([
    loadProfileData(),
    loadProjectsData(),
    loadExperienceData(),
    loadContactData(),
    loadFriendsData()
  ]);

  // DOM content is now populated, initialize all interactions
  setupRevealSystem();
  setupHeroParallax();
  setupAutonomousCursor();
  setupTextScan();
  setupCommandNavigation();
  setupInterestsInteractions();
}

initSite();
