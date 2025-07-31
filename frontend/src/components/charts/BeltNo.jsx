import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BeltNo = ({ flightData }) => {
  const [activeTab, setActiveTab] = useState("belt");
  const belts = {};
  const gatesByNumber = {};

  (flightData || []).forEach(flight => {
    if (flight.arrival_belt_no) {
      belts[flight.arrival_belt_no] = (belts[flight.arrival_belt_no] || 0) + 1;
    }
    if ((flight.flight_type === 'DER') && (flight.dep_boarding_gate_no || flight.departure_gate)) {
      const gate = flight.dep_boarding_gate_no || flight.departure_gate;
      
      const gateNumber = gate.replace(/[A-Za-z]/g, '').trim();
      
      if (gateNumber) {
        if (!gatesByNumber[gateNumber]) {
          gatesByNumber[gateNumber] = { count: 0, gates: {} };
        }
        gatesByNumber[gateNumber].count += 1;
        gatesByNumber[gateNumber].gates[gate] = (gatesByNumber[gateNumber].gates[gate] || 0) + 1;
      }
    }
  });

  const beltData = Object.keys(belts)
    .map(belt => ({
      name: belt,
      count: belts[belt],
      type: 'belt',
      beltNumber: belt
    }))
    .sort((a, b) => parseInt(a.beltNumber) - parseInt(b.beltNumber));

  const gateData = Object.keys(gatesByNumber)
    .map(gateNumber => ({
      name: gateNumber,
      count: gatesByNumber[gateNumber].count,
      gates: gatesByNumber[gateNumber].gates,
      type: 'gate'
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const activeData = activeTab === 'belt' ? beltData : gateData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      if (data.type === 'belt') {
        return (
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-xl min-w-48">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="font-bold text-gray-800 text-base">Belt {data.beltNumber}</p>
            </div>
            <p className="text-sm font-medium text-gray-600">
              <span className="font-semibold text-gray-800">{data.count}</span> flights using this belt
            </p>
          </div>
        );
      } else if (data.type === 'gate') {
        const gateEntries = Object.entries(data.gates);
        const hasMultipleGates = gateEntries.length > 1;
        
        return (
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-xl min-w-52">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <p className="font-bold text-gray-800 text-base">Gate {data.name}</p>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-3">
              <span className="font-semibold text-gray-800">{data.count}</span> total flights
            </p>
            {hasMultipleGates && (
              <div className="border-t border-gray-200/50 pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Gate Breakdown:</p>
                <div className="space-y-1">
                  {gateEntries
                    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                    .map(([gate, count]) => (
                      <div key={gate} className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Gate {gate}</span>
                        <span className="text-xs font-medium text-gray-800">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  const yAxisLabel = activeTab === 'belt' ? 'Belt Number' : 'Gate Number';

  return (
    <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
      <div className="absolute inset-0 bg-blue-50 rounded-2xl"></div>
      
      <div className="relative z-10 p-6 space-y-6">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1.5 rounded-xl inline-flex space-x-1 shadow-inner">
            <button 
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeTab === 'belt' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
              }`}
              onClick={() => setActiveTab('belt')}
            >
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span className="transition-all duration-300">Belt Usage</span>
              </div>
              {activeTab === 'belt' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
            <button 
              className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-500 ease-out transform ${
                activeTab === 'gate' 
                  ? 'bg-white text-blue-600 shadow-lg scale-105 ring-2 ring-blue-100 -translate-y-0.5' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
              }`}
              onClick={() => setActiveTab('gate')}
            >
              <div className="flex items-center space-x-2 transition-all duration-300">
                <span className="transition-all duration-300">Gate Usage</span>
              </div>
              {activeTab === 'gate' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={activeData}>
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="#e2e8f0" 
                strokeWidth={1}
                opacity={0.5}
              />
              <XAxis 
                dataKey="name" 
                label={{ 
                  value: yAxisLabel, 
                  position: 'insideBottom',
                  offset: -5,
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '600', fill: '#374151'}
                }}
                tick={{ fontSize: 12, fill: '#374151', fontWeight: '600' }}
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
                tick={{ fontSize: 12, fill: '#374151', fontWeight: '600' }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                animationDuration={0}
              />
              <Bar 
                dataKey="count" 
                fill={activeTab === 'belt' ? '#3b82f6' : '#10b981'}
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BeltNo;