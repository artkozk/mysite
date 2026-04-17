import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const isMobileViewport = window.matchMedia("(max-width: 860px)").matches;

document.body.classList.add("show-preloader");

const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const preloaderNode = document.querySelector("#preloader");
const preloaderStatusNode = document.querySelector("#preloader-status");
const preloaderMeterFillNode = document.querySelector("#preloader-meter-fill");
const preloaderCanvas = document.querySelector("#preloader-canvas");
const earthCanvas = document.querySelector("#earth-canvas");

const themeMap = {
  earth: {
    bodyClass: "theme-earth",
    accent: 0x66abff,
    label: "Earth Core"
  },
  neon: {
    bodyClass: "theme-neon",
    accent: 0x66ffe8,
    label: "Neon Drift"
  },
  ember: {
    bodyClass: "theme-ember",
    accent: 0xffb06a,
    label: "Ember Forge"
  }
};

let currentTheme = "earth";

function applyTheme(themeKey) {
  if (!themeMap[themeKey]) {
    return;
  }
  currentTheme = themeKey;
  document.body.classList.remove("theme-earth", "theme-neon", "theme-ember");
  document.body.classList.add(themeMap[themeKey].bodyClass);
  const planetStatus = document.querySelector("#planet-status");
  if (planetStatus) {
    planetStatus.textContent = `Текущая система: ${themeMap[themeKey].label}`;
  }
  document.dispatchEvent(
    new CustomEvent("system-theme-change", {
      detail: { themeKey }
    })
  );
}

const revealNodes = [...document.querySelectorAll(".reveal")];
revealNodes.forEach((node) => {
  if (node.dataset.delay) {
    node.style.setProperty("--delay", `${node.dataset.delay}ms`);
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );
  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const urls = {
  rocket:
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/PrimaryIonDrive.glb",
  earthAlbedo:
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg",
  earthNormal:
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_normal_2048.jpg",
  earthSpecular:
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_specular_2048.jpg",
  earthClouds:
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_clouds_1024.png",
  marsAlbedo:
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/mars_1k_color.jpg",
  marsNormal:
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/mars_1k_normal.jpg",
  moonAlbedo:
    "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/moon_1024.jpg"
};

const loadMessages = [
  "Открываю звёздный коридор...",
  "Запускаю экспедицию artkozk...",
  "Собираю космическую сцену...",
  "Проявляю далекие миры...",
  "Калибрую свет и глубину...",
  "Финальная синхронизация...",
  "Сцена готова к погружению..."
];

const loadState = {
  total: 0,
  done: 0
};

const loadingPromises = [];

function trackPromise(promise) {
  loadState.total += 1;
  const wrapped = promise.finally(() => {
    loadState.done += 1;
    const progress = Math.min(100, Math.round((loadState.done / Math.max(loadState.total, 1)) * 100));
    const msgIndex = Math.min(
      loadMessages.length - 1,
      Math.floor((loadState.done / Math.max(loadState.total, 1)) * loadMessages.length)
    );
    if (preloaderStatusNode) {
      preloaderStatusNode.textContent = loadMessages[msgIndex];
    }
    if (preloaderMeterFillNode) {
      preloaderMeterFillNode.style.width = `${Math.max(progress, 12)}%`;
    }
  });
  loadingPromises.push(wrapped);
  return wrapped;
}

function loadGltf(url) {
  return new Promise((resolve) => {
    gltfLoader.load(
      url,
      (gltf) => resolve(gltf),
      undefined,
      () => resolve(null)
    );
  });
}

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

function loadVideo(videoElement) {
  return new Promise((resolve) => {
    if (!videoElement) {
      resolve();
      return;
    }
    if (videoElement.readyState >= 2) {
      resolve();
      return;
    }
    const done = () => resolve();
    videoElement.addEventListener("loadeddata", done, { once: true });
    videoElement.addEventListener("error", done, { once: true });
    videoElement.play().catch(() => {});
  });
}

const assets = {
  rocket: null,
  textures: {
    earthAlbedo: null,
    earthNormal: null,
    earthSpecular: null,
    earthClouds: null,
    marsAlbedo: null,
    marsNormal: null,
    moonAlbedo: null
  }
};

const rocketPromise = trackPromise(loadGltf(urls.rocket)).then((result) => {
  assets.rocket = result;
});
const earthAlbedoPromise = trackPromise(loadTexture(urls.earthAlbedo)).then((texture) => {
  assets.textures.earthAlbedo = texture;
});
const earthNormalPromise = trackPromise(loadTexture(urls.earthNormal)).then((texture) => {
  assets.textures.earthNormal = texture;
});
const earthSpecularPromise = trackPromise(loadTexture(urls.earthSpecular)).then((texture) => {
  assets.textures.earthSpecular = texture;
});
const earthCloudsPromise = trackPromise(loadTexture(urls.earthClouds)).then((texture) => {
  assets.textures.earthClouds = texture;
});
const marsAlbedoPromise = trackPromise(loadTexture(urls.marsAlbedo)).then((texture) => {
  assets.textures.marsAlbedo = texture;
});
const marsNormalPromise = trackPromise(loadTexture(urls.marsNormal)).then((texture) => {
  assets.textures.marsNormal = texture;
});
const moonAlbedoPromise = trackPromise(loadTexture(urls.moonAlbedo)).then((texture) => {
  assets.textures.moonAlbedo = texture;
});

document.querySelectorAll(".video-ribbon video").forEach((video) => {
  trackPromise(loadVideo(video));
});

const preloaderStart = performance.now();
let heavyScenesInitialized = false;
let preloaderFinished = false;

function finishPreloader() {
  if (preloaderFinished) {
    return;
  }
  preloaderFinished = true;
  if (preloaderStatusNode) {
    preloaderStatusNode.textContent = "Стыковка завершена";
  }
  if (preloaderMeterFillNode) {
    preloaderMeterFillNode.style.width = "100%";
  }
  document.body.classList.remove("show-preloader");
  document.body.classList.add("site-live");

  if (preloaderNode && !preloaderNode.classList.contains("is-hidden")) {
    preloaderNode.classList.add("is-exit");
    setTimeout(() => {
      preloaderNode.classList.add("is-hidden");
    }, 940);
  } else if (typeof window.__forceHidePreloader === "function") {
    window.__forceHidePreloader();
  }
  document.body.classList.remove("is-loading");
}

let siteBooted = false;
function bootSite() {
  if (siteBooted) {
    return;
  }
  siteBooted = true;
  initHeavyScenes();
  finishPreloader();
}

Promise.allSettled(loadingPromises).then(() => {
  const elapsed = performance.now() - preloaderStart;
  const wait = Math.max(0, 1800 - elapsed);
  setTimeout(() => {
    bootSite();
  }, wait);
});
setTimeout(() => {
  bootSite();
}, 3000);

function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

function createStarField(scene, count = 900, spread = 120, opacity = 0.55) {
  const densityFactor = isMobileViewport ? 0.55 : 1;
  const pointsCount = Math.max(180, Math.floor(count * densityFactor));
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(pointsCount * 3);
  for (let i = 0; i < pointsCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread;
    positions[i3 + 2] = (Math.random() - 0.5) * spread;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xaed3ff,
      size: 0.09,
      transparent: true,
      opacity
    })
  );
  scene.add(points);
  return points;
}

