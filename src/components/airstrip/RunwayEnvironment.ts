import * as THREE from 'three';

export interface RunwayDimensions {
  length: number;      // e.g. 360 units (scaled runway)
  width: number;       // e.g. 18 units
  thresholdZ: number;  // e.g. -140
  touchdownZ: number;  // e.g. -100
  rolloutEndZ: number; // e.g. 140
}

export const RUNWAY_DIMENSIONS: RunwayDimensions = {
  length: 340,
  width: 18,
  thresholdZ: -140,
  touchdownZ: -95,
  rolloutEndZ: 150,
};

/**
 * Builds the complete procedural airport airfield:
 * Runway, markings, approach lights, PAPI lights, taxiway, tower, and smoke system.
 */
export function buildAirfieldEnvironment(scene: THREE.Scene): {
  smokeParticles: THREE.Points;
  triggerTouchdownSmoke: (x: number, y: number, z: number) => void;
  updatePapi: (time: number) => void;
} {
  const { length, width, thresholdZ } = RUNWAY_DIMENSIONS;

  // 1. Airfield Ground Terrain (Grassy terrain)
  const terrainGeo = new THREE.PlaneGeometry(1200, 1200);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x3d6b46, // Lush airfield grass
    roughness: 0.9,
    metalness: 0.05,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  scene.add(terrain);

  // Runway Safety Shoulder / Base Graded Dirt/Sand buffer
  const shoulderGeo = new THREE.PlaneGeometry(width * 2.2, length + 80);
  const shoulderMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Dark slate shoulder / tarmac buffer
    roughness: 0.95,
  });
  const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
  shoulder.rotation.x = -Math.PI / 2;
  shoulder.position.set(0, 0.01, 0);
  shoulder.receiveShadow = true;
  scene.add(shoulder);

  // 2. Main Asphalt Runway
  const runwayGeo = new THREE.PlaneGeometry(width, length);
  const runwayMat = new THREE.MeshStandardMaterial({
    color: 0x1e242b, // Dark asphalt
    roughness: 0.85,
    metalness: 0.1,
  });
  const runway = new THREE.Mesh(runwayGeo, runwayMat);
  runway.rotation.x = -Math.PI / 2;
  runway.position.set(0, 0.03, 0);
  runway.receiveShadow = true;
  scene.add(runway);

  // 3. Markings Materials (White and Yellow)
  const markWhiteMat = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const markYellowMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  // Runway Edge Lines (Continuous solid white stripes)
  [-width * 0.46, width * 0.46].forEach((posX) => {
    const edgeLineGeo = new THREE.PlaneGeometry(0.4, length);
    const edgeLine = new THREE.Mesh(edgeLineGeo, markWhiteMat);
    edgeLine.rotation.x = -Math.PI / 2;
    edgeLine.position.set(posX, 0.04, 0);
    scene.add(edgeLine);
  });

  // Runway Centerline Dashes (Dashed white stripes)
  const dashCount = 35;
  const dashLength = 4.5;
  const dashGap = 5.0;
  const startZ = -length * 0.45;
  for (let i = 0; i < dashCount; i++) {
    const dashZ = startZ + i * (dashLength + dashGap);
    if (dashZ > length * 0.45) break;
    const dashGeo = new THREE.PlaneGeometry(0.5, dashLength);
    const dash = new THREE.Mesh(dashGeo, markWhiteMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.04, dashZ);
    scene.add(dash);
  }

  // Threshold Piano Keys (8 white stripes at runway threshold)
  const keyCount = 10;
  const keyWidth = 0.8;
  const keyLen = 10;
  const keyGap = (width * 0.8) / (keyCount - 1);
  for (let i = 0; i < keyCount; i++) {
    const posX = -width * 0.4 + i * keyGap;
    const keyGeo = new THREE.PlaneGeometry(keyWidth, keyLen);
    const key = new THREE.Mesh(keyGeo, markWhiteMat);
    key.rotation.x = -Math.PI / 2;
    key.position.set(posX, 0.04, thresholdZ + keyLen * 0.5 + 2);
    scene.add(key);
  }

  // Aiming Point Markers (Two large thick rectangular blocks at touchdown zone)
  const aimingLen = 14;
  const aimingWidth = 2.2;
  [-width * 0.25, width * 0.25].forEach((posX) => {
    const aimingGeo = new THREE.PlaneGeometry(aimingWidth, aimingLen);
    const aimingMesh = new THREE.Mesh(aimingGeo, markWhiteMat);
    aimingMesh.rotation.x = -Math.PI / 2;
    aimingMesh.position.set(posX, 0.04, thresholdZ + 45);
    scene.add(aimingMesh);
  });

  // Touchdown Zone Marker Pairs
  [22, 65, 85].forEach((dist) => {
    [-width * 0.28, width * 0.28].forEach((posX) => {
      const pairGeo = new THREE.PlaneGeometry(1.2, 7);
      const pairMesh = new THREE.Mesh(pairGeo, markWhiteMat);
      pairMesh.rotation.x = -Math.PI / 2;
      pairMesh.position.set(posX, 0.04, thresholdZ + dist);
      scene.add(pairMesh);
    });
  });

  // 4. High-Speed Exit Taxiway (Angled turn-off at 30° toward apron)
  const exitTaxiwayGeo = new THREE.PlaneGeometry(10, 75);
  const exitTaxiway = new THREE.Mesh(exitTaxiwayGeo, runwayMat);
  exitTaxiway.rotation.x = -Math.PI / 2;
  exitTaxiway.rotation.z = THREE.MathUtils.degToRad(-32);
  exitTaxiway.position.set(22, 0.035, 10);
  scene.add(exitTaxiway);

  // Parallel Taxiway
  const parallelTaxiwayGeo = new THREE.PlaneGeometry(10, length + 40);
  const parallelTaxiway = new THREE.Mesh(parallelTaxiwayGeo, runwayMat);
  parallelTaxiway.rotation.x = -Math.PI / 2;
  parallelTaxiway.position.set(45, 0.032, 0);
  scene.add(parallelTaxiway);

  // Yellow Taxiway Centerline
  const taxiCenterGeo = new THREE.PlaneGeometry(0.35, length + 40);
  const taxiCenter = new THREE.Mesh(taxiCenterGeo, markYellowMat);
  taxiCenter.rotation.x = -Math.PI / 2;
  taxiCenter.position.set(45, 0.04, 0);
  scene.add(taxiCenter);

  // 5. Lighting Fixtures
  // Runway Edge Lights (Instanced fixtures)
  const lightCountPerSide = 34;
  const lightSpacing = length / (lightCountPerSide - 1);
  const edgeLightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8);
  const whiteBulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const amberBulbMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const greenBulbMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const redBulbMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  for (let i = 0; i < lightCountPerSide; i++) {
    const lz = -length * 0.5 + i * lightSpacing;
    const isAmberZone = lz > length * 0.25; // Amber in final 1/4 of runway

    [-width * 0.5 - 0.4, width * 0.5 + 0.4].forEach((lx) => {
      const fixture = new THREE.Mesh(edgeLightGeo, isAmberZone ? amberBulbMat : whiteBulbMat);
      fixture.position.set(lx, 0.2, lz);
      scene.add(fixture);
    });
  }

  // Threshold Green Light Bar
  for (let i = 0; i < 14; i++) {
    const greenLight = new THREE.Mesh(edgeLightGeo, greenBulbMat);
    greenLight.position.set(-width * 0.48 + i * (width * 0.96 / 13), 0.2, thresholdZ - 0.5);
    scene.add(greenLight);
  }

  // Runway End Red Light Bar
  for (let i = 0; i < 14; i++) {
    const redLight = new THREE.Mesh(edgeLightGeo, redBulbMat);
    redLight.position.set(-width * 0.48 + i * (width * 0.96 / 13), 0.2, length * 0.5 + 0.5);
    scene.add(redLight);
  }

  // Approach Lighting System (ALS) extending out 120 units before threshold
  const alsCrossbars = [
    { z: thresholdZ - 20, width: 8 },
    { z: thresholdZ - 40, width: 12 },
    { z: thresholdZ - 60, width: 18 }, // Master crossbar
    { z: thresholdZ - 80, width: 12 },
    { z: thresholdZ - 100, width: 8 },
  ];

  alsCrossbars.forEach(({ z, width: barW }) => {
    const numLights = 5;
    for (let j = 0; j < numLights; j++) {
      const lx = -barW * 0.5 + j * (barW / (numLights - 1));
      const alsBulb = new THREE.Mesh(edgeLightGeo, whiteBulbMat);
      alsBulb.position.set(lx, 0.4, z);
      scene.add(alsBulb);
    }
  });

  // PAPI (Precision Approach Path Indicator: 4 lights beside touchdown point)
  const papiMeshes: THREE.Mesh[] = [];
  const papiBoxGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
  for (let i = 0; i < 4; i++) {
    const papiBox = new THREE.Mesh(papiBoxGeo, whiteBulbMat.clone());
    papiBox.position.set(-width * 0.5 - 4 - i * 1.6, 0.35, thresholdZ + 45);
    scene.add(papiBox);
    papiMeshes.push(papiBox);
  }

  const updatePapi = (_time: number) => {
    // 2 White (too high), 2 Red (on glide path)
    (papiMeshes[0].material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
    (papiMeshes[1].material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
    (papiMeshes[2].material as THREE.MeshBasicMaterial).color.setHex(0xdc2626);
    (papiMeshes[3].material as THREE.MeshBasicMaterial).color.setHex(0xdc2626);
  };

  // 6. Air Traffic Control (ATC) Tower
  const towerGroup = new THREE.Group();
  const towerBaseGeo = new THREE.CylinderGeometry(2.5, 3.5, 32, 12);
  const towerBaseMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.6,
  });
  const towerBase = new THREE.Mesh(towerBaseGeo, towerBaseMat);
  towerBase.position.y = 16;
  towerBase.castShadow = true;
  towerGroup.add(towerBase);

  // Cab glass observation room
  const cabGeo = new THREE.CylinderGeometry(5.2, 3.8, 5.5, 12);
  const cabMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.8,
    roughness: 0.1,
  });
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.y = 33;
  towerGroup.add(cab);

  // Tower Roof & Radar Dome
  const roofGeo = new THREE.ConeGeometry(5.5, 2.5, 12);
  const roof = new THREE.Mesh(roofGeo, towerBaseMat);
  roof.position.y = 36.5;
  towerGroup.add(roof);

  const radomeGeo = new THREE.SphereGeometry(1.6, 12, 12);
  const radomeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const radome = new THREE.Mesh(radomeGeo, radomeMat);
  radome.position.y = 38.5;
  towerGroup.add(radome);

  towerGroup.position.set(75, 0, -20);
  scene.add(towerGroup);

  // 7. Touchdown Smoke Particle System
  const smokeCount = 120;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePositions = new Float32Array(smokeCount * 3);
  const smokeVelocities = new Float32Array(smokeCount * 3);
  const smokeLifes = new Float32Array(smokeCount);

  for (let i = 0; i < smokeCount; i++) {
    smokePositions[i * 3 + 1] = -100; // Inactive underground
    smokeLifes[i] = 0;
  }

  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));

  const smokeMat = new THREE.PointsMaterial({
    color: 0xd1d5db,
    size: 2.2,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });

  const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
  scene.add(smokeParticles);

  let particlePointer = 0;
  const triggerTouchdownSmoke = (x: number, y: number, z: number) => {
    const burstCount = 28;
    for (let i = 0; i < burstCount; i++) {
      const idx = (particlePointer + i) % smokeCount;
      smokePositions[idx * 3] = x + (Math.random() - 0.5) * 2.0;
      smokePositions[idx * 3 + 1] = y + 0.2;
      smokePositions[idx * 3 + 2] = z + (Math.random() - 0.5) * 2.0;

      smokeVelocities[idx * 3] = (Math.random() - 0.5) * 3.5;
      smokeVelocities[idx * 3 + 1] = 0.8 + Math.random() * 1.5;
      smokeVelocities[idx * 3 + 2] = 2.0 + Math.random() * 4.0; // Pushed backward by aircraft motion

      smokeLifes[idx] = 1.0;
    }
    particlePointer = (particlePointer + burstCount) % smokeCount;
    smokeGeo.attributes.position.needsUpdate = true;
  };

  return {
    smokeParticles,
    triggerTouchdownSmoke,
    updatePapi,
  };
}
