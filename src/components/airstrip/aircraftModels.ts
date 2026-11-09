import * as THREE from 'three';

// Airline livery color pairs based on callsign
export function getLiveryColors(callsign: string): { primary: number; accent: number; tail: number } {
  const prefix = callsign.slice(0, 3).toUpperCase();
  switch (prefix) {
    case 'AAL':
      return { primary: 0xe2e8f0, accent: 0xdc2626, tail: 0x1d4ed8 }; // American: Silver, Red, Blue
    case 'UAL':
      return { primary: 0x1e3a8a, accent: 0x38bdf8, tail: 0x0f172a }; // United: Deep Blue & Cyan
    case 'DAL':
      return { primary: 0xffffff, accent: 0xb91c1c, tail: 0x1e293b }; // Delta: White, Red, Navy
    case 'SWA':
      return { primary: 0x1d4ed8, accent: 0xf59e0b, tail: 0xdc2626 }; // Southwest: Blue, Orange, Red
    case 'BAW':
      return { primary: 0xf8fafc, accent: 0xb91c1c, tail: 0x1e3a8a }; // British: White, Red, Navy
    case 'DLH':
      return { primary: 0xf1f5f9, accent: 0xeab308, tail: 0x172554 }; // Lufthansa: Yellow & Blue
    case 'AFR':
      return { primary: 0xffffff, accent: 0xef4444, tail: 0x2563eb }; // Air France: White, Blue, Red
    case 'QFA':
      return { primary: 0xffffff, accent: 0xdc2626, tail: 0xdc2626 }; // Qantas: White, Crimson
    default: {
      let hash = 0;
      for (let i = 0; i < callsign.length; i++) {
        hash = callsign.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hues = [0x2563eb, 0x059669, 0xd97706, 0x7c3aed, 0x0284c7, 0x4f46e5];
      const selected = hues[Math.abs(hash) % hues.length];
      return { primary: 0xf8fafc, accent: selected, tail: selected };
    }
  }
}

/**
 * Creates a realistic procedural 3D airplane model oriented forward along +Z.
 * Nose points in +Z (direction of flight travel down runway).
 * Tail, horizontal stabilizers, and swept wings taper toward -Z.
 */
export function createAircraftMesh(
  category: 'Heavy' | 'Medium' | 'Light',
  callsign: string
): { group: THREE.Group; beaconLights: THREE.Mesh[]; landingLight: THREE.SpotLight } {
  const group = new THREE.Group();
  const livery = getLiveryColors(callsign);

  // Category scale factor
  const scale = category === 'Heavy' ? 1.4 : category === 'Medium' ? 1.05 : 0.8;

  // Materials
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: livery.primary,
    metalness: 0.18,
    roughness: 0.32,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: livery.accent,
    metalness: 0.25,
    roughness: 0.3,
  });

  const tailMat = new THREE.MeshStandardMaterial({
    color: livery.tail,
    metalness: 0.22,
    roughness: 0.28,
  });

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.9,
    roughness: 0.08,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.2,
  });

  const engineIntakeMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    metalness: 0.5,
    roughness: 0.6,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.95,
    metalness: 0.05,
  });

  // Dimensions
  const bodyLen = 14 * scale;
  const bodyRad = 0.92 * scale;

  // 1. Fuselage Main Body (Oriented along Z axis)
  const fuselageGeo = new THREE.CylinderGeometry(bodyRad, bodyRad, bodyLen * 0.62, 24);
  fuselageGeo.rotateX(Math.PI / 2);
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  fuselage.position.set(0, 1.25 * scale, 0);
  fuselage.castShadow = true;
  group.add(fuselage);

  // 2. Cockpit & Nose Cone (FORWARD facing +Z)
  const noseLen = bodyLen * 0.24;
  const noseGeo = new THREE.ConeGeometry(bodyRad, noseLen, 24);
  noseGeo.rotateX(Math.PI / 2); // Point cone tip toward +Z (forward)
  const nose = new THREE.Mesh(noseGeo, fuselageMat);
  nose.position.set(0, 1.25 * scale, bodyLen * 0.31 + noseLen * 0.5);
  nose.castShadow = true;
  group.add(nose);

  // Cockpit Windshield Band (Facing forward +Z)
  const visorGeo = new THREE.CylinderGeometry(
    bodyRad * 1.01,
    bodyRad * 1.01,
    0.45 * scale,
    20,
    1,
    false,
    0,
    Math.PI
  );
  visorGeo.rotateX(Math.PI / 2);
  const visor = new THREE.Mesh(visorGeo, windowMat);
  visor.position.set(0, 1.38 * scale, bodyLen * 0.31 + 0.3 * scale);
  group.add(visor);

  // 3. Tail Cone (Tapering aft toward -Z)
  const tailConeLen = bodyLen * 0.28;
  const tailConeGeo = new THREE.CylinderGeometry(0.18 * scale, bodyRad, tailConeLen, 24);
  tailConeGeo.rotateX(Math.PI / 2);
  const tailCone = new THREE.Mesh(tailConeGeo, fuselageMat);
  tailCone.position.set(0, 1.32 * scale, -bodyLen * 0.31 - tailConeLen * 0.5);
  tailCone.castShadow = true;
  group.add(tailCone);

  // 4. Main Wings (Swept backward toward -Z)
  const wingSpan = 16.5 * scale;
  const wingRoot = 3.6 * scale;
  const wingTip = 1.1 * scale;
  const wingThickness = 0.16 * scale;

  // Trapezoidal swept-back wing shape (root at +Z, swept back to -Z)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, wingRoot * 0.5);               // Leading root (+Z)
  wingShape.lineTo(wingSpan * 0.5, -wingTip * 0.8);   // Leading tip (swept aft to -Z)
  wingShape.lineTo(wingSpan * 0.5, -wingTip * 1.6);   // Trailing tip (-Z)
  wingShape.lineTo(0, -wingRoot * 0.5);              // Trailing root (-Z)
  wingShape.closePath();

  const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
    depth: wingThickness,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.04 * scale,
    bevelThickness: 0.04 * scale,
  });
  wingExtrude.rotateX(Math.PI / 2);

  // Right Wing
  const wingRight = new THREE.Mesh(wingExtrude, accentMat);
  wingRight.position.set(0, 1.0 * scale, 0.4 * scale);
  wingRight.castShadow = true;
  group.add(wingRight);

  // Left Wing (Mirrored)
  const wingLeft = wingRight.clone();
  wingLeft.scale.set(-1, 1, 1);
  group.add(wingLeft);

  // Winglets (Vertical upturned tips at wing ends)
  const wingletGeo = new THREE.BoxGeometry(0.08 * scale, 0.95 * scale, 0.7 * scale);
  const wingletR = new THREE.Mesh(wingletGeo, tailMat);
  wingletR.position.set(wingSpan * 0.5, 1.45 * scale, -0.6 * scale);
  wingletR.rotation.z = -0.15;
  group.add(wingletR);

  const wingletL = new THREE.Mesh(wingletGeo, tailMat);
  wingletL.position.set(-wingSpan * 0.5, 1.45 * scale, -0.6 * scale);
  wingletL.rotation.z = 0.15;
  group.add(wingletL);

  // 5. Vertical Stabilizer (Tailfin at aft -Z, swept backward)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);                             // Fin base front
  finShape.lineTo(0, 3.6 * scale);                  // Fin top rear
  finShape.lineTo(-1.1 * scale, 3.6 * scale);        // Fin top tip
  finShape.lineTo(-2.2 * scale, 0);                 // Fin base rear
  finShape.closePath();

  const finExtrude = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.14 * scale,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.02 * scale,
    bevelThickness: 0.02 * scale,
  });
  finExtrude.rotateY(Math.PI / 2);

  const tailfin = new THREE.Mesh(finExtrude, tailMat);
  tailfin.position.set(0, 1.65 * scale, -bodyLen * 0.3);
  tailfin.castShadow = true;
  group.add(tailfin);

  // 6. Horizontal Stabilizers (Tail elevators at rear -Z)
  const hStabSpan = 5.6 * scale;
  const hStabGeo = new THREE.BoxGeometry(hStabSpan, 0.1 * scale, 1.3 * scale);
  const hStab = new THREE.Mesh(hStabGeo, accentMat);
  hStab.position.set(0, 1.7 * scale, -bodyLen * 0.45);
  hStab.castShadow = true;
  group.add(hStab);

  // 7. Jet Engines (Underwing turbofans facing forward +Z)
  const engineRadius = 0.54 * scale;
  const engineLen = 2.5 * scale;
  const engineGeo = new THREE.CylinderGeometry(engineRadius * 0.96, engineRadius, engineLen, 20);
  engineGeo.rotateX(Math.PI / 2);

  const pylonGeo = new THREE.BoxGeometry(0.12 * scale, 0.5 * scale, 1.3 * scale);
  const engineOffset = category === 'Heavy' ? 3.7 * scale : 2.7 * scale;

  [-engineOffset, engineOffset].forEach((posX) => {
    // Engine Cowling
    const engine = new THREE.Mesh(engineGeo, metalMat);
    engine.position.set(posX, 0.5 * scale, 0.4 * scale);
    engine.castShadow = true;

    // Air Intake Fan Disc (Facing forward +Z)
    const fanGeo = new THREE.CircleGeometry(engineRadius * 0.88, 20);
    const fan = new THREE.Mesh(fanGeo, engineIntakeMat);
    fan.position.set(posX, 0.5 * scale, 0.4 * scale + engineLen * 0.5 + 0.01);

    // Intake Spinner Cone in center
    const spinnerGeo = new THREE.ConeGeometry(0.12 * scale, 0.3 * scale, 12);
    spinnerGeo.rotateX(Math.PI / 2);
    const spinner = new THREE.Mesh(spinnerGeo, metalMat);
    spinner.position.set(posX, 0.5 * scale, 0.4 * scale + engineLen * 0.5 + 0.15 * scale);

    // Exhaust Nozzle Rim (Facing aft -Z)
    const exhaustGeo = new THREE.RingGeometry(0.18 * scale, engineRadius * 0.88, 20);
    const exhaust = new THREE.Mesh(exhaustGeo, accentMat);
    exhaust.position.set(posX, 0.5 * scale, 0.4 * scale - engineLen * 0.5 - 0.01);
    exhaust.rotation.y = Math.PI;

    // Mounting Pylon connecting engine to wing
    const pylon = new THREE.Mesh(pylonGeo, fuselageMat);
    pylon.position.set(posX, 0.82 * scale, 0.35 * scale);

    group.add(engine);
    group.add(fan);
    group.add(spinner);
    group.add(exhaust);
    group.add(pylon);
  });

  // 8. Tricycle Landing Gear
  // Forward Nose Gear (At front +Z under cockpit)
  const strutGeo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.9 * scale, 10);
  const noseStrut = new THREE.Mesh(strutGeo, metalMat);
  noseStrut.position.set(0, 0.45 * scale, bodyLen * 0.3);
  group.add(noseStrut);

  const noseTireGeo = new THREE.CylinderGeometry(0.16 * scale, 0.16 * scale, 0.09 * scale, 14);
  noseTireGeo.rotateZ(Math.PI / 2);
  const noseTireL = new THREE.Mesh(noseTireGeo, tireMat);
  noseTireL.position.set(-0.08 * scale, 0.16 * scale, bodyLen * 0.3);
  const noseTireR = new THREE.Mesh(noseTireGeo, tireMat);
  noseTireR.position.set(0.08 * scale, 0.16 * scale, bodyLen * 0.3);
  group.add(noseTireL);
  group.add(noseTireR);

  // Main Landing Gear (Aft under wings at -Z)
  const mainGearOffset = 1.7 * scale;
  [-mainGearOffset, mainGearOffset].forEach((posX) => {
    const mainStrut = new THREE.Mesh(strutGeo, metalMat);
    mainStrut.position.set(posX, 0.45 * scale, -0.6 * scale);
    group.add(mainStrut);

    // Double wheel bogie
    const mainTireGeo = new THREE.CylinderGeometry(0.25 * scale, 0.25 * scale, 0.12 * scale, 14);
    mainTireGeo.rotateZ(Math.PI / 2);

    [-0.18 * scale, 0.18 * scale].forEach((offsetZ) => {
      const tireL = new THREE.Mesh(mainTireGeo, tireMat);
      tireL.position.set(posX - 0.13 * scale, 0.25 * scale, -0.6 * scale + offsetZ);
      const tireR = new THREE.Mesh(mainTireGeo, tireMat);
      tireR.position.set(posX + 0.13 * scale, 0.25 * scale, -0.6 * scale + offsetZ);
      group.add(tireL);
      group.add(tireR);
    });
  });

  // 9. Lighting
  // Red Anti-Collision Beacon Lights (Flashing on fuselage top/bottom)
  const beaconGeo = new THREE.SphereGeometry(0.08 * scale, 8, 8);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const beaconTop = new THREE.Mesh(beaconGeo, beaconMat);
  beaconTop.position.set(0, 2.22 * scale, -0.2 * scale);
  const beaconBottom = new THREE.Mesh(beaconGeo, beaconMat);
  beaconBottom.position.set(0, 0.3 * scale, 0.1 * scale);
  group.add(beaconTop);
  group.add(beaconBottom);

  // Navigation Wingtip lights (Left = Red, Right = Green)
  const redNav = new THREE.Mesh(
    new THREE.SphereGeometry(0.07 * scale, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  redNav.position.set(-wingSpan * 0.5, 1.05 * scale, -0.6 * scale);
  const greenNav = new THREE.Mesh(
    new THREE.SphereGeometry(0.07 * scale, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  greenNav.position.set(wingSpan * 0.5, 1.05 * scale, -0.6 * scale);
  group.add(redNav);
  group.add(greenNav);

  // Forward Landing Light (SpotLight aimed forward along +Z onto runway ahead)
  const landingLight = new THREE.SpotLight(0xfff8ee, 4.2, 140, Math.PI / 5, 0.45, 1.4);
  landingLight.position.set(0, 0.75 * scale, bodyLen * 0.32);
  landingLight.target.position.set(0, 0, bodyLen * 0.32 + 75);
  group.add(landingLight);
  group.add(landingLight.target);

  return {
    group,
    beaconLights: [beaconTop, beaconBottom],
    landingLight,
  };
}
