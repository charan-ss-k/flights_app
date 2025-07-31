import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

const AirportCapacityMonitor = ({ flightData, loading }) => {
  const [capacityData, setCapacityData] = useState([]);
  const [maxCapacity, setMaxCapacity] = useState(0);
  
  const THEORETICAL_MAX_CAPACITY = 40;

  const calculateHourlyCapacity = useCallback(() => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      arrival: 0,
      departure: 0,
      total: 0,
      utilizationPct: 0
    }));

    flightData.forEach(flight => {
      const isArrival = flight.flight_type === 'ARR';
      const isDeparture = flight.flight_type === 'DER';
      
      if (!isArrival && !isDeparture) return;
      
      const timeStr = isArrival ? flight.etoa : flight.etod;
      
      if (!timeStr) return;
      
      try {
        const formatDateTime = (dateStr) => {
          if (typeof dateStr === 'string' && dateStr.includes(' ') && !dateStr.includes('T')) {
            return dateStr.replace(' ', 'T');
          }
          return dateStr;
        };
        
        const flightTime = new Date(formatDateTime(timeStr));
        
        if (isNaN(flightTime.getTime())) {
          console.warn(`Invalid date for flight:`, timeStr);
          return;
        }
        
        const hour = flightTime.getHours();
        
        if (isArrival) {
          hourlyData[hour].arrival += 1;
        } else {
          hourlyData[hour].departure += 1;
        }
        
        hourlyData[hour].total += 1;
        
        hourlyData[hour].utilizationPct = Math.min(
          Math.round((hourlyData[hour].total / THEORETICAL_MAX_CAPACITY) * 100), 
          100
        );
      } catch (e) {
        console.error("Error parsing time:", e);
      }
    });

    let maxCapacityHour = 0;
    let maxCapacityValue = 0;
    
    hourlyData.forEach((data) => {
      if (data.total > maxCapacityValue) {
        maxCapacityValue = data.total;
        maxCapacityHour = data.hour;
      }
    });
    
    setMaxCapacity({
      hour: maxCapacityHour,
      value: maxCapacityValue,
      percentage: Math.min(Math.round((maxCapacityValue / THEORETICAL_MAX_CAPACITY) * 100), 100)
    });
    
    setCapacityData(hourlyData);
  }, [flightData, THEORETICAL_MAX_CAPACITY]);

  useEffect(() => {
    if (!loading && flightData && flightData.length > 0) {
      calculateHourlyCapacity();
    }
  }, [flightData, loading, calculateHourlyCapacity]);

  const getUtilizationColor = (percentage) => {
    if (percentage < 75) return '#f59e0b';
    return '#ef4444';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const totalFlights = payload.reduce((sum, entry) => sum + entry.value, 0);
      const utilizationPct = Math.round((totalFlights / THEORETICAL_MAX_CAPACITY) * 100);
      
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <p className="text-sm font-medium text-gray-600">
              Total: {totalFlights}
            </p>
            <p 
              className="text-sm font-medium"
              style={{ color: getUtilizationColor(utilizationPct) }}
            >
              Utilization: {utilizationPct}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Loading capacity analysis...</p>
        </div>
      </div>
    );
  }

  if (!flightData || flightData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No flight data available</p>
          <p className="text-slate-500 text-sm">for capacity analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
      <div className="absolute inset-0 bg-cyan-50 rounded-2xl"></div>
      
      <div className="relative z-10 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-400/20 via-blue-500/15 to-indigo-400/20 rounded-2xl p-6 border border-blue-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-black text-blue-700 mb-2">
                  {maxCapacity.hour}:00
                </div>
                <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Peak Hour
                </div>
              </div>
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-400/20 via-emerald-500/15 to-green-400/20 rounded-2xl p-6 border border-emerald-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-black text-emerald-700 mb-2">
                  {maxCapacity.value}
                </div>
                <div className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  Peak Flights
                </div>
              </div>
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400/20 via-orange-500/15 to-amber-400/20 rounded-2xl p-6 border border-orange-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>    
                <div 
                  className="text-4xl font-black mb-2"
                  style={{ color: getUtilizationColor(maxCapacity.percentage) }}
                >
                  {maxCapacity.percentage}%
                </div>
                <div className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  Max Utilization
                </div>
              </div>
              <svg className="w-14 h-14 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m6.5 7.5h4l-6 9v-6.997l-4-.003 6-9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart
              data={capacityData}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="#e2e8f0" 
                strokeWidth={1}
                opacity={0.5}
              />
              <XAxis 
                dataKey="time" 
                label={{ 
                  value: 'Time (24-Hour Format)', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '600', fill: '#374151' }
                }}
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: '500' }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Flights', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '600', fill: '#374151' }
                }}
                domain={[0, 40]}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                animationDuration={200}
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
                y={THEORETICAL_MAX_CAPACITY} 
                label={{ 
                  value: 'Maximum Capacity (40)', 
                  position: 'top',
                  style: { fontSize: '12px', fontWeight: '600', fill: '#dc2626' }
                }} 
                stroke="#dc2626"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
              <ReferenceLine 
                y={Math.round(THEORETICAL_MAX_CAPACITY * 0.75)} 
                label={{ 
                  value: '75% Capacity (30)', 
                  position: 'top',
                  style: { fontSize: '12px', fontWeight: '600', fill: '#d97706' }
                }} 
                stroke="#d97706"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
              
              <Area 
                type="monotone" 
                dataKey="arrival" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="Arrivals"
                strokeWidth={3}
              />
              <Area 
                type="monotone" 
                dataKey="departure" 
                stackId="1" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Departures"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AirportCapacityMonitor;