export type CameraMode = 'threshold' | 'touchdown' | 'tower' | 'chase' | 'free';

export interface AircraftVisualState {
  aircraftId: number;
  callsign: string;
  category: 'Heavy' | 'Medium' | 'Light';
  landingTime: number;
  phase: 'enroute' | 'final_approach' | 'touchdown' | 'rollout' | 'vacating' | 'cleared';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  speedKts: number;
  altitudeFt: number;
  distanceToTouchdownM: number;
}
