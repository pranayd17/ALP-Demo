import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Play, Pause, RotateCcw, FastForward, Eye, ShieldCheck, Clock, Plane, Info } from 'lucide-react';
import { ScheduledAircraft, ALPInstance } from '../types/alp';
import { createAircraftMesh } from './airstrip/aircraftModels';
import { buildAirfieldEnvironment, RUNWAY_DIMENSIONS } from './airstrip/RunwayEnvironment';
import { computeAircraftKinematics, AircraftFlightState } from './airstrip/FlightKinematics';
import { CameraMode } from './airstrip/types';

interface AirstripLandingViewProps {
  schedule: ScheduledAircraft[];
  instance: ALPInstance;
}

interface Aircraft3DRecord {
  group: THREE.Group;
  beaconLights: THREE.Mesh[];
  landingLight: THREE.SpotLight;
}

export const AirstripLandingView: React.FC<AirstripLandingViewProps> = ({ schedule, instance }) => {
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Time boundaries calculated from the schedule
  const minTime = useMemo(() => {
    if (!schedule.length) return 0;
    const firstLand = Math.min(...schedule.map((s) => s.landingTime));
    return Math.max(0, firstLand - 20);
  }, [schedule]);

  const maxTime = useMemo(() => {
    if (!schedule.length) return 200;
    const lastLand = Math.max(...schedule.map((s) => s.landingTime));
    return lastLand + 35;
  }, [schedule]);

  // Playback state
  const [currentTime, setCurrentTime] = useState<number>(minTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('threshold');
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(
    schedule.length > 0 ? schedule[0].aircraftId : null
  );

  // Mutable refs for animation loop
  const currentTimeRef = useRef<number>(minTime);
  const prevTimeRef = useRef<number>(minTime);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  const cameraModeRef = useRef<CameraMode>(cameraMode);
  const scheduleRef = useRef<ScheduledAircraft[]>(schedule);

  // Sync refs when state updates
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    scheduleRef.current = schedule;
    if (schedule.length > 0 && currentTimeRef.current < minTime) {
      currentTimeRef.current = minTime;
      setCurrentTime(minTime);
    }
  }, [schedule, minTime]);

  // Jump to specific flight landing
  const handleJumpToFlight = (flight: ScheduledAircraft) => {
    const jumpTime = Math.max(minTime, flight.landingTime - 18);
    currentTimeRef.current = jumpTime;
    setCurrentTime(jumpTime);
    setSelectedFlightId(flight.aircraftId);
  };

  // Find active flight (currently approaching or landing)
  const activeFlight = useMemo(() => {
    if (!schedule.length) return null;
    // Find aircraft closest to landing or in rollout
    const active = schedule.find((a) => {
      const dt = currentTime - a.landingTime;
      return dt >= -26 && dt <= 15;
    });
    return active || schedule[0];
  }, [schedule, currentTime]);

  // Main Three.js Scene Setup & Animation Lifecycle
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Detect software WebGL as per guidelines
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Daylight Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // Clean daylight sky matching white UI
    scene.fog = new THREE.Fog(0xf1f5f9, 180, 850);

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 1200);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // OrbitControls for Free Cam
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going underground
    controls.minDistance = 5;
    controls.maxDistance = 500;

    // 4. Studio Lighting & Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Natural Sun / Key Light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(120, 160, 60);
    sunLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 500;
      sunLight.shadow.camera.left = -160;
      sunLight.shadow.camera.right = 160;
      sunLight.shadow.camera.top = 160;
      sunLight.shadow.camera.bottom = -160;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    // Sky / Ground Fill
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 1.2);
    scene.add(hemiLight);

    // 5. Procedural Airfield Runway Environment
    const airfield = buildAirfieldEnvironment(scene);

    // 6. Aircraft 3D Meshes Cache
    const aircraftMeshMap = new Map<number, Aircraft3DRecord>();

    // Helper to get or create aircraft 3D model
    const getAircraftMesh = (aircraft: ScheduledAircraft): Aircraft3DRecord => {
      let record = aircraftMeshMap.get(aircraft.aircraftId);
      if (!record) {
        const meshData = createAircraftMesh(aircraft.category, aircraft.callsign);
        scene.add(meshData.group);
        record = meshData;
        aircraftMeshMap.set(aircraft.aircraftId, record);
      }
      return record;
    };

    // Camera preset coordinates
    const { thresholdZ } = RUNWAY_DIMENSIONS;

    // 7. Animation & Render Loop
    let animFrameId = 0;
    let lastClockTime = performance.now();
    let uiUpdateTimer = 0;

    const tick = () => {
      const now = performance.now();
      const deltaSec = Math.min((now - lastClockTime) / 1000, 0.1);
      lastClockTime = now;

      // Advance simulated airport time
      if (isPlayingRef.current) {
        const prevT = currentTimeRef.current;
        const newT = prevT + deltaSec * playbackSpeedRef.current;
        prevTimeRef.current = prevT;

        if (newT > maxTime) {
          currentTimeRef.current = minTime; // Loop back
        } else {
          currentTimeRef.current = newT;
        }

        // Throttle React state updates for 60fps smooth playback
        uiUpdateTimer += deltaSec;
        if (uiUpdateTimer > 0.08) {
          setCurrentTime(currentTimeRef.current);
          uiUpdateTimer = 0;
        }
      }

      const curT = currentTimeRef.current;
      const prvT = prevTimeRef.current;
      const currentSchedule = scheduleRef.current;

      // Update PAPI lights
      airfield.updatePapi(curT);

      // Track active flight for chase camera
      let leadFlightState: AircraftFlightState | null = null;

      // Update position of each scheduled aircraft
      for (const flight of currentSchedule) {
        const record = getAircraftMesh(flight);
        const state = computeAircraftKinematics(flight, curT, prvT);

        record.group.visible = state.isVisible;

        if (state.isVisible) {
          record.group.position.set(state.x, state.y, state.z);
          record.group.rotation.set(state.pitch, state.yaw, state.roll);

          // Touchdown tire smoke trigger
          if (state.justTouchedDown) {
            airfield.triggerTouchdownSmoke(state.x, state.y, state.z);
          }

          // Flashing red beacon lights (1 Hz flash)
          const isBeaconOn = Math.sin(curT * 6.28) > 0;
          record.beaconLights.forEach((beacon) => {
            beacon.visible = isBeaconOn;
          });

          // Track active flight for camera framing
          const dt = curT - flight.landingTime;
          if (dt >= -26 && dt <= 15) {
            if (!leadFlightState || Math.abs(dt) < Math.abs(curT - leadFlightState.landingTime)) {
              leadFlightState = state;
            }
          }
        }
      }

      // Update Camera based on selected mode
      const activeMode = cameraModeRef.current;
      if (activeMode === 'threshold') {
        // Looking down the runway centerline from near the threshold
        camera.position.set(0, 7.5, thresholdZ - 28);
        camera.lookAt(0, 4.0, thresholdZ + 90);
        controls.enabled = false;
      } else if (activeMode === 'touchdown') {
        // Dynamic track camera at runway edge near touchdown zone
        const focusZ = leadFlightState ? leadFlightState.z : thresholdZ + 45;
        camera.position.set(-26, 6.0, thresholdZ + 40);
        camera.lookAt(leadFlightState ? leadFlightState.x : 0, leadFlightState ? leadFlightState.y + 1.5 : 2, focusZ);
        controls.enabled = false;
      } else if (activeMode === 'tower') {
        // High control tower vantage point overlooking the airfield
        camera.position.set(75, 34, -20);
        if (leadFlightState) {
          camera.lookAt(leadFlightState.x, leadFlightState.y, leadFlightState.z);
        } else {
          camera.lookAt(0, 0, thresholdZ + 60);
        }
        controls.enabled = false;
      } else if (activeMode === 'chase') {
        // Behind and above the currently approaching aircraft
        if (leadFlightState) {
          camera.position.set(leadFlightState.x, leadFlightState.y + 6.0, leadFlightState.z - 28);
          camera.lookAt(leadFlightState.x, leadFlightState.y + 1.0, leadFlightState.z + 20);
        } else {
          camera.position.set(0, 15, thresholdZ - 50);
          camera.lookAt(0, 2, thresholdZ + 40);
        }
        controls.enabled = false;
      } else if (activeMode === 'free') {
        controls.enabled = true;
        controls.update();
      }

      // Render
      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [maxTime, minTime]);

  // Progress percentage for timeline bar
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTime - minTime) / (maxTime - minTime || 1)) * 100)
  );

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Simulation Stage & 3D Viewport Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Plane className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                3D Runway Landing Simulation
              </h2>
              <p className="text-xs text-gray-500">
                Visualizing AGWOA landing times, 3° glide slope flare, and taxiway exits
              </p>
            </div>
          </div>

          {/* Camera View Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 px-2 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Camera:</span>
            </span>

            {[
              { id: 'threshold', label: 'Runway Center' },
              { id: 'touchdown', label: 'Touchdown Zone' },
              { id: 'tower', label: 'ATC Tower' },
              { id: 'chase', label: 'Chase Cam' },
              { id: 'free', label: 'Orbit' },
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => setCameraMode(cam.id as CameraMode)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  cameraMode === cam.id
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Viewport Container */}
        <div className="relative w-full h-[460px] sm:h-[520px] bg-slate-100">
          <div ref={canvasMountRef} className="w-full h-full" />

          {/* Runway Markings Watermark Badge (Top Left overlay) */}
          <div className="absolute top-3 left-3 bg-white/90 border border-gray-200/80 rounded-lg px-3 py-1.5 shadow-xs text-xs text-gray-700 pointer-events-none backdrop-blur-xs flex items-center gap-2">
            <span className="font-bold text-gray-900">Runway 09L</span>
            <span className="text-gray-400">·</span>
            <span>Elevation: 14ft</span>
            <span className="text-gray-400">·</span>
            <span className="text-emerald-700 font-semibold">ILS Cat III</span>
          </div>

          {/* Active Flight Telemetry HUD (Top Right overlay) */}
          {activeFlight && (
            <div className="absolute top-3 right-3 bg-white/95 border border-gray-200 rounded-lg p-3 shadow-md max-w-xs text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-gray-900">{activeFlight.callsign}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      activeFlight.category === 'Heavy'
                        ? 'bg-purple-100 text-purple-700'
                        : activeFlight.category === 'Medium'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {activeFlight.category}
                  </span>
                </div>
                <span className="text-gray-500 font-mono">Pos #{activeFlight.position}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>
                  <span className="text-[10px] text-gray-400 block">Landing Time</span>
                  <span className="font-semibold text-gray-900">{activeFlight.landingTime}s</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Target (Preferred)</span>
                  <span className="font-semibold text-gray-700">{activeFlight.target}s</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Schedule Offset</span>
                  <span
                    className={`font-semibold ${
                      activeFlight.deviationType === 'On-Time'
                        ? 'text-emerald-600'
                        : activeFlight.deviationType === 'Early'
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {activeFlight.deviation > 0 ? `+${activeFlight.deviation}s` : `${activeFlight.deviation}s`} ({activeFlight.deviationType})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Separation Check</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 inline" /> Safe
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unified Bottom Interactive Control Dock */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-200 flex flex-col gap-4">
          {/* Timeline Scrubber */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1.5 font-medium text-gray-900">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulated Time:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {Math.round(currentTime)}s
                </span>
              </span>
              <span className="text-gray-500 font-mono text-[11px]">
                Range: {Math.round(minTime)}s — {Math.round(maxTime)}s ({Math.round(maxTime - minTime)}s total)
              </span>
            </div>

            {/* Slider */}
            <div className="relative flex items-center">
              <input
                type="range"
                min={minTime}
                max={maxTime}
                step={0.5}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  currentTimeRef.current = val;
                  setCurrentTime(val);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Schedule Flight Touchdown Markers on the timeline */}
            <div className="relative w-full h-4">
              {schedule.map((flight) => {
                const leftPercent = ((flight.landingTime - minTime) / (maxTime - minTime || 1)) * 100;
                const isSelected = activeFlight?.aircraftId === flight.aircraftId;
                return (
                  <button
                    key={flight.aircraftId}
                    onClick={() => handleJumpToFlight(flight)}
                    title={`${flight.callsign} (${flight.category}) @ ${flight.landingTime}s`}
                    style={{ left: `${Math.min(98, Math.max(2, leftPercent))}%` }}
                    className={`absolute -top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border transition-transform ${
                      isSelected
                        ? 'bg-blue-600 border-white ring-2 ring-blue-500 scale-125 z-10'
                        : 'bg-gray-400 hover:bg-blue-500 border-white hover:scale-125'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Playback Controls & Speed Multipliers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
            {/* Play, Pause, Reset, Step */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  currentTimeRef.current = minTime;
                  setCurrentTime(minTime);
                }}
                title="Reset simulation to beginning"
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const newT = Math.min(maxTime, currentTimeRef.current + 5);
                  currentTimeRef.current = newT;
                  setCurrentTime(newT);
                }}
                title="Step forward +5s"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>+5s</span>
              </button>
            </div>

            {/* Playback Speed Multipliers */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
              <span className="text-[11px] font-medium text-gray-500 px-1.5">Speed:</span>
              {[0.5, 1.0, 2.0, 5.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition-all ${
                    playbackSpeed === spd
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Arrival Sequence Jump Bar (Click to fly along any scheduled aircraft) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Arrival Sequence ({schedule.length} Flights)
            </h3>
            <span className="text-[11px] text-gray-400">· Click any flight to jump</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Heavy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Light
            </span>
          </div>
        </div>

        {/* Horizontal flight queue chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {schedule.map((flight) => {
            const isCurrent = activeFlight?.aircraftId === flight.aircraftId;
            return (
              <button
                key={flight.aircraftId}
                onClick={() => handleJumpToFlight(flight)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-blue-900 font-semibold'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-2 h-7 rounded-full ${
                    flight.category === 'Heavy'
                      ? 'bg-purple-500'
                      : flight.category === 'Medium'
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{flight.callsign}</span>
                    <span className="text-[10px] text-gray-400">#{flight.position}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    T = {flight.landingTime}s
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Educational Callout explaining the connection between AGWOA and the Airstrip */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-xs text-gray-700">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-blue-900 font-semibold block mb-0.5">
            How AGWOA Drives this Simulation
          </strong>
          Each aircraft follows the exact landing time T_i optimized by the Hybrid Grey Wolf & Whale
          Optimizer. The visual spacing between successive arrivals reflects the wake-vortex separation
          matrix S(i, j). Observe how each aircraft rolls out and vacates via the high-speed taxiway
          before trailing arrivals cross the runway threshold, maintaining zero separation violations.
        </div>
      </div>
    </div>
  );
};
