import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const WORKS = [
  {
    id: 'aubmed',
    num: '01',
    title: 'AUB Mediterraneo',
    role: 'Sole Developer & Designer · 2023–2025',
    summary:
      'Sole owner of the Cyprus campus web platform for two years — 50+ responsive pages, in-page PDF viewer, tree navigation, and 200+ staff requests shipped 100% on time.',
    tags: ['C# / .NET', 'SharePoint', 'JavaScript', '50+ Pages'],
    ctaLabel: 'Visit aubmed.ac.cy ↗',
    ctaHref: 'https://aubmed.ac.cy',
    external: true,
  },
  {
    id: 'zaky',
    num: '02',
    title: 'Zaky',
    role: 'Client Work · Sole Engineer · 2026',
    summary:
      '130+ screen React Native (Expo) tutoring app across iOS, Android, and Web — MMKV offline sync, native Kotlin Credential Manager, LiveKit classrooms, and Python/SymPy/Manim video pipeline.',
    tags: ['React Native', 'Kotlin', 'LiveKit', '760+ Live Reqs'],
    ctaLabel: 'See full architecture ↓',
    ctaHref: '#dossier',
    external: false,
  },
  {
    id: 'oss',
    num: '03',
    title: '739 Merged PRs',
    role: 'Open Source · Verified External PRs',
    summary:
      '739 pull requests reviewed and merged into upstream repositories across Callstack, Software Mansion, RevenueCat, FluentMigrator, Swashbuckle, LiveKit, mediasoup, and Temporal.',
    tags: ['TypeScript', 'C# / .NET', 'Go', 'C++'],
    ctaLabel: 'Verify 739 PRs on GitHub ↗',
    ctaHref:
      'https://github.com/search?q=is%3Apr+author%3ARaphaelFakhri+is%3Amerged+-user%3ARaphaelFakhri&type=pullrequests',
    external: true,
  },
  {
    id: 'systems',
    num: '04',
    title: 'CUDA Heaps & Systems',
    role: 'AUB MSc CS (3.81) · WaveMark · USJ · AI Ops',
    summary:
      'CUDA parallel heaps cutting 10M+ sort time by 88%, eye-tracker/voice VS Code MSc thesis, Cardinal Health ClickHouse/Kafka drift agent, USJ .NET/RabbitMQ SIS, and 24/7 Chatwoot AI support.',
    tags: ['CUDA / C++', 'Python / DSPy', '.NET', 'GPA 3.81'],
    ctaLabel: 'View CUDA Parallel Heaps ↗',
    ctaHref: 'https://github.com/RaphaelFakhri/Generalized_Heaps_Parallel',
    external: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers: Rounded Rectangle Geometry & High-DPI Canvas Textures             */
/* -------------------------------------------------------------------------- */

function createRoundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function createExtrudedSlab(w, h, depth, radius, bevel = 0.03) {
  const shape = createRoundedRectShape(w, h, radius);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 16,
  });
  geo.center();
  return geo;
}

function createRoundedPlaneGeo(w, h, r) {
  const shape = createRoundedRectShape(w, h, r);
  const geo = new THREE.ShapeGeometry(shape, 12);
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) + w / 2) / w;
    uvs[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geo;
}

