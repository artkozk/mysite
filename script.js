import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const themeMap = {
  earth: { bodyClass: "theme-earth", label: "Система Земли" },
  neon: { bodyClass: "theme-neon", label: "Бирюзовая система" },
  ember: { bodyClass: "theme-ember", label: "Янтарная система" }
};

let currentTheme = "earth";

function applyTheme(themeKey) {
  if (!themeMap[themeKey]) {
    return;
  }
  currentTheme = themeKey;
  document.body.classList.remove("theme-earth", "theme-neon", "theme-ember");
  document.body.classList.add(themeMap[themeKey].bodyClass);
  const statusNode = document.querySelector("#planet-status");
  if (statusNode) {
    statusNode.textContent = `Активный мир: ${themeMap[themeKey].label}`;
  }
}

function initReveal() {
  const nodes = [...document.querySelectorAll(".reveal")];
  if (nodes.length === 0) {
    return;
  }
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((node) => observer.observe(node));
}

function initTypeOnView() {
  if (prefersReducedMotion) {
    return;
  }
  const nodes = [...document.querySelectorAll("[data-type-text]")];
  if (nodes.length === 0) {
    return;
  }

  const typeNode = (node) => {
    if (node.dataset.typed === "1") {
      return;
    }
    const text = node.dataset.typeText || node.textContent || "";
    node.dataset.typed = "1";
    node.textContent = "";
    node.classList.add("is-typing");
    let i = 0;
    const step = () => {
      i += 1;
      node.textContent = text.slice(0, i);
      if (i < text.length) {
        setTimeout(step, 18);
      } else {
        node.classList.remove("is-typing");
      }
    };
    step();
  };

  if (!("IntersectionObserver" in window)) {
    nodes.forEach(typeNode);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        typeNode(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.45, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

function initProjectShowcase() {
  const titleNode = document.querySelector("#project-focus-title");
  const summaryNode = document.querySelector("#project-focus-summary");
  const pointsNode = document.querySelector("#project-focus-points");
  const impactNode = document.querySelector("#project-focus-impact");
  const chipNodes = [...document.querySelectorAll(".project-chip")];
  if (!titleNode || !summaryNode || !pointsNode || !impactNode || chipNodes.length === 0) {
    return;
  }

  const projects = {
    grantflow: {
      title: "Разработал площадку для молодёжных проектов при грантовой поддержке",
      summary:
        "Проект дал молодым командам понятный вход в реализацию: от идеи и подбора участников до обратной связи экспертов и перехода в рабочий продукт.",
      points: [
        "Снизил порог входа: не нужно искать менторов и команду по разным площадкам.",
        "Собрал единый контур для движения инициатив к грантовой поддержке и практическому запуску.",
        "Помог молодым авторам быстрее превращать замысел в проект с реальной ценностью для людей."
      ],
      impact:
        "Польза: молодёжные инициативы получают не только идею, а рабочий путь к результату и развитию через грантовую экосистему."
    },
    mentorops: {
      title: "MentorOps — управляемая система работы менторов и команды",
      summary:
        "Оркестрация задач, ревью и синхронизации менторского контура, чтобы сложные проекты выходили в релиз без хаоса и потери качества.",
      points: [
        "Выстроил прозрачный ритм работы менторов, ассистентов и разработки.",
        "Сократил потери на ручной координации и повторных согласованиях.",
        "Усилил качество решения за счёт системного ревью в критичных точках."
      ],
      impact: "Польза: бизнес получает предсказуемый delivery и более сильный конечный продукт."
    },
    media: {
      title: "Media Growth Lab — рост продукта через контент и маркетинг",
      summary:
        "Связал продукт, контент и рекламные активности в единую систему: Telegram, Дзен и YouTube работают как контур доверия и роста.",
      points: [
        "Собрал процесс производства контента с чёткой бизнес-целью, а не ради охватов.",
        "Запустил цикл гипотез и экспериментов с аналитикой результата.",
        "Автоматизировал рутину, чтобы команда фокусировалась на ценности."
      ],
      impact: "Польза: устойчивый рост внимания и конверсии вместо разовых всплесков."
    }
  };

  const setProject = (key) => {
    const data = projects[key] || projects.grantflow;
    chipNodes.forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.project === key);
    });
    titleNode.textContent = data.title;
    summaryNode.textContent = data.summary;
    pointsNode.innerHTML = "";
    data.points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      pointsNode.appendChild(li);
    });
    impactNode.textContent = data.impact;
  };

  chipNodes.forEach((chip) => {
    chip.addEventListener("click", () => {
      setProject(chip.dataset.project || "grantflow");
    });
  });

  setProject("grantflow");
}

