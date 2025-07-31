import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FlightTypeChart = ({ flightData, loading }) => {
  const [chartData, setChartData] = useState([]);
  const [flightStats, setFlightStats] = useState({
    totalFlights: 0,
    international: 0,
    domestic: 0
  });
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    if (!loading && flightData && flightData.length > 0) {
      analyzeFlightTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightData, loading]);

  const analyzeFlightTypes = () => {
    let totalFlights = 0;
    let internationalCount = 0;
    let domesticCount = 0;

    const counts = {
      international: { arrivals: 0, departures: 0 },
      domestic: { arrivals: 0, departures: 0 }
    };

    flightData.forEach(flight => {
      if (!flight.flight_mode || !flight.flight_type) return;
      
      totalFlights++;
      
      const isInternational = flight.flight_mode === 'INT';
      const isArrival = flight.flight_type === 'ARR';
      
      if (isInternational) {
        internationalCount++;
        if (isArrival) {
          counts.international.arrivals++;
        } else {
          counts.international.departures++;
        }
      } else {
        domesticCount++;
        if (isArrival) {
          counts.domestic.arrivals++;
        } else {
          counts.domestic.departures++;
        }
      }
    });

    const formattedData = [
      {
        name: 'International',
        arrivals: counts.international.arrivals,
        departures: counts.international.departures,
        total: internationalCount
      },
      {
        name: 'Domestic',
        arrivals: counts.domestic.arrivals,
        departures: counts.domestic.departures,
        total: domesticCount
      }
    ];

    setChartData(formattedData);
    setFlightStats({
      totalFlights,
      international: internationalCount,
      domestic: domesticCount
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && hoveredSection) {
      const activeSection = payload.find(item => item.dataKey === hoveredSection);
      
      if (activeSection) {
        return (
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-xl min-w-48">
            <div className="flex items-center space-x-2 mb-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeSection.color }}
              ></div>
              <p className="font-bold text-gray-800 text-base">{label}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{activeSection.name}</span>
              <span className="font-bold text-gray-800 text-lg">{activeSection.value}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200/50">
              <p className="text-xs text-gray-500">flights in this category</p>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Loading flight type analysis...</p>
        </div>
      </div>
    );
  }

  if (!flightData || flightData.length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No flight type data available</p>
          <p className="text-slate-500 text-sm">Please check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
      <div className="absolute inset-0 bg-rose-50 rounded-2xl"></div>
      
      <div className="relative z-10 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 rounded-2xl p-5 border border-emerald-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-emerald-700 mb-1">
                  {flightStats.totalFlights}
                </div>
                <div className="text-sm font-semibold text-emerald-600">
                  Total Flights
                </div>
              </div>
              <svg className="w-12 h-12 text-emerald-600" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  d="M12.382 5.304 10.096 7.59l.006.02L11.838 14a.908.908 0 0 1-.211.794l-.573.573a.339.339 0 0 1-.566-.08l-2.348-4.25-.745-.746-1.97 1.97a3.311 3.311 0 0 1-.75.504l.44 1.447a.875.875 0 0 1-.199.79l-.175.176a.477.477 0 0 1-.672 0l-1.04-1.039-.018-.02-.788-.786-.02-.02-1.038-1.039a.477.477 0 0 1 0-.672l.176-.176a.875.875 0 0 1 .79-.197l1.447.438a3.322 3.322 0 0 1 .504-.75l1.97-1.97-.746-.744-4.25-2.348a.339.339 0 0 1-.08-.566l.573-.573a.909.909 0 0 1 .794-.211l6.39 1.736.02.006 2.286-2.286c.37-.372 1.621-1.02 1.993-.65.37.372-.279 1.622-.65 1.993z" 
                />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 rounded-2xl p-5 border border-orange-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {flightStats.international}
                </div>
                <div className="text-sm font-semibold text-orange-600">
                  International
                </div>
              </div>
                <svg className="w-11 h-11 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 50 45">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 20.8404C7.01485 19.4168 9.24466 19.2185 10.6894 20.2454C12.8566 21.7859 13.1283 28.064 18.0575 25.0635C22.9867 22.063 15.9467 20.8404 17.475 16.4939C19.0033 12.1474 24.0083 15.5237 24.5059 10.7627C24.8375 7.58862 21.0408 6.37413 13.1156 7.11921" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M36.0001 8C30.2857 12.9886 28.2899 16.0011 30.0127 17.0373C32.5968 18.5917 33.6933 16.4033 36.8467 17.0373C40.0001 17.6714 39.3173 21.9457 37.6587 21.9457C36.0001 21.9457 27.41 20.8518 27.8427 25.865C28.2753 30.8781 33.4422 31.6203 33.4422 34.4211C33.4422 36.2883 32.299 39.146 30.0127 42.9942" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.10461 32.9264C7.0161 32.5288 7.70127 32.2374 8.16011 32.052C12.0072 30.4978 14.8618 30.1314 16.7237 30.953C20.0162 32.4059 18.7504 35.3401 19.7817 36.4211C20.8129 37.5021 23.3881 37.1876 23.3881 39.244C23.3881 40.615 22.9276 42.1637 22.0066 43.8901" />
                </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-2xl p-5 border border-blue-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {flightStats.domestic}
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  Domestic
                </div>
              </div>
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6H12.01M9 20L3 17V4L5 5M9 20L15 17M9 20V14M15 17L21 20V7L19 6M15 17V14M15 6.2C15 7.96731 13.5 9.4 12 11C10.5 9.4 9 7.96731 9 6.2C9 4.43269 10.3431 3 12 3C13.6569 3 15 4.43269 15 6.2Z" />
                </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 50, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="#e2e8f0" 
                strokeWidth={1}
                opacity={0.5}
              />
              <XAxis 
                dataKey="name" 
                label={{ 
                  value: 'Flight Type', 
                  position: 'insideBottom', 
                  offset: -5,
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '600', fill: '#374151' }
                }}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
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
                height={30}
                wrapperStyle={{
                  fontSize: '14px',
                  fontWeight: '600',
                  paddingBottom: '10px'
                }}
                iconType="circle"
              />
              
              <Bar 
                dataKey="arrivals" 
                stackId="a" 
                fill="#10b981" 
                name="Arrivals"
                className="outline-none"
                onMouseEnter={() => setHoveredSection('arrivals')}
                onMouseLeave={() => setHoveredSection(null)}
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="departures" 
                stackId="a" 
                fill="#3b82f6" 
                name="Departures"
                className="outline-none"
                onMouseEnter={() => setHoveredSection('departures')}
                onMouseLeave={() => setHoveredSection(null)}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FlightTypeChart;
