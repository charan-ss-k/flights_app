import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FlightRouteMap = ({ flightData, loading }) => {
  const [topDestinations, setTopDestinations] = useState([]);
  const [topOrigins, setTopOrigins] = useState([]);
  const [activeChart, setActiveChart] = useState('destinations');

  useEffect(() => {
    if (!loading && flightData && flightData.length > 0) {
      const destinations = {};
      const origins = {};

      flightData.forEach(flight => {
        if (flight.flight_type === 'DER' && flight.destination) {
          destinations[flight.destination] = (destinations[flight.destination] || 0) + 1;
        }
        if (flight.flight_type === 'ARR' && flight.origin) {
          origins[flight.origin] = (origins[flight.origin] || 0) + 1;
        }
      });

      const destinationArray = Object.entries(destinations)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const originArray = Object.entries(origins)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setTopDestinations(destinationArray.slice(0, 10));
      setTopOrigins(originArray.slice(0, 10));
    }
  }, [flightData, loading]);

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
          <p className="font-semibold text-gray-900 mb-2">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">{data.value}</span> flights
          </p>
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
          <p className="text-slate-600 font-medium animate-pulse">Loading route data...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No route data available</p>
          <p className="text-slate-500 text-sm">Please check back later</p>
        </div>
      </div>
    );
  }

  const activeData = activeChart === 'destinations' ? topDestinations : topOrigins;

  return (
    <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
      <div className="absolute inset-0 bg-blue-50 rounded-2xl"></div>
      
      <div className="relative z-10 p-6 space-y-6">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1.5 rounded-xl inline-flex space-x-1 shadow-inner">
            <button 
              onClick={() => setActiveChart('destinations')} 
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeChart === 'destinations' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-105'
              }`}
            >
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span>Top Destinations</span>
              </div>
              {activeChart === 'destinations' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
            
            <button 
              onClick={() => setActiveChart('origins')} 
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeChart === 'origins' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-105'
              }`}
            >
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span>Top Origins</span>
              </div>
              {activeChart === 'origins' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={activeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={160}
                fill="#8884d8"
                dataKey="value"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={3}
                animationBegin={0}
                animationDuration={1000}
              >
                {activeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity duration-300"
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                animationDuration={0}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                labelStyle={{ color: '#1f2937', fontWeight: '600' }}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingLeft: '30px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                formatter={(value) => (
                  <span className="text-gray-700 font-semibold">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FlightRouteMap;