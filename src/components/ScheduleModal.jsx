import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Helper function to format duration
const formatDuration = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} ${mins} min`;
    }
  }
  return `${minutes} min`;
};

// Helper function to check if program is Culto Especial de Fin de Año
const isCultoEspecial = (program) => {
  return program.name === "Culto Especial de Fin de Año";
};

export default function ScheduleModal({ isOpen, onClose, darkMode, schedule }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      AOS.init({
        once: true,
        duration: 500,
        easing: 'ease-out-cubic'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Group schedule by day - INCLUDES SPECIAL EVENTS
  const groupScheduleByDay = (schedule) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const grouped = Array(7).fill().map(() => []);

    schedule.forEach(item => {
      if (item.startDate) {
        // Special event - add to all days in range
        const start = moment(item.startDate);
        const end = moment(item.endDate);
        const diff = end.diff(start, 'days');
        
        for (let i = 0; i <= diff; i++) {
          const dayIndex = start.clone().add(i, 'days').day();
          grouped[dayIndex].push({
            ...item,
            time: 'Todo el día',
            duration: 'Evento especial',
            isSpecial: true
          });
        }
      } else {
        // Regular program
        grouped[item.day].push({
          ...item,
          isSpecial: false
        });
      }
    });

    return grouped;
  };

  const scheduleData = groupScheduleByDay(schedule);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Get current time for highlighting
  const currentDay = moment().day();

  return createPortal(
    <div 
      className="fixed inset-0 z-[1000] grid place-items-center bg-black bg-opacity-50 p-4" 
      onClick={onClose}
      data-aos="fade-in"
    >
      <div 
        className={`w-full max-w-4xl rounded-xl p-4 sm:p-6 transform transition-all duration-300 ${darkMode ? 'dark' : ''}`}
        onClick={e => e.stopPropagation()}
        data-aos="zoom-in"
        data-aos-duration="500"
        style={{ height: '90vh', maxHeight: '90vh' }}
      >
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 h-full flex flex-col`}>
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">Programación Semanal</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 p-1"
              aria-label="Cerrar"
            >
              <i className="icon-cancel text-2xl" />
            </button>
          </div>
          
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Days header - hidden on mobile, shown on desktop */}
            <div className="hidden md:grid md:grid-cols-7 gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
              {days.map((day, index) => (
                <div 
                  key={index} 
                  className={`flex-shrink-0 text-center font-medium text-sm ${index === currentDay ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  {day.substring(0, 3)}
                </div>
              ))}
            </div>
            
            {/* Programs grid - horizontal scroll on mobile */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              <div className="flex md:grid md:grid-cols-7 gap-2 overflow-x-auto">
                {scheduleData.map((dayPrograms, dayIndex) => (
                  <div key={dayIndex} className="min-w-[60vw] md:min-w-0 space-y-2">
                    {dayPrograms.map((program, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 md:p-3 rounded-lg cursor-pointer transition-all duration-200 ${program.isSpecial 
                          ? (isCultoEspecial(program) ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700' : 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700')
                          : 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700'} 
                          ${selectedProgram === program ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'hover:opacity-90'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProgram(program === selectedProgram ? null : program);
                        }}
                      >
                        {/* Day indicator for mobile */}
                        <div className="block md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {days[dayIndex].substring(0,3)}
                        </div>
                        <div className="flex items-start">
                          <span className={`inline-block w-3 h-3 rounded-full mt-1 mr-2 flex-shrink-0 ${program.isSpecial 
                              ? (isCultoEspecial(program) ? 'bg-yellow-500' : 'bg-red-500')
                              : 'bg-green-500'}`}></span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs md:text-sm text-gray-800 dark:text-gray-200 truncate">
                              {program.name}
                            </div>
                            <div className="text-2xs md:text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {program.time} • {formatDuration(program.duration)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Fixed details panel at the bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 max-h-[40vh] overflow-y-auto">
            {selectedProgram ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {selectedProgram.name}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Horario</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{selectedProgram.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duración</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {selectedProgram.isSpecial
                        ? (isCultoEspecial(selectedProgram) ? "Todo el día" : selectedProgram.duration)
                        : formatDuration(selectedProgram.duration)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Descripción</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{selectedProgram.footer}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Selecciona un programa para ver los detalles
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