function initCodeTyping() {
  const codeNode = document.querySelector("#live-code");
  if (!codeNode) {
    return;
  }

  const snippets = [
    [
      "$ discovery.run --case=grantflow",
      "$ role-map.build --experts --authors --team",
      "$ product.scope --value=high --risk=controlled"
    ],
    [
      "$ architecture.review --mentor-loop=enabled",
      "$ delivery.sync --team=core --priority=business",
      "$ release.prepare --quality=production-ready"
    ],
    [
      "$ growth.system --content --marketing --automation",
      "$ ai.assist --mode=review-first",
      "$ report.publish --impact --next-steps"
    ]
  ];

  let snippetIndex = 0;
  let charIndex = 0;
  let mode = "typing";
  let started = false;

  const tick = () => {
    const text = snippets[snippetIndex].join("\n");
    if (mode === "typing") {
      charIndex += 2;
      codeNode.textContent = text.slice(0, charIndex);
      if (charIndex >= text.length) {
        mode = "pause";
      }
      setTimeout(tick, 18);
      return;
    }
    if (mode === "pause") {
      mode = "erase";
      setTimeout(tick, 780);
      return;
    }
    charIndex -= 4;
    codeNode.textContent = text.slice(0, Math.max(0, charIndex));
    if (charIndex <= 0) {
      mode = "typing";
      snippetIndex = (snippetIndex + 1) % snippets.length;
    }
    setTimeout(tick, 16);
  };

  const start = () => {
    if (started) {
      return;
    }
    started = true;
    codeNode.textContent = "";
    tick();
  };

  if (!("IntersectionObserver" in window)) {
    start();
    return;
  }

  const section = codeNode.closest(".panel");
  if (!section) {
    start();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        start();
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
  );

  observer.observe(section);
}

function initPointerGlow() {
  const root = document.documentElement;
  let raf = null;
  let x = window.innerWidth * 0.5;
  let y = window.innerHeight * 0.5;

  const draw = () => {
    root.style.setProperty("--mx", `${x}px`);
    root.style.setProperty("--my", `${y}px`);
    raf = null;
  };

  window.addEventListener("pointermove", (event) => {
    x = event.clientX;
    y = event.clientY;
    if (!raf) {
      raf = requestAnimationFrame(draw);
    }
  });
}

