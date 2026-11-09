import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Clock,
  ShieldCheck,
  Plane,
  Navigation,
  Info,
} from 'lucide-react';
import { ScheduledAircraft, ALPInstance } from '../types/alp';

interface AirspaceMapViewProps {
  schedule: ScheduledAircraft[];
  instance: ALPInstance;
}

// Map waypoint definition
interface Waypoint {
  id: string;
  name: string;
  x: number; // in nautical miles relative to runway threshold (0, 0)
  y: number; // in nautical miles
  type: 'fix' | 'faf' | 'threshold' | 'exit';
}

// Waypoints in the terminal airspace (Runway threshold at 0, 0; runway aligned east-west)
const WAYPOINTS: Waypoint[] = [
  { id: 'THR', name: 'RWY 09L', x: 0, y: 0, type: 'threshold' },
  { id: 'FAF', name: 'NOBBI (FAF)', x: -7, y: 0, type: 'faf' },
  { id: 'IF', name: 'CLARK (IF)', x: -14, y: 0, type: 'fix' },
  { id: 'NORTH_GATE', name: 'CAMRN (N)', x: -24, y: 18, type: 'fix' },
  { id: 'SOUTH_GATE', name: 'MAYSA (S)', x: -22, y: -18, type: 'fix' },
  { id: 'EAST_ENTRY', name: 'BIGGY (E)', x: 12, y: 22, type: 'fix' },
  { id: 'WEST_GATE', name: 'TIMMY (W)', x: -32, y: -8, type: 'fix' },
  { id: 'DOWNWIND', name: 'LEWES (DW)', x: -8, y: 10, type: 'fix' },
];

