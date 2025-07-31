import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const PeakHourAnalysis = ({ flightData, loading }) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [peakIntervals, setPeakIntervals] = useState({ arrival: null, departure: null, combined: null });

  const analyzeHourlyDistribution = useCallback(() => {
    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: `${i.toString().padStart(2, '0')}:00`,
      arrivals: 0,
      departures: 0,
      total: 0
    }));

    flightData.forEach(flight => {
      const isArrival = flight.flight_type === 'ARR';
      const timeStr = isArrival ? flight.etoa : flight.etod;
      
      if (!timeStr) return;
      
      try {
        const flightTime = new Date(timeStr);
        const hour = flightTime.getHours();
        
        if (isArrival) {
          hourly[hour].arrivals += 1;
          hourly[hour].total += 1;
        } else {
          hourly[hour].departures += 1;
          hourly[hour].total += 1;
        }
      } catch (e) {
        console.error("Error parsing time:", e);
      }
    });

    let maxArrivals = 0, maxDepartures = 0, maxTotal = 0;
    let peakArrivalInterval = null, peakDepartureInterval = null, peakTotalInterval = null;
    
    hourly.forEach((data) => {
      if (data.arrivals > maxArrivals) {
        maxArrivals = data.arrivals;
        peakArrivalInterval = data.hour;
      }
      
      if (data.departures > maxDepartures) {
        maxDepartures = data.departures;
        peakDepartureInterval = data.hour;
      }
      
      if (data.total > maxTotal) {
        maxTotal = data.total;
        peakTotalInterval = data.hour;
      }
    });

    setPeakIntervals({
      arrival: peakArrivalInterval,
      departure: peakDepartureInterval,
      combined: peakTotalInterval
    });
    
    setHourlyData(hourly);
  }, [flightData]);

  useEffect(() => {
    if (!loading && flightData && flightData.length > 0) {
      analyzeHourlyDistribution();
    }
  }, [flightData, loading, analyzeHourlyDistribution]);

  const formatTimeInterval = (hour) => {
    const nextHour = (hour + 1) % 24;
    return `${hour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`;
  };

  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl min-w-[200px] transition-all duration-300">
          <p className="font-bold text-gray-900 mb-2 text-sm border-b border-gray-200 pb-2">
            {`Time: ${label}`}
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => {
              let displayName = '';
              if (entry.dataKey === 'arrivals') displayName = 'Arrival Flights';
              else if (entry.dataKey === 'departures') displayName = 'Departure Flights';
              else if (entry.dataKey === 'total') displayName = 'Total Flights';
              
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-gray-700 font-medium">{displayName}:</span>
                  </div>
                  <span className="font-bold" style={{ color: entry.color }}>
                    {entry.value}
                  </span>
                </div>
              );
            })}
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
          <p className="text-slate-600 font-medium animate-pulse">Loading hourly analysis...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No flight data available</p>
          <p className="text-slate-500 text-sm">for hourly analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
      <div className="absolute inset-0 bg-cyan-50 rounded-2xl"></div>
      
      <div className="relative z-10 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-400/20 via-emerald-500/15 to-green-400/20 rounded-2xl p-6 border border-emerald-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-emerald-700 mb-1">
                  {peakIntervals.arrival !== null ? formatTimeInterval(peakIntervals.arrival) : 'N/A'}
                </div>
                <div className="text-emerald-600 text-sm font-semibold">Peak Arrival Time</div>
              </div>
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-400/20 via-blue-500/15 to-cyan-400/20 rounded-2xl p-6 border border-blue-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-blue-700 mb-1">
                  {peakIntervals.departure !== null ? formatTimeInterval(peakIntervals.departure) : 'N/A'}
                </div>
                <div className="text-blue-600 text-sm font-semibold">Peak Departure Time</div>
              </div>
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-400/20 via-orange-500/15 to-amber-400/20 rounded-2xl p-6 border border-orange-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-orange-700 mb-1">
                  {peakIntervals.combined !== null ? formatTimeInterval(peakIntervals.combined) : 'N/A'}
                </div>
                <div className="text-orange-600 text-sm font-semibold">Peak Combined Time</div>
              </div>
                <svg className="w-12 h-12 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m6.5 7.5h4l-6 9v-6.997l-4-.003 6-9z" />
                </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <ResponsiveContainer width="100%" height={450}>
            <LineChart
              data={hourlyData}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e2e8f0" 
                strokeWidth={1}
                opacity={0.7}
              />
              <XAxis 
                dataKey="hourLabel" 
                label={{ 
                  value: 'Hour of Day', 
                  position: 'insideBottom', 
                  offset: -5,
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '600', fill: '#374151' }
                }} 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Flights', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '600', fill: '#374151' }
                }} 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ 
                  strokeDasharray: '3 3', 
                  stroke: '#3b82f6',
                  strokeWidth: 2,
                  opacity: 0.7
                }}
                animationDuration={200}
              />
              <Legend 
                verticalAlign="top"
                height={60}
                wrapperStyle={{
                  fontSize: '14px',
                  fontWeight: '500',
                  paddingTop: '0px',
                  paddingBottom: '5px'
                }}
                iconType="line"
              />
              
              {peakIntervals.arrival !== null && (
                <ReferenceLine 
                  x={formatHour(peakIntervals.arrival)} 
                  stroke="#10b981" 
                  strokeDasharray="5 5" 
                  strokeWidth={3}
                  opacity={0.8}
                  label={{ 
                    value: 'Peak Arrivals', 
                    position: 'top',
                    offset: 10,
                    style: { fontSize: '12px', fontWeight: '600', fill: '#10b981' }
                  }}
                />
              )}
              
              {peakIntervals.departure !== null && (
                <ReferenceLine 
                  x={formatHour(peakIntervals.departure)} 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5" 
                  strokeWidth={3}
                  opacity={0.8}
                  label={{ 
                    value: 'Peak Departures', 
                    position: 'top',
                    offset: 10,
                    style: { fontSize: '12px', fontWeight: '600', fill: '#3b82f6' }
                  }}
                />
              )}
              
              <Line 
                type="linear" 
                dataKey="arrivals" 
                name="Arrivals" 
                stroke="#10b981" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 8, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }}
              />
              <Line 
                type="linear" 
                dataKey="departures" 
                name="Departures" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 8, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }}
              />
              <Line 
                type="linear" 
                dataKey="total" 
                name="Total Flights" 
                stroke="#f97316" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#f97316', strokeWidth: 0 }}
                activeDot={{ r: 8, fill: '#f97316', strokeWidth: 3, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PeakHourAnalysis;