function createPRCardTexture({ repo, pr, desc, lang, stat }) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 384;
  const ctx = c.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 1024, 384);
  bg.addColorStop(0, '#141416');
  bg.addColorStop(1, '#0c0c0e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 384);

  const glow = ctx.createRadialGradient(180, 40, 10, 180, 40, 460);
  glow.addColorStop(0, 'rgba(216, 168, 120, 0.16)');
  glow.addColorStop(1, 'rgba(216, 168, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 384);

  ctx.strokeStyle = 'rgba(216, 168, 120, 0.36)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 1004, 364);

  ctx.fillStyle = 'rgba(139, 92, 246, 0.24)';
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.78)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(44, 42, 162, 46, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c4b5fd';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText('● MERGED', 68, 73);

  ctx.fillStyle = '#d8a878';
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.fillText(`${pr}  ·  ${lang}`, 228, 73);

  ctx.fillStyle = 'rgba(243, 239, 231, 0.45)';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(stat, 976, 73);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#f3efe7';
  ctx.font = '600 44px "Inter", -apple-system, sans-serif';
  ctx.fillText(repo, 44, 178);

  ctx.fillStyle = '#a8a298';
  ctx.font = '400 28px "Inter", -apple-system, sans-serif';
  ctx.fillText(desc, 44, 240);

  ctx.strokeStyle = 'rgba(243, 239, 231, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(44, 294);
  ctx.lineTo(980, 294);
  ctx.stroke();

  ctx.fillStyle = '#6e6960';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText('AUTHOR: RAPHAELFAKHRI   ·   UPSTREAM EXTERNAL REPOSITORY', 44, 336);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function createSpecPlateTexture(title, lines) {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 448;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#0b0b0d';
  ctx.fillRect(0, 0, 768, 448);

  ctx.strokeStyle = 'rgba(216, 168, 120, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 768; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 448);
    ctx.stroke();
  }
  for (let y = 0; y < 448; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(768, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(216, 168, 120, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, 744, 424);

  ctx.fillStyle = '#d8a878';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(title, 44, 72);

  ctx.fillStyle = '#a8a298';
  ctx.font = '400 22px "JetBrains Mono", monospace';
  lines.forEach((line, idx) => {
    ctx.fillText(line, 44, 134 + idx * 46);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* -------------------------------------------------------------------------- */
/* Three.js WebGL 3D Artifacts                                                */
/* -------------------------------------------------------------------------- */

function buildAubmedArtifact(textures, wireframeMaterials) {
  const group = new THREE.Group();

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x1b1b1e,
    metalness: 0.88,
    roughness: 0.22,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd8a878,
    metalness: 0.92,
    roughness: 0.2,
  });
  wireframeMaterials.push(titaniumMat, brassMat);

  const chassis = new THREE.Mesh(createExtrudedSlab(3.65, 2.3, 0.11, 0.11, 0.025), titaniumMat);
  chassis.userData.baseZ = 0;
  chassis.userData.explodeZ = -0.06;
  group.add(chassis);

  const brassBack = new THREE.Mesh(createExtrudedSlab(3.71, 2.36, 0.03, 0.12, 0.015), brassMat);
  brassBack.position.z = -0.055;
  brassBack.userData.baseZ = -0.055;
  brassBack.userData.explodeZ = -0.46;
  group.add(brassBack);

  const screenMat = new THREE.MeshStandardMaterial({
    map: textures.aubmed,
    roughness: 0.16,
    metalness: 0.05,
    emissive: 0xffffff,
    emissiveMap: textures.aubmed,
    emissiveIntensity: 0.38,
  });
  const screen = new THREE.Mesh(createRoundedPlaneGeo(3.44, 2.08, 0.06), screenMat);
  screen.position.z = 0.088;
  screen.userData.baseZ = 0.088;
  screen.userData.explodeZ = 0.56;
  group.add(screen);

  const specTex = createSpecPlateTexture('AUBMED.AC.CY // PRODUCTION ARCHITECTURE', [
    'ROLE      SOLE DEVELOPER & DESIGNER',
    'TENURE    2 YEARS (2023–2025)',
    'SURFACE   50+ RESPONSIVE CAMPUS PAGES',
    'DELIVERY  200+ STAFF REQUESTS · 100% ON TIME',
    'STACK     C# / .NET · SHAREPOINT · JS',
  ]);
  const specMat = new THREE.MeshStandardMaterial({
    map: specTex,
    roughness: 0.3,
    metalness: 0.25,
    emissive: 0xffffff,
    emissiveMap: specTex,
    emissiveIntensity: 0.24,
  });
  const specPlate = new THREE.Mesh(createRoundedPlaneGeo(2.76, 1.62, 0.05), specMat);
  specPlate.position.z = -0.09;
  specPlate.rotation.y = Math.PI;
  specPlate.userData.baseZ = -0.09;
  specPlate.userData.explodeZ = -0.82;
  group.add(specPlate);

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd8a878,
    metalness: 0.9,
    roughness: 0.2,
    transparent: true,
    opacity: 0.45,
  });
  wireframeMaterials.push(ringMat);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.009, 12, 96), ringMat);
  ring.rotation.x = Math.PI * 0.44;
  ring.rotation.y = -0.18;
  ring.userData.spinZ = 0.12;
  group.add(ring);

  return group;
}

function buildPhoneUnit(screenTexture, wireframeMaterials) {
  const phone = new THREE.Group();

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x262523,
    metalness: 0.92,
    roughness: 0.22,
  });
  const brassEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xd8a878,
    metalness: 0.94,
    roughness: 0.2,
  });
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x090b10,
    metalness: 0.95,
    roughness: 0.08,
  });
  wireframeMaterials.push(titaniumMat, brassEdgeMat);

  const body = new THREE.Mesh(createExtrudedSlab(1.26, 2.62, 0.11, 0.19, 0.024), titaniumMat);
  body.userData.baseZ = 0;
  body.userData.explodeZ = -0.08;
  phone.add(body);

  const rim = new THREE.Mesh(createExtrudedSlab(1.285, 2.645, 0.045, 0.195, 0.01), brassEdgeMat);
  rim.userData.baseZ = 0;
  rim.userData.explodeZ = -0.26;
  phone.add(rim);

  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTexture,
    roughness: 0.14,
    metalness: 0.05,
    emissive: 0xffffff,
    emissiveMap: screenTexture,
    emissiveIntensity: 0.42,
  });
  const screen = new THREE.Mesh(createRoundedPlaneGeo(1.15, 2.49, 0.15), screenMat);
  screen.position.z = 0.084;
  screen.userData.baseZ = 0.084;
  screen.userData.explodeZ = 0.48;
  phone.add(screen);

  const island = new THREE.Mesh(
    createRoundedPlaneGeo(0.3, 0.072, 0.034),
    new THREE.MeshBasicMaterial({ color: 0x050506 })
  );
  island.position.set(0, 1.13, 0.089);
  island.userData.baseZ = 0.089;
  island.userData.explodeZ = 0.52;
  phone.add(island);

  const camDeck = new THREE.Mesh(createExtrudedSlab(0.54, 0.54, 0.04, 0.11, 0.012), titaniumMat);
  camDeck.position.set(-0.25, 0.89, -0.09);
  camDeck.userData.baseZ = -0.09;
  camDeck.userData.explodeZ = -0.42;
  phone.add(camDeck);

  [
    [-0.12, 0.12],
    [-0.12, -0.12],
    [0.12, 0.0],
  ].forEach(([lx, ly]) => {
    const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 24), brassEdgeMat);
    lensRing.rotation.x = Math.PI / 2;
    lensRing.position.set(-0.25 + lx, 0.89 + ly, -0.12);
    lensRing.userData.baseZ = -0.12;
    lensRing.userData.explodeZ = -0.52;
    phone.add(lensRing);

    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.045, 24), lensMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(-0.25 + lx, 0.89 + ly, -0.125);
    glass.userData.baseZ = -0.125;
    glass.userData.explodeZ = -0.53;
    phone.add(glass);
  });

  return phone;
}

function buildZakyArtifact(textures, wireframeMaterials) {
  const group = new THREE.Group();

  const frontPhone = buildPhoneUnit(textures.zaky1, wireframeMaterials);
  frontPhone.position.set(-0.46, -0.05, 0.24);
  frontPhone.rotation.set(0.04, 0.16, -0.03);
  frontPhone.userData.baseX = -0.46;
  frontPhone.userData.explodeX = -0.88;
  group.add(frontPhone);

  const backPhone = buildPhoneUnit(textures.zaky2, wireframeMaterials);
  backPhone.position.set(0.62, 0.14, -0.34);
  backPhone.rotation.set(-0.04, -0.22, 0.04);
  backPhone.scale.setScalar(0.92);
  backPhone.userData.baseX = 0.62;
  backPhone.userData.explodeX = 1.04;
  group.add(backPhone);

  const haloMat = new THREE.MeshStandardMaterial({
    color: 0xd8a878,
    metalness: 0.92,
    roughness: 0.2,
    transparent: true,
    opacity: 0.38,
  });
  wireframeMaterials.push(haloMat);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.08, 0.008, 12, 96), haloMat);
  halo.rotation.x = Math.PI * 0.48;
  halo.rotation.y = 0.25;
  halo.userData.spinZ = -0.14;
  group.add(halo);

  return group;
}

function buildOssArtifact(wireframeMaterials) {
  const group = new THREE.Group();

  const cardSpecs = [
    {
      repo: 'fluentmigrator/fluentmigrator',
      pr: '#2384',
      desc: 'NULL semantics consistency across 8 SQL database engines',
      lang: 'C# / .NET',
      stat: 'UPSTREAM',
      pos: [0.0, 0.7, 0.34],
      rot: [0.06, -0.1, 0.01],
      explodeZ: 0.85,
    },
    {
      repo: 'livekit/livekit',
      pr: '#5135',
      desc: 'WebRTC RTX payload-type negotiation reliability fix',
      lang: 'GO / WEBRTC',
      stat: 'UPSTREAM',
      pos: [0.16, 0.0, 0.0],
      rot: [0.02, -0.04, -0.01],
      explodeZ: 0.0,
    },
    {
      repo: 'callstack/react-native-brownfield',
      pr: '#519',
      desc: 'iOS NSNumber boxing fix for native bridge interop',
      lang: 'SWIFT / RN',
      stat: 'UPSTREAM',
      pos: [-0.14, -0.7, -0.32],
      rot: [-0.04, 0.08, 0.01],
      explodeZ: -0.85,
    },
  ];

  const slabMat = new THREE.MeshStandardMaterial({
    color: 0x17171a,
    metalness: 0.85,
    roughness: 0.25,
  });
  wireframeMaterials.push(slabMat);

  cardSpecs.forEach((spec) => {
    const holder = new THREE.Group();
    holder.position.set(...spec.pos);
    holder.rotation.set(...spec.rot);
    holder.userData.baseZ = spec.pos[2];
    holder.userData.explodeZ = spec.explodeZ;

    const backing = new THREE.Mesh(createExtrudedSlab(3.12, 1.16, 0.06, 0.08, 0.015), slabMat);
    holder.add(backing);

    const tex = createPRCardTexture(spec);
    const faceMat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.22,
      metalness: 0.08,
      emissive: 0xffffff,
      emissiveMap: tex,
      emissiveIntensity: 0.45,
    });
    const face = new THREE.Mesh(createRoundedPlaneGeo(3.04, 1.08, 0.055), faceMat);
    face.position.z = 0.048;
    holder.add(face);

    const backFace = new THREE.Mesh(createRoundedPlaneGeo(3.04, 1.08, 0.055), faceMat);
    backFace.position.z = -0.048;
    backFace.rotation.y = Math.PI;
    holder.add(backFace);

    group.add(holder);
  });

  // Exactly 739 orbiting luminous points — 1 particle per verified merged PR
  const prCount = 739;
  const positions = new Float32Array(prCount * 3);
  const colors = new Float32Array(prCount * 3);
  const cBrass = new THREE.Color(0xd8a878);
  const cAlabaster = new THREE.Color(0xf3efe7);
  const cViolet = new THREE.Color(0xa78bfa);

  for (let i = 0; i < prCount; i++) {
    const t = (i / prCount) * Math.PI * 2;
    const band = (i % 7) - 3;
    const radius = 2.02 + (i % 19) * 0.045 + Math.sin(i * 1.7) * 0.14;
    const y = band * 0.14 + Math.cos(i * 2.3) * 0.16;
    positions[i * 3] = Math.cos(t * 3 + i * 0.13) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(t * 3 + i * 0.13) * radius;

    const pick = i % 5 === 0 ? cViolet : i % 2 === 0 ? cBrass : cAlabaster;
    colors[i * 3] = pick.r;
    colors[i * 3 + 1] = pick.g;
    colors[i * 3 + 2] = pick.b;
  }

  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  ptsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const prRing = new THREE.Points(
    ptsGeo,
    new THREE.PointsMaterial({
      size: 0.042,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      sizeAttenuation: true,
    })
  );
  prRing.rotation.x = 0.34;
  prRing.rotation.z = -0.18;
  prRing.userData.spinY = 0.24;
  group.add(prRing);

  return group;
}

function buildCudaHeapArtifact(wireframeMaterials) {
  const group = new THREE.Group();

  const levels = [
    { count: 1, radius: 0.0, y: 1.24, size: 0.175 },
    { count: 4, radius: 0.76, y: 0.42, size: 0.12 },
    { count: 12, radius: 1.44, y: -0.42, size: 0.084 },
    { count: 24, radius: 2.02, y: -1.24, size: 0.06 },
  ];

  const nodes = [];
  const nodeMeshes = [];
  const edgePositions = [];
  const nodeGeo = new THREE.SphereGeometry(1, 20, 20);

  levels.forEach((lvl, li) => {
    const levelNodes = [];
    for (let i = 0; i < lvl.count; i++) {
      const angle = (i / lvl.count) * Math.PI * 2 + li * 0.35;
      const pos = new THREE.Vector3(Math.cos(angle) * lvl.radius, lvl.y, Math.sin(angle) * lvl.radius);
      const isRoot = li === 0;
      const mat = new THREE.MeshStandardMaterial({
        color: isRoot ? 0xd8a878 : li === 1 ? 0x9ec5e8 : 0x5d728a,
        emissive: isRoot ? 0xd8a878 : 0x7cc4fa,
        emissiveIntensity: isRoot ? 0.65 : 0.2,
        metalness: 0.85,
        roughness: 0.2,
      });
      wireframeMaterials.push(mat);

      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.position.copy(pos);
      mesh.scale.setScalar(lvl.size);
      mesh.userData = {
        level: li,
        baseY: lvl.y,
        explodeY: lvl.y * 1.35,
        baseSize: lvl.size,
      };
      group.add(mesh);
      nodeMeshes.push(mesh);
      levelNodes.push(pos);

      if (li > 0) {
        const prev = nodes[li - 1];
        const parentPos = prev[Math.floor((i / lvl.count) * prev.length)];
        edgePositions.push(parentPos.x, parentPos.y, parentPos.z, pos.x, pos.y, pos.z);
      }
    }
    nodes.push(levelNodes);
  });

  levels.forEach((lvl, li) => {
    if (li === 0) return;
    const arr = nodes[li];
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      const b = arr[(i + 1) % arr.length];
      edgePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  });

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
  group.add(
    new THREE.LineSegments(
      edgeGeo,
      new THREE.LineBasicMaterial({ color: 0xd8a878, transparent: true, opacity: 0.42 })
    )
  );

  const ringMat1 = new THREE.MeshStandardMaterial({
    color: 0x7cc4fa,
    metalness: 0.9,
    roughness: 0.25,
    transparent: true,
    opacity: 0.35,
  });
  const ringMat2 = new THREE.MeshStandardMaterial({
    color: 0xd8a878,
    metalness: 0.9,
    roughness: 0.2,
    transparent: true,
    opacity: 0.45,
  });
  wireframeMaterials.push(ringMat1, ringMat2);

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.008, 12, 96), ringMat1);
  ring1.rotation.x = Math.PI * 0.42;
  ring1.userData.spinZ = 0.18;
  group.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.48, 0.007, 12, 96), ringMat2);
  ring2.rotation.x = -Math.PI * 0.36;
  ring2.rotation.y = 0.42;
  ring2.userData.spinZ = -0.14;
  group.add(ring2);

  group.userData.heapNodes = nodeMeshes;
  return group;
}

/* -------------------------------------------------------------------------- */
/* Software / Non-WebGL True 3D Interactive Fallback Engine (Canvas2D+CSS3D)  */
/* Ensures zero blank/broken screens even on non-GPU headless or VDI browsers */
/* -------------------------------------------------------------------------- */

