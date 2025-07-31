import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Taskbar from './components/Taskbar';
import ArrivalsTable from './components/ArrivalsTable';
import DeparturesTable from './components/DeparturesTable';
import Login from './components/Login';
import DataVisualisation from './components/DataVisualisation';

function getTodayIST() {
  try {
    const now = new Date();
    const istDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    const yyyy = istDate.getFullYear();
    const mm = String(istDate.getMonth() + 1).padStart(2, '0');
    const dd = String(istDate.getDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
  } catch (error) {
    console.error('Error getting IST date:', error);
    return null;
  }
}

const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const NavigationButtons = ({ currentPage }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-center my-6">
      <div className="inline-flex bg-white rounded-full w-[350px] p-[7px] shadow-md overflow-hidden relative">
        <div 
          className={`
            absolute h-[calc(100%-14px)] rounded-[18px] bg-orange-300/95 
            transition-all duration-300 ease-out z-[1] top-[7px] 
            w-[calc(50%-7px)] shadow-md shadow-blue-400/30
            ${currentPage === 'arrivals' 
              ? 'left-[7px]' 
              : 'left-[calc(50%+0px)]'
            }
          `}
        />
        
        <button 
          className={`
            border-none bg-transparent font-medium text-sm py-2.5 px-6 cursor-pointer 
            rounded-[18px] transition-all duration-300 ease-in-out relative outline-none 
            z-[2] flex-1
            ${currentPage === 'arrivals' 
              ? 'text-white' 
              : 'text-gray-600 hover:bg-gray-100/70'
            }
          `}
          onClick={() => navigate('/Data/Arrivals')}
        >
          Arrivals
        </button>
        
        <button 
          className={`
            border-none bg-transparent font-medium text-sm py-2.5 px-6 cursor-pointer 
            rounded-[18px] transition-all duration-300 ease-in-out relative outline-none 
            z-[2] flex-1
            ${currentPage === 'departures' 
              ? 'text-white' 
              : 'text-gray-600 hover:bg-gray-100/70'
            }
          `}
          onClick={() => navigate('/Data/Departures')}
        >
          Departures
        </button>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = localStorage.getItem('user');
    const loggedOut = localStorage.getItem('loggedOut') === 'true';
    return !!user && !loggedOut;
  });
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(getTodayIST());
  const [selectedDate, setSelectedDate] = useState(getTodayIST());
  const logoutTimerRef = useRef(null);

  const [arrivalsData, setArrivalsData] = useState([]);
  const [departuresData, setDeparturesData] = useState([]);
  const [visualisationData, setVisualisationData] = useState([]);
  const [arrivalsLoading, setArrivalsLoading] = useState(true);
  const [departuresLoading, setDeparturesLoading] = useState(true);
  const [visualisationLoading, setVisualisationLoading] = useState(true);

  const fetchArrivalsData = async (dateParam) => {
    setArrivalsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/arrivals?date=${dateParam}`);
      const data = await response.json();
      
      const processArrivalsData = (arrivals) => {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        return arrivals.map(flight => {
          const stoaStr = flight.stoa && flight.stoa !== '-' ? flight.stoa : null;
          const stoaDateStr = stoaStr ? stoaStr.slice(0, 10) : null;
          if (stoaDateStr && stoaDateStr > todayStr) {
            return {
              ...flight,
              passengers: "-",
              number_of_passenger: "-",
              etoa: "-",
              arrival_belt_no: "-",
              psta: "-",
              operational_status: "ontime"
            };
          }
          return flight;
        });
      };

      const processedData = processArrivalsData(data.flights || []);
      setArrivalsData(processedData);
    } catch (error) {
      console.error("Error fetching arrivals data:", error);
      setArrivalsData([]);
    } finally {
      setArrivalsLoading(false);
    }
  };

  const fetchDeparturesData = async (dateParam) => {
    setDeparturesLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/departures?date=${dateParam}`);
      const data = await response.json();
      
      const processDeparturesData = (departures) => {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        return departures.map(flight => {
          const stodStr = flight.stod && flight.stod !== '-' ? flight.stod : null;
          const stodDateStr = stodStr ? stodStr.slice(0, 10) : null;
          if (stodDateStr && stodDateStr > todayStr) {
            return {
              ...flight,
              passengers: "-",
              number_of_passenger: "-",
              etod: "-",
              dep_boarding_gate_no: "-",
              pstd: "-",
              operational_status: "ontime"
            };
          }
          return flight;
        });
      };

      const processedData = processDeparturesData(data.flights || []);
      setDeparturesData(processedData);
    } catch (error) {
      console.error("Error fetching departures data:", error);
      setDeparturesData([]);
    } finally {
      setDeparturesLoading(false);
    }
  };

  const fetchVisualisationData = async () => {
    try {
      const now = new Date();
      const istDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const istDateStr = istDate.toISOString().split("T")[0];
      
      setVisualisationLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/api/all_flights?date=${istDateStr}`);
      const data = await response.json();
      setVisualisationData(data.flights || []);
    } catch (error) {
      console.error("Error fetching visualisation data:", error);
      const today = new Date();
      const istOffset = 5.5 * 60;
      const utc = today.getTime() + (today.getTimezoneOffset() * 60000);
      const istNow = new Date(utc + (istOffset * 60000));
      const istDateStr = istNow.toISOString().split("T")[0];
      
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/all_flights?date=${istDateStr}`);
        const data = await response.json();
        setVisualisationData(data.flights || []);
      } catch (fallbackError) {
        console.error("Error in fallback fetching visualisation data:", fallbackError);
        setVisualisationData([]);
      }
    } finally {
      setVisualisationLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      const isLoggedOut = localStorage.getItem('loggedOut') === 'true';
      setIsAuthenticated(!!(user && !isLoggedOut));
    };
    checkAuth();
    setLoading(false);
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchArrivalsData(selectedDate);
      fetchDeparturesData(selectedDate);
      fetchVisualisationData();
    }
  }, [isAuthenticated, selectedDate]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.removeItem('loggedOut');
    } else {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    }
    const timer = logoutTimerRef.current;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.setItem('loggedOut', 'true');
  };

  if (loading) return null;

  return (
    <div className="m-0 font-sans antialiased bg-orange-50 relative min-h-screen">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate to="/Data/Arrivals" replace />
              )
            } 
          />

          <Route 
            path="/Data/Arrivals" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <div>
                  <Taskbar
                    date={date}
                    setDate={setDate}
                    onLogout={handleLogout}
                  />
                  <div className="px-4 py-6">
                    <NavigationButtons currentPage="arrivals" />
                    <ArrivalsTable
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      flightData={arrivalsData}
                      loading={arrivalsLoading}
                      onRefresh={() => fetchArrivalsData(selectedDate)}
                    />
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/Data/Departures" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <div>
                  <Taskbar
                    date={date}
                    setDate={setDate}
                    onLogout={handleLogout}
                  />
                  <div className="px-4 py-6">
                    <NavigationButtons currentPage="departures" />
                    <DeparturesTable
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      flightData={departuresData}
                      loading={departuresLoading}
                      onRefresh={() => fetchDeparturesData(selectedDate)}
                    />
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/DataVisuals" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <div>
                  <Taskbar
                    date={date}
                    setDate={setDate}
                    onLogout={handleLogout}
                  />
                  <div className="px-4 py-6">
                    <DataVisualisation 
                      flightData={visualisationData}
                      loading={visualisationLoading}
                      onRefresh={fetchVisualisationData}
                    />
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/Data/Arrivals" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="*" 
            element={
              isAuthenticated ? (
                <Navigate to="/Data/Arrivals" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;