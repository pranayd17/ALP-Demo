import React, { useState, useMemo } from 'react';
import { ScheduledAircraft } from '../types/alp';
import { Download, Search } from 'lucide-react';

interface ScheduleTableProps {
  schedule: ScheduledAircraft[];
  instanceName: string;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule, instanceName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Early' | 'On-Time' | 'Late'>('All');

  const filteredSchedule = useMemo(() => {
    return schedule.filter((s) => {
      const matchesSearch =
        s.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.aircraftId.toString().includes(searchTerm);
      const matchesFilter = filterType === 'All' || s.deviationType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [schedule, searchTerm, filterType]);

  const handleExportCSV = () => {
    if (schedule.length === 0) return;

    const headers = [
      'Landing Order',
      'Aircraft ID',
      'Flight Callsign',
      'Scheduled Landing Time (s)',
      'Target Time (s)',
      'Earliest (s)',
      'Latest (s)',
      'Status',
      'Time Deviation (s)',
      'Penalty Cost ($)',
    ];

    const rows = schedule.map((s) => [
      s.position,
      s.aircraftId,
      s.callsign,
      s.landingTime.toFixed(2),
      s.target.toFixed(1),
      s.earliest.toFixed(1),
      s.latest.toFixed(1),
      s.deviationType,
      s.deviation.toFixed(2),
      s.penalty.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Landing_Schedule_${instanceName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
      {/* Table Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Landing Sequence Schedule
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Optimized landing times and penalties for each arrival flight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search flight..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-40"
            />
          </div>

          {/* Simple Filter Dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="On-Time">On-Time Only</option>
            <option value="Early">Early Landings</option>
            <option value="Late">Delayed Landings</option>
          </select>

          {/* CSV Download Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Clean Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-3">Order</th>
              <th className="py-2.5 px-3">Flight</th>
              <th className="py-2.5 px-3">Landing Time</th>
              <th className="py-2.5 px-3">Target Time</th>
              <th className="py-2.5 px-3">Allowed Window</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Difference</th>
              <th className="py-2.5 px-3">Penalty Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSchedule.length > 0 ? (
              filteredSchedule.map((s) => {
                const isEarly = s.deviationType === 'Early';
                const isLate = s.deviationType === 'Late';

                return (
                  <tr key={s.aircraftId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-gray-900">#{s.position}</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-600">{s.callsign}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{s.landingTime.toFixed(2)}s</td>
                    <td className="py-2.5 px-3 text-gray-600">{s.target.toFixed(1)}s</td>
                    <td className="py-2.5 px-3 text-gray-500">[{s.earliest.toFixed(0)}s .. {s.latest.toFixed(0)}s]</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          isEarly
                            ? 'bg-blue-50 text-blue-700'
                            : isLate
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {s.deviationType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {s.deviation < 0.01 ? '0.0s' : `${isEarly ? '-' : '+'}${s.deviation.toFixed(1)}s`}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {s.penalty > 0 ? `$${s.penalty.toFixed(2)}` : '$0.00'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No flights match the search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