function startSpatialFallback({ canvas, stageWrap, fallbackEl, fpsEl, getState, reducedMotion }) {
  if (fallbackEl) fallbackEl.hidden = false;
  const ctx = canvas.getContext('2d');
  const rigs = Array.from(document.querySelectorAll('[data-fallback-rig]'));

  // Precompute 739 orbital PR particles + 41-node 3D CUDA parallel heap
  const prStars = Array.from({ length: 739 }, (_, i) => {
    const a = (i / 739) * Math.PI * 2;
    const band = (i % 7) - 3;
    const r = 1.9 + (i % 19) * 0.055 + Math.sin(i * 1.7) * 0.15;
    return {
      x: Math.cos(a * 3 + i * 0.13) * r,
      y: band * 0.15 + Math.cos(i * 2.3) * 0.16,
      z: Math.sin(a * 3 + i * 0.13) * r,
      color: i % 5 === 0 ? '#a78bfa' : i % 2 === 0 ? '#d8a878' : '#f3efe7',
      size: i % 5 === 0 ? 2.1 : 1.4,
    };
  });

  const heapLevels = [
    { count: 1, radius: 0.0, y: -1.18, r: 10 },
    { count: 4, radius: 0.78, y: -0.4, r: 7 },
    { count: 12, radius: 1.46, y: 0.4, r: 5 },
    { count: 24, radius: 2.02, y: 1.18, r: 3.5 },
  ];
  const heapNodes = [];
  const heapEdges = [];
  const byLevel = [];
  heapLevels.forEach((lvl, li) => {
    const cur = [];
    for (let i = 0; i < lvl.count; i++) {
      const ang = (i / lvl.count) * Math.PI * 2 + li * 0.35;
      const idx = heapNodes.length;
      heapNodes.push({
        x: Math.cos(ang) * lvl.radius,
        y: lvl.y,
        z: Math.sin(ang) * lvl.radius,
        level: li,
        r: lvl.r,
      });
      cur.push(idx);
      if (li > 0) {
        const prev = byLevel[li - 1];
        heapEdges.push([prev[Math.floor((i / lvl.count) * prev.length)], idx]);
      }
    }
    if (li > 0) {
      for (let i = 0; i < cur.length; i++) {
        heapEdges.push([cur[i], cur[(i + 1) % cur.length]]);
      }
    }
    byLevel.push(cur);
  });

  let w = 1;
  let h = 1;
  let dpr = 1;
  function resize() {
    const r = stageWrap.getBoundingClientRect();
    w = Math.max(1, Math.floor(r.width));
    h = Math.max(1, Math.floor(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  resize();
  window.addEventListener('resize', resize);

  function project(x, y, z, yaw, pitch, cx, cy, scale) {
    const cyaw = Math.cos(yaw);
    const syaw = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    const x1 = x * cyaw - z * syaw;
    const z1 = x * syaw + z * cyaw;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const persp = 5.4 / (5.4 - z2);
    return { x: cx + x1 * scale * persp, y: cy + y2 * scale * persp, z: z2, s: persp };
  }

  let frames = 0;
  let fpsLast = performance.now();
  const start = performance.now();

  function tick() {
    requestAnimationFrame(tick);
    const now = performance.now();
    const t = (now - start) / 1000;

    frames++;
    if (now - fpsLast >= 600) {
      const fps = Math.round((frames * 1000) / (now - fpsLast));
      if (fpsEl) fpsEl.textContent = `FPS ${Math.min(120, fps)}`;
      frames = 0;
      fpsLast = now;
    }

    const { activeIndex, pointerX, pointerY, dragRotY, dragRotX, xrayActive } = getState();

    // Sync CSS 3D rigs
    rigs.forEach((rig) => {
      const idx = Number(rig.dataset.fallbackRig);
      const isActive = idx === activeIndex;
      rig.classList.toggle('is-active', isActive);
      if (isActive) {
        const yawDeg =
          (reducedMotion ? -10 : Math.sin(t * 0.55) * 7 - 8) + pointerX * 14 + dragRotY * 52;
        const pitchDeg =
          (reducedMotion ? 4 : Math.cos(t * 0.45) * 3 + 4) - pointerY * 10 - dragRotX * 42;
        rig.style.transform = `rotateX(${pitchDeg.toFixed(2)}deg) rotateY(${yawDeg.toFixed(2)}deg)`;
      }
    });

    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w >= 960 ? w * 0.66 : w * 0.5;
    const cy = w >= 960 ? h * 0.42 : h * 0.5;
    const scale = Math.min(w, h) * (w >= 960 ? 0.175 : 0.22);
    const yaw = (reducedMotion ? 0.3 : t * 0.26) + pointerX * 0.3 + dragRotY;
    const pitch = 0.24 + pointerY * 0.16 + dragRotX;

    // Orbital ring halo behind every sculpture
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.14 + pointerX * 0.06);
    ctx.strokeStyle = xrayActive ? 'rgba(124, 196, 250, 0.34)' : 'rgba(216, 168, 120, 0.22)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.ellipse(0, 0, scale * 2.15, scale * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Artifact 03: 739 orbiting merged-PR stars projected in 3D
    if (activeIndex === 2) {
      prStars.forEach((p) => {
        const pr = project(p.x, p.y, p.z, yaw * 1.15, pitch + 0.18, cx, cy, scale * 1.08);
        const alpha = Math.max(0.18, Math.min(0.95, 0.45 + pr.z * 0.24));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, p.size * pr.s, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // Artifact 04: Real-time 41-node 3D CUDA Parallel Heap lattice with live heapify wave
    if (activeIndex === 3) {
      const yMult = xrayActive ? 1.3 : 1.0;
      const projected = heapNodes.map((n) =>
        project(n.x, n.y * yMult, n.z, yaw, pitch, cx, cy, scale * 1.06)
      );

      // Edges
      ctx.strokeStyle = xrayActive ? 'rgba(124, 196, 250, 0.52)' : 'rgba(216, 168, 120, 0.42)';
      ctx.lineWidth = 1.1;
      heapEdges.forEach(([a, b]) => {
        const pa = projected[a];
        const pb = projected[b];
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      // Nodes with traveling bottom-up GPU heapify pulse
      const wave = (t * 1.65) % 4.5;
      projected.forEach((p, idx) => {
        const lvl = heapNodes[idx].level;
        const dist = Math.abs(3 - lvl - wave);
        const pulse = Math.max(0, 1 - dist * 1.15);
        const rad = heapNodes[idx].r * p.s * (1 + pulse * 0.35);

        if (pulse > 0.1 || lvl === 0) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 3.2);
          g.addColorStop(
            0,
            lvl === 0 ? 'rgba(216, 168, 120, 0.85)' : 'rgba(124, 196, 250, 0.72)'
          );
          g.addColorStop(1, 'rgba(124, 196, 250, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = lvl === 0 ? '#ecc59b' : pulse > 0.3 ? '#9ed8ff' : '#8da9c4';
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  tick();
}

/* -------------------------------------------------------------------------- */
/* Main Controller                                                            */
/* -------------------------------------------------------------------------- */

function init() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let xrayActive = false;

  /* 1. Live Beirut Clock */
  const clockEl = document.getElementById('telemetry-clock');
  function updateClock() {
    if (!clockEl) return;
    try {
      const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Beirut',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      clockEl.textContent = `BEIRUT ${fmt.format(new Date())}`;
    } catch {
      clockEl.textContent = 'BEIRUT EET';
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* 2. Real LCP Telemetry */
  const lcpEl = document.getElementById('telemetry-lcp');
  if (lcpEl && 'PerformanceObserver' in window) {
    try {
      const po = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) lcpEl.textContent = `LCP ${(last.startTime / 1000).toFixed(2)}s`;
      });
      po.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      lcpEl.textContent = 'LCP <0.4s';
    }
  }

  /* 3. Copy Email + Toast */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  }

  function copyEmail() {
    const email = 'mail@raphaelfakhri.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(
        () => showToast('Copied mail@raphaelfakhri.com'),
        () => showToast(email)
      );
    } else {
      showToast(email);
    }
  }

  document.querySelectorAll('[data-copy-email]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      copyEmail();
    });
  });

  /* 4. Tactile Physics ID Badge */
  const badgeEl = document.querySelector('[data-badge]');
  if (badgeEl && !reducedMotion) {
    let bx = 0;
    let by = 0;
    let tx = 0;
    let ty = 0;

    badgeEl.addEventListener('pointermove', (e) => {
      const r = badgeEl.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tx = nx * 16;
      ty = -ny * 14;
      badgeEl.style.setProperty('--gx', `${(nx + 0.5) * 100}%`);
      badgeEl.style.setProperty('--gy', `${(ny + 0.5) * 100}%`);
    });

    badgeEl.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
    });

    const tickBadge = () => {
      bx += (tx - bx) * 0.14;
      by += (ty - by) * 0.14;
      badgeEl.style.transform = `perspective(700px) rotateX(${by.toFixed(2)}deg) rotateY(${bx.toFixed(2)}deg)`;
      requestAnimationFrame(tickBadge);
    };
    requestAnimationFrame(tickBadge);
  }

  /* 5. Active Work UI Sync */
  const workRows = Array.from(document.querySelectorAll('[data-work-index]'));
  const capNum = document.getElementById('caption-num');
  const capTitle = document.getElementById('caption-title');
  const capRole = document.getElementById('caption-role');
  const capSummary = document.getElementById('caption-summary');
  const capTags = document.getElementById('caption-tags');
  const capCta = document.getElementById('caption-cta');

  function setActiveWork(idx) {
    activeIndex = ((idx % WORKS.length) + WORKS.length) % WORKS.length;
    const item = WORKS[activeIndex];

    workRows.forEach((row) => {
      const match = Number(row.dataset.workIndex) === activeIndex;
      row.classList.toggle('is-active', match);
      row.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    if (capNum) capNum.textContent = `${item.num} / 0${WORKS.length}`;
    if (capTitle) capTitle.textContent = item.title;
    if (capRole) capRole.textContent = item.role;
    if (capSummary) capSummary.textContent = item.summary;
    if (capTags) {
      capTags.innerHTML = '';
      item.tags.forEach((t) => {
        const span = document.createElement('span');
        span.textContent = t;
        capTags.appendChild(span);
      });
    }
    if (capCta) {
      capCta.textContent = item.ctaLabel;
      capCta.setAttribute('href', item.ctaHref);
      if (item.external) {
        capCta.setAttribute('target', '_blank');
        capCta.setAttribute('rel', 'noopener noreferrer');
      } else {
        capCta.removeAttribute('target');
        capCta.removeAttribute('rel');
      }
    }
  }

  workRows.forEach((row) => {
    const idx = Number(row.dataset.workIndex);
    row.addEventListener('mouseenter', () => setActiveWork(idx));
    row.addEventListener('focus', () => setActiveWork(idx));
    row.addEventListener('click', () => setActiveWork(idx));
  });

  document.getElementById('btn-prev')?.addEventListener('click', () => setActiveWork(activeIndex - 1));
  document.getElementById('btn-next')?.addEventListener('click', () => setActiveWork(activeIndex + 1));

  /* 6. X-Ray / Exploded Wireframe Toggle */
  const xrayBtn = document.getElementById('telemetry-xray');
  const holdXrayBtn = document.getElementById('hold-xray-btn');

  function setXray(next) {
    xrayActive = Boolean(next);
    document.body.classList.toggle('is-xray', xrayActive);
    if (xrayBtn) {
      xrayBtn.classList.toggle('is-active', xrayActive);
      xrayBtn.textContent = xrayActive ? 'X-RAY ON [W]' : 'X-RAY [W]';
    }
  }

  xrayBtn?.addEventListener('click', () => setXray(!xrayActive));
  if (holdXrayBtn) {
    holdXrayBtn.addEventListener('pointerdown', () => setXray(true));
    holdXrayBtn.addEventListener('pointerup', () => setXray(false));
    holdXrayBtn.addEventListener('pointerleave', () => {
      if (xrayActive) setXray(false);
    });
  }

  /* 7. Command Palette (⌘K) */
  const paletteEl = document.getElementById('cmd-palette');
  const paletteInput = document.getElementById('cmd-input');
  const paletteList = document.getElementById('cmd-list');
  const paletteOpenBtn = document.getElementById('telemetry-cmdk');

  const commands = [
    { label: '01 · AUB Mediterraneo (aubmed.ac.cy)', meta: '3D Stage', run: () => setActiveWork(0) },
    { label: '02 · Zaky (130+ Screen React Native App)', meta: '3D Stage', run: () => setActiveWork(1) },
    { label: '03 · 739 Merged Open-Source PRs', meta: '3D Stage', run: () => setActiveWork(2) },
    { label: '04 · CUDA Parallel Heaps & MSc (3.81)', meta: '3D Stage', run: () => setActiveWork(3) },
    { label: 'Toggle 3D X-Ray / Wireframe Mode', meta: 'Key W', run: () => setXray(!xrayActive) },
    {
      label: 'Open Interactive CV',
      meta: '/cv/',
      run: () => {
        window.location.href = '/cv/';
      },
    },
    {
      label: 'Download 1-Page PDF CV',
      meta: 'PDF',
      run: () => window.open('/cv/Raphael_Fakhri_CV.pdf', '_blank', 'noopener'),
    },
    {
      label: 'Verify 739 Merged PRs on GitHub',
      meta: 'GitHub ↗',
      run: () => window.open(WORKS[2].ctaHref, '_blank', 'noopener'),
    },
    {
      label: 'Visit aubmed.ac.cy',
      meta: 'Live ↗',
      run: () => window.open('https://aubmed.ac.cy', '_blank', 'noopener'),
    },
    { label: 'Copy Email (mail@raphaelfakhri.com)', meta: 'Clipboard', run: () => copyEmail() },
    {
      label: 'Jump to Full Background Dossier',
      meta: '#dossier',
      run: () => document.getElementById('dossier')?.scrollIntoView({ behavior: 'smooth' }),
    },
  ];

  let cmdFiltered = commands;
  let cmdSelected = 0;

  function renderPalette() {
    if (!paletteList) return;
    paletteList.innerHTML = '';
    cmdFiltered.forEach((cmd, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cmd-item${i === cmdSelected ? ' is-selected' : ''}`;
      btn.innerHTML = `<span>${cmd.label}</span><kbd>${cmd.meta}</kbd>`;
      btn.addEventListener('mouseenter', () => {
        cmdSelected = i;
        renderPalette();
      });
      btn.addEventListener('click', () => {
        closePalette();
        cmd.run();
      });
      paletteList.appendChild(btn);
    });
  }

  function openPalette() {
    if (!paletteEl) return;
    paletteEl.hidden = false;
    cmdFiltered = commands;
    cmdSelected = 0;
    if (paletteInput) {
      paletteInput.value = '';
      paletteInput.focus();
    }
    renderPalette();
  }

  function closePalette() {
    if (!paletteEl) return;
    paletteEl.hidden = true;
  }

  paletteOpenBtn?.addEventListener('click', openPalette);
  paletteEl?.addEventListener('click', (e) => {
    if (e.target === paletteEl) closePalette();
  });

  paletteInput?.addEventListener('input', () => {
    const q = paletteInput.value.trim().toLowerCase();
    cmdFiltered = commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.meta.toLowerCase().includes(q)
    );
    cmdSelected = 0;
    renderPalette();
  });

  window.addEventListener('keydown', (e) => {
    const isPaletteOpen = paletteEl && !paletteEl.hidden;

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isPaletteOpen ? closePalette() : openPalette();
      return;
    }

    if (isPaletteOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        cmdSelected = (cmdSelected + 1) % Math.max(1, cmdFiltered.length);
        renderPalette();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cmdSelected = (cmdSelected - 1 + Math.max(1, cmdFiltered.length)) % Math.max(1, cmdFiltered.length);
        renderPalette();
      } else if (e.key === 'Enter' && cmdFiltered[cmdSelected]) {
        e.preventDefault();
        const chosen = cmdFiltered[cmdSelected];
        closePalette();
        chosen.run();
      }
      return;
    }

    if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.key >= '1' && e.key <= '4') {
      setActiveWork(Number(e.key) - 1);
    } else if (e.key.toLowerCase() === 'w') {
      setXray(!xrayActive);
    } else if (e.key === 'ArrowRight') {
      setActiveWork(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      setActiveWork(activeIndex - 1);
    }
  });

  setActiveWork(0);

  /* 8. Shared Pointer & Drag-to-Orbit Physics */
  const canvas = document.getElementById('stage-canvas');
  const stageWrap = document.getElementById('stage-viewport');
  const fallbackEl = document.getElementById('stage-fallback');
  const fpsEl = document.getElementById('telemetry-fps');
  if (!canvas || !stageWrap) return;

  let pointerX = 0;
  let pointerY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragRotY = 0;
  let dragRotX = 0;
  let targetDragY = 0;
  let targetDragX = 0;

  window.addEventListener(
    'pointermove',
    (e) => {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
      if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        targetDragY += dx * 0.0085;
        targetDragX = THREE.MathUtils.clamp(targetDragX + dy * 0.0065, -0.75, 0.75);
      }
    },
    { passive: true }
  );

  stageWrap.addEventListener('pointerdown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    stageWrap.classList.add('is-dragging');
  });

  const endDrag = () => {
    isDragging = false;
    stageWrap.classList.remove('is-dragging');
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  /* 9. Real-Time Three.js WebGL Stage (with seamless Canvas2D+CSS3D fallback) */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    const updateFallbackDrag = () => {
      if (!isDragging) {
        targetDragY *= 0.95;
        targetDragX *= 0.95;
      }
      dragRotY += (targetDragY - dragRotY) * 0.12;
      dragRotX += (targetDragX - dragRotX) * 0.12;
      requestAnimationFrame(updateFallbackDrag);
    };
    requestAnimationFrame(updateFallbackDrag);

    startSpatialFallback({
      canvas,
      stageWrap,
      fallbackEl,
      fpsEl,
      reducedMotion,
      getState: () => ({ activeIndex, pointerX, pointerY, dragRotY, dragRotX, xrayActive }),
    });
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070708, 0.055);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  camera.position.set(0, 0.0, 7.6);

  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  } catch {
    // Graceful lighting without env map
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
  keyLight.position.set(4.5, 5.2, 5.5);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xd8a878, 6.8, 16);
  rimLight.position.set(-4.2, 2.4, -2.5);
  scene.add(rimLight);

  const coolFill = new THREE.PointLight(0x7cc4fa, 3.4, 16);
  coolFill.position.set(3.5, -3.2, 2.2);
  scene.add(coolFill);

  const dustCount = 180;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    dustPos[i * 3 + 2] = -2 - Math.random() * 7;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPos, 3));
  const dustPoints = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xd8a878,
      size: 0.028,
      transparent: true,
      opacity: 0.34,
    })
  );
  scene.add(dustPoints);

  const loader = new THREE.TextureLoader();
  const loadTex = (url) => {
    const t = loader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  };
  const textures = {
    aubmed: loadTex('/work-aubmed.jpg'),
    zaky1: loadTex('/work-zaky-1.jpg'),
    zaky2: loadTex('/work-zaky-2.jpg'),
  };

  const wireframeMaterials = [];
  const stageRoot = new THREE.Group();
  scene.add(stageRoot);

  const artifacts = [
    buildAubmedArtifact(textures, wireframeMaterials),
    buildZakyArtifact(textures, wireframeMaterials),
    buildOssArtifact(wireframeMaterials),
    buildCudaHeapArtifact(wireframeMaterials),
  ];

  artifacts.forEach((art, i) => {
    art.visible = i === 0;
    art.scale.setScalar(i === 0 ? 1 : 0.001);
    stageRoot.add(art);
  });

  function resize() {
    const rect = stageWrap.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    if (w >= 960) {
      stageRoot.position.set(1.18, 0.56, 0);
      camera.position.z = 7.45;
    } else if (w >= 640) {
      stageRoot.position.set(0.35, 0.3, 0);
      camera.position.z = 8.1;
    } else {
      stageRoot.position.set(0, 0.15, 0);
      camera.position.z = 8.8;
    }
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let lastIdx = activeIndex;
  let explodeAmount = 0;
  let frames = 0;
  let fpsLast = performance.now();
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    frames++;
    const now = performance.now();
    if (now - fpsLast >= 600) {
      const fps = Math.round((frames * 1000) / (now - fpsLast));
      if (fpsEl) fpsEl.textContent = `FPS ${Math.min(120, fps)}`;
      frames = 0;
      fpsLast = now;
    }

    if (lastIdx !== activeIndex) {
      targetDragY = -0.35;
      targetDragX = 0;
      lastIdx = activeIndex;
    }

    if (!isDragging) {
      targetDragY *= 0.965;
      targetDragX *= 0.965;
    }

    dragRotY += (targetDragY - dragRotY) * 0.1;
    dragRotX += (targetDragX - dragRotX) * 0.1;

    const targetExplode = xrayActive ? 1 : 0;
    explodeAmount += (targetExplode - explodeAmount) * 0.1;

    wireframeMaterials.forEach((m) => {
      const wantWire = explodeAmount > 0.35;
      if (m.wireframe !== wantWire) m.wireframe = wantWire;
    });

    artifacts.forEach((art, i) => {
      const isCurrent = i === activeIndex;
      const targetScale = isCurrent ? 1 : 0.001;
      const s = THREE.MathUtils.lerp(art.scale.x, targetScale, 0.14);
      art.scale.setScalar(s);
      art.visible = s > 0.015;
      if (!art.visible) return;

      const floatY = reducedMotion ? 0 : Math.sin(t * 1.15 + i) * 0.07;
      art.position.y = floatY;

      const idleYaw = reducedMotion ? -0.18 : Math.sin(t * 0.42) * 0.15 - 0.16;
      const targetY = idleYaw + pointerX * 0.24 + dragRotY;
      const targetX = pointerY * 0.14 + dragRotX;
      art.rotation.y += (targetY - art.rotation.y) * 0.1;
      art.rotation.x += (targetX - art.rotation.x) * 0.1;

      art.traverse((child) => {
        if (child.userData.baseZ !== undefined && child.userData.explodeZ !== undefined) {
          child.position.z = THREE.MathUtils.lerp(
            child.userData.baseZ,
            child.userData.explodeZ,
            explodeAmount
          );
        }
        if (child.userData.baseX !== undefined && child.userData.explodeX !== undefined) {
          child.position.x = THREE.MathUtils.lerp(
            child.userData.baseX,
            child.userData.explodeX,
            explodeAmount
          );
        }
        if (child.userData.baseY !== undefined && child.userData.explodeY !== undefined) {
          child.position.y = THREE.MathUtils.lerp(
            child.userData.baseY,
            child.userData.explodeY,
            explodeAmount
          );
        }
        if (!reducedMotion && child.userData.spinZ) {
          child.rotation.z += child.userData.spinZ * dt * (1 + explodeAmount * 1.6);
        }
        if (!reducedMotion && child.userData.spinY) {
          child.rotation.y += child.userData.spinY * dt * (1 + explodeAmount * 1.8);
        }
      });

      if (art.userData.heapNodes && !reducedMotion) {
        const wave = (t * 1.6) % 4.5;
        art.userData.heapNodes.forEach((node) => {
          const dist = Math.abs(3 - node.userData.level - wave);
          const pulse = Math.max(0, 1 - dist * 1.15);
          node.material.emissiveIntensity =
            (node.userData.level === 0 ? 0.55 : 0.18) + pulse * 1.15;
          node.scale.setScalar(node.userData.baseSize * (1 + pulse * 0.28));
        });
      }
    });

    if (!reducedMotion) {
      dustPoints.rotation.y = t * 0.018 + pointerX * 0.04;
      dustPoints.rotation.x = pointerY * 0.03;
    }

    renderer.render(scene, camera);
  }

  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
