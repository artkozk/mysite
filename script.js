import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const preloader = document.querySelector("#preloader");
const preloaderBar = document.querySelector("#preloader-bar");
const preloaderStatus = document.querySelector("#preloader-status");

const resourceState = {
  loaded: 0,
  total: 8
};

function markLoaded(label) {
  resourceState.loaded += 1;
  const progress = Math.min(100, Math.round((resourceState.loaded / resourceState.total) * 100));
  if (preloaderBar) {
    preloaderBar.style.width = `${progress}%`;
  }
  if (preloaderStatus) {
    preloaderStatus.textContent = `${label} • ${progress}%`;
  }
}

function hidePreloader() {
  if (!preloader) {
    return;
  }
  preloader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
}

const preloaderFailSafe = setTimeout(() => {
  hidePreloader();
}, 8000);

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
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealNodes.forEach((node) => {
    revealObserver.observe(node);
  });
} else {
  revealNodes.forEach((node) => {
    node.classList.add("is-visible");
  });
}

const videoNodes = [...document.querySelectorAll(".video-ribbon video")];
videoNodes.forEach((videoNode, index) => {
  const loaded = () => {
    markLoaded(`Видео-слой ${index + 1}`);
  };
  if (videoNode.readyState >= 2) {
    loaded();
  } else {
    videoNode.addEventListener("loadeddata", loaded, { once: true });
    videoNode.addEventListener("error", loaded, { once: true });
  }
  videoNode.play().catch(() => {});
});

const terminalNode = document.querySelector("#terminal-stream");
const terminalPool = [
  "boot::mentorship feedback loop engaged",
  "client_brief::translate business goal into product flow",
  "ui_engine::motion layer calibrated for trust",
  "api_core::stability check passed",
  "perf_scan::critical path optimized",
  "mentor_review::iteration accepted",
  "deploy::production channel green",
  "telemetry::engagement trend rising",
  "support::post-release monitoring active",
  "craft::turn complexity into clarity"
];

if (terminalNode) {
  const lines = [];
  const lineCap = () => Math.max(120, Math.floor(window.innerHeight / 14) + 110);
  let maxLines = lineCap();

  const render = () => {
    terminalNode.textContent = lines.join("\n");
  };

  const push = () => {
    const stamp = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const message = terminalPool[Math.floor(Math.random() * terminalPool.length)];
    lines.push(`[${stamp}] $ ${message}`);
    while (lines.length > maxLines) {
      lines.shift();
    }
  };

  for (let i = 0; i < maxLines; i += 1) {
    push();
  }
  render();
  markLoaded("Терминальный поток");

  if (!prefersReducedMotion) {
    setInterval(() => {
      push();
      render();
    }, 180);
  }

  window.addEventListener("resize", () => {
    maxLines = lineCap();
  });
}

const mentorNodes = [...document.querySelectorAll(".orbit-node")];
const mentorTitle = document.querySelector("#mentor-title");
const mentorCopy = document.querySelector("#mentor-copy");

mentorNodes.forEach((node) => {
  node.addEventListener("click", () => {
    mentorNodes.forEach((item) => item.classList.remove("is-active"));
    node.classList.add("is-active");
    if (mentorTitle) {
      mentorTitle.textContent = node.dataset.title || "";
    }
    if (mentorCopy) {
      mentorCopy.textContent = node.dataset.copy || "";
    }
  });
});

const root = document.documentElement;
const depthNodes = [...document.querySelectorAll("[data-depth]")];
let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.5;
let rafId = null;

function renderParallax() {
  root.style.setProperty("--mx", `${pointerX}px`);
  root.style.setProperty("--my", `${pointerY}px`);

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const ratioX = (pointerX - centerX) / centerX;
  const ratioY = (pointerY - centerY) / centerY;

  depthNodes.forEach((node) => {
    const depth = Number(node.getAttribute("data-depth")) || 0;
    node.style.setProperty("--px", `${ratioX * depth}px`);
    node.style.setProperty("--py", `${ratioY * depth}px`);
  });

  rafId = null;
}

renderParallax();

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (!rafId) {
    rafId = requestAnimationFrame(renderParallax);
  }
});

