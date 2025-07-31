import React, { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";

const ARRIVAL_STATUSES = ["Arrived", "On Time", "Delayed", "Cancelled"];
const DEPARTURE_STATUSES = ["Departed", "Boarding", "On Time", "Delayed", "Cancelled"];
const STATUS_COLORS = {
  "On Time": "#4DA8DA",
  "Delayed": "#f59e0b",
  "Cancelled": "#ef4444",
  "Arrived": "#059669",
  "Departed": "#059669",
  "Boarding": "#89A8B2",
};

const BGStatus = ({ flightData, loading }) => {
  const [statusCounts, setStatusCounts] = useState({ arrivals: {}, departures: {} });
  const [activeTab, setActiveTab] = useState('arrivals');
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chartKey, setChartKey] = useState(0);

  const getCurrentIST = useCallback(() => {
    try {
      const now = new Date();
      const ISTTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      return ISTTime;
    } catch (error) {
      console.error('Error getting current IST time:', error);
      return new Date();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentIST());
    }, 1000);
    return () => clearInterval(timer);
  }, [getCurrentIST]);

  const getFlightStatus = useCallback((flight, currentTimeIST) => {
    const isArrival = flight.flight_type && flight.flight_type.toUpperCase() === "ARR";
    const isDeparture = flight.flight_type && (flight.flight_type.toUpperCase() === "DER");

    const operationalStatus = flight.operational_status?.toLowerCase();
    if (operationalStatus === 'cancelled') {
      return 'Cancelled';
    }
    if (operationalStatus !== 'operating') {
      return null;
    }

    if (isDeparture) {
      const stod = new Date(flight.stod);
      const etod = new Date(flight.etod);
      
      if (isNaN(stod.getTime()) || isNaN(etod.getTime())) {
        return null;
      }

      const nowIST = currentTimeIST;

      if (nowIST.getTime() >= etod.getTime()) {
        return 'Departed';
      }

      const boardingThreshold = new Date(nowIST.getTime() + (40 * 60 * 1000));
      if (etod.getTime() <= boardingThreshold.getTime()) {
        return 'Boarding';
      }

      const diffMinutes = (etod.getTime() - stod.getTime()) / (60 * 1000);
      if (diffMinutes > 30) {
        return 'Delayed';
      }

      return 'On Time';
    }

    if (isArrival) {
      const stoa = new Date(flight.stoa);
      const etoa = new Date(flight.etoa);
      
      if (isNaN(stoa.getTime()) || isNaN(etoa.getTime())) {
        return null;
      }

      const nowIST = currentTimeIST;

      if (nowIST.getTime() >= etoa.getTime()) {
        return 'Arrived';
      }

      const diffMinutes = (etoa.getTime() - stoa.getTime()) / (60 * 1000);
      if (diffMinutes > 30) {
        return 'Delayed';
      }

      return 'On Time';
    }

    return null;
  }, []);

  const groupStatusCounts = useCallback((flights, currentTimeIST) => {
    const arrivals = {};
    const departures = {};
    ARRIVAL_STATUSES.forEach(status => arrivals[status] = 0);
    DEPARTURE_STATUSES.forEach(status => departures[status] = 0);

    flights.forEach(flight => {
      const status = getFlightStatus(flight, currentTimeIST);
      if (!status) return;

      const isArrival = flight.flight_type && flight.flight_type.toUpperCase() === "ARR";
      const isDeparture = flight.flight_type && (flight.flight_type.toUpperCase() === "DER");

      if (isArrival && ARRIVAL_STATUSES.includes(status)) {
        arrivals[status]++;
      } else if (isDeparture && DEPARTURE_STATUSES.includes(status)) {
        departures[status]++;
      }
    });

    return { arrivals, departures };
  }, [getFlightStatus]);

  useEffect(() => {
    if (!loading && flightData && flightData.length > 0) {
      const counts = groupStatusCounts(flightData, currentTime);
      setStatusCounts(counts);
    }
  }, [flightData, loading, currentTime, groupStatusCounts]);

  const getChartData = () => {
    const activeData = activeTab === 'arrivals' ? statusCounts.arrivals : statusCounts.departures;
    
    return Object.entries(activeData)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count
      }));
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#1f2937" fontSize={18} fontWeight="600">
          {payload.name}
        </text>
        <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#6b7280" fontSize={15}>
          {value} flights ({(percent * 100).toFixed(1)}%)
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.95}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 4}
          outerRadius={innerRadius - 1}
          fill={fill}
          opacity={0.8}
        />
      </g>
    );
  };

  const handleTabSwitch = (newTab) => {
    if (newTab === activeTab) return;
    
    setActiveTab(newTab);
    setActiveIndex(0);
    setChartKey(prev => prev + 1);
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Loading flight status data...</p>
        </div>
      </div>
    );
  }

  if (!flightData || flightData.length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No flight status data available</p>
          <p className="text-slate-500 text-sm">Please check back later</p>
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
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeTab === 'arrivals' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
              }`}
              onClick={() => handleTabSwitch('arrivals')}
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
              onClick={() => handleTabSwitch('departures')}
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
      
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart key={chartKey}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                animationBegin={0}
                animationDuration={1000}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name] || '#8884d8'}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} flights`, name]}
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
                  <span style={{ color: STATUS_COLORS[value] || '#8884d8' }}>
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

export default BGStatus;