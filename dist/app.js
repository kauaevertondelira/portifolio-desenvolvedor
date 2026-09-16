import * as THREE from './vendor/three.module.js';

const motion = matchMedia('(prefers-reduced-motion: reduce)');
let disposePage = () => {};
function mount() {
  const cleanups = [];
  const gsap = window.gsap;
  let context;
  if (gsap && window.ScrollTrigger && !motion.matches) {
    gsap.registerPlugin(window.ScrollTrigger);
    context = gsap.context(() => {
      if (document.querySelector('.hero-copy')) gsap.from('.hero-copy > *, .hero-top', { y: 26, opacity: 0, duration: 1, stagger: .11, ease: 'power3.out', clearProps: 'all' });
      gsap.from('.artifact', { opacity: 0, scale: .86, duration: 1.7, ease: 'power2.out', clearProps: 'transform,opacity' });
      document.querySelectorAll('.section-heading, .work-title, .case-file, .tech-grid article, .profile-frame, .profile-copy, .contact h2, .contact-links a').forEach(el => {
        gsap.from(el, { y: 35, opacity: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 93%', once: true }, clearProps: 'all' });
      });
    });
    cleanups.push(() => context.revert());
  }
  const host = document.querySelector('.canvas-host');
  if (host) {
    try { cleanups.push(createObject(host)); }
    catch (error) { host.parentElement.querySelector('.artifact-fallback')?.removeAttribute('hidden'); console.warn('WebGL indisponível: experiência textual preservada.', error); }
  }
  disposePage = () => cleanups.forEach(fn => fn());
}

function createObject(host) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, 0, 12.7);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  host.appendChild(renderer.domElement);
  const group = new THREE.Group();
  scene.add(group);
  // A beveled, extruded silhouette forms the original low-poly batarang study.
  const points = [[0,.18],[-.33,.35],[-.46,.92],[-.65,.53],[-1.3,.66],[-2.3,1.05],[-3.48,1.9],[-3.13,.45],[-2.85,-.65],[-2.3,-.06],[-1.83,-.73],[-1.35,-.32],[-.65,-1.04],[0,-1.52],[.65,-1.04],[1.35,-.32],[1.83,-.73],[2.3,-.06],[2.85,-.65],[3.13,.45],[3.48,1.9],[2.3,1.05],[1.3,.66],[.65,.53],[.46,.92],[.33,.35]];
  const shape = new THREE.Shape(points.map(([x,y]) => new THREE.Vector2(x,y)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .2, bevelEnabled: true, bevelThickness: .07, bevelSize: .08, bevelSegments: 2, steps: 1 });
  geometry.center();
  const front = new THREE.MeshStandardMaterial({ color: 0x444c49, metalness: .86, roughness: .3 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xa6af89, metalness: .92, roughness: .22 });
  const mesh = new THREE.Mesh(geometry, [front, edge]);
  group.add(mesh);
  const edgeGeometry = new THREE.EdgesGeometry(geometry, 35);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xc3cf96, transparent: true, opacity: .28 });
  group.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));
  const ridgeGeometry = new THREE.ConeGeometry(.17, 1.65, 4);
  const ridge = new THREE.Mesh(ridgeGeometry, edge);
  ridge.rotation.x = Math.PI / 2; ridge.rotation.z = Math.PI / 4;
  ridge.position.set(0, -.05, .16); ridge.scale.set(1, .16, 1);
  group.add(ridge);
  const ambient = new THREE.HemisphereLight(0xd8e1d1, 0x252820, 3);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xe7f3f0, 8); key.position.set(-3, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xdbf34c, 6); rim.position.set(4, -2, 2); scene.add(rim);
  const cool = new THREE.DirectionalLight(0x95aabd, 4); cool.position.set(-5, -2, -2); scene.add(cool);
  const pointer = { x: 0, y: 0 };
  let visible = true, running = true, frame = 0, t = 0, last = 0;
  const move = e => { const r = host.getBoundingClientRect(); pointer.x = (e.clientX-r.left)/r.width-.5; pointer.y = (e.clientY-r.top)/r.height-.5; };
  const leave = () => { pointer.x = 0; pointer.y = 0; };
  host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave);
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w,h); camera.aspect = w/h; camera.position.z = camera.aspect < 1.2 ? 15 : 12.7; camera.updateProjectionMatrix(); };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }); intersection.observe(host);
  group.rotation.set(.18, -.32, -.2);
  const animate = now => {
    if (!running) return;
    frame = requestAnimationFrame(animate);
    const delta = Math.min((now-last)/1000, .05); last = now;
    if (!visible || document.hidden) return;
    const active = !motion.matches;
    if (active) t += delta;
    const targetX = .18 + (active ? pointer.y*.45 : 0);
    const targetY = -.32 + (active ? Math.sin(t*.45)*.16 + pointer.x*.65 : 0);
    group.rotation.x += (targetX-group.rotation.x)*.05;
    group.rotation.y += (targetY-group.rotation.y)*.05;
    group.rotation.z = -.2 + (active ? Math.sin(t*.5)*.05 : 0);
    group.position.y = active ? Math.sin(t*.9)*.14 : 0;
    renderer.render(scene,camera);
  };
  frame = requestAnimationFrame(animate);
  return () => { running=false;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);geometry.dispose();edgeGeometry.dispose();ridgeGeometry.dispose();front.dispose();edge.dispose();edgeMaterial.dispose();renderer.dispose();renderer.domElement.remove(); };
}

mount();
motion.addEventListener('change', () => { disposePage(); mount(); });