function initMentorOrbit() {
  const field = document.querySelector("#orbit-field");
  const nodes = [...document.querySelectorAll(".orbit-node")];
  const titleNode = document.querySelector("#mentor-focus-title");
  const copyNode = document.querySelector("#mentor-focus-copy");

  if (!field || nodes.length === 0) {
    return;
  }

  const states = nodes.map((node) => ({
    node,
    title: node.dataset.title || "",
    copy: node.dataset.copy || "",
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    dragging: false,
    moved: false,
    pointerId: null,
    holdUntil: 0,
    startX: 0,
    startY: 0
  }));

  let selected = states[0];
  let rect = field.getBoundingClientRect();

  const nodeRadius = () => (rect.width < 430 ? 42 : 51);

  const resize = () => {
    rect = field.getBoundingClientRect();
  };

  const clamp = (x, y) => {
    const max = Math.min(rect.width, rect.height) * 0.5 - nodeRadius() - 4;
    const dist = Math.hypot(x, y);
    if (dist <= max) {
      return { x, y };
    }
    const k = max / Math.max(dist, 1e-6);
    return { x: x * k, y: y * k };
  };

  const setActive = (state) => {
    selected = state;
    states.forEach((item) => {
      item.node.classList.toggle("is-active", item === state);
      if (item !== state) {
        item.holdUntil = performance.now() + 600;
      }
    });
    if (titleNode) {
      titleNode.textContent = `Фокус: ${state.title}`;
    }
    if (copyNode) {
      copyNode.textContent = state.copy;
    }
  };

  const recalcTargets = () => {
    const outer = states.filter((state) => state !== selected);
    const ring = Math.min(rect.width, rect.height) * 0.36;
    outer.forEach((state, index) => {
      const angle = -Math.PI / 2 + (index / Math.max(outer.length, 1)) * Math.PI * 2;
      state.tx = Math.cos(angle) * ring;
      state.ty = Math.sin(angle) * ring;
    });
    selected.tx = 0;
    selected.ty = 0;
  };

  const applyCollisions = (active) => {
    const now = performance.now();
    const minDist = nodeRadius() * 1.9;
    states.forEach((other) => {
      if (other === active) {
        return;
      }
      const dx = other.x - active.x;
      const dy = other.y - active.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= minDist) {
        return;
      }
      const nx = dx / Math.max(dist, 0.001);
      const ny = dy / Math.max(dist, 0.001);
      const overlap = minDist - dist;
      other.x += nx * overlap * 0.62;
      other.y += ny * overlap * 0.62;
      other.vx += nx * (0.7 + overlap * 0.05);
      other.vy += ny * (0.7 + overlap * 0.05);
      other.holdUntil = now + 5000;
    });
  };

  states.forEach((state) => {
    state.node.addEventListener("pointerdown", (event) => {
      resize();
      state.dragging = true;
      state.moved = false;
      state.pointerId = event.pointerId;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.vx = 0;
      state.vy = 0;
      state.node.classList.add("is-dragging");
      state.node.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    state.node.addEventListener("pointermove", (event) => {
      if (!state.dragging) {
        return;
      }
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      if (Math.abs(dx) + Math.abs(dy) > 6) {
        state.moved = true;
      }
      const px = event.clientX - rect.left - rect.width / 2;
      const py = event.clientY - rect.top - rect.height / 2;
      const clamped = clamp(px, py);
      state.vx = (clamped.x - state.x) * 0.28;
      state.vy = (clamped.y - state.y) * 0.28;
      state.x = clamped.x;
      state.y = clamped.y;
      applyCollisions(state);
      event.preventDefault();
    });

    const release = () => {
      if (!state.dragging) {
        return;
      }
      state.dragging = false;
      state.node.classList.remove("is-dragging");
      if (state.pointerId !== null && state.node.hasPointerCapture(state.pointerId)) {
        state.node.releasePointerCapture(state.pointerId);
      }
      state.pointerId = null;

      if (!state.moved) {
        setActive(state);
      } else {
        state.holdUntil = performance.now() + 5000;
      }
    };

    state.node.addEventListener("pointerup", release);
    state.node.addEventListener("pointercancel", release);
  });

  setActive(states[0]);
  recalcTargets();

  const loop = () => {
    requestAnimationFrame(loop);
    resize();
    recalcTargets();
    const now = performance.now();

    states.forEach((state) => {
      if (!state.dragging) {
        const toCenter = state === selected;
        const spring = toCenter ? 0.18 : now > state.holdUntil ? 0.1 : 0.02;
        const damping = toCenter ? 0.72 : 0.9;
        state.vx += (state.tx - state.x) * spring;
        state.vy += (state.ty - state.y) * spring;
        state.vx *= damping;
        state.vy *= damping;
        state.x += state.vx;
        state.y += state.vy;
        const clamped = clamp(state.x, state.y);
        state.x = clamped.x;
        state.y = clamped.y;
      }
      state.node.style.setProperty("--x", `${state.x}px`);
      state.node.style.setProperty("--y", `${state.y}px`);
    });
  };

  loop();
  window.addEventListener("resize", resize);
}
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const assetUrls = {
  rocket: "./assets/PrimaryIonDrive.glb",
  earthMap: "./assets/textures/earth_atmos_2048.jpg",
  earthNormal: "./assets/textures/earth_normal_2048.jpg",
  earthSpecular: "./assets/textures/earth_specular_2048.jpg",
  earthClouds: "./assets/textures/earth_clouds_1024.png",
  moonMap: "./assets/textures/moon_1024.jpg",
  neptuneMap: "./assets/textures/2k_neptune.jpg",
  saturnMap: "./assets/textures/2k_saturn.jpg",
  jupiterMap: "./assets/textures/2k_jupiter.jpg"
};

const assets = {
  rocket: null,
  textures: {}
};

function loadTexture(url) {
  return new Promise((resolve) => {
    textureLoader.load(
      url,
      (texture) => resolve(texture),
      undefined,
      () => resolve(null)
    );
  });
}

function loadRocket(url) {
  return new Promise((resolve) => {
    gltfLoader.load(
      url,
      (gltf) => resolve(gltf),
      undefined,
      () => resolve(null)
    );
  });
}

const preloaderNode = document.querySelector("#preloader");
const preloaderStatusNode = document.querySelector("#preloader-status");
const preloaderFillNode = document.querySelector("#preloader-meter-fill");
const preloaderCanvas = document.querySelector("#preloader-canvas");

const loadMessages = [
  "Открываю стартовый коридор...",
  "Поднимаю космическую сцену...",
  "Калибрую планетарные системы...",
  "Синхронизирую визуальные контуры...",
  "Финишная подготовка..."
];

function initPreloaderScene() {
  if (!preloaderCanvas) {
    return () => {};
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0.05, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas: preloaderCanvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambient = new THREE.AmbientLight(0x7da0d8, 0.8);
  const key = new THREE.DirectionalLight(0xffffff, 1.18);
  key.position.set(4.5, 2.2, 5);
  scene.add(ambient, key);

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 1200;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 120;
    positions[i3 + 1] = (Math.random() - 0.5) * 70;
    positions[i3 + 2] = (Math.random() - 0.5) * 100;
  }
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({
      color: 0xa8d1ff,
      size: 0.1,
      transparent: true,
      opacity: 0.62
    })
  );
  scene.add(stars);

  const placeholder = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 1.3, 16),
    new THREE.MeshStandardMaterial({
      color: 0x89bbff,
      roughness: 0.4,
      metalness: 0.38
    })
  );
  placeholder.rotation.z = Math.PI * 0.5;
  scene.add(placeholder);

  let rocketScene = null;
  if (assets.rocket?.scene) {
    rocketScene = assets.rocket.scene.clone(true);
    rocketScene.scale.setScalar(0.48);
    rocketScene.rotation.set(0.12, Math.PI * 0.5, -0.18);
    scene.add(rocketScene);
    scene.remove(placeholder);
  }

  const actor = () => rocketScene || placeholder;
  const clock = new THREE.Clock();
  let stopped = false;

  const animate = () => {
    if (stopped) {
      return;
    }
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    stars.rotation.y = elapsed * 0.03;

    const ship = actor();
    if (ship) {
      const t = (elapsed % 2.4) / 2.4;
      ship.position.x = -6 + t * 12;
      ship.position.y = -0.08 + Math.sin(elapsed * 3.2) * 0.1;
      ship.position.z = 1.8 - t * 4.6;
      ship.rotation.y = Math.PI * 0.5 + t * 0.2;
      ship.rotation.z = -0.18 + t * 0.26;
    }

    renderer.render(scene, camera);
  };

  animate();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);

  return () => {
    stopped = true;
    window.removeEventListener("resize", onResize);
    renderer.dispose();
  };
}

