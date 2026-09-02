/**
 * 7ORVIX Realistic Fluid Physics Engine (Vanilla JS)
 * Standalone, zero-dependency fluid floating simulation loop.
 */
export function initFluidPhysics(config = {}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const viewport = config.viewport || document.getElementById('viewport');
  const floatingLogo = config.floatingLogo || document.getElementById('floating-logo');
  const fullSvg = config.fullSvg || document.getElementById('full-svg');
  const particlesGroup = config.particlesGroup || document.getElementById('particles-group');
  const feDisp = config.feDisp || document.getElementById('fe-disp');
  const feTurb = config.feTurb || document.getElementById('fe-turb');
  const bgGlow = config.bgGlow || document.getElementById('bg-glow');

  if (!viewport || !floatingLogo) {
    console.warn("FluidPhysics: Viewport or floatingLogo element not found.");
    return () => {};
  }

  // Setup Fullscreen SVG ViewBox
  function syncSvgDimensions() {
    if (fullSvg) {
      fullSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    }
  }
  syncSvgDimensions();
  window.addEventListener('resize', syncSvgDimensions);

  // Object Dynamic Center State
  let centerX = window.innerWidth / 2;
  let centerY = window.innerHeight * 0.46;

  const handleResize = () => {
    centerX = window.innerWidth / 2;
    centerY = window.innerHeight * 0.46;
  };
  window.addEventListener('resize', handleResize);

  const bodyState = {
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    angle: 0,
    vAngle: 0,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0
  };

  // Ambient Drifting Particles Array
  const particles = [];
  const NUM_PARTICLES = config.numParticles || 20;

  if (particlesGroup) {
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const p = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 1.2 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.3,
        baseOpacity: 0.12 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        element: null
      };

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", p.radius.toFixed(1));
      circle.setAttribute("fill", "rgba(255, 255, 255, 0.35)");
      circle.setAttribute("filter", "blur(0.5px)");
      particlesGroup.appendChild(circle);
      p.element = circle;

      particles.push(p);
    }
  }

  // Pointer Event Handlers
  const handlePointerDown = (e) => {
    bodyState.isDragging = true;
    bodyState.dragOffsetX = e.clientX - bodyState.x;
    bodyState.dragOffsetY = e.clientY - bodyState.y;
  };

  const handlePointerMove = (e) => {
    if (bodyState.isDragging) {
      const targetX = e.clientX - bodyState.dragOffsetX;
      const targetY = e.clientY - bodyState.dragOffsetY;

      bodyState.vx = (targetX - bodyState.x) * 0.25;
      bodyState.vy = (targetY - bodyState.y) * 0.25;

      bodyState.x = targetX;
      bodyState.y = targetY;
    } else {
      const dx = e.clientX - bodyState.x;
      const dy = e.clientY - bodyState.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 180 && dist > 1) {
        const push = (180 - dist) / 180;
        bodyState.vx -= (dx / dist) * push * 0.4;
        bodyState.vy -= (dy / dist) * push * 0.4;
      }
    }

    if (bgGlow) {
      const glowX = (e.clientX - window.innerWidth / 2) * 0.04;
      const glowY = (e.clientY - window.innerHeight / 2) * 0.04;
      bgGlow.style.transform = `translate(calc(-50% + ${glowX}px), calc(-50% + ${glowY}px))`;
    }
  };

  const handlePointerUp = () => {
    if (bodyState.isDragging) {
      bodyState.isDragging = false;
    }
  };

  viewport.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);

  let time = 0;
  let animId = null;

  function updatePhysics() {
    time += 0.016;

    const floatX = Math.sin(time * 0.7) * 10 + Math.cos(time * 1.2) * 4;
    const floatY = Math.sin(time * 0.9) * 12 + Math.sin(time * 0.45) * 4;

    const targetCenterX = centerX + floatX;
    const targetCenterY = centerY + floatY;

    if (!bodyState.isDragging) {
      const K_CENTER = 0.015;
      bodyState.vx += (targetCenterX - bodyState.x) * K_CENTER;
      bodyState.vy += (targetCenterY - bodyState.y) * K_CENTER;
    }

    const PAD_X = 220;
    const PAD_Y = 110;
    const K_EDGE = 0.06;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    if (bodyState.x < PAD_X) {
      const overlap = PAD_X - bodyState.x;
      bodyState.vx += Math.pow(overlap, 1.1) * K_EDGE;
    }
    if (bodyState.x > screenW - PAD_X) {
      const overlap = bodyState.x - (screenW - PAD_X);
      bodyState.vx -= Math.pow(overlap, 1.1) * K_EDGE;
    }
    if (bodyState.y < PAD_Y) {
      const overlap = PAD_Y - bodyState.y;
      bodyState.vy += Math.pow(overlap, 1.1) * K_EDGE;
    }
    if (bodyState.y > screenH - PAD_Y) {
      const overlap = bodyState.y - (screenH - PAD_Y);
      bodyState.vy -= Math.pow(overlap, 1.1) * K_EDGE;
    }

    const HEAVY_FLUID_DRAG = 0.945;
    bodyState.vx *= HEAVY_FLUID_DRAG;
    bodyState.vy *= HEAVY_FLUID_DRAG;

    if (!bodyState.isDragging) {
      bodyState.x += bodyState.vx;
      bodyState.y += bodyState.vy;
    }

    const targetRoll = (bodyState.vx * 0.008);
    bodyState.vAngle = (bodyState.vAngle + (targetRoll - bodyState.angle) * 0.04) * 0.88;
    bodyState.angle += bodyState.vAngle;

    const offsetX = bodyState.x - centerX;
    const offsetY = bodyState.y - centerY;
    const angleDeg = (bodyState.angle * 180 / Math.PI).toFixed(2);

    floatingLogo.style.transform = `
      translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0px)
      rotate(${angleDeg}deg)
    `;

    const speed = Math.hypot(bodyState.vx, bodyState.vy);
    if (feDisp) {
      const dispScale = (6 + Math.min(speed * 0.8, 8)).toFixed(1);
      feDisp.setAttribute("scale", dispScale);
    }
    if (feTurb) {
      const freqX = (0.006 + Math.sin(time * 0.3) * 0.0015).toFixed(4);
      const freqY = (0.012 + Math.cos(time * 0.5) * 0.002).toFixed(4);
      feTurb.setAttribute("baseFrequency", `${freqX} ${freqY}`);
    }

    particles.forEach(p => {
      p.x += p.vx + Math.sin(time + p.phase) * 0.2;
      p.y += p.vy;

      if (p.y < -20) {
        p.y = window.innerHeight + 20;
        p.x = Math.random() * window.innerWidth;
      }

      const opacity = (p.baseOpacity + Math.sin(time * 2.5 + p.phase) * 0.12).toFixed(2);
      p.element.setAttribute("cx", p.x.toFixed(1));
      p.element.setAttribute("cy", p.y.toFixed(1));
      p.element.setAttribute("opacity", Math.max(0.04, opacity));
    });

    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(updatePhysics);
    }
  }

  if (prefersReducedMotion) {
    floatingLogo.style.transform = `translate3d(0px, 0px, 0px)`;
  } else {
    animId = requestAnimationFrame(updatePhysics);
  }

  // Cleanup Function
  return function destroy() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener('resize', syncSvgDimensions);
    window.removeEventListener('resize', handleResize);
    viewport.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };
}