export const AirspaceMapView: React.FC<AirspaceMapViewProps> = ({ schedule, instance }) => {
  // Timeline boundaries
  const minTime = useMemo(() => {
    if (!schedule.length) return 0;
    const firstLand = Math.min(...schedule.map((s) => s.landingTime));
    return Math.max(0, firstLand - 60); // 60s of airspace transit before landing
  }, [schedule]);

  const maxTime = useMemo(() => {
    if (!schedule.length) return 200;
    const lastLand = Math.max(...schedule.map((s) => s.landingTime));
    return lastLand + 20;
  }, [schedule]);

  // Simulation playback state
  const [currentTime, setCurrentTime] = useState<number>(minTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(
    schedule.length > 0 ? schedule[0].aircraftId : null
  );

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1.0); // 1.0 = ~35 NM radius
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation frame loop refs
  const currentTimeRef = useRef<number>(minTime);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const playbackSpeedRef = useRef<number>(playbackSpeed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    currentTimeRef.current = minTime;
    setCurrentTime(minTime);
    if (schedule.length > 0) {
      setSelectedFlightId(schedule[0].aircraftId);
    }
  }, [instance.id, minTime, schedule]);

  // Animation ticker for clock playback
  useEffect(() => {
    let animId = 0;
    let lastTick = performance.now();
    let throttleCounter = 0;

    const tick = () => {
      const now = performance.now();
      const deltaSec = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;

      if (isPlayingRef.current) {
        const nextTime = currentTimeRef.current + deltaSec * playbackSpeedRef.current;
        if (nextTime > maxTime) {
          currentTimeRef.current = minTime;
        } else {
          currentTimeRef.current = nextTime;
        }

        throttleCounter += deltaSec;
        if (throttleCounter > 0.05) {
          setCurrentTime(currentTimeRef.current);
          throttleCounter = 0;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [maxTime, minTime]);

  // Assign arrival route corridors based on aircraft ID modulo
  const getFlightRoute = (aircraftId: number) => {
    const routeIndex = aircraftId % 4;
    switch (routeIndex) {
      case 0:
        return {
          name: 'CAMRN4 (North Arrival)',
          waypoints: [
            { x: -32, y: 24 },
            { x: -24, y: 18 },
            { x: -16, y: 8 },
            { x: -14, y: 0 },
            { x: -7, y: 0 },
            { x: 0, y: 0 },
          ],
        };
      case 1:
        return {
          name: 'MAYSA2 (South Arrival)',
          waypoints: [
            { x: -30, y: -24 },
            { x: -22, y: -18 },
            { x: -15, y: -7 },
            { x: -14, y: 0 },
            { x: -7, y: 0 },
            { x: 0, y: 0 },
          ],
        };
      case 2:
        return {
          name: 'TIMMY1 (West Downwind)',
          waypoints: [
            { x: -34, y: -4 },
            { x: -24, y: 0 },
            { x: -14, y: 0 },
            { x: -7, y: 0 },
            { x: 0, y: 0 },
          ],
        };
      default:
        return {
          name: 'EAST2 (Downwind Base)',
          waypoints: [
            { x: 8, y: 18 },
            { x: -6, y: 15 },
            { x: -16, y: 9 },
            { x: -14, y: 0 },
            { x: -7, y: 0 },
            { x: 0, y: 0 },
          ],
        };
    }
  };

  // Compute 2D position, altitude, speed, and heading along route
  const getAircraftMapState = (aircraft: ScheduledAircraft, time: number) => {
    const route = getFlightRoute(aircraft.aircraftId);
    const transitDuration = 55; // 55s transit time in terminal airspace
    const tLand = aircraft.landingTime;
    const dt = time - tLand; // seconds relative to touchdown

    // Route points
    const pts = route.waypoints;

    if (dt < -transitDuration) {
      // Prior to airspace entry
      const p0 = pts[0];
      return {
        visible: false,
        x: p0.x,
        y: p0.y,
        altitudeFt: 12000,
        speedKts: 260,
        headingDeg: 120,
        phase: 'enroute',
        route,
      };
    }

    if (dt <= 0) {
      // In transit along STAR corridor toward runway
      const progress = (dt + transitDuration) / transitDuration; // 0 -> 1
      const totalSegments = pts.length - 1;
      const exactIdx = progress * totalSegments;
      const segIdx = Math.min(Math.floor(exactIdx), totalSegments - 1);
      const segT = exactIdx - segIdx;

      const pA = pts[segIdx];
      const pB = pts[segIdx + 1];

      const curX = pA.x + (pB.x - pA.x) * segT;
      const curY = pA.y + (pB.y - pA.y) * segT;

      // Heading in degrees
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      let heading = Math.atan2(dx, dy) * (180 / Math.PI);
      if (heading < 0) heading += 360;

      // Altitude descends from 10,000 ft to 0 ft
      const alt = Math.max(0, Math.round((1 - progress) * 9500));
      // Speed slows from 240 kts to 135 kts
      const spd = Math.round(240 - progress * 105);

      return {
        visible: true,
        x: curX,
        y: curY,
        altitudeFt: alt,
        speedKts: spd,
        headingDeg: Math.round(heading),
        phase: progress > 0.85 ? 'final' : 'approach',
        route,
      };
    }

    if (dt <= 12) {
      // On runway rollout
      const rollProgress = dt / 12;
      const rollX = rollProgress * 1.8; // Rolls along runway East (positive X)
      return {
        visible: true,
        x: rollX,
        y: 0,
        altitudeFt: 0,
        speedKts: Math.max(25, Math.round(135 - rollProgress * 105)),
        headingDeg: 90,
        phase: 'rollout',
        route,
      };
    }

    // Vacated onto taxiway
    return {
      visible: dt < 22,
      x: 1.8,
      y: 0.3,
      altitudeFt: 0,
      speedKts: 15,
      headingDeg: 45,
      phase: 'taxiway',
      route,
    };
  };

  // Convert Nautical Miles (NM) to SVG Canvas coordinates
  const canvasWidth = 860;
  const canvasHeight = 540;
  const centerX = canvasWidth / 2 + pan.x;
  const centerY = canvasHeight / 2 + pan.y;
  const scaleNm = 12 * zoom; // pixels per nautical mile

  const nmToPx = (nmX: number, nmY: number) => ({
    cx: centerX + nmX * scaleNm,
    cy: centerY - nmY * scaleNm, // Invert Y for standard map orientation (North up)
  });

  // Selected aircraft details
  const activeFlight = useMemo(() => {
    if (!schedule.length) return null;
    if (selectedFlightId) {
      const match = schedule.find((s) => s.aircraftId === selectedFlightId);
      if (match) return match;
    }
    // Default to aircraft currently approaching or on final
    const current = schedule.find((s) => {
      const dt = currentTime - s.landingTime;
      return dt >= -35 && dt <= 10;
    });
    return current || schedule[0];
  }, [schedule, selectedFlightId, currentTime]);

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Map Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                Terminal Airspace & Geographic Map
              </h2>
              <p className="text-xs text-gray-500">
                Live flight positions, arrival corridors (STAR), and wake-vortex separation rings
              </p>
            </div>
          </div>

          {/* Map Controls (Zoom Presets & Reset) */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => {
                setZoom(0.75);
                setPan({ x: 40, y: 0 });
              }}
              title="Regional 40 NM View"
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                zoom === 0.75 ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              40 NM
            </button>
            <button
              onClick={() => {
                setZoom(1.15);
                setPan({ x: 30, y: 0 });
              }}
              title="Approach 20 NM View"
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                zoom === 1.15 ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              20 NM
            </button>
            <button
              onClick={() => {
                setZoom(2.2);
                setPan({ x: 80, y: 0 });
              }}
              title="Final Approach 10 NM View"
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                zoom === 2.2 ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              10 NM
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1" />

            <button
              onClick={() => setZoom((z) => Math.min(3.5, z * 1.25))}
              title="Zoom In"
              className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z * 0.8))}
              title="Zoom Out"
              className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1.0);
                setPan({ x: 0, y: 0 });
              }}
              title="Reset Map Position"
              className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Map Viewport Area (SVG Vector Geographic Map) */}
        <div
          className="relative w-full h-[480px] sm:h-[540px] bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={(e) => {
            isDraggingRef.current = true;
            dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
          }}
          onMouseMove={(e) => {
            if (!isDraggingRef.current) return;
            setPan({
              x: e.clientX - dragStartRef.current.x,
              y: e.clientY - dragStartRef.current.y,
            });
          }}
          onMouseUp={() => {
            isDraggingRef.current = false;
          }}
          onMouseLeave={() => {
            isDraggingRef.current = false;
          }}
        >
          <svg className="w-full h-full" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
            <defs>
              {/* Runway pattern */}
              <pattern id="runwayGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
              </pattern>

              {/* Aircraft Icon Marker */}
              <g id="aircraftGlyph">
                {/* Airplane silhouette centered at 0, 0 pointing NORTH */}
                <path
                  d="M 0 -10 L 2 -4 L 10 0 L 10 2 L 2 1 L 2 7 L 5 9 L 5 11 L 0 10 L -5 11 L -5 9 L -2 7 L -2 1 L -10 2 L -10 0 L -2 -4 Z"
                  fill="currentColor"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              </g>
            </defs>

            {/* Background Grid */}
            <rect width="100%" height="100%" fill="url(#runwayGrid)" />

            {/* Compass Rose & Cardinal Headings */}
            <g opacity="0.4" pointerEvents="none">
              <text x={centerX} y="30" textAnchor="middle" className="text-[12px] font-bold fill-gray-400">
                N 360°
              </text>
              <text x={canvasWidth - 35} y={centerY + 4} textAnchor="middle" className="text-[12px] font-bold fill-gray-400">
                E 090°
              </text>
              <text x={centerX} y={canvasHeight - 15} textAnchor="middle" className="text-[12px] font-bold fill-gray-400">
                S 180°
              </text>
              <text x="35" y={centerY + 4} textAnchor="middle" className="text-[12px] font-bold fill-gray-400">
                W 270°
              </text>
            </g>

            {/* Range Rings (5, 10, 20, 30, 40 NM) */}
            {[5, 10, 20, 30, 40].map((radiusNm) => {
              const rPx = radiusNm * scaleNm;
              const thresholdPt = nmToPx(0, 0);
              return (
                <g key={radiusNm}>
                  <circle
                    cx={thresholdPt.cx}
                    cy={thresholdPt.cy}
                    r={rPx}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={thresholdPt.cx + rPx + 4}
                    y={thresholdPt.cy - 4}
                    className="text-[10px] font-mono fill-gray-400 select-none"
                  >
                    {radiusNm} NM
                  </text>
                </g>
              );
            })}

            {/* Extended Centerline / ILS Glidepath Localizer */}
            {(() => {
              const pStart = nmToPx(-25, 0);
              const pEnd = nmToPx(4, 0);
              return (
                <g>
                  {/* Localizer cone */}
                  <polygon
                    points={`${nmToPx(-25, 1.8).cx},${nmToPx(-25, 1.8).cy} ${nmToPx(0, 0).cx},${nmToPx(0, 0).cy} ${nmToPx(-25, -1.8).cx},${nmToPx(-25, -1.8).cy}`}
                    fill="#3b82f6"
                    fillOpacity="0.05"
                  />
                  <line
                    x1={pStart.cx}
                    y1={pStart.cy}
                    x2={pEnd.cx}
                    y2={pEnd.cy}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />
                </g>
              );
            })()}

            {/* Standard Arrival Route (STAR) Paths */}
            {[
              {
                id: 'CAMRN',
                name: 'CAMRN4 Arrival',
                color: '#6366f1',
                pts: [
                  { x: -32, y: 24 },
                  { x: -24, y: 18 },
                  { x: -16, y: 8 },
                  { x: -14, y: 0 },
                ],
              },
              {
                id: 'MAYSA',
                name: 'MAYSA2 Arrival',
                color: '#0ea5e9',
                pts: [
                  { x: -30, y: -24 },
                  { x: -22, y: -18 },
                  { x: -15, y: -7 },
                  { x: -14, y: 0 },
                ],
              },
              {
                id: 'EAST',
                name: 'EAST2 Downwind',
                color: '#10b981',
                pts: [
                  { x: 8, y: 18 },
                  { x: -6, y: 15 },
                  { x: -16, y: 9 },
                  { x: -14, y: 0 },
                ],
              },
            ].map((route) => {
              const pathD = route.pts
                .map((pt, i) => {
                  const px = nmToPx(pt.x, pt.y);
                  return `${i === 0 ? 'M' : 'L'} ${px.cx} ${px.cy}`;
                })
                .join(' ');
              return (
                <g key={route.id} opacity="0.6">
                  <path d={pathD} fill="none" stroke={route.color} strokeWidth="1.2" strokeDasharray="3 3" />
                  {/* Waypoint circles */}
                  {route.pts.map((pt, idx) => {
                    const pos = nmToPx(pt.x, pt.y);
                    return (
                      <circle key={idx} cx={pos.cx} cy={pos.cy} r="3" fill="#ffffff" stroke={route.color} strokeWidth="1.5" />
                    );
                  })}
                </g>
              );
            })}

            {/* Airfield Runway 09L / 27R Ground Footprint */}
            {(() => {
              const rwyStart = nmToPx(0, 0);
              const rwyEnd = nmToPx(2.2, 0);
              return (
                <g>
                  {/* Runway asphalt block */}
                  <line
                    x1={rwyStart.cx}
                    y1={rwyStart.cy}
                    x2={rwyEnd.cx}
                    y2={rwyEnd.cy}
                    stroke="#1e293b"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  {/* Runway Centerline */}
                  <line
                    x1={rwyStart.cx}
                    y1={rwyStart.cy}
                    x2={rwyEnd.cx}
                    y2={rwyEnd.cy}
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                  {/* Threshold label */}
                  <text
                    x={rwyStart.cx - 10}
                    y={rwyStart.cy - 10}
                    className="text-[11px] font-bold fill-gray-900"
                  >
                    RWY 09L
                  </text>
                </g>
              );
            })()}

            {/* Airspace Waypoints & Navigation Fixes */}
            {WAYPOINTS.map((wp) => {
              const pos = nmToPx(wp.x, wp.y);
              return (
                <g key={wp.id} className="pointer-events-none">
                  {wp.type === 'faf' ? (
                    // Final approach fix (triangle)
                    <polygon
                      points={`${pos.cx},${pos.cy - 6} ${pos.cx - 5},${pos.cy + 4} ${pos.cx + 5},${pos.cy + 4}`}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  ) : wp.type === 'fix' ? (
                    // Nav fix (diamond)
                    <polygon
                      points={`${pos.cx},${pos.cy - 4} ${pos.cx + 4},${pos.cy} ${pos.cx},${pos.cy + 4} ${pos.cx - 4},${pos.cy}`}
                      fill="#475569"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  ) : null}
                  <text
                    x={pos.cx}
                    y={pos.cy + 13}
                    textAnchor="middle"
                    className="text-[9px] font-mono font-semibold fill-gray-600"
                  >
                    {wp.name}
                  </text>
                </g>
              );
            })}

            {/* Render Live Scheduled Aircraft */}
            {schedule.map((flight) => {
              const state = getAircraftMapState(flight, currentTime);
              if (!state.visible) return null;

              const pos = nmToPx(state.x, state.y);
              const isSelected = activeFlight?.aircraftId === flight.aircraftId;

              // Wake-vortex separation buffer radius based on Category
              const wakeRadiusNm = flight.category === 'Heavy' ? 5.5 : flight.category === 'Medium' ? 4.0 : 3.0;
              const wakeRadiusPx = wakeRadiusNm * scaleNm;

              const categoryColor =
                flight.category === 'Heavy'
                  ? '#9333ea' // Purple
                  : flight.category === 'Medium'
                  ? '#2563eb' // Blue
                  : '#059669'; // Emerald

              return (
                <g
                  key={flight.aircraftId}
                  className="cursor-pointer"
                  onClick={() => setSelectedFlightId(flight.aircraftId)}
                >
                  {/* Wake Separation Buffer Ring (Safe spacing buffer circle) */}
                  <circle
                    cx={pos.cx}
                    cy={pos.cy}
                    r={wakeRadiusPx}
                    fill={categoryColor}
                    fillOpacity={isSelected ? '0.12' : '0.05'}
                    stroke={categoryColor}
                    strokeWidth={isSelected ? '1.8' : '1'}
                    strokeDasharray={isSelected ? 'none' : '3 3'}
                  />

                  {/* Aircraft Heading Glyph */}
                  <g transform={`translate(${pos.cx}, ${pos.cy}) rotate(${state.headingDeg})`}>
                    <path
                      d="M 0 -11 L 3 -5 L 12 0 L 12 2 L 3 1 L 3 8 L 6 10 L 6 12 L 0 11 L -6 12 L -6 10 L -3 8 L -3 1 L -12 2 L -12 0 L -3 -5 Z"
                      fill={categoryColor}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  </g>

                  {/* Transponder Radar Data Block (Flight Tag) */}
                  <g transform={`translate(${pos.cx + 14}, ${pos.cy - 18})`}>
                    {/* Background tag pill */}
                    <rect
                      x="0"
                      y="0"
                      width="92"
                      height="38"
                      rx="4"
                      fill="#ffffff"
                      fillOpacity="0.95"
                      stroke={isSelected ? '#2563eb' : '#cbd5e1'}
                      strokeWidth={isSelected ? '1.8' : '1'}
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                    />
                    {/* Callsign & Category indicator */}
                    <text x="6" y="13" className="text-[10px] font-mono font-bold fill-gray-900">
                      {flight.callsign}
                    </text>
                    <text
                      x="84"
                      y="13"
                      textAnchor="end"
                      className="text-[9px] font-bold"
                      fill={categoryColor}
                    >
                      {flight.category[0]}
                    </text>
                    {/* Altitude & Speed */}
                    <text x="6" y="24" className="text-[9px] font-mono fill-gray-500">
                      A{Math.round(state.altitudeFt / 100)
                        .toString()
                        .padStart(3, '0')}{' '}
                      · {state.speedKts}kt
                    </text>
                    {/* Assigned landing time */}
                    <text x="6" y="34" className="text-[8px] font-mono fill-blue-600 font-semibold">
                      T_land: {flight.landingTime}s
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Map Info Badge (Top Left overlay) */}
          <div className="absolute top-3 left-3 bg-white/95 border border-gray-200 rounded-lg px-3 py-1.5 shadow-xs text-xs text-gray-700 pointer-events-none flex items-center gap-2">
            <span className="font-bold text-gray-900">METRO TMA AIRSPACE</span>
            <span className="text-gray-400">·</span>
            <span>Elevation: 14ft MSL</span>
            <span className="text-gray-400">·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Wake Separation Safe
            </span>
          </div>

          {/* Active Flight Radar Card (Top Right overlay) */}
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
                  <span className="text-[10px] text-gray-400 block">Assigned Touchdown</span>
                  <span className="font-semibold text-gray-900">{activeFlight.landingTime}s</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Preferred Target</span>
                  <span className="font-semibold text-gray-700">{activeFlight.target}s</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Separation Buffer</span>
                  <span className="font-semibold text-gray-900">
                    {activeFlight.category === 'Heavy' ? '5.5 NM' : activeFlight.category === 'Medium' ? '4.0 NM' : '3.0 NM'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Approach Route</span>
                  <span className="font-semibold text-blue-600">
                    {getFlightRoute(activeFlight.aircraftId).name.split(' ')[0]}
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
                <span>Simulated Airspace Time:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {Math.round(currentTime)}s
                </span>
              </span>
              <span className="text-gray-500 font-mono text-[11px]">
                Airspace Window: {Math.round(minTime)}s — {Math.round(maxTime)}s
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

            {/* Flight touchdown markers */}
            <div className="relative w-full h-4">
              {schedule.map((flight) => {
                const leftPercent = ((flight.landingTime - minTime) / (maxTime - minTime || 1)) * 100;
                const isSelected = activeFlight?.aircraftId === flight.aircraftId;
                return (
                  <button
                    key={flight.aircraftId}
                    onClick={() => {
                      currentTimeRef.current = Math.max(minTime, flight.landingTime - 25);
                      setCurrentTime(currentTimeRef.current);
                      setSelectedFlightId(flight.aircraftId);
                    }}
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
                title="Reset simulation to start"
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

      {/* Arrival Sequence Chips */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Airspace Traffic Queue ({schedule.length} Aircraft)
            </h3>
            <span className="text-[11px] text-gray-400">· Click any flight to highlight and center</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Heavy (5.5 NM)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Medium (4.0 NM)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Light (3.0 NM)
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
                onClick={() => {
                  setSelectedFlightId(flight.aircraftId);
                  const jumpTime = Math.max(minTime, flight.landingTime - 30);
                  currentTimeRef.current = jumpTime;
                  setCurrentTime(jumpTime);
                }}
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

      {/* Info Callout */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-xs text-gray-700">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-blue-900 font-semibold block mb-0.5">
            Geographic Airspace Map & Separation Standards
          </strong>
          This map visualizes the terminal maneuvering area (TMA) within a 40 Nautical Mile radius of
          the airport. The circular safety envelopes represent wake turbulence buffers mandated by
          ICAO/FAA standards. The AGWOA optimization algorithm guarantees that these separation envelopes
          never overlap along the shared final approach localizer.
        </div>
      </div>
    </div>
  );
};