let preloaderHidden = false;
function hidePreloader() {
  if (preloaderHidden) {
    return;
  }
  preloaderHidden = true;
  document.body.classList.remove("show-preloader");
  if (preloaderNode) {
    preloaderNode.classList.add("is-hidden");
  }
}

function setPreloaderProgress(done, total) {
  const ratio = total > 0 ? done / total : 1;
  const progress = Math.max(12, Math.min(100, Math.round(ratio * 100)));
  if (preloaderFillNode) {
    preloaderFillNode.style.width = `${progress}%`;
  }
  if (preloaderStatusNode) {
    const index = Math.min(loadMessages.length - 1, Math.floor(ratio * loadMessages.length));
    preloaderStatusNode.textContent = loadMessages[index] || loadMessages[loadMessages.length - 1];
  }
}

function triggerFlightOverlay(themeKey) {
  const overlay = document.querySelector("#flight-overlay");
  if (!overlay) {
    return;
  }
  const status = document.querySelector("#flight-status");
  if (status && themeMap[themeKey]) {
    status.textContent = `Гиперпереход: ${themeMap[themeKey].label}`;
  }
  overlay.classList.remove("is-active");
  void overlay.offsetWidth;
  overlay.classList.add("is-active");
  const timeout = prefersReducedMotion ? 420 : 980;
  window.setTimeout(() => {
    overlay.classList.remove("is-active");
  }, timeout);
}

