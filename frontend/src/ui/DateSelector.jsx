import React, { useState, useRef, useEffect } from 'react';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateLocal(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function formatDateIST(year, month, day) {
  const utc = new Date(Date.UTC(year, month, day));
  const ist = new Date(utc.getTime() + (5.5 * 60 * 60 * 1000));
  const yyyy = ist.getFullYear();
  const mm = String(ist.getMonth() + 1).padStart(2, '0');
  const dd = String(ist.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DateSelector = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : new Date();
  const [month, setMonth] = useState(selected.getMonth());
  const [year, setYear] = useState(selected.getFullYear());
  const [view, setView] = useState('day');
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open && value) {
      const d = new Date(value);
      setMonth(d.getMonth());
      setYear(d.getFullYear());
    }
  }, [value, open]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const today = formatDateIST(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  function handleSelect(day) {
    const formatted = formatDateIST(year, month, day);
    onChange(formatted);
    setOpen(false);
    setView('day');
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  }
  
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  }

  const decadeStart = Math.floor(year / 10) * 10;
  const years = Array.from({ length: 10 }, (_, i) => decadeStart + i);

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div 
      className="inline-block relative bg-white rounded-xl shadow-lg hover:shadow-xl focus-within:shadow-xl cursor-pointer min-w-[170px] transition-shadow duration-200"
      ref={ref}
    >
      <div
        className="flex items-center gap-2 font-semibold text-blue-900 text-base tracking-wide px-4 py-2.5 rounded-xl transition-shadow duration-200 select-none"
        onClick={() => { setOpen(o => !o); setView('day'); }}
        tabIndex={0}
      >
        <span className="inline-block w-5 h-5 mr-1">
          <svg 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            className="w-full h-full"
          >
            <rect width="18" height="16" x="3" y="5" rx="3"/>
            <path d="M16 3v4M8 3v4M3 9h18"/>
          </svg>
        </span>
        <span>
          {selected.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl p-4 z-[9999] min-w-[240px] animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-center gap-2.5 mb-2 font-semibold text-blue-900 bg-slate-50 rounded-lg py-1.5">
            <button 
              className="bg-none border-none text-lg text-blue-900 cursor-pointer px-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
              onClick={() => {
                if (view === 'day') prevMonth();
                else if (view === 'month') setYear(y => y - 1);
                else if (view === 'year') setYear(y => y - 10);
              }}
            >
              &lt;
            </button>

            {view === 'day' && (
              <>
                <span
                  className="cursor-pointer mx-1 font-bold px-2.5 py-0.5 rounded-lg bg-slate-50 text-blue-900 hover:bg-yellow-200 hover:text-yellow-800 transition-colors duration-200"
                  onClick={() => setView('month')}
                  title="Select month"
                >
                  {months[month]}
                </span>
                <span
                  className="cursor-pointer mx-1 font-bold px-2.5 py-0.5 rounded-lg bg-slate-50 text-blue-900 hover:bg-yellow-200 hover:text-yellow-800 transition-colors duration-200"
                  onClick={() => setView('year')}
                  title="Select year"
                >
                  {year}
                </span>
              </>
            )}

            {view === 'month' && (
              <span
                className="cursor-pointer mx-1 font-bold px-2.5 py-0.5 rounded-lg bg-slate-50 text-blue-900 hover:bg-yellow-200 hover:text-yellow-800 transition-colors duration-200"
                onClick={() => setView('year')}
                title="Select year"
              >
                {year}
              </span>
            )}

            {view === 'year' && (
              <span className="mx-1 font-bold">
                {years[0]} - {years[years.length - 1]}
              </span>
            )}

            <button 
              className="bg-none border-none text-lg text-blue-900 cursor-pointer px-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
              onClick={() => {
                if (view === 'day') nextMonth();
                else if (view === 'month') setYear(y => y + 1);
                else if (view === 'year') setYear(y => y + 10);
              }}
            >
              &gt;
            </button>
          </div>

          {view === 'day' && (
            <div className="grid grid-cols-7 gap-1">
              {weekdays.map(d => (
                <div key={d} className="text-sm text-slate-500 text-center font-medium mb-0.5">
                  {d}
                </div>
              ))}
              {Array(firstDay).fill(null).map((_, i) => (
                <div key={'empty-' + i} className="text-center py-1.5 rounded-md pointer-events-none"></div>
              ))}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDateLocal(year, month, day);
                const isSelected = value === dateStr;
                const isToday = today === dateStr;
                return (
                  <div
                    key={day}
                    className={`
                      text-center py-1.5 rounded-md cursor-pointer font-medium text-blue-900 
                      transition-all duration-200 hover:bg-yellow-200 hover:text-yellow-800
                      ${isSelected ? 'bg-yellow-400 text-white hover:bg-yellow-400 hover:text-white' : ''}
                      ${isToday ? 'border-2 border-yellow-400' : ''}
                    `}
                    onClick={() => handleSelect(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          )}

          {view === 'month' && (
            <div className="grid grid-cols-3 gap-2 py-2">
              {months.map((m, idx) => (
                <div
                  key={m}
                  className={`
                    text-center py-2.5 rounded-lg cursor-pointer font-semibold text-blue-900 
                    bg-slate-50 transition-all duration-200 hover:bg-yellow-400 hover:text-white
                    ${idx === month ? 'bg-yellow-400 text-white' : ''}
                  `}
                  onClick={() => { setMonth(idx); setView('day'); }}
                >
                  {m.slice(0, 3)}
                </div>
              ))}
            </div>
          )}

          {view === 'year' && (
            <div className="grid grid-cols-5 gap-2 py-2">
              {years.map(y => (
                <div
                  key={y}
                  className={`
                    text-center py-2.5 rounded-lg cursor-pointer font-semibold text-blue-900 
                    bg-slate-50 transition-all duration-200 hover:bg-yellow-400 hover:text-white
                    ${y === year ? 'bg-yellow-400 text-white' : ''}
                  `}
                  onClick={() => { setYear(y); setView('month'); }}
                >
                  {y}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-2.5">
            <button
              className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-blue-900 font-bold border-none rounded-lg px-4 py-1.5 cursor-pointer text-base shadow-sm hover:bg-yellow-400 hover:text-white transition-all duration-200"
              onClick={() => {
                const now = new Date();
                const todayStr = formatDateIST(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate()
                );
                setYear(now.getFullYear());
                setMonth(now.getMonth());
                setView('day');
                onChange(todayStr);
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSelector;