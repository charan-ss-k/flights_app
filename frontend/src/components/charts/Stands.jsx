import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const Stands = ({ flightData, loading }) => {
  const [pstaData, setPstaData] = useState([]);
  const [pstdData, setPstdData] = useState([]);
  const [stats, setStats] = useState({
    avgPsta: 0,
    avgPstd: 0,
    maxPsta: 0,
    maxPstd: 0,
    minPsta: 0,
    minPstd: 0,
    medianPsta: 0,
    medianPstd: 0,
    flightsWithPsta: 0,
    flightsWithPstd: 0
  });
  const [activeTab, setActiveTab] = useState('psta');

  const safeToNumber = (value) => {
    if (value === null || value === undefined || value === "" || value === "-") return null;
    const num = Number(value);
    return !isNaN(num) ? num : null;
  };

  const calculateMedian = (values) => {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
    } else {
      return sorted[middle];
    }
  };

  const analyzePassengerStandTimes = useCallback(() => {
    const isValidStandRange = (standNum) => {
      return (standNum >= 1 && standNum <= 80) || (standNum >= 201 && standNum <= 220);
    };
    
    const createRangeKey = (standNum) => {
      if (standNum >= 1 && standNum <= 80) {
        const rangeStart = Math.ceil(standNum / 10) * 10 - 9;
        const rangeEnd = Math.min(rangeStart + 9, 80);
        return `${rangeStart}-${rangeEnd}`;
      } else if (standNum >= 201 && standNum <= 220) {
        if (standNum >= 201 && standNum <= 210) {
          return "201-210";
        } else if (standNum >= 211 && standNum <= 220) {
          return "211-220";
        }
      }
      return null;
    };
    
    const arrivalsWithPsta = flightData.filter(flight => {
      const isArrival = flight.flight_type === 'ARR';
      const pstaValue = safeToNumber(flight.psta);
      const hasPsta = pstaValue !== null;
      const isValidRange = hasPsta && isValidStandRange(pstaValue);
      
      return isArrival && hasPsta && isValidRange;
    });
    
    const departuresWithPstd = flightData.filter(flight => {
      const isDeparture = flight.flight_type === 'DEP' || flight.flight_type === 'DER';
      const pstdValue = flight.pstd || flight.passenger_stand_time_departure || flight.PSTD;
      const pstdNum = safeToNumber(pstdValue);
      const hasPstd = pstdNum !== null;
      const isValidRange = hasPstd && isValidStandRange(pstdNum);
      
      return isDeparture && hasPstd && isValidRange;
    });
    
    const allPstaValues = arrivalsWithPsta.map(flight => safeToNumber(flight.psta)).filter(val => val !== null);
    const allPstdValues = departuresWithPstd.map(flight => {
      const pstdValue = flight.pstd || flight.passenger_stand_time_departure || flight.PSTD;
      return safeToNumber(pstdValue);
    }).filter(val => val !== null);

    const pstaRanges = {};
    const pstaStandCounts = {};
    let totalPsta = 0;
    
    arrivalsWithPsta.forEach(flight => {
      const psta = safeToNumber(flight.psta);
      if (psta === null || !isValidStandRange(psta)) return;
      
      totalPsta += psta;
      
      if (!pstaStandCounts[psta]) {
        pstaStandCounts[psta] = 0;
      }
      pstaStandCounts[psta]++;
      
      const rangeLabel = createRangeKey(psta);
      if (!rangeLabel) return;
      
      if (!pstaRanges[rangeLabel]) {
        pstaRanges[rangeLabel] = {
          range: rangeLabel,
          count: 0,
          standCounts: {}
        };
      }
      
      pstaRanges[rangeLabel].count++;
      
      if (!pstaRanges[rangeLabel].standCounts[psta]) {
        pstaRanges[rangeLabel].standCounts[psta] = 0;
      }
      pstaRanges[rangeLabel].standCounts[psta]++;
    });

    const pstdRanges = {};
    const pstdStandCounts = {};
    let totalPstd = 0;
    
    departuresWithPstd.forEach(flight => {
      const pstdValue = flight.pstd || flight.passenger_stand_time_departure || flight.PSTD;
      const pstd = safeToNumber(pstdValue);
      if (pstd === null || !isValidStandRange(pstd)) return;
      
      totalPstd += pstd;
      
      if (!pstdStandCounts[pstd]) {
        pstdStandCounts[pstd] = 0;
      }
      pstdStandCounts[pstd]++;
      
      const rangeLabel = createRangeKey(pstd);
      if (!rangeLabel) return;
      
      if (!pstdRanges[rangeLabel]) {
        pstdRanges[rangeLabel] = {
          range: rangeLabel,
          count: 0,
          standCounts: {}
        };
      }
      
      pstdRanges[rangeLabel].count++;
      
      if (!pstdRanges[rangeLabel].standCounts[pstd]) {
        pstdRanges[rangeLabel].standCounts[pstd] = 0;
      }
      pstdRanges[rangeLabel].standCounts[pstd]++;
    });

    const sortRanges = (ranges) => {
      return ranges.sort((a, b) => {
        const aStart = parseInt(a.range.split('-')[0]);
        const bStart = parseInt(b.range.split('-')[0]);
        return aStart - bStart;
      });
    };

    const pstaArray = sortRanges(Object.values(pstaRanges));
    const pstdArray = sortRanges(Object.values(pstdRanges));

    const pstaStandNumbers = Object.keys(pstaStandCounts).map(Number);
    const pstdStandNumbers = Object.keys(pstdStandCounts).map(Number);
    
    let maxPstaStand = '';
    let minPstaStand = '';
    let maxPstdStand = '';
    let minPstdStand = '';
    
    if (pstaStandNumbers.length > 0) {
      const maxPstaCount = Math.max(...Object.values(pstaStandCounts));
      const minPstaCount = Math.min(...Object.values(pstaStandCounts));
      
      maxPstaStand = Object.keys(pstaStandCounts).find(stand => 
        pstaStandCounts[stand] === maxPstaCount
      );
        
      minPstaStand = Object.keys(pstaStandCounts).find(stand => 
        pstaStandCounts[stand] === minPstaCount
      );
    }
    
    if (pstdStandNumbers.length > 0) {
      const maxPstdCount = Math.max(...Object.values(pstdStandCounts));
      const minPstdCount = Math.min(...Object.values(pstdStandCounts));
      
      maxPstdStand = Object.keys(pstdStandCounts).find(stand => 
        pstdStandCounts[stand] === maxPstdCount
      );
      
      minPstdStand = Object.keys(pstdStandCounts).find(stand => 
        pstdStandCounts[stand] === minPstdCount
      );
    }

    const medianPsta = calculateMedian(allPstaValues);
    const medianPstd = calculateMedian(allPstdValues);

    setPstaData(pstaArray);
    setPstdData(pstdArray);
    
    const newStats = {
      avgPsta: arrivalsWithPsta.length > 0 ? Math.round(totalPsta / arrivalsWithPsta.length) : 0,
      avgPstd: departuresWithPstd.length > 0 ? Math.round(totalPstd / departuresWithPstd.length) : 0,
      maxPsta: maxPstaStand,
      maxPstd: maxPstdStand,
      minPsta: minPstaStand,
      minPstd: minPstdStand,
      medianPsta,
      medianPstd,
      flightsWithPsta: arrivalsWithPsta.length,
      flightsWithPstd: departuresWithPstd.length
    };
    
    setStats(newStats);
  }, [flightData]);

  useEffect(() => {
    if (!loading && flightData && flightData.length > 0) {
      analyzePassengerStandTimes();
    }
  }, [flightData, loading, analyzePassengerStandTimes]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const standType = activeTab === 'psta' ? 'PSTA' : 'PSTD';
      
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl max-w-80 min-w-60">
          <p 
            className="font-bold text-sm mb-2"
            style={{ color: payload[0].color }}
          >
            {standType} Range: {data.range}
          </p>
          
          <p className="text-sm font-semibold text-gray-700 mb-3">
            <span className="font-medium">Total Flights:</span> 
            <span className="ml-2 font-bold" style={{ color: payload[0].color }}>
              {data.count}
            </span>
          </p>

          {data.standCounts && Object.keys(data.standCounts).length > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Individual Stands:
              </p>
              
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(data.standCounts)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([stand, count], index) => (
                    <div 
                      key={index} 
                      className="flex flex-col items-center px-2 py-1.5 bg-gray-50 rounded-md text-xs"
                    >
                      <span 
                        className="font-semibold text-xs"
                        style={{ color: payload[0].color }}
                      >
                        {stand}
                      </span>
                      <span className="text-gray-600 font-medium text-xs">
                        {count}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
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
          <p className="text-slate-600 font-medium animate-pulse">Loading passenger stand time data...</p>
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
          <p className="text-slate-600 font-medium">No passenger stand time data available</p>
        </div>
      </div>
    );
  }

  const activeData = activeTab === 'psta' ? pstaData : pstdData;
  const maxValue = activeTab === 'psta' ? stats.maxPsta : stats.maxPstd;
  const minValue = activeTab === 'psta' ? stats.minPsta : stats.minPstd;
  const flightCount = activeTab === 'psta' ? stats.flightsWithPsta : stats.flightsWithPstd;
  
  const hasData = activeData && activeData.length > 0;
  if (!hasData) {
    return (
      <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
        <div className="absolute inset-0 bg-rose-50 rounded-2xl"></div>
        
        <div className="relative z-10 p-6 space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-1 rounded-lg inline-flex space-x-1 shadow-sm border">
              <button 
                onClick={() => setActiveTab('psta')}
                className={`tab-button px-4 py-2 rounded-md font-medium text-sm ${
                  activeTab === 'psta' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600'
                }`}
              >
                PSTA Arrivals
              </button>
              <button 
                onClick={() => setActiveTab('pstd')}
                className={`tab-button px-4 py-2 rounded-md font-medium text-sm ${
                  activeTab === 'pstd' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600'
                }`}
              >
                PSTD Departures
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-60">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">
                No {activeTab === 'psta' ? 'PSTA' : 'PSTD'} data available
              </p>
              <p className="text-slate-500 text-sm">for selected date</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
      <div className="absolute inset-0 bg-rose-50 rounded-2xl"></div>
      
      <div className="relative z-10 p-6 space-y-6">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1.5 rounded-xl inline-flex space-x-1 shadow-inner">
            <button 
              onClick={() => setActiveTab('psta')}
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeTab === 'psta' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span className="transition-all duration-300">PSTA</span>
              </div>
              {activeTab === 'psta' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('pstd')}
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeTab === 'pstd' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
              }`}
            >
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span className="transition-all duration-300">PSTD</span>
              </div>
              {activeTab === 'pstd' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-400/20 via-emerald-500/15 to-green-400/20 rounded-2xl p-6 border border-emerald-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-700 mb-1">
                  {minValue || 'N/A'}
                </div>
                <div className="text-emerald-600 text-sm font-semibold">Least Used Stand</div>
              </div>
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" fill="currentColor" d="M12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.3166 21.0976 11.6834 21.0976 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3Z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400/20 via-blue-500/15 to-indigo-400/20 rounded-2xl p-6 border border-blue-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {maxValue || 'N/A'}
                </div>
                <div className="text-blue-600 text-sm font-semibold">Most Used Stand</div>
              </div>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" transform='rotate(180)'>
                <path strokeLinecap="round" strokeLinejoin="round" fill='currentColor' d="M12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.3166 21.0976 11.6834 21.0976 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3Z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400/20 via-orange-500/15 to-amber-400/20 rounded-2xl p-6 border border-orange-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-700 mb-1">
                  {flightCount}
                </div>
                <div className="text-orange-600 text-sm font-semibold">Total Flights</div>
              </div>
              <svg className="w-12 h-12 text-orange-600" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  d="M12.382 5.304 10.096 7.59l.006.02L11.838 14a.908.908 0 0 1-.211.794l-.573.573a.339.339 0 0 1-.566-.08l-2.348-4.25-.745-.746-1.97 1.97a3.311 3.311 0 0 1-.75.504l.44 1.447a.875.875 0 0 1-.199.79l-.175.176a.477.477 0 0 1-.672 0l-1.04-1.039-.018-.02-.788-.786-.02-.02-1.038-1.039a.477.477 0 0 1 0-.672l.176-.176a.875.875 0 0 1 .79-.197l1.447.438a3.322 3.322 0 0 1 .504-.75l1.97-1.97-.746-.744-4.25-2.348a.339.339 0 0 1-.08-.566l.573-.573a.909.909 0 0 1 .794-.211l6.39 1.736.02.006 2.286-2.286c.37-.372 1.621-1.02 1.993-.65.37.372-.279 1.622-.65 1.993z" 
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={activeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e2e8f0" 
                strokeWidth={1}
                opacity={0.7}
              />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 11, fill: '#374151', fontWeight: '500' }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                interval={0}
                textAnchor="middle"
                height={60}
                label={{ 
                  value: 'Stand Ranges', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fontSize: '12px', fontWeight: '600', fill: '#374151' }
                }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#374151', fontWeight: '500' }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                label={{ 
                  value: 'Number of Flights', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '12px', fontWeight: '600', fill: '#374151' }
                }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                animationDuration={0}
              />
              <Legend 
                verticalAlign="top"
                height={40}
                wrapperStyle={{ 
                  paddingTop: '0px', 
                  paddingBottom: '15px', 
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                iconType="circle"
              />
              <Bar 
                dataKey="count" 
                name={activeTab === 'psta' ? 'PSTA Arrivals' : 'PSTD Departures'} 
                fill={activeTab === 'psta' ? '#3b82f6' : '#10b981'}
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: '350', 
                    fill: '#374151' 
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stands;