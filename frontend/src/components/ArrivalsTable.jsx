import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import DateSelector from '../ui/DateSelector';
import '../styles/Tables.css';

const PAGE_SIZE = 30;

const ArrivalsTable = ({ selectedDate, setSelectedDate, flightData = [], loading = false, onRefresh }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const autoCycling = true;
  const intervalRef = useRef();
  const [timerResetKey, setTimerResetKey] = useState(0);

  const arrivals = flightData;

  const filteredArrivalsCount = useMemo(() => {
    return arrivals.filter(row => row.operational_status?.toLowerCase() !== 'not operating').length;
  }, [arrivals]);

  const totalFiltered = arrivals.filter(
    row => row.operational_status?.toLowerCase() !== 'not operating'
  ).length;  
  const totalPagesCalc = Math.ceil(totalFiltered / PAGE_SIZE);

  const paginatedArrivals = arrivals
    .filter(row => row.operational_status?.toLowerCase() !== 'not operating')
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToFirstPage = () => {
    setCurrentPage(1);
    setTimerResetKey(prev => prev + 1);
  };  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
    setTimerResetKey(prev => prev + 1);
  };  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPagesCalc, prev + 1));
    setTimerResetKey(prev => prev + 1);
  };  
  const goToLastPage = () => {
    setCurrentPage(totalPagesCalc);
    setTimerResetKey(prev => prev + 1);
  };

  useEffect(() => {
    setCurrentTime(new Date());    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }    
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());      
      if (autoCycling) {
        setCurrentPage((prev) => {
          const totalPagesCalc = Math.ceil(filteredArrivalsCount / PAGE_SIZE);
          return totalPagesCalc === 0 ? 1 : (prev % totalPagesCalc) + 1;
        });
      }
    }, 5000);    
    return () => clearInterval(intervalRef.current);
  }, [filteredArrivalsCount, autoCycling, timerResetKey]);

  useEffect(() => {
    setTotalPages(totalPagesCalc);
  }, [totalPagesCalc]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
  };

  const renderStatus = (row) => {
    const status = row.operational_status?.toLowerCase();
    if (status === 'cancelled') {
      return <span className="flight-status-cancelled">Cancelled</span>;
    }
    if (status !== 'operating') {
      return null;
    }

    const stoa = new Date(row.stoa);
    const etoa = new Date(row.etoa);
    const now = currentTime;

    if (now.getTime() >= etoa.getTime()) {
      return <span className="flight-status-arrived">Arrived</span>;
    }

    const diffMinutes = (etoa.getTime() - stoa.getTime()) / (60 * 1000);
    if (diffMinutes <= 30) {
      return <span className="flight-status-ontime">On Time</span>;
    } else {
      return <span className="flight-status-delayed">Delayed</span>;
    }
  };

  const rowVariants = {
    hidden: { opacity: 0 },
    visible: i => ({
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.5
      }
    }),
    exit: { opacity: 0 }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-visible">
      <motion.div
        className="table-container overflow-visible"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex gap-3 mb-5 items-center relative" style={{ zIndex: 9999 }}>
          <label htmlFor="arrivals-date-input" className="text-sm font-medium text-slate-700">Select Date:</label>
          <div className="relative" style={{ zIndex: 9999 }}>
            <DateSelector
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </div>
        </div>
        
        <div className="fixed right-5 bottom-3 bg-black/70 text-white py-1.5 px-4 rounded-lg text-base z-[1000]">
          Time: {currentTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
        
        {loading ? (
          <div className="table-no-data">
            Loading flight information...
          </div>
        ) : paginatedArrivals.length === 0 ? (
          <div className="table-no-data">
            No information available for {formatDate(selectedDate)}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="flights-table">
                <thead>
                  <tr>
                    <th className="table-header">Flight</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">STOA</th>
                    <th className="table-header">Flight Type</th>
                    <th className="table-header">Flight Mode</th>
                    <th className="table-header">Passengers</th>
                    <th className="table-header">ETOA</th>
                    <th className="table-header">Belt No</th>
                    <th className="table-header">PSTA</th>
                    <th className="table-header">Airline</th>
                    <th className="table-header">Origin</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedArrivals.map((row, idx) => (
                    <motion.tr
                      key={`${row.flight}-${idx}`}
                      custom={idx}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={rowVariants}
                      className="table-row"
                    >
                      <td className="table-cell">{row.flight}</td>
                      <td className="table-cell">
                        {row.operational_status === 'ontime' ? (
                          <span className="flight-status-ontime">On Time</span>
                        ) : (
                          <span>{renderStatus(row)}</span>
                        )}
                      </td>
                      <td className="table-cell table-date-cell">
                        <div className="table-date-time">
                          <div className="font-medium">{formatDate(row.stoa)}</div>
                          <div className="text-slate-500 text-sm">{formatTime(row.stoa)}</div>
                        </div>
                      </td>
                      <td className="table-cell">{row.flight_type}</td>
                      <td className="table-cell">
                        {row.flight_mode === 'INT' ? (
                          <span className="flight-mode-international">INT</span>
                        ) : row.flight_mode === 'DOM' ? (
                          <span className="flight-mode-domestic">DOM</span>
                        ) : (
                          row.flight_mode
                        )}
                      </td>
                      <td className="table-cell">{row.number_of_passenger}</td>
                      <td className="table-cell table-date-cell">
                        {row.etoa === '-' ? (
                          <span>-</span>
                        ) : (
                          <div className="table-date-time">
                            <div className="font-medium">{formatDate(row.etoa)}</div>
                            <div className="text-slate-500 text-sm">{formatTime(row.etoa)}</div>
                          </div>
                        )}
                      </td>
                      <td className="table-cell">{row.arrival_belt_no}</td>
                      <td className="table-cell">{row.psta}</td>
                      <td className="table-cell">{row.airline}</td>
                      <td className="table-cell">{row.origin}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="table-navigation">
              <div className="table-nav-buttons">
                <button
                  className="nav-button"
                  title="First"
                  aria-label="Go to first page"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  |&lt;
                </button>
                <button
                  className="nav-button"
                  title="Previous"
                  aria-label="Go to previous page"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <button
                  className="nav-button"
                  title="Next"
                  aria-label="Go to next page"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
                <button
                  className="nav-button"
                  title="Last"
                  aria-label="Go to last page"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;|
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ArrivalsTable;