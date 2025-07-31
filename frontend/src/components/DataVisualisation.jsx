import React, { useState, useEffect, useCallback } from 'react';
import FlightTypeChart from './charts/FlightDelayCauses';
import BeltNo from './charts/BeltNo';
import AirportCapacityMonitor from './charts/AirportCapacityMonitor';
import BGStatus from './charts/BGStatus';
import PCAirlines from './charts/PCAirlines';
import FlightRouteMap from './charts/FlightRouteMap';
import FlightTimeChart from './charts/FlightTimeChart';
import Stands from './charts/Stands';
import PeakHourAnalysis from './charts/PeakHourAnalysis';
import '../styles/Charts.css';

const DataVisualisation = ({ flightData, loading }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalFlights: 0,
    activeGates: 0,
    activeBelts: 0,
    arrivals: 0,
    departures: 0
  });

  const calculateDashboardStats = useCallback((data) => {
    const stats = {
      totalFlights: data.length,
      activeGates: new Set(),
      activeBelts: new Set(),
      arrivals: 0,
      departures: 0
    };

    data.forEach(flight => {
      if (flight.flight_type === 'ARR') {
        stats.arrivals++;
      } else if (flight.flight_type === 'DER') {
        stats.departures++;
      }

      if (flight.dep_boarding_gate_no) {
        stats.activeGates.add(flight.dep_boarding_gate_no);
      }
      if (flight.arrival_belt_no) {
        stats.activeBelts.add(flight.arrival_belt_no);
      }
    });

    stats.activeGates = stats.activeGates.size;
    stats.activeBelts = stats.activeBelts.size;

    setDashboardStats(stats);
  }, []);

  useEffect(() => {
    if (!loading && flightData && flightData.length > 0) {
      calculateDashboardStats(flightData);
    }
  }, [flightData, loading, calculateDashboardStats]);

  return (
    <div className="min-h-screen" style={{ willChange: 'scroll-position' }}>
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className='flex justify-center mb-6'>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2x1">
            <div className="bg-blue-100 rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-20 justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700 mb-1">
                    {dashboardStats.totalFlights.toLocaleString()}
                  </div>
                  <div className="text-blue-600 text-sm font-semibold">Total Flights</div>
                </div>
                <div className="text-blue-400">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-emerald-100 rounded-lg p-4 gap-20 border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-emerald-600 text-sm font-semibold">Flight Operations</div>
                <div className="text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-medium">Arrivals</span>
                  <span className="text-xl font-bold text-emerald-800">{dashboardStats.arrivals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-medium">Departures</span>
                  <span className="text-xl font-bold text-emerald-800">{dashboardStats.departures}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="mb-8 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Route Analytics</h3>
                <p className="text-gray-600 text-sm">Popular destinations and routes</p>
              </div>
              <FlightRouteMap flightData={flightData} loading={loading} />
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="mb-8 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Flight Status Overview</h3>
                <p className="text-gray-600 text-sm">Real-time operational status</p>
              </div>
              <BGStatus flightData={flightData} loading={loading} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="mb-8 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Airport Capacity Monitor</h3>
              <p className="text-gray-600 text-sm">Hourly flight distribution and capacity utilization</p>
            </div>
            <AirportCapacityMonitor flightData={flightData} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="mb-8 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Infrastructure Utilization</h3>
                <p className="text-gray-600 text-sm">Belt and gate usage patterns</p>
              </div>
              <BeltNo flightData={flightData} />
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="mb-8 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Flight Type Distribution</h3>
                <p className="text-gray-600 text-sm">International vs Domestic breakdown</p>
              </div>
              <FlightTypeChart flightData={flightData} loading={loading} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="mb-8 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Flight Time Analysis</h3>
              <p className="text-gray-600 text-sm">Scheduled vs actual flight times</p>
            </div>
            <FlightTimeChart flightData={flightData} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="mb-8 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Airline Operations</h3>
                <p className="text-gray-600 text-sm">Airline performance comparison</p>
              </div>
              <PCAirlines flightData={flightData} loading={loading} />
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="mb-8 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Stand Utilization</h3>
                <p className="text-gray-600 text-sm">PSTA / PSTD</p>
              </div>
              <Stands flightData={flightData} loading={loading} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="mb-8 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Peak Hour Analysis</h3>
              <p className="text-gray-600 text-sm">Traffic patterns and insights</p>
            </div>
            <PeakHourAnalysis flightData={flightData} loading={loading} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default DataVisualisation;