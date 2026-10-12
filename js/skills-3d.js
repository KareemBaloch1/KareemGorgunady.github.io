// Skills 3D floating tiles — Three.js r134
// Uses canvas-drawn textures (name + icon colour) instead of SVG loading,
// which Three.js TextureLoader cannot handle for cross-origin SVGs.

const COLORS = {
  backend: '#7c3aed', ai: '#06b6d4', data: '#10b981', devops: '#f59e0b'
};

function makeTexture(skill) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');

  // Background
  ctx.fillStyle = '#13131f';
  ctx.roundRect(0, 0, size, size, 24);
  ctx.fill();

  // Accent border glow
  const color = COLORS[skill.group] || '#7c3aed';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.roundRect(4, 4, size - 8, size - 8, 20);
  ctx.stroke();

  // Icon placeholder circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 - 28, 44, 0, Math.PI * 2);
  ctx.fillStyle = color + '22';
  ctx.fill();
  ctx.strokeStyle = color + '66';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Skill initial letter (large)
  ctx.fillStyle = color;
  ctx.font = 'bold 52px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(skill.name.charAt(0).toUpperCase(), size / 2, size / 2 - 28);

  // Skill name
  ctx.fillStyle = '#e8e8f0';
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(skill.name, size / 2, size / 2 + 52);

  // Group label
  ctx.fillStyle = color + 'cc';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText(skill.group.toUpperCase(), size / 2, size / 2 + 76);

  const tex = new window.THREE.CanvasTexture(c);
  return tex;
}

export function initSkillsScene(canvasId, skills, onHover) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof window.THREE === 'undefined') return null;
  const THREE = window.THREE;

  const W = canvas.clientWidth  || canvas.parentElement.clientWidth  || 800;
  const H = canvas.clientHeight || canvas.parentElement.clientHeight || 420;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.z = 8;

  const tiles = [];
  const COLS = Math.min(skills.length, Math.ceil(Math.sqrt(skills.length * 1.5)));
  const ROWS = Math.ceil(skills.length / COLS);
  const SPACING_X = 2.4;
  const SPACING_Y = 2.4;

  skills.forEach((skill, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = (col - (COLS - 1) / 2) * SPACING_X;
    const y = (row - (ROWS - 1) / 2) * SPACING_Y * -1;

    const tex = makeTexture(skill);
    const geo = new THREE.PlaneGeometry(1.9, 1.9);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0);
    mesh.userData = { skill, baseY: y, phase: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    tiles.push(mesh);
  });

  // Adjust camera Z based on grid size
  camera.position.z = Math.max(8, ROWS * 2.2);

  let mouse = { x: 0, y: 0 };
  let hoveredTile = null;
  let raf = null;
  let visible = true;

  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  const onMouseMove = e => {
    const rect = canvas.getBoundingClientRect();
    mouseVec.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    mouse.x = mouseVec.x;
    mouse.y = mouseVec.y;

    raycaster.setFromCamera(mouseVec, camera);
    const hits = raycaster.intersectObjects(tiles);
    if (hits.length > 0) {
      const hit = hits[0].object;
      if (hoveredTile !== hit) {
        hoveredTile = hit;
        onHover && onHover(hit.userData.skill, e.clientX, e.clientY);
        canvas.style.cursor = 'pointer';
      }
    } else {
      if (hoveredTile) { hoveredTile = null; onHover && onHover(null); }
      canvas.style.cursor = 'default';
    }
  };

  const onMouseLeave = () => {
    hoveredTile = null;
    onHover && onHover(null);
  };

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);

  const onResize = () => {
    const w = canvas.clientWidth  || canvas.parentElement.clientWidth  || 800;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight || 420;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  window.addEventListener('resize', onResize);

  const obs = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !raf) animate();
  }, { threshold: 0.05 });
  obs.observe(canvas);

  const onVisibility = () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; visible = false; }
    else { visible = true; animate(); }
  };
  document.addEventListener('visibilitychange', onVisibility);

  let t = 0;
  function animate() {
    if (!visible) { raf = null; return; }
    raf = requestAnimationFrame(animate);
    t += 0.007;
    tiles.forEach(tile => {
      tile.position.y = tile.userData.baseY + Math.sin(t + tile.userData.phase) * 0.1;
      tile.rotation.y = mouse.x * 0.2 + Math.sin(t * 0.4 + tile.userData.phase) * 0.04;
      tile.rotation.x = -mouse.y * 0.12;
      // Highlight hovered tile
      const isHovered = tile === hoveredTile;
      tile.scale.setScalar(isHovered ? 1.08 : 1.0);
    });
    renderer.render(scene, camera);
  }
  animate();

  return function cleanup() {
    cancelAnimationFrame(raf);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    obs.disconnect();
    tiles.forEach(m => { m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); });
    renderer.dispose();
  };
}