function createPlanetSurfaceTexture(themeKey) {
  const size = 768;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const baseGradient = ctx.createRadialGradient(
    size * 0.36,
    size * 0.32,
    size * 0.12,
    size * 0.5,
    size * 0.5,
    size * 0.66
  );
  if (themeKey === "ember") {
    baseGradient.addColorStop(0, "#ffca88");
    baseGradient.addColorStop(0.28, "#e38448");
    baseGradient.addColorStop(0.62, "#7d2f2d");
    baseGradient.addColorStop(1, "#30131b");
  } else {
    baseGradient.addColorStop(0, "#aef2ff");
    baseGradient.addColorStop(0.3, "#3ebbd8");
    baseGradient.addColorStop(0.64, "#1f4f86");
    baseGradient.addColorStop(1, "#09172d");
  }
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, size, size);

  ctx.globalAlpha = themeKey === "ember" ? 0.18 : 0.2;
  for (let i = 0; i < 1600; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 0.8 + Math.random() * 3.4;
    const tint =
      themeKey === "ember"
        ? `rgba(${190 + Math.floor(Math.random() * 65)}, ${80 + Math.floor(Math.random() * 70)}, ${45 + Math.floor(Math.random() * 40)}, 1)`
        : `rgba(${55 + Math.floor(Math.random() * 65)}, ${120 + Math.floor(Math.random() * 110)}, ${165 + Math.floor(Math.random() * 90)}, 1)`;
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = themeKey === "ember" ? 0.2 : 0.16;
  ctx.lineWidth = themeKey === "ember" ? 3.2 : 2.6;
  for (let i = 0; i < 18; i += 1) {
    ctx.beginPath();
    ctx.strokeStyle =
      themeKey === "ember" ? "rgba(255,198,120,0.58)" : "rgba(155,240,255,0.52)";
    let sx = -40 + Math.random() * (size + 80);
    let sy = Math.random() * size;
    ctx.moveTo(sx, sy);
    for (let k = 0; k < 5; k += 1) {
      sx += size * 0.2;
      sy += (Math.random() - 0.5) * 120;
      ctx.quadraticCurveTo(
        sx - size * 0.08,
        sy + (Math.random() - 0.5) * 80,
        sx,
        sy
      );
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function initPreloaderScene() {
  if (!preloaderCanvas) {
    return;
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    46,
    preloaderCanvas.clientWidth / preloaderCanvas.clientHeight,
    0.1,
    120
  );
  camera.position.set(0, 0.2, 8);
  const renderer = createRenderer(preloaderCanvas);

  const ambient = new THREE.AmbientLight(0x7092c9, 0.7);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(3, 1, 4);
  scene.add(ambient, key);

  const stars = createStarField(scene, 1400, 220, 0.6);
  const streaks = [];
  const streakCount = isMobileViewport ? 12 : 24;
  for (let i = 0; i < streakCount; i += 1) {
    const streak = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.04, 2.2 + Math.random() * 3.8, 10, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x7fc2ff,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.14,
        depthWrite: false
      })
    );
    streak.rotation.z = Math.PI * 0.5;
    streak.position.set(
      -6 + Math.random() * 12,
      (Math.random() - 0.5) * 3.6,
      -3.6 + Math.random() * 7.2
    );
    streak.userData.speed = 0.028 + Math.random() * 0.07;
    streak.userData.wave = Math.random() * Math.PI * 2;
    scene.add(streak);
    streaks.push(streak);
  }

  const placeholder = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 1.4, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8cbefc,
      metalness: 0.35,
      roughness: 0.4
    })
  );
  placeholder.rotation.z = Math.PI / 2;
  placeholder.position.set(-5.5, -0.1, 1.8);
  scene.add(placeholder);

  let rocket = null;
  rocketPromise.then(() => {
    if (!assets.rocket?.scene || preloaderNode?.classList.contains("is-hidden")) {
      return;
    }
    rocket = assets.rocket.scene.clone(true);
    rocket.scale.setScalar(0.65);
    rocket.position.copy(placeholder.position);
    rocket.rotation.set(0.2, Math.PI / 2, -0.15);
    scene.add(rocket);
    scene.remove(placeholder);
  });

  const clock = new THREE.Clock();
  const animate = () => {
    if (preloaderNode?.classList.contains("is-hidden")) {
      return;
    }
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    stars.rotation.y = t * 0.028;
    streaks.forEach((streak, index) => {
      const wave = Math.sin(t * 2.8 + streak.userData.wave + index * 0.12) * 0.07;
      streak.position.x += streak.userData.speed;
      streak.position.y += wave * 0.08;
      if (streak.position.x > 6.4) {
        streak.position.x = -6.4;
      }
    });
    const actor = rocket || placeholder;
    if (actor) {
      const p = Math.min(1, t / 2.8);
      actor.position.x = -5.5 + p * 12;
      actor.position.y = -0.1 + Math.sin(t * 2.5) * 0.1;
      actor.position.z = 1.8 - p * 4.8;
      actor.rotation.z = -0.15 + p * 0.32;
      actor.rotation.y = Math.PI / 2 + p * 0.22;
    }
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = preloaderCanvas.clientWidth / preloaderCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(preloaderCanvas.clientWidth, preloaderCanvas.clientHeight);
  });
}

let flightOverlayTimer = null;
function triggerFlightOverlay(themeKey) {
  const overlayNode = document.querySelector("#flight-overlay");
  if (!overlayNode) {
    return;
  }
  const statusNode = document.querySelector("#flight-status");
  if (statusNode && themeMap[themeKey]) {
    statusNode.textContent = `Гиперпереход: ${themeMap[themeKey].label}`;
  }
  overlayNode.classList.remove("is-active");
  void overlayNode.offsetWidth;
  overlayNode.classList.add("is-active");
  if (flightOverlayTimer) {
    clearTimeout(flightOverlayTimer);
  }
  flightOverlayTimer = setTimeout(() => {
    overlayNode.classList.remove("is-active");
  }, prefersReducedMotion ? 420 : 980);
}

function initEarthScene() {
  if (!earthCanvas) {
    return;
  }
  const earthIntroStartMs = performance.now();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    43,
    window.innerWidth / window.innerHeight,
    0.1,
    220
  );
  camera.position.set(0, 0.08, 7.1);
  const renderer = createRenderer(earthCanvas);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ambient = new THREE.AmbientLight(0x7697c8, 0.72);
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(5.8, 2.1, 5.4);
  const rim = new THREE.DirectionalLight(0x73c4ff, 0.58);
  rim.position.set(-5.2, -2.2, -4.2);
  scene.add(ambient, key, rim);

  const stars = createStarField(scene, 1800, 185, 0.58);
  const worldRig = new THREE.Group();
  scene.add(worldRig);

  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x4f84d8,
    shininess: 22
  });
  let earthMapsApplied = false;
  const applyEarthMaps = () => {
    let changed = false;
    if (!earthMat.map && assets.textures.earthAlbedo) {
      assets.textures.earthAlbedo.colorSpace = THREE.SRGBColorSpace;
      earthMat.map = assets.textures.earthAlbedo;
      changed = true;
    }
    if (!earthMat.normalMap && assets.textures.earthNormal) {
      earthMat.normalMap = assets.textures.earthNormal;
      earthMat.normalScale = new THREE.Vector2(0.92, 0.92);
      changed = true;
    }
    if (!earthMat.specularMap && assets.textures.earthSpecular) {
      earthMat.specularMap = assets.textures.earthSpecular;
      earthMat.specular = new THREE.Color(0x3f6598);
      changed = true;
    }
    if (changed) {
      earthMat.needsUpdate = true;
    }
    earthMapsApplied = Boolean(earthMat.map && earthMat.normalMap && earthMat.specularMap);
  };
  if (assets.textures.earthAlbedo) {
    assets.textures.earthAlbedo.colorSpace = THREE.SRGBColorSpace;
    earthMat.map = assets.textures.earthAlbedo;
  }
  if (assets.textures.earthNormal) {
    earthMat.normalMap = assets.textures.earthNormal;
    earthMat.normalScale = new THREE.Vector2(0.92, 0.92);
  }
  if (assets.textures.earthSpecular) {
    earthMat.specularMap = assets.textures.earthSpecular;
    earthMat.specular = new THREE.Color(0x3f6598);
  }
  applyEarthMaps();

  const earthGroup = new THREE.Group();
  const earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.08, 120, 120),
    earthMat
  );
  earthGroup.add(earthMesh);
  const earthHitArea = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 20, 20),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.01,
      depthWrite: false
    })
  );
  earthHitArea.userData.themeKey = "earth";
  earthGroup.add(earthHitArea);
  worldRig.add(earthGroup);

  const cloudMat = new THREE.MeshPhongMaterial({
    map: assets.textures.earthClouds || null,
    transparent: true,
    opacity: assets.textures.earthClouds ? 0.42 : 0,
    depthWrite: false
  });
  const cloudMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.13, 80, 80),
    cloudMat
  );
  earthGroup.add(cloudMesh);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.34, 56, 56),
    new THREE.MeshBasicMaterial({
      color: 0x75b5ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    })
  );
  earthGroup.add(atmosphere);

  const planetSystems = [
    { key: "earth", baseAngle: 0, anchor: earthGroup, mesh: earthMesh },
    { key: "neon", baseAngle: 2.12, anchor: null, mesh: null },
    { key: "ember", baseAngle: -2.18, anchor: null, mesh: null }
  ];
  const remotePlanetMeshes = [];
  const remotePlanetHitAreas = [];
  const themeHitAreas = [earthHitArea];
  const remoteFrontnessByTheme = new Map([
    ["earth", 1],
    ["neon", 0],
    ["ember", 0]
  ]);

  const remoteDefs = [
    {
      key: "neon",
      color: 0x7fd9ff,
      glow: 0x7af4ff,
      radius: 1.14,
      baseY: 0.5,
      mapKey: "marsAlbedo",
      normalKey: "marsNormal",
      roughness: 0.54,
      metalness: 0.09,
      orbitSpeed: 0.23
    },
    {
      key: "ember",
      color: 0xffb775,
      glow: 0xffc47a,
      radius: 1.08,
      baseY: 0.44,
      mapKey: "moonAlbedo",
      roughness: 0.6,
      metalness: 0.08,
      orbitSpeed: -0.17
    }
  ];

  const proceduralSurfaceMap = {
    neon: createPlanetSurfaceTexture("neon"),
    ember: createPlanetSurfaceTexture("ember")
  };

  const remoteOrbitRadius = 10.4;
  remoteDefs.forEach((def) => {
    const slot = planetSystems.find((item) => item.key === def.key);
    if (!slot) {
      return;
    }
    const anchor = new THREE.Group();
    const fallbackMap = proceduralSurfaceMap[def.key] || null;
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: def.color,
      transparent: true,
      opacity: 0.2,
      roughness: def.roughness ?? 0.56,
      metalness: def.metalness ?? 0.08,
      clearcoat: 0.46,
      clearcoatRoughness: 0.35,
      emissive: new THREE.Color(def.glow).multiplyScalar(0.2),
      map: fallbackMap
    });
    if (def.mapKey && assets.textures[def.mapKey]) {
      const mapTexture = assets.textures[def.mapKey];
      mapTexture.colorSpace = THREE.SRGBColorSpace;
      bodyMaterial.map = mapTexture;
    }
    if (def.normalKey && assets.textures[def.normalKey]) {
      bodyMaterial.normalMap = assets.textures[def.normalKey];
      bodyMaterial.normalScale = new THREE.Vector2(0.76, 0.76);
    }
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(def.radius, 72, 72),
      bodyMaterial
    );
    anchor.position.set(
      Math.sin(slot.baseAngle) * remoteOrbitRadius,
      def.baseY,
      Math.cos(slot.baseAngle) * remoteOrbitRadius - 2.5
    );
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(def.radius * 1.18, 0.04, 18, 92),
      new THREE.MeshBasicMaterial({
        color: def.glow,
        transparent: true,
        opacity: 0.35
      })
    );
    halo.rotation.x = Math.PI * 0.45;
    anchor.add(body);
    anchor.add(halo);

    const hitArea = new THREE.Mesh(
      new THREE.SphereGeometry(def.radius * 2.2, 20, 20),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.01,
        depthWrite: false
      })
    );
    hitArea.userData.themeKey = def.key;
    anchor.add(hitArea);

    worldRig.add(anchor);
    body.userData.themeKey = def.key;
    remotePlanetMeshes.push(body);
    remotePlanetHitAreas.push(hitArea);
    themeHitAreas.push(hitArea);

    slot.anchor = anchor;
    slot.mesh = body;
    slot.baseY = def.baseY;
    slot.halo = halo;
    slot.hitArea = hitArea;
    slot.def = def;
    slot.defaultPos = anchor.position.clone();
    slot.fallbackMap = fallbackMap;
    slot.orbitAngle = slot.baseAngle;
  });
  const earthSlot = planetSystems.find((item) => item.key === "earth");
  if (earthSlot) {
    earthSlot.defaultPos = new THREE.Vector3(0, 0, 0);
  }

  const orbitGuide = new THREE.Mesh(
    new THREE.TorusGeometry(remoteOrbitRadius, 0.03, 8, 180),
    new THREE.MeshBasicMaterial({
      color: 0x5b9aff,
      transparent: true,
      opacity: 0.18
    })
  );
  orbitGuide.rotation.x = Math.PI * 0.5;
  orbitGuide.position.z = -2.5;
  worldRig.add(orbitGuide);

  const asteroidTracks = [];
  const asteroidBelt = new THREE.Group();
  worldRig.add(asteroidBelt);
  const asteroidCount = isMobileViewport ? 5 : 10;
  for (let i = 0; i < asteroidCount; i += 1) {
    const size = 0.025 + Math.random() * 0.055;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.56 + Math.random() * 0.05, 0.12, 0.34 + Math.random() * 0.09),
        roughness: 0.94,
        metalness: 0.03,
        transparent: true,
        opacity: 0.72
      })
    );
    asteroidBelt.add(rock);
    asteroidTracks.push({
      mesh: rock,
      radius: 3.25 + Math.random() * 0.92,
      speed: 0.15 + Math.random() * 0.11,
      phase: Math.random() * Math.PI * 2,
      yPhase: Math.random() * Math.PI * 2,
      baseY: -0.08 + (Math.random() - 0.5) * 0.22,
      spinX: (Math.random() - 0.5) * 0.04,
      spinY: (Math.random() - 0.5) * 0.06
    });
  }

  const moonTracks = [];
  const moonGroup = new THREE.Group();
  worldRig.add(moonGroup);
  const moonDefs = [
    { radius: 4.55, size: 0.11, speed: 0.2, phase: 0.35, tone: 0.58, y: 0.2 },
    { radius: 5.18, size: 0.08, speed: 0.14, phase: 2.4, tone: 0.5, y: -0.22 }
  ];
  moonDefs.forEach((def, index) => {
    const moonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.58, 0.16, def.tone),
      roughness: 0.78,
      metalness: 0.04,
      map: assets.textures.moonAlbedo || null
    });
    if (moonMat.map) {
      moonMat.map.colorSpace = THREE.SRGBColorSpace;
    }
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(def.size, 24, 24),
      moonMat
    );
    moonGroup.add(moon);
    moonTracks.push({
      mesh: moon,
      radius: def.radius,
      speed: def.speed,
      phase: def.phase,
      baseY: def.y,
      wobble: 0.18 + index * 0.08
    });
  });

  const cometGroup = new THREE.Group();
  const cometTail = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 1.08, 20, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x8ed9ff,
      transparent: true,
      opacity: 0.24,
      depthWrite: false
    })
  );
  cometTail.rotation.z = -Math.PI * 0.5;
  cometTail.position.x = -0.48;
  const cometCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 22, 22),
    new THREE.MeshBasicMaterial({
      color: 0xbaf0ff,
      transparent: true,
      opacity: 0.92
    })
  );
  cometGroup.add(cometTail);
  cometGroup.add(cometCore);
  scene.add(cometGroup);

  let rocket = null;
  if (assets.rocket?.scene) {
    rocket = assets.rocket.scene.clone(true);
    rocket.scale.setScalar(0.11);
    rocket.position.set(-3.2, 1.0, 1.8);
    rocket.rotation.set(0.08, 1.1, -0.2);
    scene.add(rocket);
  }

  let dragActive = false;
  let dragDistance = 0;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerMaybeClick = false;
  let lastX = 0;
  let lastY = 0;
  let worldRotationY = 0;
  let worldTiltX = 0.03;
  let spinVelocity = 0;
  let tiltVelocity = 0;
  let activeTheme = currentTheme;
  let revealEnergy = 0.12;
  let flightBoost = 0;
  let themeTravelUntil = 0;
  let manualControlUntil = 0;
  let autoOrbitPausedUntil = 0;
  let orbitClock = 0;
  let prevFrameMs = performance.now();

  const baseSpin = prefersReducedMotion ? 0.00016 : 0.00034;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const cameraLookTarget = new THREE.Vector3(0, 0, 0);
  const tmpTarget = new THREE.Vector3();

  const commitTheme = (themeKey) => {
    if (!themeMap[themeKey]) {
      return;
    }
    if (themeKey === activeTheme) {
      return;
    }
    activeTheme = themeKey;
    applyTheme(themeKey);
    flightBoost = 1.45;
    themeTravelUntil = performance.now() + (prefersReducedMotion ? 420 : 1220);
    manualControlUntil = performance.now() + 1200;
    autoOrbitPausedUntil = performance.now() + 1200;
    triggerFlightOverlay(themeKey);
  };

  const onThemeChange = (event) => {
    const themeKey = event.detail?.themeKey;
    if (!themeMap[themeKey]) {
      return;
    }
    activeTheme = themeKey;
  };
  document.addEventListener("system-theme-change", onThemeChange);

  const pickRemoteTheme = (clientX, clientY) => {
    const rect = earthCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }
    pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const intersections = raycaster.intersectObjects(themeHitAreas, false);
    for (const entry of intersections) {
      const themeKey = entry?.object?.userData?.themeKey;
      if (!themeKey) {
        continue;
      }
      if (themeKey === "earth") {
        return "earth";
      }
      const frontness = remoteFrontnessByTheme.get(themeKey) ?? 0;
      if (frontness > 0.03) {
        return themeKey;
      }
    }
    const bodyIntersections = raycaster.intersectObjects(remotePlanetMeshes, false);
    const bodyHit = bodyIntersections.find((entry) => {
      const mesh = entry.object;
      const themeKey = mesh?.userData?.themeKey;
      if (!themeKey) {
        return false;
      }
      return (remoteFrontnessByTheme.get(themeKey) ?? 0) > 0.03;
    });
    return bodyHit?.object?.userData?.themeKey || null;
  };

  earthCanvas.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerMaybeClick = true;
    dragActive = true;
    dragDistance = 0;
    revealEnergy = Math.max(revealEnergy, 0.28);
    manualControlUntil = Number.POSITIVE_INFINITY;
    autoOrbitPausedUntil = Number.POSITIVE_INFINITY;
    document.body.classList.add("earth-dragging");
    lastX = event.clientX;
    lastY = event.clientY;
    earthCanvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  earthCanvas.addEventListener("pointermove", (event) => {
    if (!dragActive) {
      const hoverTheme = pickRemoteTheme(event.clientX, event.clientY);
      earthCanvas.style.cursor = hoverTheme ? "pointer" : "grab";
      return;
    }
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    worldRotationY += dx * 0.0045;
    worldTiltX = THREE.MathUtils.clamp(worldTiltX + dy * 0.0016, -0.2, 0.18);
    spinVelocity = dx * 0.0006;
    tiltVelocity = dy * 0.00008;
    dragDistance += Math.abs(dx) + Math.abs(dy);
    if (Math.abs(event.clientX - pointerStartX) + Math.abs(event.clientY - pointerStartY) > 8) {
      pointerMaybeClick = false;
    }
    revealEnergy = Math.min(1, revealEnergy + Math.min(0.26, (Math.abs(dx) + Math.abs(dy)) * 0.0042));
    lastX = event.clientX;
    lastY = event.clientY;
    event.preventDefault();
  });

  const releaseEarthDrag = (event) => {
    const cancelled =
      event?.type === "pointercancel" || event?.type === "lostpointercapture";
    const movedSinceDown =
      Math.abs((event?.clientX ?? pointerStartX) - pointerStartX) +
      Math.abs((event?.clientY ?? pointerStartY) - pointerStartY);
    if (!cancelled && pointerMaybeClick && movedSinceDown < 8) {
      const pickedTheme = pickRemoteTheme(event?.clientX ?? pointerStartX, event?.clientY ?? pointerStartY);
      if (pickedTheme) {
        commitTheme(pickedTheme);
        revealEnergy = Math.max(revealEnergy, 0.56);
      }
    }
    pointerMaybeClick = false;
    if (!dragActive) {
      return;
    }
    dragActive = false;
    document.body.classList.remove("earth-dragging");
    if (event?.pointerId !== undefined && earthCanvas.hasPointerCapture(event.pointerId)) {
      earthCanvas.releasePointerCapture(event.pointerId);
    }
    manualControlUntil = performance.now() + 5000;
    autoOrbitPausedUntil = performance.now() + 5000;
    // explicit planet click controls theme switch
  };
  earthCanvas.addEventListener("pointerup", releaseEarthDrag);
  earthCanvas.addEventListener("pointercancel", releaseEarthDrag);
  earthCanvas.addEventListener("lostpointercapture", releaseEarthDrag);
  earthCanvas.addEventListener("pointerleave", () => {
    if (!dragActive) {
      earthCanvas.style.cursor = "grab";
    }
  });
  earthCanvas.addEventListener(
    "wheel",
    (event) => {
      worldRotationY += event.deltaY * 0.0012;
      worldTiltX = THREE.MathUtils.clamp(worldTiltX + event.deltaX * 0.00045, -0.2, 0.18);
      revealEnergy = Math.min(1, revealEnergy + 0.06);
      manualControlUntil = performance.now() + 5000;
      autoOrbitPausedUntil = performance.now() + 5000;
      event.preventDefault();
    },
    { passive: false }
  );

  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const nowMs = performance.now();
    const dt = Math.min(0.06, Math.max(0.001, (nowMs - prevFrameMs) / 1000));
    prevFrameMs = nowMs;
    const autoOrbitActive = !dragActive && nowMs > autoOrbitPausedUntil;
    if (autoOrbitActive) {
      orbitClock += dt;
    }
    if (!earthMapsApplied) {
      applyEarthMaps();
    }
    if (!cloudMat.map && assets.textures.earthClouds) {
      cloudMat.map = assets.textures.earthClouds;
      cloudMat.opacity = 0.42;
      cloudMat.needsUpdate = true;
    }

    worldRotationY += baseSpin + spinVelocity;
    spinVelocity *= dragActive ? 0.9 : 0.965;
    if (!dragActive && activeTheme !== "earth" && nowMs > manualControlUntil) {
      const activeSlot = planetSystems.find((slot) => slot.key === activeTheme);
      if (activeSlot) {
        const alignTarget = -(activeSlot.orbitAngle ?? activeSlot.baseAngle);
        const diff =
          THREE.MathUtils.euclideanModulo(alignTarget - worldRotationY + Math.PI, Math.PI * 2) -
          Math.PI;
        worldRotationY += diff * 0.035;
      }
    }
    worldTiltX = THREE.MathUtils.clamp(worldTiltX + tiltVelocity, -0.2, 0.18);
    tiltVelocity *= 0.92;
    revealEnergy *= dragActive ? 0.995 : 0.982;
    revealEnergy = Math.max(revealEnergy, 0.09);

    worldRig.rotation.y = worldRotationY;
    worldRig.rotation.x = worldTiltX;

    earthMesh.rotation.y += prefersReducedMotion ? 0.00024 : 0.001;
    cloudMesh.rotation.y += 0.0012;
    earthGroup.rotation.z = Math.sin(t * 0.18) * 0.03;
    const earthTargetScale = activeTheme === "earth" ? 1 : 0.79;
    const earthTargetPos =
      activeTheme === "earth"
        ? tmpTarget.set(0, 0, 0)
        : tmpTarget.set(-5.35, -0.28, -4.05);
    earthGroup.position.lerp(earthTargetPos, activeTheme === "earth" ? 0.06 : 0.08);
    earthGroup.scale.lerp(new THREE.Vector3(earthTargetScale, earthTargetScale, earthTargetScale), 0.08);

    asteroidTracks.forEach((item, index) => {
      const angle = orbitClock * item.speed + item.phase;
      item.mesh.position.set(
        Math.cos(angle) * item.radius,
        item.baseY + Math.sin(orbitClock * 0.6 + item.yPhase) * 0.2,
        Math.sin(angle) * item.radius * 0.62
      );
      item.mesh.rotation.x += item.spinX;
      item.mesh.rotation.y += item.spinY;
      if (index % 4 === 0) {
        item.mesh.scale.setScalar(1 + Math.sin(orbitClock * 2 + item.phase) * 0.06);
      }
    });

    moonTracks.forEach((moon, index) => {
      const angle = orbitClock * moon.speed + moon.phase;
      moon.mesh.position.set(
        Math.cos(angle) * moon.radius,
        moon.baseY + Math.sin(orbitClock * moon.wobble + index) * 0.12,
        Math.sin(angle) * moon.radius * 0.72
      );
      moon.mesh.rotation.y += 0.002 + index * 0.0004;
    });

    remoteDefs.forEach((def, index) => {
      const slot = planetSystems.find((item) => item.key === def.key);
      if (!slot?.anchor || !slot.mesh) {
        return;
      }
      const meshMat = slot.mesh.material;
      if (def.mapKey && !meshMat.map && assets.textures[def.mapKey]) {
        const tex = assets.textures[def.mapKey];
        tex.colorSpace = THREE.SRGBColorSpace;
        meshMat.map = tex;
        meshMat.needsUpdate = true;
      }
      if (def.normalKey && !meshMat.normalMap && assets.textures[def.normalKey]) {
        meshMat.normalMap = assets.textures[def.normalKey];
        meshMat.normalScale = new THREE.Vector2(0.76, 0.76);
        meshMat.needsUpdate = true;
      }
      if (autoOrbitActive) {
        slot.orbitAngle += (def.orbitSpeed ?? 0.15) * dt;
      }
      const orbitAngle = slot.orbitAngle ?? slot.baseAngle;
      slot.mesh.rotation.y += 0.003 + index * 0.001;
      const orbitPos = new THREE.Vector3(
        Math.sin(orbitAngle) * remoteOrbitRadius,
        def.baseY + Math.sin(orbitClock * 0.7 + index * 1.5) * 0.2,
        Math.cos(orbitAngle) * remoteOrbitRadius - 2.5
      );
      const focusPos = new THREE.Vector3(
        0.05 + Math.sin(t * 0.34 + index) * 0.12,
        0.18 + Math.cos(t * 0.46 + index) * 0.09,
        0.28
      );
      const sidePos = new THREE.Vector3(
        Math.sign(Math.sin(slot.baseAngle)) * 6.35,
        0.94 + Math.sin(t * 0.3 + index * 2) * 0.12,
        -5.4
      );
      const targetPos =
        activeTheme === "earth"
          ? orbitPos
          : activeTheme === def.key
            ? focusPos
            : sidePos;
      slot.anchor.position.lerp(targetPos, activeTheme === "earth" ? 0.05 : 0.09);
      const relative =
        THREE.MathUtils.euclideanModulo(worldRotationY + orbitAngle + Math.PI, Math.PI * 2) -
        Math.PI;
      const frontness = THREE.MathUtils.clamp(Math.cos(relative) * 0.5 + 0.5, 0, 1);
      remoteFrontnessByTheme.set(def.key, frontness);
      const focusBoost = activeTheme === def.key ? 0.34 : 0;
      const opacity = THREE.MathUtils.clamp(
        0.16 + frontness * (0.26 + revealEnergy * 0.62) + focusBoost,
        0.16,
        0.98
      );
      slot.mesh.material.opacity = opacity;
      slot.mesh.material.emissiveIntensity = 0.28 + frontness * 0.44 + focusBoost * 0.5;
      const targetScale =
        activeTheme === def.key
          ? 1.36
          : activeTheme === "earth"
            ? 0.72 + frontness * 0.22
            : 0.66 + frontness * 0.14;
      const currentScale = slot.mesh.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, activeTheme === "earth" ? 0.05 : 0.08);
      slot.mesh.scale.setScalar(nextScale);
      if (slot.halo) {
        slot.halo.material.opacity = 0.1 + opacity * (activeTheme === def.key ? 0.62 : 0.42);
        slot.halo.rotation.z += 0.007 + index * 0.002;
      }
      if (slot.hitArea) {
        slot.hitArea.scale.setScalar(1 + frontness * 0.45 + (activeTheme === def.key ? 0.5 : 0));
      }
    });

    const travelActive = performance.now() < themeTravelUntil;
    if (travelActive) {
      flightBoost = Math.max(flightBoost, 0.8 + Math.sin(t * 20) * 0.08);
    }
    if (flightBoost > 0.001) {
      flightBoost *= 0.92;
    } else {
      flightBoost = 0;
    }

    const targetCameraZ = activeTheme === "earth" ? 7.1 : 5.04;
    const targetCameraX = activeTheme === "earth" ? 0 : 0.11;
    const targetCameraY = activeTheme === "earth" ? 0.08 : 0.23;
    camera.position.x += (targetCameraX - camera.position.x) * 0.09;
    camera.position.y += (targetCameraY - camera.position.y) * 0.09;
    camera.position.z += (targetCameraZ - flightBoost * 2.2 - camera.position.z) * 0.1;
    camera.fov += ((activeTheme === "earth" ? 43 : 37.5) + flightBoost * 11 - camera.fov) * 0.12;
    camera.updateProjectionMatrix();
    if (activeTheme === "earth") {
      cameraLookTarget.set(0, 0, 0);
    } else {
      const focusSlot = planetSystems.find((slot) => slot.key === activeTheme);
      if (focusSlot?.anchor) {
        focusSlot.anchor.getWorldPosition(cameraLookTarget);
      } else {
        cameraLookTarget.set(0, 0, 0);
      }
    }
    camera.lookAt(cameraLookTarget);
    stars.rotation.y += 0.006 + flightBoost * 0.03;
    stars.rotation.x = Math.sin(t * 0.12) * 0.04;

    const cometProgress = THREE.MathUtils.euclideanModulo(t * 0.09, 1);
    const cometArc = cometProgress * Math.PI * 2;
    cometGroup.position.set(
      Math.cos(cometArc) * 8.6,
      2.1 + Math.sin(cometArc * 1.7) * 0.75,
      -4.2 + Math.sin(cometArc) * 2.1
    );
    cometGroup.rotation.z = Math.sin(t * 1.9) * 0.35;
    cometTail.material.opacity = 0.2 + Math.sin(t * 3.1) * 0.08;

    if (rocket) {
      const doc = document.documentElement;
      const scrollProgress =
        (doc.scrollTop || window.scrollY) /
        Math.max(doc.scrollHeight - window.innerHeight, 1);
      const landing = THREE.MathUtils.smoothstep(scrollProgress, 0.84, 0.985);
      const introProgress = THREE.MathUtils.clamp(
        (performance.now() - earthIntroStartMs) / 2600,
        0,
        1
      );
      const orbitOffset =
        activeTheme === "neon" ? -1.8 : activeTheme === "ember" ? 1.8 : 0;

      const roamX = Math.sin(t * 0.62) * 3.7 + orbitOffset;
      const roamY = Math.cos(t * 0.41) * 1.3 + 0.82;
      const roamZ = 1.4 + Math.sin(t * 0.92) * 0.75;
      const landX = 0.2 + orbitOffset * 0.18;
      const landY = -2.2;
      const landZ = 2.2;
      const missionX = THREE.MathUtils.lerp(roamX, landX, landing);
      const missionY = THREE.MathUtils.lerp(roamY, landY, landing);
      const missionZ = THREE.MathUtils.lerp(roamZ, landZ, landing);
      const launchX = -8.8;
      const launchY = 2.7;
      const launchZ = 6.6;

      rocket.position.x = THREE.MathUtils.lerp(launchX, missionX, introProgress);
      rocket.position.y = THREE.MathUtils.lerp(launchY, missionY, introProgress);
      rocket.position.z = THREE.MathUtils.lerp(launchZ, missionZ, introProgress);
      rocket.rotation.y = THREE.MathUtils.lerp(1.55, THREE.MathUtils.lerp(1.2, -0.5, landing), introProgress);
      rocket.rotation.z = THREE.MathUtils.lerp(
        -0.28,
        THREE.MathUtils.lerp(Math.sin(t * 0.8) * 0.2, -0.18, landing),
        introProgress
      );
      rocket.rotation.x = THREE.MathUtils.lerp(0.22, THREE.MathUtils.lerp(0.08, 0.18, landing), introProgress);
    }

    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function initOrbitPhysics() {
  const orbitField = document.querySelector("#orbit-field");
  const mentorNodes = [...document.querySelectorAll(".orbit-node")];
  const mentorTitle = document.querySelector("#mentor-title");
  const mentorCopy = document.querySelector("#mentor-copy");
  const mentorPriority = document.querySelector("#mentor-priority");
  if (!orbitField || mentorNodes.length === 0) {
    return;
  }

  const states = mentorNodes.map((node) => ({
    node,
    key: node.dataset.key || "",
    title: node.dataset.title || "",
    copy: node.dataset.copy || "",
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    dragging: false,
    pointerId: null,
    holdUntil: 0,
    moved: false,
    startPointerX: 0,
    startPointerY: 0
  }));

  let selectedState = states[0];
  let rect = orbitField.getBoundingClientRect();
  let centerX = rect.width / 2;
  let centerY = rect.height / 2;

  const nodeRadius = 49;

  const resize = () => {
    rect = orbitField.getBoundingClientRect();
    centerX = rect.width / 2;
    centerY = rect.height / 2;
  };

  const setPriority = (key) => {
    if (!mentorPriority) {
      return;
    }
    const items = [...mentorPriority.querySelectorAll("li")];
    const selected = items.find((item) => item.dataset.key === key);
    if (!selected) {
      return;
    }
    mentorPriority.prepend(selected);
    items.forEach((item) => item.classList.remove("is-priority"));
    selected.classList.add("is-priority");
  };

  const activate = (state) => {
    states.forEach((s) => s.node.classList.remove("is-active"));
    state.node.classList.add("is-active");
    state.node.classList.remove("is-pop");
    void state.node.offsetWidth;
    state.node.classList.add("is-pop");
    if (mentorTitle) {
      mentorTitle.textContent = state.title;
    }
    if (mentorCopy) {
      mentorCopy.textContent = state.copy;
    }
    setPriority(state.key);
  };

  const setCentered = (state) => {
    selectedState = state;
    states.forEach((item) => {
      item.node.classList.toggle("is-centered", item === selectedState);
      if (item !== selectedState) {
        item.holdUntil = performance.now() + 600;
      }
    });
    activate(state);
  };

  const getStateByKey = (key) => states.find((state) => state.key === key);

  const recalcTargets = () => {
    const radiusBase = Math.min(rect.width, rect.height) * 0.36;
    const outer = states.filter((state) => state !== selectedState);
    outer.forEach((state, idx) => {
      const angle = (-Math.PI / 2) + (idx / Math.max(outer.length, 1)) * Math.PI * 2;
      const wave = idx % 2 === 0 ? 0 : 24;
      const radius = radiusBase + wave;
      state.tx = Math.cos(angle) * radius;
      state.ty = Math.sin(angle) * radius;
    });
    if (selectedState) {
      selectedState.tx = 0;
      selectedState.ty = 0;
    }
  };

  const clampToOrbit = (x, y) => {
    const maxRadius = Math.min(rect.width, rect.height) * 0.5 - nodeRadius - 4;
    const dist = Math.hypot(x, y);
    if (dist <= maxRadius) {
      return { x, y };
    }
    const ratio = maxRadius / Math.max(dist, 1e-6);
    return {
      x: x * ratio,
      y: y * ratio
    };
  };

  const applyCollisionImpulse = (active) => {
    const now = performance.now();
    states.forEach((other) => {
      if (other === active) {
        return;
      }
      const dx = other.x - active.x;
      const dy = other.y - active.y;
      const dist = Math.hypot(dx, dy);
      const minDist = nodeRadius * 2 - 8;
      if (dist >= minDist) {
        return;
      }
      const nx = dx / Math.max(dist, 0.001);
      const ny = dy / Math.max(dist, 0.001);
      const overlap = minDist - dist;
      other.x += nx * overlap * 0.56;
      other.y += ny * overlap * 0.56;
      const impulse = 1.28 + overlap * 0.14;
      other.vx += nx * impulse;
      other.vy += ny * impulse;
      active.vx -= nx * impulse * 0.38;
      active.vy -= ny * impulse * 0.38;
      other.holdUntil = now + 5200;
    });
  };

  states.forEach((state) => {
    state.node.addEventListener("pointerdown", (event) => {
      resize();
      state.dragging = true;
      state.pointerId = event.pointerId;
      state.moved = false;
      state.startPointerX = event.clientX;
      state.startPointerY = event.clientY;
      state.vx = 0;
      state.vy = 0;
      state.node.setPointerCapture(event.pointerId);
      state.node.classList.add("is-dragging");
      event.preventDefault();
    });

    state.node.addEventListener("pointermove", (event) => {
      if (!state.dragging) {
        return;
      }
      resize();
      const px = event.clientX - rect.left - centerX;
      const py = event.clientY - rect.top - centerY;
      const clamped = clampToOrbit(px, py);
      const moveVX = clamped.x - state.x;
      const moveVY = clamped.y - state.y;
      if (Math.abs(event.clientX - state.startPointerX) + Math.abs(event.clientY - state.startPointerY) > 6) {
        state.moved = true;
      }
      state.x = clamped.x;
      state.y = clamped.y;
      state.vx = moveVX * 0.24;
      state.vy = moveVY * 0.24;
      applyCollisionImpulse(state);
      event.preventDefault();
    });

    state.node.addEventListener("pointerup", () => {
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
        setCentered(state);
      } else {
        activate(state);
        state.holdUntil = performance.now() + 5000;
      }
    });
    state.node.addEventListener("pointercancel", () => {
      if (state.pointerId !== null && state.node.hasPointerCapture(state.pointerId)) {
        state.node.releasePointerCapture(state.pointerId);
      }
      state.pointerId = null;
      state.dragging = false;
      state.node.classList.remove("is-dragging");
    });
  });

  if (mentorPriority) {
    mentorPriority.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const item = target.closest("li");
      if (!item) {
        return;
      }
      const key = item.dataset.key || "";
      const state = getStateByKey(key);
      if (!state) {
        return;
      }
      setCentered(state);
    });
  }

  setCentered(states[0]);
  resize();
  recalcTargets();

  const loop = () => {
    requestAnimationFrame(loop);
    const now = performance.now();
    recalcTargets();

    states.forEach((state) => {
      if (!state.dragging) {
        const restoring =
          state === selectedState
            ? 0.16
            : now > state.holdUntil
              ? 0.08
              : 0.02;
        const damping = state === selectedState ? 0.82 : 0.9;
        state.vx += (state.tx - state.x) * restoring;
        state.vy += (state.ty - state.y) * restoring;
        state.vx *= damping;
        state.vy *= damping;
        state.x += state.vx;
        state.y += state.vy;
        if (state === selectedState) {
          state.x *= 0.74;
          state.y *= 0.74;
          state.vx *= 0.72;
          state.vy *= 0.72;
        }
        const clamped = clampToOrbit(state.x, state.y);
        state.x = clamped.x;
        state.y = clamped.y;
      } else if (state === selectedState) {
        selectedState = state;
      }

      state.node.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    });
  };
  loop();

  window.addEventListener("resize", resize);
}

function initCodeTyping() {
  const codeSection = document.querySelector("#code");
  const liveCodeNode = document.querySelector("#live-code");
  const runtimeHeadlineNode = document.querySelector("#runtime-headline");
  const runtimeListNode = document.querySelector("#runtime-list");
  const runtimeControlNodes = [...document.querySelectorAll(".runtime-chip")];
  const codePulseNodes = [...document.querySelectorAll("#code-pulses span")];
  if (!liveCodeNode || !runtimeListNode || !codeSection) {
    return;
  }
  liveCodeNode.textContent = "const mission = craftUI({ wow: true, trust: true });";

  const snippets = [
    {
      title: "Frontend пакет обновлён",
      track: "frontend",
      code: [
        "$ git pull mentor/ui-polish",
        "$ pnpm build:ui --profile=trust",
        "$ deploy --scope=frontend --status=ok"
      ]
    },
    {
      title: "Backend контур стабилен",
      track: "backend",
      code: [
        "$ pnpm test:api --critical",
        "$ run migration --safe-mode",
        "$ monitor latency --threshold=80ms"
      ]
    },
    {
      title: "Клиентская итерация закрыта",
      track: "client",
      code: [
        "$ sync feedback --client",
        "$ map goals --mentor --client",
        "$ release impact-report"
      ]
    }
  ];

  let activeTrack = "all";
  const applyRuntimeFilter = () => {
    const rows = [...runtimeListNode.querySelectorAll("li")];
    rows.forEach((row) => {
      const rowTrack = row.dataset.track || "all";
      row.hidden = activeTrack !== "all" && rowTrack !== activeTrack;
    });
  };

  runtimeControlNodes.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeTrack = chip.dataset.track || "all";
      runtimeControlNodes.forEach((node) => {
        node.classList.toggle("is-active", node === chip);
      });
      applyRuntimeFilter();
      chip.classList.remove("is-active");
      void chip.offsetWidth;
      chip.classList.add("is-active");
    });
  });

  const pushRuntime = (snippet) => {
    const row = document.createElement("li");
    row.dataset.track = snippet.track;
    row.textContent = `${snippet.title} • ${new Date().toLocaleTimeString("ru-RU")}`;
    runtimeListNode.prepend(row);
    requestAnimationFrame(() => row.classList.add("is-visible"));
    while (runtimeListNode.children.length > 5) {
      runtimeListNode.removeChild(runtimeListNode.lastElementChild);
    }
    applyRuntimeFilter();
  };

  let snippetIndex = 0;
  let charIndex = 0;
  let mode = "typing";
  let typingStarted = false;

  const tick = () => {
    const snippet = snippets[snippetIndex];
    const text = snippet.code.join("\n");
    if (mode === "typing") {
      charIndex += 2;
      liveCodeNode.textContent = text.slice(0, charIndex);
      if (charIndex >= text.length) {
        mode = "pause";
        codePulseNodes.forEach((node, index) => {
          node.style.animationDelay = `${index * 0.08}s`;
        });
        if (runtimeHeadlineNode) {
          runtimeHeadlineNode.textContent = snippet.title;
        }
        pushRuntime(snippet);
      }
      setTimeout(tick, 18);
      return;
    }
    if (mode === "pause") {
      mode = "deleting";
      setTimeout(tick, 700);
      return;
    }
    charIndex -= 4;
    liveCodeNode.textContent = text.slice(0, Math.max(0, charIndex));
    if (charIndex <= 0) {
      mode = "typing";
      snippetIndex = (snippetIndex + 1) % snippets.length;
    }
    setTimeout(tick, 16);
  };

  const startTyping = () => {
    if (typingStarted) {
      return;
    }
    typingStarted = true;
    charIndex = 0;
    mode = "typing";
    liveCodeNode.textContent = "";
    tick();
  };

  if ("IntersectionObserver" in window) {
    const codeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          startTyping();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
    );
    codeObserver.observe(codeSection);
  } else {
    startTyping();
  }
}

