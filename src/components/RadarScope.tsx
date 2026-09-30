import React, { useState, useEffect, useRef } from 'react';
import { ScheduledAircraft, ALPInstance } from '../types/alp';
import { Play, Pause, RotateCcw, Plane, Info } from 'lucide-react';

interface RadarScopeProps {
  instance: ALPInstance;
  schedule: ScheduledAircraft[];
}

export const RadarScope: React.FC<RadarScopeProps> = ({ instance, schedule }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedAircraftId, setSelectedAircraftId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Time bounds
  const minTime = Math.min(...instance.aircraft.map((a) => a.arrival), 0);
  const maxTime = Math.max(
    ...schedule.map((s) => s.landingTime),
    ...instance.aircraft.map((a) => a.latest),
    200
  );

  useEffect(() => {
    setCurrentTime(minTime);
    setIsPlaying(false);
  }, [instance.id]);

  useEffect(() => {
    let lastStamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = (timestamp - lastStamp) / 1000;
      lastStamp = timestamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt * playbackSpeed * 8;
          if (next >= maxTime + 10) {
            setIsPlaying(false);
            return maxTime + 10;
          }
          return next;
        });
      }

      drawAirportRadar();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, maxTime, currentTime, schedule, selectedAircraftId]);

  // Clean, light top-down airport canvas
  const drawAirportRadar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width * 0.45;
    const cy = height * 0.5;
    const maxRadius = Math.min(cx - 30, cy - 30);

    // Clean white-gray canvas background
    ctx.fillStyle = '#f8fafc'; // light slate-50
    ctx.fillRect(0, 0, width, height);

    // Subtle distance rings
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let r = 1; r <= 4; r++) {
      const radius = (maxRadius / 4) * r;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${r * 5} NM`, cx + 6, cy - radius + 12);
    }

    // Runway in the center
    ctx.fillStyle = '#334155'; // dark slate
    ctx.fillRect(cx - 5, cy - 8, 85, 16);

    // Runway center dashes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 75, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('RWY 09', cx + 18, cy + 3);

    // Approach glideslope line extending west
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - maxRadius, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw aircraft
    schedule.forEach((ac, idx) => {
      const isSelected = selectedAircraftId === ac.aircraftId;
      const landingTime = ac.landingTime;
      const timeRemaining = landingTime - currentTime;

      let px: number;
      let py: number;

      if (timeRemaining <= 0) {
        // Plane has touched down
        const taxiDist = Math.min(70, Math.abs(timeRemaining) * 4);
        px = cx + 80 + taxiDist;
        py = cy + ((idx % 3) - 1) * 16;
      } else {
        // Approaching
        const normDist = Math.min(1.0, timeRemaining / 120.0);
        const radius = normDist * (maxRadius - 20) + 20;
        const angleOffset = Math.sin(ac.aircraftId * 1.7) * 0.7;
        const angle = Math.PI + angleOffset;

        px = cx + Math.cos(angle) * radius;
        py = cy + Math.sin(angle) * radius;
      }

      // Approach path line
      if (timeRemaining > 0) {
        ctx.strokeStyle = isSelected ? '#3b82f6' : '#cbd5e1';
        ctx.lineWidth = isSelected ? 1.5 : 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Plane icon color
      let blipColor = '#10b981'; // on-time emerald
      if (ac.deviationType === 'Early') blipColor = '#3b82f6'; // blue
      if (ac.deviationType === 'Late') blipColor = '#f59e0b'; // amber
      if (timeRemaining <= 0) blipColor = '#64748b'; // landed gray

      ctx.fillStyle = blipColor;
      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Flight text label
      ctx.fillStyle = isSelected ? '#1e3a8a' : '#334155';
      ctx.font = isSelected ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.fillText(ac.callsign, px + 8, py - 2);

      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      if (timeRemaining <= 0) {
        ctx.fillText(`Landed`, px + 8, py + 9);
      } else {
        ctx.fillText(`T-${timeRemaining.toFixed(0)}s`, px + 8, py + 9);
      }
    });
  };

  const selectedAircraft = schedule.find((s) => s.aircraftId === selectedAircraftId);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
      {/* Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">
              Airport Approach & Radar View
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Simulate airplanes arriving at Runway 09. Click on any plane to inspect its details.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <div className="text-right mr-2 text-xs">
            <span className="text-gray-500 block text-[10px]">TIME</span>
            <span className="font-bold text-gray-900">
              T+{currentTime.toFixed(0)}s
            </span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(minTime);
            }}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs text-gray-600">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded transition-colors ${
                  playbackSpeed === spd ? 'bg-white text-gray-900 font-bold shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas and Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Clean Canvas */}
        <div className="lg:col-span-3 bg-slate-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-2 relative">
          <canvas
            ref={canvasRef}
            width={720}
            height={400}
            className="w-full h-auto max-h-[400px] cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = ((e.clientX - rect.left) / rect.width) * 720;
              const clickY = ((e.clientY - rect.top) / rect.height) * 400;

              let closestId: number | null = null;
              let minDistance = 30;

              const cx = 720 * 0.45;
              const cy = 400 * 0.5;
              const maxRadius = Math.min(cx - 30, cy - 30);

              schedule.forEach((ac, idx) => {
                const timeRemaining = ac.landingTime - currentTime;
                let px: number;
                let py: number;

                if (timeRemaining <= 0) {
                  const taxiDist = Math.min(70, Math.abs(timeRemaining) * 4);
                  px = cx + 80 + taxiDist;
                  py = cy + ((idx % 3) - 1) * 16;
                } else {
                  const normDist = Math.min(1.0, timeRemaining / 120.0);
                  const radius = normDist * (maxRadius - 20) + 20;
                  const angleOffset = Math.sin(ac.aircraftId * 1.7) * 0.7;
                  const angle = Math.PI + angleOffset;
                  px = cx + Math.cos(angle) * radius;
                  py = cy + Math.sin(angle) * radius;
                }

                const dist = Math.hypot(px - clickX, py - clickY);
                if (dist < minDistance) {
                  minDistance = dist;
                  closestId = ac.aircraftId;
                }
              });

              setSelectedAircraftId(closestId);
            }}
          />

          {/* Simple Legend */}
          <div className="absolute bottom-3 left-4 flex items-center gap-3 text-xs text-gray-600 bg-white/90 px-3 py-1 rounded-md border border-gray-200 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> On-Time
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Early
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Delayed
            </span>
          </div>
        </div>

        {/* Selected Flight Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between text-xs">
          <div>
            <h3 className="font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">
              Flight Details
            </h3>

            {selectedAircraft ? (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="text-gray-500 text-[11px]">Flight Callsign</div>
                  <div className="text-base font-bold text-gray-900">{selectedAircraft.callsign}</div>
                  <div className="text-gray-500 text-[11px] mt-1">Landing #{selectedAircraft.position} of {schedule.length}</div>
                </div>

                <div className="space-y-1.5 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Scheduled Landing:</span>
                    <span className="font-bold text-gray-900">{selectedAircraft.landingTime.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Time:</span>
                    <span className="text-gray-800">{selectedAircraft.target.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Allowed Window:</span>
                    <span className="text-gray-800">[{selectedAircraft.earliest.toFixed(0)}s .. {selectedAircraft.latest.toFixed(0)}s]</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-semibold ${
                      selectedAircraft.deviationType === 'Late' ? 'text-amber-600' : selectedAircraft.deviationType === 'Early' ? 'text-blue-600' : 'text-emerald-600'
                    }`}>
                      {selectedAircraft.deviationType} ({selectedAircraft.deviation.toFixed(1)}s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Penalty Cost:</span>
                    <span className="font-semibold text-gray-900">${selectedAircraft.penalty.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center p-3 text-gray-400">
                <Info className="w-5 h-5 mb-1 text-gray-400" />
                <span>Click any plane on the map or click its name below to view its details.</span>
              </div>
            )}
          </div>

          {/* Quick Click List */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1.5">
              Select Flight
            </span>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {schedule.map((s) => (
                <button
                  key={s.aircraftId}
                  onClick={() => setSelectedAircraftId(s.aircraftId)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    selectedAircraftId === s.aircraftId
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {s.callsign}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Timeline Slider */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Simulation Progress</span>
          <span className="font-semibold text-gray-700">T+{currentTime.toFixed(0)}s</span>
        </div>
        <input
          type="range"
          min={minTime}
          max={maxTime + 10}
          step={1}
          value={currentTime}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentTime(parseFloat(e.target.value));
          }}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    </div>
  );
};
