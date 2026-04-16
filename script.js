const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const yearNode = document.querySelector("#year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (!prefersReducedMotion) {
  const root = document.documentElement;
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;
  let rafId = null;

  const depthNodes = [...document.querySelectorAll("[data-depth]")];

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

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(renderMotion);
    }
  });

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

  const tiltNodes = [...document.querySelectorAll(".tilt")];
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

const revealNodes = [...document.querySelectorAll(".reveal")];
revealNodes.forEach((node) => {
  if (node.dataset.delay) {
    node.style.setProperty("--delay", `${node.dataset.delay}ms`);
  }
});

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
