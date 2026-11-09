import { ScheduledAircraft } from '../../types/alp';
import { RUNWAY_DIMENSIONS } from './RunwayEnvironment';

export interface AircraftFlightState {
  aircraftId: number;
  callsign: string;
  category: 'Heavy' | 'Medium' | 'Light';
  landingTime: number;
  phase: 'enroute' | 'final_approach' | 'touchdown' | 'rollout' | 'vacating' | 'cleared';
  x: number;
  y: number;
  z: number;
  pitch: number; // Pitch up/down radians
  yaw: number;   // Heading radians
  roll: number;  // Bank angle radians
  speedKts: number;
  altitudeFt: number;
  distanceToTouchdownM: number;
  justTouchedDown: boolean;
  isVisible: boolean;
}

export function computeAircraftKinematics(
  aircraft: ScheduledAircraft,
  currentTime: number,
  prevTime: number
): AircraftFlightState {
  const { touchdownZ } = RUNWAY_DIMENSIONS;
  const tLand = aircraft.landingTime;
  const dt = currentTime - tLand; // Seconds relative to touchdown
  const prevDt = prevTime - tLand;

  // Touchdown detector for smoke effect
  const justTouchedDown = prevDt < 0 && dt >= 0;

  // Approach configuration
  const approachDuration = 26; // 26 seconds on final approach
  const rolloutDuration = 12;  // 12 seconds rollout before exit
  const vacateDuration = 10;   // 10 seconds to vacate runway

  // Phase 1: Enroute / In Holding (More than 26s before landing)
  if (dt < -approachDuration) {
    const timeBeforeFinal = -dt - approachDuration;
    const distanceFar = 320 + timeBeforeFinal * 18;
    return {
      aircraftId: aircraft.aircraftId,
      callsign: aircraft.callsign,
      category: aircraft.category,
      landingTime: tLand,
      phase: 'enroute',
      x: 0,
      y: 65 + timeBeforeFinal * 3.5,
      z: touchdownZ - distanceFar,
      pitch: -0.05,
      yaw: 0,
      roll: 0,
      speedKts: 160,
      altitudeFt: Math.round(1800 + timeBeforeFinal * 120),
      distanceToTouchdownM: Math.round(distanceFar * 12),
      justTouchedDown: false,
      isVisible: timeBeforeFinal < 20, // Render when reasonably close
    };
  }

  // Phase 2: Final Approach (dt in [-26, 0])
  if (dt < 0) {
    const approachProgress = (dt + approachDuration) / approachDuration; // 0 (start) -> 1 (touchdown)
    const startZ = touchdownZ - 280;
    const currentZ = startZ + approachProgress * 280;

    // Glide slope: 52 down to 0
    let currentY = (1 - approachProgress) * 52;

    // Flare in the last 3.5 seconds
    let pitch = 0.048; // +2.8° descent pitch down
    if (dt > -3.5) {
      const flareRatio = (dt + 3.5) / 3.5;
      pitch = 0.048 - flareRatio * 0.11; // Pitches smoothly up to -3.5° flare
      currentY = (1 - approachProgress) * 52 * 0.95; // Soft cushioning
    }

    const speed = Math.round(155 - approachProgress * 20); // 155 -> 135 kts
    const altitude = Math.round(currentY * 30);
    const distToTouchdown = Math.round(-dt * 65);

    return {
      aircraftId: aircraft.aircraftId,
      callsign: aircraft.callsign,
      category: aircraft.category,
      landingTime: tLand,
      phase: 'final_approach',
      x: 0,
      y: Math.max(0.05, currentY),
      z: currentZ,
      pitch,
      yaw: 0,
      roll: 0,
      speedKts: speed,
      altitudeFt: altitude,
      distanceToTouchdownM: distToTouchdown,
      justTouchedDown,
      isVisible: true,
    };
  }

  // Phase 3: Touchdown & Ground Rollout (dt in [0, 12])
  if (dt < rolloutDuration) {
    const rollProgress = dt / rolloutDuration; // 0 -> 1
    // Roll from touchdownZ (-95) to exit turn-off (Z = 12)
    const distanceRoll = 107;
    // Deceleration curve
    const easeOut = 1 - Math.pow(1 - rollProgress, 1.8);
    const currentZ = touchdownZ + easeOut * distanceRoll;

    // Nose gear touches down smoothly within first 2.5 seconds
    const pitch = dt < 2.5 ? -(1 - dt / 2.5) * 0.055 : 0;
    const speed = Math.round(135 - rollProgress * 105); // 135 kts -> 30 kts

    return {
      aircraftId: aircraft.aircraftId,
      callsign: aircraft.callsign,
      category: aircraft.category,
      landingTime: tLand,
      phase: dt < 1.0 ? 'touchdown' : 'rollout',
      x: 0,
      y: 0,
      z: currentZ,
      pitch,
      yaw: 0,
      roll: 0,
      speedKts: Math.max(25, speed),
      altitudeFt: 0,
      distanceToTouchdownM: 0,
      justTouchedDown,
      isVisible: true,
    };
  }

  // Phase 4: Vacating onto High-Speed Taxiway (dt in [12, 22])
  if (dt < rolloutDuration + vacateDuration) {
    const turnProgress = (dt - rolloutDuration) / vacateDuration; // 0 -> 1
    // Smooth transition from runway centerline (X=0, Z=12) to parallel taxiway (X=45, Z=55)
    const currentX = turnProgress * 45;
    const currentZ = 12 + turnProgress * 43;

    // Yaw angled at ~32 degrees during exit, then straightening out
    let yaw = 0;
    if (turnProgress < 0.7) {
      yaw = -Math.sin(turnProgress * Math.PI) * 0.55;
    }

    return {
      aircraftId: aircraft.aircraftId,
      callsign: aircraft.callsign,
      category: aircraft.category,
      landingTime: tLand,
      phase: 'vacating',
      x: currentX,
      y: 0,
      z: currentZ,
      pitch: 0,
      yaw,
      roll: 0,
      speedKts: 22,
      altitudeFt: 0,
      distanceToTouchdownM: 0,
      justTouchedDown: false,
      isVisible: true,
    };
  }

  // Phase 5: Runway Cleared / Taxis along parallel taxiway
  const clearedTime = dt - (rolloutDuration + vacateDuration);
  const currentZ = 55 + clearedTime * 4.5;

  return {
    aircraftId: aircraft.aircraftId,
    callsign: aircraft.callsign,
    category: aircraft.category,
    landingTime: tLand,
    phase: 'cleared',
    x: 45,
    y: 0,
    z: currentZ,
    pitch: 0,
    yaw: 0,
    roll: 0,
    speedKts: 15,
    altitudeFt: 0,
    distanceToTouchdownM: 0,
    justTouchedDown: false,
    isVisible: clearedTime < 25, // Disappears after taxiing into hangar/apron
  };
}
