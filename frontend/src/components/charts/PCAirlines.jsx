import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const PCAirlines = ({ flightData, loading }) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const [airlineStats, setAirlineStats] = useState({
    maxArrivals: { count: 0, airline: '' },
    maxDepartures: { count: 0, airline: '' },
    maxTotal: { count: 0, airline: '' }
  });

  useEffect(() => {
    if (flightData.length > 0) {
      const airlines = [...new Set(flightData.map(flight => flight.airline))];
      const arrivals = airlines.map(airline =>
        flightData.filter(flight => flight.airline === airline && flight.flight_type === 'ARR').length
      );
      const departures = airlines.map(airline =>
        flightData.filter(flight => flight.airline === airline && flight.flight_type === 'DER').length
      );

      let maxArrivals = { count: 0, airline: '' };
      let maxDepartures = { count: 0, airline: '' };
      let maxTotal = { count: 0, airline: '' };

      airlines.forEach((airline, index) => {
        const arrivalCount = arrivals[index];
        const departureCount = departures[index];
        const totalCount = arrivalCount + departureCount;

        if (arrivalCount > maxArrivals.count) {
          maxArrivals = { count: arrivalCount, airline };
        }
        if (departureCount > maxDepartures.count) {
          maxDepartures = { count: departureCount, airline };
        }
        if (totalCount > maxTotal.count) {
          maxTotal = { count: totalCount, airline };
        }
      });

      setAirlineStats({
        maxArrivals,
        maxDepartures,
        maxTotal
      });

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: airlines,
          datasets: [
            {
              label: 'Arrivals',
              data: arrivals,
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: 'Departures',
              data: departures,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 2000,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'rectRounded',
                padding: 20,
                font: {
                  size: 14,
                  weight: '600'
                },
                color: '#374151'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#1f2937',
              bodyColor: '#374151',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              cornerRadius: 12,
              displayColors: true,
              padding: 12,
              boxPadding: 6,
              titleFont: {
                size: 14,
                weight: '600'
              },
              bodyFont: {
                size: 13,
                weight: '500'
              }
            }
          },
          scales: {
            x: {
              type: 'category',
              stacked: false,
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12,
                  weight: '500'
                },
                maxRotation: 45
              },
              title: {
                display: true,
                text: 'Airlines',
                color: '#374151',
                font: {
                  size: 14,
                  weight: '600'
                },
                padding: 16
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#f3f4f6',
                lineWidth: 1
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12,
                  weight: '500'
                }
              },
              title: {
                display: true,
                text: 'Number of Flights',
                color: '#374151',
                font: {
                  size: 14,
                  weight: '600'
                },
                padding: 16
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          hover: {
            animationDuration: 200
          }
        }
      });
    }
  }, [flightData]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Loading airline data...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No airline data available</p>
          <p className="text-slate-500 text-sm">Please check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ willChange: 'auto', contain: 'layout style' }}>
      <div className="absolute inset-0 bg-blue-50 rounded-2xl"></div>
      
      <div className="relative z-10 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-400/20 via-emerald-500/15 to-green-400/20 rounded-2xl p-6 border border-emerald-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-emerald-700 mb-2">
                  {airlineStats.maxArrivals.airline || 'N/A'}
                </div>
                <div className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Max Arrivals</div>
                <div className="text-emerald-500 text-xs mt-1 font-semibold">
                  {airlineStats.maxArrivals.count} flights
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-400/20 via-red-500/15 to-pink-400/20 rounded-2xl p-6 border border-red-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-red-700 mb-2">
                  {airlineStats.maxDepartures.airline || 'N/A'}
                </div>
                <div className="text-red-600 text-sm font-bold uppercase tracking-wider">Max Departures</div>
                <div className="text-red-500 text-xs mt-1 font-semibold">
                  {airlineStats.maxDepartures.count} flights
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400/20 via-blue-500/15 to-cyan-400/20 rounded-2xl p-6 border border-blue-300/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-blue-700 mb-2">
                  {airlineStats.maxTotal.airline || 'N/A'}
                </div>
                <div className="text-blue-600 text-sm font-bold uppercase tracking-wider">Max Total Flights</div>
                <div className="text-blue-500 text-xs mt-1 font-semibold">
                  {airlineStats.maxTotal.count} flights
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="relative h-full w-full">
            <canvas 
              ref={canvasRef}
              className="w-full h-full rounded-2xl"
              style={{ height: '500px', width: '100%' }}
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCAirlines;