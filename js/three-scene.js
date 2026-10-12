// Hero 3D particle field — Three.js r134
export function initHeroScene(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof window.THREE === 'undefined') return;
  const THREE = window.THREE;

  const W = canvas.clientWidth  || window.innerWidth;
  const H = canvas.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.z = 5;

  // Particle field
  const COUNT = 1600;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const c1 = new THREE.Color('#7c3aed');
  const c2 = new THREE.Color('#06b6d4');
  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 14;
    pos[i*3+1] = (Math.random() - 0.5) * 10;
    pos[i*3+2] = (Math.random() - 0.5) * 8;
    const t = Math.random();
    const c = c1.clone().lerp(c2, t);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.8 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Wireframe torus knot accent
  const kGeo = new THREE.TorusKnotGeometry(1.1, 0.3, 100, 14);
  const kMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.15 });
  const knot = new THREE.Mesh(kGeo, kMat);
  scene.add(knot);

  let mouse = { x: 0, y: 0 };
  let scrollY = 0;
  let raf = null;
  let visible = true;

  const onMouseMove = e => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onScroll = () => { scrollY = window.scrollY; };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll, { passive: true });

  const onResize = () => {
    const w = canvas.clientWidth  || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
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
    t += 0.004;
    points.rotation.y = t * 0.1 + mouse.x * 0.12;
    points.rotation.x = mouse.y * 0.06;
    knot.rotation.x = t * 0.25;
    knot.rotation.y = t * 0.4;
    camera.position.y = -scrollY * 0.0015;
    renderer.render(scene, camera);
  }
  animate();

  return function cleanup() {
    cancelAnimationFrame(raf);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    obs.disconnect();
    geo.dispose(); mat.dispose(); kGeo.dispose(); kMat.dispose();
    renderer.dispose();
  };
}