function initWorldScene() {
  const canvas = document.querySelector("#earth-canvas");
  if (!canvas) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, window.innerWidth / window.innerHeight, 0.1, 260);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambient = new THREE.AmbientLight(0x6f9ad1, 0.72);
  const key = new THREE.DirectionalLight(0xffffff, 1.16);
  key.position.set(5.8, 3.2, 4.6);
  const rim = new THREE.DirectionalLight(0x79bfff, 0.48);
  rim.position.set(-5.4, -1.5, -4.6);
  scene.add(ambient, key, rim);

  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 1700;
  const starPositions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount; i += 1) {
    const i3 = i * 3;
    starPositions[i3] = (Math.random() - 0.5) * 190;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 130;
    starPositions[i3 + 2] = (Math.random() - 0.5) * 170;
  }
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({
      color: 0xaed3ff,
      size: 0.11,
      transparent: true,
      opacity: 0.56
    })
  );
  scene.add(stars);

  const root = new THREE.Group();
  scene.add(root);

  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x4f84d7,
    shininess: 26,
    specular: new THREE.Color(0x2f4f85)
  });
  if (assets.textures.earthMap) {
    assets.textures.earthMap.colorSpace = THREE.SRGBColorSpace;
    earthMat.map = assets.textures.earthMap;
  }
  if (assets.textures.earthNormal) {
    earthMat.normalMap = assets.textures.earthNormal;
    earthMat.normalScale = new THREE.Vector2(0.95, 0.95);
  }
  if (assets.textures.earthSpecular) {
    earthMat.specularMap = assets.textures.earthSpecular;
  }

  const earthAnchor = new THREE.Group();
  root.add(earthAnchor);

  const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(1.95, 120, 120), earthMat);
  earthAnchor.add(earthMesh);

  const cloudMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.01, 100, 100),
    new THREE.MeshPhongMaterial({
      map: assets.textures.earthClouds || null,
      transparent: true,
      opacity: assets.textures.earthClouds ? 0.36 : 0,
      depthWrite: false
    })
  );
  earthAnchor.add(cloudMesh);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.18, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x7ab9ff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    })
  );
  earthAnchor.add(atmosphere);

  const earthHit = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 24, 24),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
  );
  earthHit.userData.themeKey = "earth";
  earthAnchor.add(earthHit);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 32, 32),
    new THREE.MeshStandardMaterial({
      map: assets.textures.moonMap || null,
      color: 0xa5b8cb,
      roughness: 0.9,
      metalness: 0.04
    })
  );
  moon.position.set(3.05, 0.42, -0.55);
  root.add(moon);
  const createPlanet = ({ radius, map, color, roughness, metalness }) => {
    if (map) {
      map.colorSpace = THREE.SRGBColorSpace;
    }
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, 80, 80),
      new THREE.MeshStandardMaterial({
        map: map || null,
        color,
        roughness,
        metalness
      })
    );
  };

  const neonAnchor = new THREE.Group();
  const neonMesh = createPlanet({
    radius: 0.82,
    map: assets.textures.neptuneMap || assets.textures.jupiterMap,
    color: 0x6fc8ff,
    roughness: 0.74,
    metalness: 0.06
  });
  neonAnchor.add(neonMesh);
  const neonHit = new THREE.Mesh(
    new THREE.SphereGeometry(1.16, 24, 24),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
  );
  neonHit.userData.themeKey = "neon";
  neonAnchor.add(neonHit);

  const emberAnchor = new THREE.Group();
  const emberMesh = createPlanet({
    radius: 0.9,
    map: assets.textures.saturnMap || assets.textures.jupiterMap,
    color: 0xffbb84,
    roughness: 0.68,
    metalness: 0.1
  });
  emberAnchor.add(emberMesh);
  const emberHit = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 24, 24),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
  );
  emberHit.userData.themeKey = "ember";
  emberAnchor.add(emberHit);

  root.add(neonAnchor, emberAnchor);

  const rings = [];
  for (let i = 0; i < 18; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(4.8 + i * 0.075, 0.004, 8, 220),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x6ca6f1 : 0x7fc9ff,
        transparent: true,
        opacity: i % 3 === 0 ? 0.1 : 0.05,
        depthWrite: false
      })
    );
    ring.rotation.x = Math.PI / 2.05;
    ring.rotation.y = 0.06;
    root.add(ring);
    rings.push(ring);
  }

  const asteroids = [];
  const asteroidCount = 34;
  const asteroidGeometry = new THREE.IcosahedronGeometry(0.08, 0);
  for (let i = 0; i < asteroidCount; i += 1) {
    const mesh = new THREE.Mesh(
      asteroidGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x8ea6c1,
        roughness: 0.78,
        metalness: 0.04,
        transparent: true,
        opacity: 0.6
      })
    );
    mesh.position.set(
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 8,
      -4 + Math.random() * 10
    );
    mesh.userData.spin = (Math.random() - 0.5) * 0.7;
    scene.add(mesh);
    asteroids.push(mesh);
  }

  const systems = {
    earth: { key: "earth", anchor: earthAnchor, mesh: earthMesh, angle: 0, speed: 0, radius: 0, yAmp: 0, baseY: 0, scale: 1 },
    neon: { key: "neon", anchor: neonAnchor, mesh: neonMesh, angle: 2.12, speed: 0.14, radius: 6, yAmp: 0.44, baseY: 0.72, scale: 0.86 },
    ember: { key: "ember", anchor: emberAnchor, mesh: emberMesh, angle: 5.18, speed: 0.09, radius: 7.15, yAmp: 0.5, baseY: -0.58, scale: 0.88 }
  };

  const flight = {
    active: false,
    start: 0,
    duration: prefersReducedMotion ? 680 : 1550,
    from: "earth",
    to: "earth"
  };

  const interaction = {
    dragging: false,
    pointerId: null,
    moved: false,
    lastX: 0,
    lastY: 0,
    rotateX: 0.06,
    rotateY: 0,
    autoYaw: 0,
    lastUserInputAt: performance.now()
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let cameraLook = new THREE.Vector3(0, 0, 0);
  let cameraPos = new THREE.Vector3(0, 0.18, 7.2);
  camera.position.copy(cameraPos);
  camera.lookAt(cameraLook);

  const getPlanetPosition = (key) => {
    const anchor = systems[key]?.anchor;
    if (!anchor) {
      return new THREE.Vector3();
    }
    const out = new THREE.Vector3();
    anchor.getWorldPosition(out);
    return out;
  };

  const switchTheme = (key) => {
    if (!themeMap[key] || key === currentTheme) {
      return;
    }
    flight.active = true;
    flight.start = performance.now();
    flight.from = currentTheme;
    flight.to = key;
    triggerFlightOverlay(key);
  };

  const updateOrbits = (delta, orbitEnabled) => {
    [systems.neon, systems.ember].forEach((planet) => {
      if (orbitEnabled) {
        planet.angle += delta * planet.speed;
      }
      const x = Math.cos(planet.angle) * planet.radius;
      const z = Math.sin(planet.angle) * planet.radius * 0.86;
      const y = planet.baseY + Math.sin(planet.angle * 0.76) * planet.yAmp;
      planet.anchor.position.set(x, y, z);
    });

    moon.position.x = Math.cos(performance.now() * 0.00018) * 3.05;
    moon.position.z = Math.sin(performance.now() * 0.00018) * 2.2;
    moon.position.y = 0.35 + Math.sin(performance.now() * 0.00011) * 0.22;
  };

  const pointerToNdc = (event) => {
    const canvasRect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    pointer.y = -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
  };

  canvas.addEventListener("pointerdown", (event) => {
    interaction.dragging = true;
    interaction.pointerId = event.pointerId;
    interaction.moved = false;
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
    interaction.lastUserInputAt = performance.now();
    canvas.setPointerCapture(event.pointerId);
    document.body.classList.add("earth-dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!interaction.dragging) {
      return;
    }
    const dx = event.clientX - interaction.lastX;
    const dy = event.clientY - interaction.lastY;
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;

    if (Math.abs(dx) + Math.abs(dy) > 1.2) {
      interaction.moved = true;
    }

    interaction.rotateY += dx * 0.0042;
    interaction.rotateX += dy * 0.0026;
    interaction.rotateX = THREE.MathUtils.clamp(interaction.rotateX, -0.38, 0.38);
    interaction.lastUserInputAt = performance.now();
  });

  const releaseDrag = (event) => {
    if (!interaction.dragging) {
      return;
    }
    const wasMoved = interaction.moved;
    interaction.dragging = false;
    interaction.lastUserInputAt = performance.now();
    document.body.classList.remove("earth-dragging");

    if (interaction.pointerId !== null && canvas.hasPointerCapture(interaction.pointerId)) {
      canvas.releasePointerCapture(interaction.pointerId);
    }
    interaction.pointerId = null;

    if (wasMoved) {
      return;
    }

    pointerToNdc(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([earthHit, neonHit, emberHit, earthMesh, neonMesh, emberMesh], false);
    if (hits.length === 0) {
      return;
    }

    const target = hits.find((hit) => hit.object.userData.themeKey) || hits[0];
    const key = target.object.userData.themeKey || target.object.parent?.userData?.themeKey;
    if (typeof key === "string") {
      switchTheme(key);
    }
  };

  canvas.addEventListener("pointerup", releaseDrag);
  canvas.addEventListener("pointercancel", releaseDrag);

  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    const now = performance.now();

    const orbitEnabled = !interaction.dragging && now - interaction.lastUserInputAt > 5000;

    if (orbitEnabled && !flight.active) {
      interaction.autoYaw += delta * 0.06;
      interaction.rotateY = THREE.MathUtils.lerp(interaction.rotateY, interaction.autoYaw, 0.015);
      interaction.rotateX = THREE.MathUtils.lerp(interaction.rotateX, 0.06, 0.012);
    }

    updateOrbits(delta, orbitEnabled);

    earthMesh.rotation.y += delta * 0.12;
    if (cloudMesh) {
      cloudMesh.rotation.y += delta * 0.16;
    }
    stars.rotation.y += delta * 0.01;

    rings.forEach((ring, index) => {
      ring.rotation.z += delta * (0.015 + index * 0.00015);
      ring.material.opacity = 0.04 + Math.sin(now * 0.00045 + index * 0.2) * 0.01;
    });

    asteroids.forEach((asteroid, index) => {
      asteroid.rotation.x += delta * asteroid.userData.spin;
      asteroid.rotation.y += delta * asteroid.userData.spin * 0.7;
      asteroid.position.x += Math.sin(now * 0.00028 + index * 0.6) * 0.0012;
      asteroid.position.y += Math.cos(now * 0.00023 + index * 0.4) * 0.0009;
    });

    root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, interaction.rotateX, 0.1);
    root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, interaction.rotateY, 0.1);

    let focusTheme = currentTheme;
    let transitionWarp = 0;

    if (flight.active) {
      const progress = THREE.MathUtils.clamp((now - flight.start) / flight.duration, 0, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      transitionWarp = Math.sin(progress * Math.PI);

      if (progress >= 1) {
        flight.active = false;
        applyTheme(flight.to);
        focusTheme = currentTheme;
      } else {
        focusTheme = eased < 0.5 ? flight.from : flight.to;
      }
    }

    const activeSystem = systems[focusTheme] || systems.earth;
    const lookTarget = getPlanetPosition(activeSystem.key);

    const desiredDistance = activeSystem.key === "earth" ? 7.2 : 5.9;
    const desiredY = activeSystem.key === "earth" ? 0.2 : 0.28;

    const desiredPos = new THREE.Vector3(
      lookTarget.x,
      lookTarget.y + desiredY,
      lookTarget.z + desiredDistance - transitionWarp * 0.8
    );

    cameraPos.lerp(desiredPos, flight.active ? 0.11 : 0.06);
    cameraLook.lerp(lookTarget, flight.active ? 0.11 : 0.07);

    camera.position.copy(cameraPos);
    camera.fov = THREE.MathUtils.lerp(camera.fov, 43 + transitionWarp * 10, 0.12);
    camera.updateProjectionMatrix();
    camera.lookAt(cameraLook);

    [systems.earth, systems.neon, systems.ember].forEach((planet) => {
      const targetScale = planet.key === activeSystem.key ? (planet.key === "earth" ? 1 : 1.08) : 0.88;
      planet.scale = THREE.MathUtils.lerp(planet.scale, targetScale, 0.08);
      planet.anchor.scale.setScalar(planet.scale);
    });

    renderer.render(scene, camera);
  };

  animate();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);
}

