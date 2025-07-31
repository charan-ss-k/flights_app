import React, { useState, useEffect, useCallback } from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
  Legend
} from "recharts";

const TIME_RANGES = [
  { label: "00:00 - 06:00", min: 0, max: 360 },
  { label: "06:00 - 12:00", min: 360, max: 720 },
  { label: "12:00 - 18:00", min: 720, max: 1080 },
  { label: "18:00 - 00:00", min: 1080, max: 1440 }
];

const FlightTimeChart = ({ flightData = [], loading }) => {
  const [activeTab, setActiveTab] = useState('arrivals');
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[0]);
  const [departureData, setDepartureData] = useState([]);
  const [arrivalData, setArrivalData] = useState([]);
  const [ , setPeakTimes] = useState({
    peakArrival: null,
    peakDeparture: null,
    peakCombined: null
  });
  const [stats, setStats] = useState({
    totalArrivals: 0,
    totalDepartures: 0,
    onTimeArrivalsPercent: 0,
    onTimeDeparturesPercent: 0
  });

  const formatMinutes = (minutes) => {
    if (minutes >= 1440) {
      return "00:00";
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const processFlightData = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      arrivals: 0,
      departures: 0,
      total: 0
    }));

    const arrivals = flightData
      .filter(flight => {
        const flight_type = flight.flight_type === "ARR";
        const flightDate = flight.stoa?.split('T')[0] || '';
        return flight_type && flightDate === today;
      })
      .map(flight => {
        const stoa = flight.stoa;
        const etoa = flight.etoa;
        if (!stoa || !etoa) return null;

        const stoaTime = parseInt(stoa.slice(11, 13), 10) * 60 + parseInt(stoa.slice(14, 16), 10);
        const etoaTime = parseInt(etoa.slice(11, 13), 10) * 60 + parseInt(etoa.slice(14, 16), 10);
        const hour = parseInt(stoa.slice(11, 13), 10);

        hourlyData[hour].arrivals++;
        hourlyData[hour].total++;

        const delayMinutes = etoaTime - stoaTime;
        const isOnTime = delayMinutes <= 30;

        return {
          flight: flight.flight,
          airline: flight.airline,
          origin: flight.origin,
          scheduledTime: stoaTime,
          estimatedTime: etoaTime,
          scheduledTimeStr: stoa.slice(11, 16),
          estimatedTimeStr: etoa.slice(11, 16),
          delayMinutes,
          isOnTime
        };
      })
      .filter(Boolean);

    const departures = flightData
      .filter(flight => {
        const flight_type = flight.flight_type === "DER" || flight.flight_type === "DEP";
        const flightDate = flight.stod?.split('T')[0] || '';
        return flight_type && flightDate === today;
      })
      .map(flight => {
        const stod = flight.stod;
        const etod = flight.etod;
        if (!stod || !etod) return null;

        const stodTime = parseInt(stod.slice(11, 13), 10) * 60 + parseInt(stod.slice(14, 16), 10);
        const etodTime = parseInt(etod.slice(11, 13), 10) * 60 + parseInt(etod.slice(14, 16), 10);
        const hour = parseInt(stod.slice(11, 13), 10);

        hourlyData[hour].departures++;
        hourlyData[hour].total++;

        const delayMinutes = etodTime - stodTime;
        const isOnTime = delayMinutes <= 30;

        return {
          flight: flight.flight,
          airline: flight.airline,
          destination: flight.destination,
          scheduledTime: stodTime,
          estimatedTime: etodTime,
          scheduledTimeStr: stod.slice(11, 16),
          estimatedTimeStr: etod.slice(11, 16),
          delayMinutes,
          isOnTime
        };
      })
      .filter(Boolean);

    let maxArrivals = 0, maxDepartures = 0, maxTotal = 0;
    let peakArrivalHour = null, peakDepartureHour = null, peakCombinedHour = null;

    hourlyData.forEach((data, hour) => {
      if (data.arrivals > maxArrivals) {
        maxArrivals = data.arrivals;
        peakArrivalHour = hour;
      }
      if (data.departures > maxDepartures) {
        maxDepartures = data.departures;
        peakDepartureHour = hour;
      }
      if (data.total > maxTotal) {
        maxTotal = data.total;
        peakCombinedHour = hour;
      }
    });

    setPeakTimes({
      peakArrival: peakArrivalHour !== null ? `${peakArrivalHour.toString().padStart(2, '0')}:00` : 'N/A',
      peakDeparture: peakDepartureHour !== null ? `${peakDepartureHour.toString().padStart(2, '0')}:00` : 'N/A',
      peakCombined: peakCombinedHour !== null ? `${peakCombinedHour.toString().padStart(2, '0')}:00` : 'N/A'
    });

    const filteredArrivals = arrivals.filter(
      f => f.scheduledTime >= selectedRange.min && f.scheduledTime < selectedRange.max
    );

    const filteredDepartures = departures.filter(
      f => f.scheduledTime >= selectedRange.min && f.scheduledTime < selectedRange.max
    );
    const onTimeArrivals = arrivals.filter(f => f.isOnTime).length;
    const onTimeDepartures = departures.filter(f => f.isOnTime).length;

    setArrivalData(filteredArrivals);
    setDepartureData(filteredDepartures);
    setStats({
      totalArrivals: filteredArrivals.length,
      totalDepartures: filteredDepartures.length,
      onTimeArrivalsPercent: arrivals.length > 0 ? Math.round((onTimeArrivals / arrivals.length) * 100) : 0,
      onTimeDeparturesPercent: departures.length > 0 ? Math.round((onTimeDepartures / departures.length) * 100) : 0
    });
  }, [flightData, selectedRange]);

  useEffect(() => {
    if (!loading && flightData && flightData.length > 0) {
      processFlightData();
    }
  }, [loading, flightData, processFlightData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const delayText = data.delayMinutes <= 0 
        ? `${Math.abs(data.delayMinutes)} mins early` 
        : `${data.delayMinutes} mins delayed`;

      const statusText = data.isOnTime ? "On time" : delayText;

      return (
        <div className="bg-white/95 backdrop-blur-sm text-gray-800 p-4 border border-gray-200 rounded-xl shadow-xl max-w-[280px] transition-all duration-300">
          <p className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-2 text-sm">
            ✈️ Flight: {data.flight}
          </p>
          <div className="space-y-2 text-sm">
            {activeTab === 'arrivals' && data.origin && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">From:</span>
                <span className="font-semibold text-indigo-600">{data.origin}</span>
              </div>
            )}
            {activeTab === 'departures' && data.destination && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">To:</span>
                <span className="font-semibold text-indigo-600">{data.destination}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Scheduled:</span>
              <span className="font-semibold text-blue-600">{data.scheduledTimeStr}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Estimated:</span>
              <span className="font-semibold text-purple-600">{data.estimatedTimeStr}</span>
            </div>
            <div className={`mt-3 p-2 rounded-lg text-center font-bold text-sm ${
              data.isOnTime 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {statusText}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const activeData = activeTab === 'arrivals' ? arrivalData : departureData;
  const xAxisLabel = activeTab === 'arrivals' ? 'Scheduled Arrival Time (STOA)' : 'Scheduled Departure Time (STOD)';
  const yAxisLabel = activeTab === 'arrivals' ? 'Estimated Arrival Time (ETOA)' : 'Estimated Departure Time (ETOD)';
  
  const xMin = selectedRange.min;
  const xMax = selectedRange.max;
  const yMin = selectedRange.min;
  const yMax = selectedRange.max + 60;

  const generateTicks = (min, max) => {
    const interval = Math.max(Math.floor((max - min) / 6), 30);
    const ticks = [];
    for (let i = min; i <= max; i += interval) {
      ticks.push(i);
    }
    if (!ticks.includes(max)) {
      ticks.push(max);
    }
    return ticks;
  };

  const xTicks = generateTicks(xMin, xMax);
  const yTicks = generateTicks(yMin, yMax);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Loading flight schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
      <div className="absolute inset-0 bg-cyan-50 rounded-2xl"></div>
      
      <div className="relative z-10 p-6 space-y-6">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1.5 rounded-xl inline-flex space-x-1 shadow-inner">
            <button 
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeTab === 'arrivals' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
              }`}
              onClick={() => setActiveTab('arrivals')}
            >
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span className="transition-all duration-300">Arrivals</span>
              </div>
              {activeTab === 'arrivals' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
            
            <button 
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeTab === 'departures' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
              }`}
              onClick={() => setActiveTab('departures')}
            >
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span className="transition-all duration-300">Departures</span>
              </div>
              {activeTab === 'departures' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-100 rounded-2xl p-5 border border-blue-200/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    {activeTab === 'arrivals' ? stats.totalArrivals : stats.totalDepartures}
                  </div>
                  <div className="text-blue-600 text-sm font-semibold">
                    Total {activeTab === 'arrivals' ? 'Arrivals' : 'Departures'}
                  </div>
                </div>
                <div className="text-blue-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d={activeTab === 'departures' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 rounded-2xl p-5 border border-emerald-200/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold mb-1 text-emerald-700">
                    {activeTab === 'arrivals' ? stats.onTimeArrivalsPercent : stats.onTimeDeparturesPercent}%
                  </div>
                  <div className="text-emerald-600 text-sm font-semibold">On-Time Performance</div>
                </div>
                <div className="text-emerald-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1.5 rounded-xl inline-flex space-x-1 shadow-inner">
            {TIME_RANGES.map(range => (
              <button
                key={range.label}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform ${
                  selectedRange.label === range.label
                    ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-indigo-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-105'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{range.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 60 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e2e8f0" 
                strokeWidth={1}
                opacity={0.7}
              />
              <XAxis 
                type="number" 
                dataKey="scheduledTime" 
                name="Scheduled Time" 
                tickFormatter={formatMinutes}
                domain={[xMin, xMax]}
                ticks={xTicks}
                label={{ 
                  value: xAxisLabel, 
                  position: "insideBottom", 
                  offset: -10,
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '600', fill: '#374151' }
                }}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              />
              <YAxis 
                type="number" 
                dataKey="estimatedTime" 
                name="Estimated Time" 
                tickFormatter={formatMinutes}
                domain={[yMin, yMax]} 
                ticks={yTicks}
                label={{ 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: "insideLeft",
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '600', fill: '#374151' }
                }}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              />
              <ZAxis type="number" range={[80, 80]} />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ 
                  strokeDasharray: '3 3', 
                  stroke: '#3b82f6',
                  strokeWidth: 2,
                  opacity: 0.7
                }}
                animationDuration={0}
              />
              
              <Legend 
                verticalAlign="top"
                height={50}
                wrapperStyle={{
                  fontSize: '14px',
                  fontWeight: '600',
                  paddingBottom: '10px'
                }}
                iconType="circle"
              />
              
              <ReferenceLine
                segment={[
                  { x: xMin, y: xMin + 30 },
                  { x: xMax, y: xMax + 30 }
                ]}
                stroke="#f59e0b"
                strokeDasharray="8,4"
                strokeWidth={3}
                opacity={0.8}
              />
              
              <Scatter 
                name="On Time" 
                data={activeData.filter(d => d.isOnTime)} 
                fill="#10b981"
                fillOpacity={1}
              />
              <Scatter 
                name="Delayed" 
                data={activeData.filter(d => !d.isOnTime)} 
                fill="#ef4444"
                fillOpacity={1}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {!loading && activeData.length === 0 && (
          <div className="flex items-center justify-center mt-8 p-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">No flight data available</p>
              <p className="text-slate-500 text-sm">for the selected time range</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightTimeChart;