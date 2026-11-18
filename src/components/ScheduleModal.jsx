/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { CalendarIcon, CloseIcon, ImageIcon } from './Icons';

const formatDuration = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} ${mins} min`;
  }
  return `${minutes} min`;
};

const formatTime = (time) => {
  if (!time || time === 'Todo el día') return time;
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

const isCultoEspecial = (program) => program.name === 'Culto Especial de Fin de Año';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function ScheduleModal({ isOpen, onClose, darkMode, schedule }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const currentDay = moment().day();
  const [mobileDay, setMobileDay] = useState(currentDay);

  useEffect(() => {
    if (isOpen) {
      setMobileDay(moment().day());
      AOS.init({
        once: true,
        duration: 400,
        easing: 'ease-out-cubic',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groupScheduleByDay = (items) => {
    const grouped = Array(7)
      .fill()
      .map(() => []);

    items.forEach((item) => {
      if (item.startDate) {
        const start = moment(item.startDate);
        const end = moment(item.endDate);
        const diff = end.diff(start, 'days');

        for (let i = 0; i <= diff; i++) {
          const dayIndex = start.clone().add(i, 'days').day();
          grouped[dayIndex].push({
            ...item,
            time: 'Todo el día',
            duration: 'Evento especial',
            isSpecial: true,
          });
        }
      } else {
        grouped[item.day].push({
          ...item,
          isSpecial: false,
        });
      }
    });

    return grouped;
  };

  const scheduleData = groupScheduleByDay(schedule);

  const renderProgramCard = (program, idx) => {
    const isSelected = selectedProgram === program;
    const dotClass = program.isSpecial
      ? isCultoEspecial(program)
        ? 'bg-amber-500'
        : 'bg-rose-500'
      : 'bg-emerald-500';

    return (
      <button
        key={idx}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedProgram(isSelected ? null : program);
        }}
        className={`w-full text-left rounded-2xl p-3 transition-all duration-150 touch-manipulation cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
          isSelected
            ? 'accent-ring bg-white/95 dark:bg-slate-800/95 shadow-md'
            : 'glass-inner hover:scale-[1.01]'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${dotClass}`} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-100 leading-snug">
              {program.name}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              {formatTime(program.time)} •{' '}
              {program.isSpecial
                ? isCultoEspecial(program)
                  ? 'Todo el día'
                  : program.duration
                : formatDuration(program.duration)}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Programación Semanal"
      className={`${darkMode ? 'dark' : ''} fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/35 backdrop-blur-sm p-2 sm:p-4 md:p-6`}
      onClick={onClose}
    >
      <div
        className="glass-shell rounded-[28px] w-full max-w-7xl h-[90vh] max-h-[860px] flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
        data-aos="zoom-in"
        data-aos-duration="350"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-200/70 dark:border-white/10 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl pill-gold-soft flex items-center justify-center flex-shrink-0">
              <CalendarIcon />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-800 dark:text-white leading-tight truncate">
                Programación Semanal
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                Toca cualquier programa para ver su descripción completa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full glass-pill text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Desktop 7-Day Column Headers */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-3 px-6 py-3 bg-white/40 dark:bg-slate-900/35 border-b border-slate-200/60 dark:border-white/10 text-center text-sm font-extrabold text-slate-600 dark:text-slate-300">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`py-1 rounded-xl ${
                index === currentDay ? 'pill-gold-soft font-extrabold' : ''
              }`}
            >
              {index === currentDay ? `${day} (Hoy)` : day}
            </div>
          ))}
        </div>

        {/* Mobile/Tablet Day Selector Pills */}
        <div className="lg:hidden flex items-center gap-1.5 px-4 py-3 overflow-x-auto no-scrollbar bg-white/35 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-white/10">
          {DAYS.map((day, index) => {
            const active = index === mobileDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setMobileDay(index)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  active
                    ? 'btn-opal-gold'
                    : index === currentDay
                      ? 'pill-gold-soft'
                      : 'glass-pill text-slate-600 dark:text-slate-300'
                }`}
              >
                {day.substring(0, 3)}
                {index === currentDay ? ' • Hoy' : ''}
              </button>
            );
          })}
        </div>

        {/* Programs Grid (7 columns on Desktop, focused selected day on Mobile/Tablet) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="hidden lg:grid lg:grid-cols-7 gap-3 items-start">
            {scheduleData.map((dayPrograms, dayIndex) => (
              <div key={dayIndex} className="space-y-2.5">
                {dayPrograms.map((program, idx) => renderProgramCard(program, idx))}
              </div>
            ))}
          </div>

          <div className="lg:hidden space-y-2.5">
            {scheduleData[mobileDay]?.length > 0 ? (
              scheduleData[mobileDay].map((program, idx) => renderProgramCard(program, idx))
            ) : (
              <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-8">
                Transmisión continua de Radio Hermón 95.3 FM
              </p>
            )}
          </div>
        </div>

        {/* Fixed Details Panel at Bottom */}
        <div className="border-t border-slate-200/70 dark:border-white/10 bg-white/55 dark:bg-slate-900/45 px-5 sm:px-7 py-4 max-h-[32vh] overflow-y-auto">
          {selectedProgram ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 glass-inner rounded-2xl overflow-hidden flex justify-center items-center p-1">
                {selectedProgram.image || (selectedProgram.images && selectedProgram.images[0]) ? (
                  <img
                    src={selectedProgram.image || selectedProgram.images[0]}
                    alt={selectedProgram.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <span className="text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white">
                    {selectedProgram.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedProgram.isSpecial ? 'pill-gold-soft' : 'badge-emerald-live'
                    }`}
                  >
                    {selectedProgram.isSpecial ? 'Evento Especial' : 'Programa Regular'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Horario
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {formatTime(selectedProgram.time)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Duración
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {selectedProgram.isSpecial
                        ? isCultoEspecial(selectedProgram)
                          ? 'Todo el día'
                          : selectedProgram.duration
                        : formatDuration(selectedProgram.duration)}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Descripción
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {selectedProgram.footer}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 text-center py-2">
              Selecciona un programa para ver los detalles
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
