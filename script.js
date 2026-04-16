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

const streamNode = document.querySelector("#stream-lines");
const liveCommandNode = document.querySelector("#live-command");

const streamPool = [
  "git checkout -b launch/next-impact",
  "npm run build --mode=production",
  "docker compose up api gateway redis",
  "curl /health -> 200 stable",
  "pnpm lint && pnpm typecheck",
  "deploy::frontend complete in 48s",
  "telemetry::latency down to 74ms",
  "db migrate --safe --zero-downtime",
  "cache warmup complete for 12 regions",
  "observability stream: all systems green",
  "feature flag rollout at 100%",
  "monitoring alerts: no incidents detected"
];

function rebalanceStreamOpacity() {
  if (!streamNode) {
    return;
  }
  const rows = [...streamNode.children];
  const total = rows.length || 1;
  rows.forEach((row, index) => {
    const opacity = 0.2 + ((index + 1) / total) * 0.65;
    row.style.opacity = String(opacity);
  });
}

function pushStreamLine(text) {
  if (!streamNode) {
    return;
  }
  const row = document.createElement("li");
  row.textContent = text;
  streamNode.append(row);
  requestAnimationFrame(() => {
    row.classList.add("is-in");
  });

  while (streamNode.children.length > 13) {
    streamNode.removeChild(streamNode.firstElementChild);
  }
  rebalanceStreamOpacity();
}

if (streamNode && !prefersReducedMotion) {
  for (let i = 0; i < 8; i += 1) {
    pushStreamLine(streamPool[Math.floor(Math.random() * streamPool.length)]);
  }

  setInterval(() => {
    const stamp = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const command = streamPool[Math.floor(Math.random() * streamPool.length)];
    pushStreamLine(`${stamp} :: ${command}`);
  }, 900);
}

const liveCommands = [
  "ship --beautiful --stable",
  "design + architecture = trust",
  "build interface --premium --fast",
  "commit precision && deploy confidence"
];

if (liveCommandNode) {
  if (prefersReducedMotion) {
    liveCommandNode.textContent = liveCommands[0];
  } else {
    let commandIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const active = liveCommands[commandIndex];
      let delay = deleting ? 38 : 62;

      if (!deleting) {
        charIndex += 1;
        if (charIndex >= active.length) {
          deleting = true;
          delay = 1200;
        }
      } else {
        charIndex -= 1;
        if (charIndex <= 0) {
          deleting = false;
          commandIndex = (commandIndex + 1) % liveCommands.length;
          delay = 280;
        }
      }

      liveCommandNode.textContent = active.slice(0, charIndex);
      setTimeout(tick, delay);
    };

    tick();
  }
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
      const rotateY = (x - 0.5) * 9;
      node.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}
