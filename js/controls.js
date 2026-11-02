// Independent pointers let the left thumb walk while the right thumb turns the camera.
export function stickVector(dx, dy, radius = 48) {
  const distance = Math.hypot(dx, dy);
  if (distance < radius * .12) return { x: 0, z: 0 };
  const scale = Math.min(1, distance / radius) / distance;
  return { x: dx * scale, z: dy * scale };
}

export function createControls({ canvas, stick, knob, active, turn, jump, interact, pause }) {
  const keys = new Set();
  const state = { x: 0, z: 0, running: false };
  let stickId = null, cameraId = null, lastX = 0, lastY = 0;
  function reset() {
    keys.clear(); state.x = state.z = 0;
    for (const [element, id] of [[stick, stickId], [canvas, cameraId]]) {
      if (id !== null && element.hasPointerCapture(id)) element.releasePointerCapture(id);
    }
    stickId = cameraId = null;
    knob.style.transform = 'translate(-50%, -50%)';
  }
  function moveStick(e) {
    if (e.pointerId !== stickId) return;
    const rect = stick.getBoundingClientRect();
    const radius = rect.width * .32;
    const v = stickVector(e.clientX - rect.left - rect.width / 2, e.clientY - rect.top - rect.height / 2, radius);
    state.x = v.x; state.z = v.z;
    knob.style.transform = `translate(calc(-50% + ${v.x * radius}px), calc(-50% + ${v.z * radius}px))`;
  }
  stick.addEventListener('pointerdown', e => {
    if (!active() || stickId !== null) return;
    e.preventDefault(); stickId = e.pointerId; stick.setPointerCapture(stickId); moveStick(e);
  });
  stick.addEventListener('pointermove', moveStick);
  const releaseStick = e => { if (e.pointerId === stickId) { stickId = null; state.x = state.z = 0; knob.style.transform = 'translate(-50%, -50%)'; } };
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) stick.addEventListener(event, releaseStick);
  canvas.addEventListener('pointerdown', e => {
    if (!active() || cameraId !== null) return;
    e.preventDefault(); cameraId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(cameraId);
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerId !== cameraId || !active()) return;
    turn((e.clientX - lastX) * .005, (e.clientY - lastY) * .004);
    lastX = e.clientX; lastY = e.clientY;
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, e => { if (cameraId === e.pointerId) cameraId = null; });
  addEventListener('keydown', e => {
    if (!active()) return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    keys.add(e.code);
    if (!e.repeat) { if (e.code === 'Space') jump(); if (e.code === 'KeyE') interact(); if (e.code === 'Escape') pause(); }
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', reset);
  addEventListener('resize', reset);
  document.addEventListener('visibilitychange', reset);
  return {
    state, reset,
    read() {
      let x = state.x + Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
      let z = state.z + Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'));
      const length = Math.hypot(x, z);
      if (length > 1) { x /= length; z /= length; }
      return { x, z, moving: Math.min(1, length), run: state.running || keys.has('ShiftLeft') || keys.has('ShiftRight') };
    }
  };
}