const magneticNodes = [...document.querySelectorAll(".magnetic")];
if (!prefersReducedMotion) {
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

const tiltNodes = [...document.querySelectorAll(".tilt")];
if (!prefersReducedMotion) {
  tiltNodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const bounds = node.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const rotateX = (0.5 - y) * 7;
      const rotateY = (x - 0.5) * 9;
      node.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}

const canvas = document.querySelector("#earth-canvas");
if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    44,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.2, 7.2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambient = new THREE.AmbientLight(0x7796cc, 0.7);
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(6, 2, 5);
  const rim = new THREE.DirectionalLight(0x6ac2ff, 0.6);
  rim.position.set(-4, -1, -3);
  scene.add(ambient, key, rim);

  const starGeo = new THREE.BufferGeometry();
  const starCount = 1400;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 120;
    positions[i3 + 1] = (Math.random() - 0.5) * 100;
    positions[i3 + 2] = (Math.random() - 0.5) * 120;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xaed3ff,
      size: 0.09,
      transparent: true,
      opacity: 0.55
    })
  );
  scene.add(stars);

  const textureLoader = new THREE.TextureLoader();
  const loadTexture = (url, label) =>
    new Promise((resolve) => {
      textureLoader.load(
        url,
        (texture) => {
          markLoaded(label);
          resolve(texture);
        },
        undefined,
        () => {
          markLoaded(label);
          resolve(null);
        }
      );
    });

  Promise.all([
    loadTexture(
      "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
      "Земля: albedo"
    ),
    loadTexture(
      "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
      "Земля: normal"
    ),
    loadTexture(
      "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg",
      "Земля: specular"
    ),
    loadTexture(
      "https://threejs.org/examples/textures/planets/earth_clouds_1024.png",
      "Земля: clouds"
    )
  ]).then(([albedo, normal, specular, clouds]) => {
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, 0.05, 0);

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x4f84d8,
      shininess: 22
    });
    if (albedo) {
      albedo.colorSpace = THREE.SRGBColorSpace;
      earthMaterial.map = albedo;
    }
    if (normal) {
      earthMaterial.normalMap = normal;
      earthMaterial.normalScale = new THREE.Vector2(0.9, 0.9);
    }
    if (specular) {
      earthMaterial.specularMap = specular;
      earthMaterial.specular = new THREE.Color(0x436699);
    }

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(2.36, 120, 120),
      earthMaterial
    );
    earthGroup.add(globe);

    if (clouds) {
      const cloudMaterial = new THREE.MeshPhongMaterial({
        map: clouds,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      const cloudMesh = new THREE.Mesh(
        new THREE.SphereGeometry(2.4, 80, 80),
        cloudMaterial
      );
      earthGroup.add(cloudMesh);
    }

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 56, 56),
      new THREE.MeshBasicMaterial({
        color: 0x72b2ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
      })
    );
    earthGroup.add(glow);
    scene.add(earthGroup);

    let dragActive = false;
    let lastX = 0;
    let lastY = 0;
    let spinVelocity = 0;

    const nearEarth = (x, y) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.52;
      const r = Math.min(window.innerWidth, window.innerHeight) * 0.34;
      return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2;
    };

    window.addEventListener("pointerdown", (event) => {
      if (!nearEarth(event.clientX, event.clientY)) {
        return;
      }
      dragActive = true;
      lastX = event.clientX;
      lastY = event.clientY;
    });

    window.addEventListener("pointermove", (event) => {
      if (!dragActive) {
        return;
      }
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      globe.rotation.y += dx * 0.005;
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + dy * 0.002, -0.4, 0.4);
      spinVelocity = dx * 0.0007;
      lastX = event.clientX;
      lastY = event.clientY;
    });

    window.addEventListener("pointerup", () => {
      dragActive = false;
    });
    window.addEventListener("pointercancel", () => {
      dragActive = false;
    });

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      stars.rotation.y = t * 0.01;
      globe.rotation.y += (prefersReducedMotion ? 0.0002 : 0.00095) + spinVelocity;
      spinVelocity *= 0.96;
      earthGroup.rotation.z = Math.sin(t * 0.18) * 0.03;

      if (earthGroup.children[1]) {
        earthGroup.children[1].rotation.y += 0.00135;
      }

      renderer.render(scene, camera);
    };
    animate();

    markLoaded("3D сцена");
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

const waitForReady = setInterval(() => {
  if (resourceState.loaded >= resourceState.total) {
    clearInterval(waitForReady);
    clearTimeout(preloaderFailSafe);
    setTimeout(hidePreloader, 450);
  }
}, 120);
