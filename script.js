const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
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

const terminalNode = document.querySelector("#terminal-bg-lines");
const terminalPool = [
  "boot::route [alpha] mission controls online",
  "sync::design + architecture => trust",
  "git commit -m \"ship premium quality\"",
  "deploy/frontend --region=eu-central --status=ok",
  "api::latency 74ms p95 | healthy",
  "render::motion pipeline stable",
  "security::checks passed (0 critical)",
  "optimizer::bundle reduction -18%",
  "ux::interaction confidence +37%",
  "release::version 2.1.0 approved",
  "telemetry::all systems green",
  "db::migrations applied with zero downtime"
];

if (terminalNode) {
  const lineStore = [];
  const estimateLineCap = () => Math.max(130, Math.floor(window.innerHeight / 14) + 120);
  let maxLines = estimateLineCap();

  const renderTerminal = () => {
    terminalNode.textContent = lineStore.join("\n");
  };

  const pushTerminalLine = () => {
    const stamp = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const text = terminalPool[Math.floor(Math.random() * terminalPool.length)];
    lineStore.push(`[${stamp}] $ ${text}`);
    while (lineStore.length > maxLines) {
      lineStore.shift();
    }
  };

  for (let i = 0; i < maxLines; i += 1) {
    pushTerminalLine();
  }
  renderTerminal();

  if (!prefersReducedMotion) {
    setInterval(() => {
      pushTerminalLine();
      renderTerminal();
    }, 160);
  }

  window.addEventListener("resize", () => {
    maxLines = estimateLineCap();
  });
}

if (!prefersReducedMotion) {
  const root = document.documentElement;
  const depthNodes = [...document.querySelectorAll("[data-depth]")];
  const magneticNodes = [...document.querySelectorAll(".magnetic")];
  const tiltNodes = [...document.querySelectorAll(".tilt")];
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;
  let rafId = null;

  function renderMotion() {
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

  renderMotion();

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(renderMotion);
    }
  });

  magneticNodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const bounds = node.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      node.style.transform = `translate(${x * 0.13}px, ${y * 0.13}px)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });

  tiltNodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const bounds = node.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const rotateX = (0.5 - y) * 7;
      const rotateY = (x - 0.5) * 8;
      node.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}