async function boot() {
  initReveal();
  initTypeOnView();
  initProjectShowcase();
  initCodeTyping();
  initPointerGlow();
  initMentorOrbit();
  applyTheme("earth");

  const tracked = [];
  let done = 0;

  const track = (promise) => {
    tracked.push(
      promise.finally(() => {
        done += 1;
        setPreloaderProgress(done, tracked.length);
      })
    );
    return promise;
  };

  const tasks = [
    ["earthMap", loadTexture(assetUrls.earthMap)],
    ["earthNormal", loadTexture(assetUrls.earthNormal)],
    ["earthSpecular", loadTexture(assetUrls.earthSpecular)],
    ["earthClouds", loadTexture(assetUrls.earthClouds)],
    ["moonMap", loadTexture(assetUrls.moonMap)],
    ["neptuneMap", loadTexture(assetUrls.neptuneMap)],
    ["saturnMap", loadTexture(assetUrls.saturnMap)],
    ["jupiterMap", loadTexture(assetUrls.jupiterMap)],
    ["rocket", loadRocket(assetUrls.rocket)]
  ];

  const minDuration = prefersReducedMotion ? 400 : 1400;
  const maxDuration = 6200;
  const startAt = performance.now();

  tasks.forEach(([key, promise]) => {
    track(
      promise.then((result) => {
        if (key === "rocket") {
          assets.rocket = result;
        } else {
          assets.textures[key] = result;
        }
      })
    );
  });

  const stopPreloaderScene = initPreloaderScene();

  let worldStarted = false;
  const startWorld = () => {
    if (worldStarted) {
      return;
    }
    worldStarted = true;
    initWorldScene();
  };

  const allDone = Promise.allSettled(tracked);

  await Promise.race([
    allDone,
    new Promise((resolve) => window.setTimeout(resolve, maxDuration))
  ]);

  const elapsed = performance.now() - startAt;
  const wait = Math.max(0, minDuration - elapsed);
  if (wait > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, wait));
  }

  if (preloaderStatusNode) {
    preloaderStatusNode.textContent = "Стыковка завершена";
  }
  if (preloaderFillNode) {
    preloaderFillNode.style.width = "100%";
  }

  startWorld();
  hidePreloader();

  window.setTimeout(() => {
    stopPreloaderScene();
  }, 650);

  window.setTimeout(() => {
    if (document.body.classList.contains("show-preloader")) {
      startWorld();
      hidePreloader();
      stopPreloaderScene();
    }
  }, 7000);
}

boot().catch((error) => {
  console.error("Boot failure:", error);
  hidePreloader();
  applyTheme("earth");
  initWorldScene();
});