function initTerminalStream() {
  if (isMobileViewport) {
    return;
  }
  const terminalNode = document.querySelector("#terminal-stream");
  if (!terminalNode) {
    return;
  }
  const pool = [
    "boot::mentor feedback loop active",
    "client_goal::convert to measurable UX outcome",
    "render::motion tuned for trust",
    "api_core::stability checks passed",
    "release::production channel green",
    "tracking::engagement curve rising",
    "architecture::scale-ready foundation set",
    "qa::critical path secured"
  ];
  const lines = [];
  const cap = () => Math.max(120, Math.floor(window.innerHeight / 14) + 100);
  let maxLines = cap();

  const push = () => {
    const stamp = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const text = pool[Math.floor(Math.random() * pool.length)];
    lines.push(`[${stamp}] $ ${text}`);
    while (lines.length > maxLines) {
      lines.shift();
    }
  };
  for (let i = 0; i < maxLines; i += 1) {
    push();
  }
  terminalNode.textContent = lines.join("\n");
  setInterval(() => {
    push();
    terminalNode.textContent = lines.join("\n");
  }, prefersReducedMotion ? 480 : 170);
  window.addEventListener("resize", () => {
    maxLines = cap();
  });
}

function initRouteProgress() {
  const routeSection = document.querySelector(".scene--route");
  const progressBar = document.querySelector("#route-progress-bar");
  if (!routeSection || !progressBar) {
    return;
  }
  const update = () => {
    const rect = routeSection.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const start = viewport * 0.92;
    const end = -rect.height * 0.28;
    const value = (start - rect.top) / Math.max(start - end, 1);
    const clamped = THREE.MathUtils.clamp(value, 0, 1);
    progressBar.style.width = `${12 + clamped * 88}%`;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function initTypeOnView() {
  const nodes = [...document.querySelectorAll("[data-type-text]")];
  if (nodes.length === 0 || prefersReducedMotion) {
    return;
  }

  const runTyping = (node) => {
    if (node.dataset.typed === "1") {
      return;
    }
    const text = node.dataset.typeText || node.textContent || "";
    node.dataset.typed = "1";
    node.classList.add("is-typing");
    node.textContent = "";
    let i = 0;
    const step = () => {
      i += 1;
      node.textContent = text.slice(0, i);
      if (i < text.length) {
        setTimeout(step, 20);
      } else {
        node.classList.remove("is-typing");
      }
    };
    step();
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        runTyping(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.45, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((node) => {
    observer.observe(node);
  });
}

function initMagneticButtons() {
  const magneticNodes = [...document.querySelectorAll(".magnetic")];
  magneticNodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const bounds = node.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      node.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}

function initPointerGlow() {
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;
  let rafId = null;
  const root = document.documentElement;
  const update = () => {
    root.style.setProperty("--mx", `${pointerX}px`);
    root.style.setProperty("--my", `${pointerY}px`);
    rafId = null;
  };
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(update);
    }
  });
}

function initHeavyScenes() {
  if (heavyScenesInitialized) {
    return;
  }
  heavyScenesInitialized = true;
  try {
    initEarthScene();
  } catch (error) {
    console.error("Earth scene init failed:", error);
    document.body.classList.add("earth-fallback");
  }
  applyTheme("earth");
}

initPointerGlow();
initMagneticButtons();
initTerminalStream();
initCodeTyping();
initTypeOnView();
initRouteProgress();
initOrbitPhysics();
initPreloaderScene();
