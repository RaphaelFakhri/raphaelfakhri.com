const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

if (!reduced && finePointer) {
  document.querySelectorAll('[data-stage]').forEach((stage) => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    const animate = () => {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      stage.style.setProperty('--rx', `${currentX.toFixed(2)}deg`);
      stage.style.setProperty('--ry', `${currentY.toFixed(2)}deg`);
      if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(animate);
    };

    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      targetX = -py * 11;
      targetY = px * 13;
      kick();
    });

    stage.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      kick();
    });
  });
}
