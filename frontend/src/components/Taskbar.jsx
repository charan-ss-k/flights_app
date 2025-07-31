import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Taskbar = ({ date, setDate, onLogout }) => {
  const [airportDataDropdown, setAirportDataDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAirportDataDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/Data/')) return 'data';
    if (path === '/DataVisuals') return 'visuals';
    return 'data';
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 shadow-lg relative z-[100] border-b border-slate-400/20">
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d5bc8e' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative mr-4" ref={dropdownRef}>
        <button 
          className={`
            flex items-center gap-2 cursor-pointer bg-transparent px-4 py-2.5 rounded-lg 
            font-medium tracking-wide transition-all duration-300 backdrop-blur-none shadow-none 
            text-white/90 hover:bg-slate-600/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15
            ${airportDataDropdown ? 'bg-slate-600/20 border-white/40' : ''}
          `}
          onClick={() => setAirportDataDropdown(!airportDataDropdown)}
        >
          Airport Data
          <div className="relative w-2.5 h-2.5 ml-1">
            <div 
              className={`
                absolute bg-white/70 w-2 h-0.5 rounded-sm transition-all duration-300
                ${airportDataDropdown 
                  ? 'rotate-[135deg] top-0.5 -left-0.5' 
                  : 'rotate-45 top-0.5 -left-0.5'
                }
              `}
            />
            <div 
              className={`
                absolute bg-white/70 w-2 h-0.5 rounded-sm transition-all duration-300
                ${airportDataDropdown 
                  ? '-rotate-[135deg] top-0.5 left-0.5' 
                  : '-rotate-45 top-0.5 left-0.5'
                }
              `}
            />
          </div>
        </button>
        
        {airportDataDropdown && (
          <div className="absolute top-[calc(100%+10px)] left-0 z-[1000] min-w-[220px] py-2 m-0 bg-white backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300">
            <div 
              className="absolute -top-1 left-5 w-2.5 h-2.5 bg-white rotate-45 border-t border-l border-gray-200"
            />
            
            <div 
              className={`
                flex items-center w-full px-4 py-3 text-slate-700 font-medium text-sm 
                transition-all duration-200 relative border-l-[3px] border-transparent
                hover:bg-slate-100 hover:text-slate-800 hover:pl-5 cursor-pointer
                ${activeTab === 'data' ? 'border-l-slate-600 bg-slate-100/70 text-slate-800' : ''}
                border-b border-gray-100
              `}
              onClick={() => {
                navigate('/Data/Arrivals');
                setAirportDataDropdown(false);
              }}
            >
              Data
            </div>
            
            <div 
              className={`
                flex items-center w-full px-4 py-3 text-slate-700 font-medium text-sm 
                transition-all duration-200 relative border-l-[3px] border-transparent
                hover:bg-slate-100 hover:text-slate-800 hover:pl-5 cursor-pointer
                ${activeTab === 'visuals' ? 'border-l-slate-600 bg-slate-100/70 text-slate-800' : ''}
              `}
              onClick={() => {
                navigate('/DataVisuals');
                setAirportDataDropdown(false);
              }}
            >
              Data Visuals
            </div>
          </div>
        )}
      </div>
      
      <button 
        className="absolute right-5 w-10 h-10 flex items-center justify-center bg-red-500/80 text-white border-none rounded-full cursor-pointer transition-all duration-300 hover:bg-red-500 hover:rotate-[15deg] hover:shadow-lg hover:shadow-red-500/50"
        onClick={onLogout}
      >
        <div 
          className="block w-4 h-4 bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'%3E%3C/path%3E%3Cpolyline points='16 17 21 12 16 7'%3E%3C/polyline%3E%3Cline x1='21' y1='12' x2='9' y2='12'%3E%3C/line%3E%3C/svg%3E")`
          }}
        />
      </button>
    </div>
  );
};

export default Taskbar;