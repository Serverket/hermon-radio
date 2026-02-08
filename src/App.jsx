import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { subscribeOverlay, putOverlay, authCheck } from './overlayClient';
import MultiBibleCard from './MultiBibleCard';
import CustomPlayer from './CustomPlayer';
import DonationInfo from './DonationInfo';
import ImageModal from './components/ImageModal';
import BibleModal from './components/BibleModal';
import ScheduleModal from './components/ScheduleModal';
import Slideshow from './components/Slideshow';
import AnimatedBackground from './components/AnimatedBackground';
import "./styles/tailwind.css";
import Footer from './Footer';
import moment from "moment";
import "aos/dist/aos.css";
import AOS from "aos";

// Small tooltip component rendered via portal so it is never clipped by parent overflow
// Usage: <InfoTip text="Helpful explanation" />
const InfoTip = ({ text }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const anchorRef = useRef(null);

  const show = () => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    // Position below the anchor, centered with an 8px gap
    setPos({ top: r.bottom + 8, left: r.left + r.width / 2 });
    setOpen(true);
  };
  const hide = () => setOpen(false);

  useEffect(() => {
    const onScrollOrResize = () => {
      if (!open) return;
      hide(); // simple approach: hide on scroll/resize to avoid stale position
    };
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize, true);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize, true);
    };
  }, [open]);

  return (
    <>
      <span
        ref={anchorRef}
        className="inline-block relative ml-1 align-middle cursor-help"
        aria-label={text}
        tabIndex={0}
        onMouseEnter={show}
        onFocus={show}
        onMouseLeave={hide}
        onBlur={hide}
      >
        <span className="h-4 w-4 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-[10px] leading-none text-gray-800 dark:text-gray-200 select-none focus:outline-none">?</span>
      </span>
      {open && createPortal(
        <div
          role="tooltip"
          className="fixed z-[9999] whitespace-pre rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow-lg pointer-events-none"
          style={{ top: `${pos.top}px`, left: `${pos.left}px`, transform: "translateX(-50%)" }}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  );
};

/**
 * Schedule configuration for program images and advertisements
 * Contains time-based and date-range based schedules for content display
 */
const imageSchedule = [
  // Monday
  { day: 1, time: "06:00", duration: 60, image: "/programs/regular/DesayunoEspiritual.webp", name: "Desayuno Espiritual", header: "Estás en sintonía de", footer: "Vivencias, reflexiones y meditaciones a través de la palabra de Dios" },
  { day: 1, time: "09:00", duration: 120, image: "/programs/regular/LasSagradasEscrituras.webp", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 1, time: "13:00", duration: 180, image: "/programs/regular/Diosysusmaravillas.webp", name: "Dios y sus maravillas", header: "Estás en sintonía de", footer: "Charlas | Música en vivo | Consejos | Reflexión" },
  { day: 1, time: "15:00", duration: 60, image: "/programs/regular/ElClamordeMiPueblo.webp", name: "El Clamor de Mi Pueblo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },

  // Tuesday
  { day: 2, time: "06:00", duration: 60, image: "/programs/regular/DesayunoEspiritual.webp", name: "Desayuno Espiritual", header: "Estás en sintonía de", footer: "Vivencias, reflexiones y meditaciones a través de la palabra de Dios" },
  { day: 2, time: "09:00", duration: 120, image: "/programs/regular/LasSagradasEscrituras.webp", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 2, time: "15:00", duration: 60, image: "/programs/regular/ElClamordeMiPueblo.webp", name: "El Clamor de Mi Pueblo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 2, time: "16:00", duration: 120, image: "/programs/regular/LaFevieneporeloír.webp", name: "La Fe viene por el oír", header: 'Estás en sintonía de', footer: "¡Comunícate con nosotros para patrocinarnos!" },

  // Wednesday
  { day: 3, time: "06:00", duration: 60, image: "/programs/regular/DesayunoEspiritual.webp", name: "Desayuno Espiritual", header: "Estás en sintonía de", footer: "Vivencias, reflexiones y meditaciones a través de la palabra de Dios" },
  { day: 3, time: "09:00", duration: 120, image: "/programs/regular/LasSagradasEscrituras.webp", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 3, time: "11:00", duration: 60, image: "/programs/regular/Sumergidosensupresencia.webp", name: "Sumergidos en Su Presencia", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 3, time: "13:00", duration: 120, image: "/programs/regular/PalabraSaludyVida.webp", name: "Palabra, Salud y Vida", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 3, time: "15:00", duration: 60, image: "/programs/regular/ElClamordeMiPueblo.webp", name: "El Clamor de Mi Pueblo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 3, time: "16:00", duration: 120, image: "/programs/regular/Momentoscristianos.webp", name: "Momentos Cristianos", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },

  // Thursday
  { day: 4, time: "06:00", duration: 60, image: "/programs/regular/DesayunoEspiritual.webp", name: "Desayuno Espiritual", header: "Estás en sintonía de", footer: "Vivencias, reflexiones y meditaciones a través de la palabra de Dios" },
  { day: 4, time: "09:00", duration: 120, image: "/programs/regular/LasSagradasEscrituras.webp", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 4, time: "11:00", duration: 120, image: "/programs/regular/BuenConsejoBiblico.webp", name: "Un Buen Consejo Bíblico", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 4, time: "13:00", duration: 120, image: "/programs/regular/Mujeresdevaloryfe.webp", name: "Mujeres de Valor y Fe", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 4, time: "15:00", duration: 60, image: "/programs/regular/ElClamordeMiPueblo.webp", name: "El Clamor de Mi Pueblo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 4, time: "20:00", duration: 60, image: "/programs/regular/Horadeldiscipulado.webp", name: "Hora del Discipulado", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },

  // Friday
  { day: 5, time: "06:00", duration: 60, image: "/programs/regular/DesayunoEspiritual.webp", name: "Desayuno Espiritual", header: "Estás en sintonía de", footer: "Vivencias, reflexiones y meditaciones a través de la palabra de Dios" },
  { day: 5, time: "09:00", duration: 120, image: "/programs/regular/LasSagradasEscrituras.webp", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 5, time: "11:00", duration: 60, image: "/programs/regular/Sumergidosensupresencia.webp", name: "Sumergidos en Su Presencia", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 5, time: "15:00", duration: 60, image: "/programs/regular/ElClamordeMiPueblo.webp", name: "El Clamor de Mi Pueblo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 5, time: "18:00", duration: 60, image: "/programs/regular/AlfayOmega.webp", name: "Alfa y Omega", header: "Estás en sintonía de", footer: 'Patrocinadores: Panadería La Nonna | Academia Twin Tonges | @longyu.shop' },
  { day: 5, time: "19:00", duration: 120, image: "/programs/regular/Tiempoderefrigerio.webp", name: "Tiempo de Refrigerio", header: "Estás en sintonía de", footer: "Patrocinadores: Pincho Pocholin | Kiosco La Bendición | Iglesia Tiempo de Refrigerio | Escríbenos al 0424 315 71 26" },

  // Saturday
  { day: 6, time: "05:00", duration: 120, image: "/programs/regular/AmanecerConCristo.webp", name: "Amanecer con Cristo", header: "Estás en sintonía de", footer: "Patrocinadores: Inversiones y Variedad Yalex A&B | Inversiones Karvican | Cerrajería El Cóndor" },
  { day: 6, time: "16:00", duration: 120, image: "/programs/regular/EnOndaConCristo.webp", name: "En Onda Con Cristo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 6, time: "21:00", duration: 60, image: "/programs/regular/VivenciasenCristo.webp", name: "Vivencias en Cristo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },

  // Sunday
  { day: 0, time: "07:00", duration: 120, image: "/programs/regular/Micasayyo.webp", name: "Mi Casa y Yo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 0, time: "16:00", duration: 120, images: ["/programs/regular/seguidoresdecristo1.webp", "/programs/regular/seguidoresdecristo2.webp", "/programs/regular/seguidoresdecristo4.webp"], name: "Seguidores de Cristo", header: "Estás en sintonía de", footer: "¿Con qué limpiará el joven su camino? Con guardar tu palabra. - Salmos 119:9" },

  // Special date-range schedules
  // To activate, uncomment and ensure the year is dynamic or set correctly
  // { startDate: `${moment().year()}-12-31`, endDate: `${moment().year()}-12-31`, image: "/programs/regular/Cultodefin.webp", name: "Culto Especial de Fin de Año", header: "Culto Especial de Fin de Año | 8:30 PM", footer: 'Ven y adoremos juntos a nuestro Dios, será una noche de bendición, de alegría, de alabanzas al Rey de Reyes. Visítanos en la Calle Salias N° 2, Edificio Hermón, Diagonal a Bancaribe.' },
];

// Helper function to group schedule by day
const groupScheduleByDay = (schedule) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const grouped = {};

  schedule.forEach(item => {
    if (!item.startDate) { // Only include recurring schedules
      const dayName = days[item.day];
      if (!grouped[dayName]) grouped[dayName] = [];

      grouped[dayName].push({
        time: item.time,
        name: item.name,
        duration: item.duration
      });
    }
  });

  return grouped;
};

// Advertisement schedule configuration
const adSchedule = [
  { day: 1, time: "12:00", duration: 45 }, // Monday 12PM (Free 11-13)
  { day: 2, time: "12:00", duration: 45 }, // Tuesday 12PM (Free 11-15)
  { day: 3, time: "12:00", duration: 45 }, // Wednesday 12PM (Free 12-13)
  { day: 4, time: "17:00", duration: 45 }, // Thursday 5PM (Free 16-20)
  { day: 5, time: "13:00", duration: 45 }, // Friday 1PM (Free 12-15)
];

// Random advertisements pool
const randomAds = [
  { image: "/programs/regular/LasSagradasEscrituras.webp", name: "Escudriñando Las Sagradas Escrituras", header: "No te pierdas el programa", footer: "¡Comunícate con nosotros para patrocinarnos!" },
];

// Overlay backend config
const OVERLAY_BASE_URL = import.meta.env.VITE_OVERLAY_BASE_URL;

function App() {
  // State management
  const [currentImage, setCurrentImage] = useState(null); // Currently displayed program/image
  const [darkToggle, setDarkToggle] = useState( // Dark mode state with localStorage persistence
    localStorage.getItem("darkMode") === "true"
  );
  const [showDonationInfo, setShowDonationInfo] = useState(false); // Donation modal visibility
  const [showBibleCard, setShowBibleCard] = useState(false); // Bible card visibility (closed by default)
  const [imageModalOpen, setImageModalOpen] = useState(false); // Image modal visibility
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Load overlay data from localStorage
  const loadOverlayFromStorage = () => {
    try {
      const saved = localStorage.getItem('hermon-radio-overlay');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          visible: false, // Always start with overlay hidden
          type: parsed.type || 'image',
          url: parsed.url || '',
          text: parsed.text || '',
          bgColor: parsed.bgColor || '#1f2937',
          textColor: parsed.textColor || '#ffffff',
          position: parsed.position || 'inline',
          fit: parsed.fit || 'contain'
        };
      }
    } catch (error) {
      console.warn('Error loading overlay from localStorage:', error);
    }
    return {
      visible: false,
      type: 'image',
      url: '',
      text: '',
      bgColor: '#1f2937',
      textColor: '#ffffff',
      position: 'inline',
      fit: 'contain'
    };
  };

  const [overlay, setOverlay] = useState(loadOverlayFromStorage());
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminUserInput, setAdminUserInput] = useState("");
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminCreds, setAdminCreds] = useState({ user: "", pass: "" });
  const [adminEnter, setAdminEnter] = useState(false);
  const [adminMinimized, setAdminMinimized] = useState(false);
  const [overlayAnim, setOverlayAnim] = useState(false);
  const [overlayImageModalOpen, setOverlayImageModalOpen] = useState(false);


  /**
   * Effect for scheduling content updates
   * Checks current time and updates displayed content every minute
   * Priority: Date-range schedules > Ads > Regular programs
   */
  useEffect(() => {
    const getCurrentImage = () => {
      const now = moment();
      const currentDay = now.day(); // 0 (Sunday) to 6 (Saturday)
      const currentTime = now.format('HH:mm');

      // Check for active date-range schedules first
      const dateRangeImage = imageSchedule.find(schedule =>
        schedule.startDate && schedule.endDate &&
        now.isBetween(moment(schedule.startDate), moment(schedule.endDate).endOf('day'), null, '[]')
      );

      if (dateRangeImage) return dateRangeImage;

      // Check for active advertisement time slots
      const scheduledAdTime = adSchedule.find(schedule => {
        // Convert both times to moment objects for precise comparison
        const nowTime = moment(currentTime, 'HH:mm');
        const scheduleTime = moment(schedule.time, 'HH:mm');
        const scheduleEndTime = moment(schedule.time, 'HH:mm').add(schedule.duration, 'minutes');

        return (
          schedule.day === currentDay &&
          nowTime.isSameOrAfter(scheduleTime) &&
          nowTime.isBefore(scheduleEndTime)
        );
      });

      if (scheduledAdTime) return randomAds[Math.floor(Math.random() * randomAds.length)];

      // Check regular program schedule
      const scheduledImage = imageSchedule.find(schedule => {
        // Convert both times to moment objects for precise comparison
        const nowTime = moment(currentTime, 'HH:mm');
        const scheduleTime = moment(schedule.time, 'HH:mm');
        const scheduleEndTime = moment(schedule.time, 'HH:mm').add(schedule.duration, 'minutes');

        return (
          schedule.day === currentDay &&
          nowTime.isSameOrAfter(scheduleTime) &&
          nowTime.isBefore(scheduleEndTime)
        );
      });

      return scheduledImage || null;
    };

    const updateImage = () => setCurrentImage(getCurrentImage());
    updateImage(); // Initial update
    const interval = setInterval(updateImage, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize AOS (Animate On Scroll) library
   * Configured for single-time animations with smooth easing
   */
  useEffect(() => {
    AOS.init({
      once: true, // Animations only play once
      easing: "ease-out-cubic", // Smooth animation curve
    });
  }, []);

  // Toggle dark mode and persist state in localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !darkToggle;
    setDarkToggle(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  // Live overlay via SSE - skip updates when admin is editing
  const adminAuthedRef = React.useRef(adminAuthed);
  useEffect(() => { adminAuthedRef.current = adminAuthed; }, [adminAuthed]);

  useEffect(() => {
    if (!OVERLAY_BASE_URL) return;
    const stop = subscribeOverlay(OVERLAY_BASE_URL, (data) => {
      // Skip SSE updates when admin is editing to prevent resetting their work
      if (adminAuthedRef.current) return;
      setOverlay((prev) => ({ ...prev, ...data }));
    });
    return stop;
  }, []);

  // Animate admin modal on open
  useEffect(() => {
    if (adminOpen) {
      setAdminEnter(false);
      const id = requestAnimationFrame(() => setAdminEnter(true));
      return () => cancelAnimationFrame(id);
    } else {
      setAdminEnter(false);
    }
  }, [adminOpen]);

  // Save overlay data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hermon-radio-overlay', JSON.stringify({
        type: overlay.type,
        url: overlay.url,
        text: overlay.text,
        bgColor: overlay.bgColor,
        textColor: overlay.textColor,
        position: overlay.position,
        fit: overlay.fit
      }));
    } catch (error) {
      console.warn('Error saving overlay to localStorage:', error);
    }
  }, [overlay.type, overlay.url, overlay.text, overlay.bgColor, overlay.textColor, overlay.position, overlay.fit]);

  // Animate overlay content on changes
  useEffect(() => {
    setOverlayAnim(false);
    const id = requestAnimationFrame(() => setOverlayAnim(true));
    return () => cancelAnimationFrame(id);
  }, [overlay.visible, overlay.url, overlay.type, overlay.position, overlay.fit, overlay.text]);


  const adminLogin = async (e) => {
    e?.preventDefault?.();
    if (!adminUserInput || !adminPassInput) { alert('Ingrese usuario y contraseña'); return; }
    if (!OVERLAY_BASE_URL) { alert('Configure VITE_OVERLAY_BASE_URL'); return; }
    const creds = { user: adminUserInput.trim(), pass: adminPassInput };
    try {
      await authCheck(OVERLAY_BASE_URL, creds);
      setAdminCreds(creds);
      setAdminAuthed(true);
    } catch (err) {
      setAdminAuthed(false);
      alert('Credenciales inválidas');
    }
  };

  const saveOverlay = async (payload) => {
    if (!OVERLAY_BASE_URL) { alert('Configure VITE_OVERLAY_BASE_URL'); return; }
    try {
      await putOverlay(OVERLAY_BASE_URL, { user: adminCreds.user, pass: adminCreds.pass }, payload);
    } catch (e) {
      alert('Error al actualizar la transmisión');
    }
  };

  const closeOverlayContent = async () => {
    // Always hide locally for responsive UX
    setOverlay((o) => ({ ...o, visible: false }));
    // If not authenticated or backend URL missing, stop here
    if (!adminAuthed) return;
    if (!OVERLAY_BASE_URL) return;
    try {
      await saveOverlay({ ...overlay, visible: false });
    } catch (e) {
      // Ignore network/backend errors; overlay already hidden locally
    }
  };


  const youtubeEmbedUrl = (url) => {
    if (!url) return '';
    let val = url.trim();
    try {
      const u = new URL(val);
      // Handle https://youtu.be/<ID>
      if (u.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1&mute=0&controls=1&showinfo=1&rel=0`;
      }
      // Handle https://www.youtube.com/watch?v=<ID>
      if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}?autoplay=1&mute=0&controls=1&showinfo=1&rel=0`;
      }
      // If it's already an embed link
      if (u.pathname.includes('/embed/')) {
        if (!u.searchParams.has('autoplay')) u.searchParams.set('autoplay', '1');
        return u.toString();
      }
      return val;
    } catch {
      return val;
    }
  };

  const vdoNinjaUrl = (url) => {
    if (!url) return '';
    let val = url.trim();

    // 1. If user pasted an iframe code, extract src
    if (val.startsWith('<iframe') && val.includes('src="')) {
      const srcMatch = val.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        val = srcMatch[1];
      }
    }

    // 2. Ensure protocol
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      val = 'https://' + val;
    }

    try {
      const u = new URL(val);
      if (u.hostname.includes('vdo.ninja') || u.hostname.includes('obs.ninja')) {
        // Essential flags
        if (!u.searchParams.has('autoplay')) u.searchParams.set('autoplay', '1');



        return u.toString();
      }
      return val;
    } catch {
      return val;
    }
  };


  /**
   * Share functionality - opens WhatsApp and Telegram share links
   * Uses predefined message and URL
   */
  const shareApp = () => {
    const urlToShare = "https://www.radiohermonfm.com";
    const message = encodeURIComponent("Escucha Radio Hermón - Un rocío que desciende de lo alto");
    window.open(`https://api.whatsapp.com/send?text=${message}%0A${urlToShare}`, "_blank");
    window.open(`https://t.me/share/url?url=${urlToShare}&text=${message}`, "_blank");
  };

  // Toggle donation information modal visibility
  const toggleDonationInfo = () => setShowDonationInfo(prev => !prev);

  // Toggle Bible card visibility
  const toggleBibleCard = () => setShowBibleCard(prev => !prev);

  /**
   * Copy text to clipboard with fallback for older browsers
   * @param {string} text - Text to copy to clipboard
   */
  const copyToClipboard = (text) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => alert("Información copiada: " + text));
    } else {
      // Fallback for browsers without Clipboard API support
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Información copiada: " + text);
    }
  };

  return (
    <div className="flex justify-center items-center" data-aos="fade-in" data-aos-delay="200">
      <div className={`h-screen w-full ${darkToggle && "dark"}`}>
        {/* Main content container */}
        <div className="flex flex-col justify-center items-center w-full h-screen dark:bg-gray-800">
          {/* Animated Background */}
          <AnimatedBackground darkMode={darkToggle} />

          {/* Header panel buttons */}
          <div className="flex justify-between w-[370px] sm:w-96 mb-0">
            <div className="flex">
              <button
                onClick={shareApp}
                title="Compartir"
                data-aos="fade-down"
                data-aos-duration="700"
                data-aos-once="true"
                className="px-4 py-2 mr-1 text-gray-800 bg-gray-100 rounded-t-lg transition-colors duration-700 ease-in-out dark:bg-gray-900 dark:text-gray-200 hover:text-blue-500 hover:bg-blue-50"
              >
                <i className="text-lg icon-share" />
              </button>
              <button
                onClick={toggleDonationInfo}
                title="Donar"
                data-aos="fade-down"
                data-aos-duration="1100"
                data-aos-once="true"
                className="px-4 py-2 text-red-600 bg-gray-100 rounded-t-lg transition-colors duration-700 ease-in-out dark:bg-gray-900 dark:text-red-400 hover:text-red-500 hover:bg-red-50"
              >
                <i className="text-lg icon-heart" />
              </button>
            </div>
            <div className="flex">
              <button
                onClick={toggleDarkMode}
                title={darkToggle ? "Modo claro" : "Modo oscuro"}
                data-aos="fade-down"
                data-aos-duration="1300"
                data-aos-once="true"
                className="px-4 py-2 mr-1 text-gray-800 bg-gray-100 rounded-t-lg transition-colors duration-700 ease-in-out dark:bg-gray-900 dark:text-gray-800 hover:bg-yellow-50 dark:hover:bg-gray-900 hover:text-yellow-600 dark:hover:text-gray-800"
              >
                <i className={`text-lg ${darkToggle ? 'icon-sun-filled dark:text-gray-200' : 'icon-moon-3'}`} />
              </button>
              <button
                onClick={toggleBibleCard}
                title="Biblia"
                data-aos="fade-down"
                data-aos-duration="900"
                data-aos-once="true"
                className="px-4 py-2 text-gray-800 bg-gray-100 rounded-t-lg transition-colors duration-700 ease-in-out dark:bg-gray-900 dark:text-gray-200 hover:text-blue-500 hover:bg-blue-50"
              >
                <i className={`text-lg icon-book ${showBibleCard ? 'text-blue-500 dark:text-blue-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Main content card */}
          <div className="w-[370px] sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-b-xl text-white dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-50" {...(overlay.type !== 'hls' && { 'data-aos': 'zoom-in', 'data-aos-delay': '700' })}>

            {/* Main content area */}
            <div className="px-6 space-y-2 text-center sm:space-y-3">
              <div className="text-3xl font-bold text-gray-800 filter drop-shadow-md dark:text-gray-200 md:text-2xl">
                Radio Hermón
              </div>

              {/* Overlay inline or scheduled image/text */}
              {overlay?.visible && overlay?.position === 'inline' && (
                (overlay?.type === 'text' && !!overlay?.text) ||
                (overlay?.type === 'image' && !!overlay?.url) ||
                (overlay?.type === 'youtube' && !!overlay?.url) ||
                (overlay?.type === 'vdoninja' && !!overlay?.url)
              ) ? (
                <div className="flex justify-center items-center w-full">
                  <div className={`flex flex-col justify-center items-center space-y-2 w-full transform transition-all duration-300 ${overlayAnim ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'}`}>

                    {/* Image Overlay */}
                    {overlay.type === 'image' && (
                      <div className="relative w-full">
                        <img
                          src={overlay.url}
                          alt="superposición"
                          onClick={() => setOverlayImageModalOpen(true)}
                          title="Haz clic para ampliar"
                          className={`w-full h-auto rounded-xl cursor-pointer hover:scale-[1.02] transition-transform ${overlay.fit === 'cover' ? 'object-cover' : 'object-contain'}`}
                        />
                        {/* Text overlay for images in inline mode */}
                        {overlay.text && (
                          <div className="flex absolute inset-0 justify-center items-center p-4 pointer-events-none">
                            <div className="max-w-4xl text-center text-white pointer-events-auto">
                              <div
                                className="inline-block rounded-xl px-4 py-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
                                style={{ backgroundColor: overlay.bgColor }}
                              >
                                <div
                                  className="text-lg font-semibold whitespace-pre-wrap break-words sm:text-xl"
                                  style={{ color: overlay.textColor }}
                                >
                                  {overlay.text}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* YouTube Video Overlay */}
                    {overlay.type === 'youtube' && (
                      <div className="overflow-hidden w-full bg-black rounded-xl" style={{ aspectRatio: '16 / 9' }}>
                        <iframe
                          src={youtubeEmbedUrl(overlay.url)}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                          title="Superposición de YouTube"
                        />
                      </div>
                    )}

                    {/* VDO.ninja Iframe - Optimized */}
                    {overlay.type === 'vdoninja' && (
                      <div className="overflow-hidden w-full bg-black rounded-xl shadow-lg" style={{ aspectRatio: '16 / 9' }}>
                        <iframe
                          key={overlay.url}
                          src={vdoNinjaUrl(overlay.url)}
                          allow="autoplay; camera; microphone; fullscreen; picture-in-picture; display-capture; clipboard-read; clipboard-write"
                          allowFullScreen
                          className="w-full h-full border-none"
                          title="VDO.ninja Stream"
                          loading="eager"
                        />
                      </div>
                    )}

                    {/* Text Only Overlay */}
                    {overlay.type === 'text' && (
                      <div className="px-4 py-3 w-full rounded-xl" style={{ backgroundColor: overlay.bgColor }}>
                        <div className="text-lg font-semibold whitespace-pre-wrap break-words sm:text-xl" style={{ color: overlay.textColor }}>{overlay.text}</div>
                      </div>
                    )}

                  </div>
                </div>
              ) : (
                currentImage && (
                  <div className="flex justify-center items-center w-full">
                    <div className="flex flex-col justify-center items-center space-y-2 w-full">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-600">
                        {currentImage.header}
                      </span>

                      {currentImage.images ? (
                        <div className="relative z-10 w-auto h-36 md:h-48 aspect-square rounded-xl overflow-hidden shadow-lg transition-all ease-in-out cursor-pointer hover:scale-105 bg-black/5 dark:bg-white/5">
                          <Slideshow
                            images={currentImage.images}
                            interval={4000}
                            className="w-full h-full"
                            onClick={() => setImageModalOpen(true)}
                            title="Haz clic para ampliar"
                          />
                        </div>
                      ) : (
                        <img
                          className="z-10 h-36 rounded-xl transition-all ease-in-out cursor-pointer md:h-48 hover:scale-105"
                          src={currentImage.image}
                          alt={currentImage.name}
                          onClick={() => setImageModalOpen(true)}
                          title="Haz clic para ampliar"
                        />
                      )}

                      <div className="overflow-hidden w-8/12 text-sm text-center text-gray-800 drop-shadow-md md:w-full dark:text-gray-200">
                        <marquee>
                          {currentImage.footer}
                        </marquee>
                      </div>
                    </div>
                  </div>
                )
              )}



              {/* Audio player */}
              <div className="flex justify-center text-sm text-grey-darker" data-aos="fade-right" data-aos-delay="900">
                <CustomPlayer
                  darkMode={darkToggle}
                  src="https://app0102.sonicpanelradio.com/8840/stream"
                />
              </div>

              {/* Buttons row below player */}
              <div className="flex justify-between items-center pt-2 w-full" data-aos="fade-up" data-aos-delay="800">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center justify-center px-3 py-1 h-8 text-sm text-gray-800 dark:text-gray-200 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border border-white/30 dark:border-gray-600 hover:border-white/50 dark:hover:border-gray-400 rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/50 hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.3)] hover:scale-[1.03]"
                  title="Ver Programas"
                >
                  <i className="mr-1 text-lg icon-calendar-5" />
                  Ver Programas
                </button>
                <div className="flex space-x-2">
                  <a href="https://www.facebook.com/Hermon95.3" target="_blank" rel="noreferrer">
                    <button type="button" className="text-white text-md sm:text-sm hover:text-[#3b5998] bg-[#3b5998] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200">
                      <i className="icon-facebook-squared" />
                    </button>
                  </a>
                  <a href="https://www.instagram.com/radiohermon/" target="_blank" rel="noreferrer">
                    <button type="button" className="text-white text-md sm:text-sm hover:text-[#bc2a8d] bg-[#bc2a8d] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200">
                      <i className="icon-instagram-1" />
                    </button>
                  </a>
                </div>
              </div>

              {/* Social media links */}
              {/* <div className="flex flex-row justify-center items-center pt-2 space-x-2 text-center" data-aos="fade-up" data-aos-delay="800">
                <a href="https://www.facebook.com/Hermon95.3" target="_blank" rel="noreferrer">
                  <button type="button" className="text-white text-md sm:text-sm hover:text-[#3b5998] bg-[#3b5998] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-facebook-squared active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200">
                    Facebook
                  </button>
                </a>
                <a href="https://www.instagram.com/radiohermon/" target="_blank" rel="noreferrer">
                  <button type="button" className="text-white text-md sm:text-sm hover:text-[#bc2a8d] bg-[#bc2a8d] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-instagram-1 active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200">
                    Instagram
                  </button>
                </a>
              </div> */}
            </div>

            {/* Donation information modal */}
            <DonationInfo
              showDonationInfo={showDonationInfo}
              toggleDonationInfo={toggleDonationInfo}
              copyToClipboard={copyToClipboard}
            />
          </div>

          {/* Footer */}
          <Footer />

          {/* Bible Modal */}
          <BibleModal isOpen={showBibleCard} onClose={() => setShowBibleCard(false)} darkMode={darkToggle} />

          {/* Admin Top Utility Bar */}
          {adminOpen && (
            <div className={`fixed top-0 left-0 right-0 z-[220] transition-all duration-200 ${adminEnter ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
              <div className="mx-auto max-w-screen-lg border-b border-gray-200 shadow-sm backdrop-blur bg-white/90 dark:bg-gray-900/90 dark:border-gray-700">
                <div className="flex justify-between items-center px-3 py-2 sm:px-4">
                  <h3 className="text-sm font-semibold text-gray-800 sm:text-base dark:text-gray-200">Panel de Transmisión</h3>
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={() => setAdminMinimized(!adminMinimized)}
                      className="flex justify-center items-center w-8 h-8 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                      aria-label={adminMinimized ? 'Expandir' : 'Minimizar'}
                      title={adminMinimized ? 'Expandir' : 'Minimizar'}
                    >
                      {adminMinimized ? <i className="icon-down-open" /> : <span className="block w-4 h-1 bg-current rounded-sm" />}
                    </button>
                    <button
                      onClick={() => { setAdminOpen(false); setAdminAuthed(false); setAdminMinimized(false); }}
                      className="flex justify-center items-center w-8 h-8 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                      aria-label="Cerrar"
                      title="Cerrar"
                    >
                      <i className="text-xl leading-none icon-cancel" />
                    </button>
                  </div>
                </div>
                {!adminMinimized && (
                  <div className="px-3 sm:px-4 pb-3 max-h-[50vh] overflow-y-auto">
                    {!adminAuthed ? (
                      <form onSubmit={adminLogin} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Usuario administrador</label>
                          <input type="text" value={adminUserInput} onChange={(e) => setAdminUserInput(e.target.value)} className="px-3 py-2 w-full text-gray-800 bg-white rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" placeholder="Ingrese usuario" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                          <input type="password" value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} className="px-3 py-2 w-full text-gray-800 bg-white rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" placeholder="Ingrese contraseña" />
                        </div>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Entrar</button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        {/* Redesigned Compact Control Panel */}
                        <div className="space-y-3">
                          {/* Row 1: Type + Display Mode + Fit - All in one line */}
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Type Selector - Icon buttons with expanding text */}
                            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <button
                                type="button"
                                title="Imagen"
                                onClick={() => setOverlay(o => ({ ...o, type: 'image' }))}
                                className={`flex items-center gap-1.5 p-2 rounded-md transition-all duration-200 ${overlay.type === 'image'
                                  ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm px-3'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                  }`}
                              >
                                <i className="icon-picture text-base"></i>
                                <span className={`text-sm font-medium overflow-hidden transition-all duration-200 ${overlay.type === 'image' ? 'max-w-[60px] opacity-100' : 'max-w-0 opacity-0'}`}>Imagen</span>
                              </button>
                              <button
                                type="button"
                                title="Texto"
                                onClick={() => setOverlay(o => ({ ...o, type: 'text' }))}
                                className={`flex items-center gap-1.5 p-2 rounded-md transition-all duration-200 ${overlay.type === 'text'
                                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm px-3'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                  }`}
                              >
                                <i className="icon-edit text-base"></i>
                                <span className={`text-sm font-medium overflow-hidden transition-all duration-200 ${overlay.type === 'text' ? 'max-w-[60px] opacity-100' : 'max-w-0 opacity-0'}`}>Texto</span>
                              </button>
                              <button
                                type="button"
                                title="YouTube"
                                onClick={() => setOverlay(o => ({ ...o, type: 'youtube' }))}
                                className={`flex items-center gap-1.5 p-2 rounded-md transition-all duration-200 ${overlay.type === 'youtube'
                                  ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm px-3'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                  }`}
                              >
                                <i className="icon-video text-base"></i>
                                <span className={`text-sm font-medium overflow-hidden transition-all duration-200 ${overlay.type === 'youtube' ? 'max-w-[70px] opacity-100' : 'max-w-0 opacity-0'}`}>YouTube</span>
                              </button>
                              <button
                                type="button"
                                title="En Vivo / Pantalla"
                                onClick={() => setOverlay(o => ({ ...o, type: 'vdoninja' }))}
                                className={`flex items-center gap-1.5 p-2 rounded-md transition-all duration-200 ${overlay.type === 'vdoninja'
                                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm px-3'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                  }`}
                              >
                                <i className="icon-videocam text-base"></i>
                                <span className={`text-sm font-medium overflow-hidden transition-all duration-200 ${overlay.type === 'vdoninja' ? 'max-w-[70px] opacity-100' : 'max-w-0 opacity-0'}`}>En Vivo</span>
                              </button>
                            </div>

                            {/* Separator */}
                            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                            {/* Display Mode Toggle */}
                            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <button
                                type="button"
                                title="Integrado"
                                onClick={() => setOverlay(o => ({ ...o, position: 'inline' }))}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${overlay.position === 'inline'
                                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                  }`}
                              >
                                <i className="icon-th-large mr-1"></i>Integrado
                              </button>
                              <button
                                type="button"
                                title="Pantalla Completa"
                                onClick={() => setOverlay(o => ({ ...o, position: 'fullscreen' }))}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${overlay.position === 'fullscreen'
                                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                  }`}
                              >
                                <i className="icon-window-maximize mr-1"></i>Completa
                              </button>
                            </div>

                            {/* Image Fit Toggle (only visible for image type) */}
                            {overlay.type === 'image' && (
                              <>
                                <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                  <button
                                    type="button"
                                    title="Contener imagen"
                                    onClick={() => setOverlay(o => ({ ...o, fit: 'contain' }))}
                                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${overlay.fit === 'contain'
                                      ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                      }`}
                                  >
                                    Contener
                                  </button>
                                  <button
                                    type="button"
                                    title="Cubrir área"
                                    onClick={() => setOverlay(o => ({ ...o, fit: 'cover' }))}
                                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${overlay.fit === 'cover'
                                      ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                      }`}
                                  >
                                    Cubrir
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Content Inputs - Reorganized Grid */}
                        <div className="space-y-3">
                          {overlay.type === 'text' && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="inline-flex items-center">Texto<InfoTip text={"Mensaje que se mostrará como sobreimpresión en vivo."} /></span>
                              </label>
                              <textarea
                                value={overlay.text}
                                onChange={(e) => setOverlay(o => ({ ...o, text: e.target.value }))}
                                className="w-full min-h-[60px] px-3 py-2 rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Escribe el anuncio..."
                              />
                              <div className="flex flex-wrap gap-4">
                                <div className="flex gap-2 items-center">
                                  <label className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">Fondo<InfoTip text={"Color de fondo del texto."} /></label>
                                  <input type="color" value={overlay.bgColor || '#2563eb'} onChange={(e) => setOverlay(o => ({ ...o, bgColor: e.target.value }))} className="w-8 h-6 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                  <input type="text" value={overlay.bgColor || ''} onChange={(e) => setOverlay(o => ({ ...o, bgColor: e.target.value }))} placeholder="#2563eb" className="px-2 py-1 w-20 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 text-gray-800 dark:text-gray-200" />
                                </div>
                                <div className="flex gap-2 items-center">
                                  <label className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">Texto<InfoTip text={"Color del texto."} /></label>
                                  <input type="color" value={overlay.textColor || '#ffffff'} onChange={(e) => setOverlay(o => ({ ...o, textColor: e.target.value }))} className="w-8 h-6 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                  <input type="text" value={overlay.textColor || ''} onChange={(e) => setOverlay(o => ({ ...o, textColor: e.target.value }))} placeholder="#ffffff" className="px-2 py-1 w-20 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 text-gray-800 dark:text-gray-200" />
                                </div>
                              </div>
                            </div>
                          )}

                          {overlay.type === 'image' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">URL de imagen<InfoTip text={"Pega un enlace directo a una imagen (JPG, PNG, GIF, etc.)"} /></label>
                                <input
                                  type="text"
                                  value={overlay.url}
                                  onChange={(e) => setOverlay(o => ({ ...o, url: e.target.value }))}
                                  placeholder="https://ejemplo.com/imagen.jpg"
                                  className="w-full px-3 py-2 rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">Texto superpuesto<InfoTip text={"Texto que aparecerá sobre la imagen."} /></label>
                                <input
                                  type="text"
                                  value={overlay.text || ''}
                                  onChange={(e) => setOverlay(o => ({ ...o, text: e.target.value }))}
                                  placeholder="Texto sobre la imagen..."
                                  className="w-full px-3 py-2 rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div className="lg:col-span-2 flex flex-wrap gap-4">
                                <div className="flex gap-2 items-center">
                                  <label className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">Fondo<InfoTip text={"Color de fondo del texto sobre la imagen."} /></label>
                                  <input type="color" value={overlay.bgColor || '#2563eb'} onChange={(e) => setOverlay(o => ({ ...o, bgColor: e.target.value }))} className="w-8 h-6 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                  <input type="text" value={overlay.bgColor || ''} onChange={(e) => setOverlay(o => ({ ...o, bgColor: e.target.value }))} placeholder="#2563eb" className="px-2 py-1 w-20 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 text-gray-800 dark:text-gray-200" />
                                </div>
                                <div className="flex gap-2 items-center">
                                  <label className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">Texto<InfoTip text={"Color del texto sobre la imagen."} /></label>
                                  <input type="color" value={overlay.textColor || '#ffffff'} onChange={(e) => setOverlay(o => ({ ...o, textColor: e.target.value }))} className="w-8 h-6 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                  <input type="text" value={overlay.textColor || ''} onChange={(e) => setOverlay(o => ({ ...o, textColor: e.target.value }))} placeholder="#ffffff" className="px-2 py-1 w-20 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-900/60 text-gray-800 dark:text-gray-200" />
                                </div>
                              </div>
                            </div>
                          )}

                          {overlay.type === 'vdoninja' && (
                            <div className="space-y-1">
                              <label className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">Link de Video (VDO.ninja)<InfoTip text={"Pega el link de VDO.ninja o tu stream principal."} /></label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={overlay.url}
                                  onChange={(e) => setOverlay(o => ({ ...o, url: e.target.value }))}
                                  placeholder="https://vdo.ninja/?view=XXXX"
                                  className="flex-1 px-3 py-2 rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => window.open(vdoNinjaUrl(overlay.url), '_blank')}
                                  className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                                  title="Probar link"
                                >
                                  <i className="icon-link-ext"></i>
                                </button>
                              </div>
                            </div>
                          )}

                          {overlay.type === 'youtube' && (
                            <div className="space-y-1">
                              <label className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">URL de YouTube<InfoTip text={"Pega un enlace de YouTube (https://youtu.be/... o https://www.youtube.com/watch?v=...)"} /></label>
                              <input
                                type="text"
                                value={overlay.url}
                                onChange={(e) => setOverlay(o => ({ ...o, url: e.target.value }))}
                                placeholder="https://youtu.be/..."
                                className="w-full px-3 py-2 rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions - Compact Row */}
                        <div className="flex flex-wrap gap-2 items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Visible</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={!!overlay.visible}
                              onClick={() => setOverlay(o => ({ ...o, visible: !o.visible }))}
                              className={`inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${overlay.visible ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${overlay.visible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const defaultOverlay = {
                                  visible: false,
                                  type: 'image',
                                  url: '',
                                  position: 'inline',
                                  fit: 'contain',
                                  source: 'url',
                                  title: '',
                                  text: '',
                                  bgColor: '#2563eb',
                                  textColor: '#ffffff'
                                };
                                setOverlay(defaultOverlay);
                                saveOverlay(defaultOverlay);
                              }}
                              className="inline-flex items-center justify-center p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              title="Limpiar"
                            >
                              <i className="icon-trash-1"></i>
                            </button>
                            <button
                              onClick={() => saveOverlay(overlay)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                              <i className="icon-export"></i>
                              Transmitir
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Admin trigger (top-right). Invisible by default; appears on hover/focus */}
          {!adminOpen && (
            <button
              onClick={() => setAdminOpen(true)}
              title="Admin"
              aria-label="Abrir panel de administración"
              className="fixed top-3 right-3 z-[221] opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-800 rounded-lg shadow dark:bg-gray-900 dark:text-gray-200"
            >
              <i className="text-lg icon-lock" />
            </button>
          )}

          {/* Fullscreen Overlay */}
          {overlay?.visible && overlay?.position === 'fullscreen' && (
            overlay?.type === 'text' ? !!overlay?.text : !!overlay?.url
          ) && (
              <div
                className={`fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-6 transition-opacity duration-200 ${overlayAnim ? 'bg-black/70 opacity-100' : 'bg-black/0 opacity-0'}`}
                onClick={(e) => { if (e.target === e.currentTarget) closeOverlayContent(); }}
              >
                <div
                  className={`relative w-full h-full max-w-screen max-h-screen rounded-lg overflow-hidden bg-black transform transition-all duration-200 ${overlayAnim ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button for fullscreen content */}
                  <button
                    onClick={closeOverlayContent}
                    className="absolute top-4 right-4 z-[160] w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                    aria-label="Cerrar"
                    title="Cerrar"
                  >
                    <i className="text-2xl icon-cancel" />
                  </button>
                  {overlay.type === 'image' && (
                    <div className="relative w-full h-full">
                      <img
                        src={overlay.url}
                        alt="superposición"
                        onClick={() => setOverlayImageModalOpen(true)}
                        title="Haz clic para ampliar"
                        className={`w-full h-full cursor-zoom-in ${overlay.fit === 'cover' ? 'object-cover' : 'object-contain'}`}
                      />
                      {/* Text overlay for images */}
                      {overlay.text && (
                        <div className="flex absolute inset-0 justify-center items-center p-6 pointer-events-none">
                          <div className="max-w-4xl text-center text-white pointer-events-auto">
                            <div
                              className="inline-block rounded-xl px-6 py-4 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
                              style={{ backgroundColor: overlay.bgColor }}
                            >
                              <div
                                className="text-2xl font-bold whitespace-pre-wrap sm:text-4xl lg:text-6xl"
                                style={{ color: overlay.textColor }}
                              >
                                {overlay.text}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {overlay.type === 'youtube' && (
                    <iframe
                      src={youtubeEmbedUrl(overlay.url)}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      title="Superposición de YouTube en pantalla completa"
                    />
                  )}
                  {overlay.type === 'vdoninja' && (
                    <div className="w-full h-full bg-black">
                      <iframe
                        key={overlay.url}
                        src={vdoNinjaUrl(overlay.url)}
                        allow="autoplay; camera; microphone; fullscreen; picture-in-picture; display-capture; clipboard-read; clipboard-write"
                        allowFullScreen
                        className="w-full h-full border-none"
                        title="VDO.ninja Stream"
                      />
                    </div>
                  )}
                  {overlay.type === 'text' && (
                    <div className="flex justify-center items-center p-6 w-full h-full">
                      <div className="max-w-4xl text-center text-white">
                        <div className="inline-block rounded-xl px-6 py-4 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]" style={{ backgroundColor: overlay.bgColor }}>
                          <div className="text-2xl font-bold whitespace-pre-wrap sm:text-4xl lg:text-6xl" style={{ color: overlay.textColor }}>{overlay.text}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Image Modal for enlarged view */}
          {currentImage && (
            <ImageModal
              isOpen={imageModalOpen}
              onClose={() => setImageModalOpen(false)}
              image={currentImage.image}
              images={currentImage.images}
              name={currentImage.name}
              header={currentImage.header}
              footer={currentImage.footer}
              darkMode={darkToggle}
            />
          )}

          {/* Overlay image click-to-enlarge modal */}
          {overlay?.visible && overlay?.url && overlay.type === 'image' && (
            <ImageModal
              isOpen={overlayImageModalOpen}
              onClose={() => setOverlayImageModalOpen(false)}
              image={overlay.url}
              name={overlay.title || 'Superposición'}
              header={overlay.title}
              footer={''}
              darkMode={darkToggle}
            />
          )}
          <ScheduleModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            darkMode={darkToggle}
            schedule={imageSchedule} // Pass entire schedule array
          />
          {/* ElevenLabs Convai AI Assistant Widget - positioned at bottom */}
          {/* <div className="fixed right-4 bottom-16 z-50">
            <ConvaiAssistant />
          </div> */}
        </div>
      </div>
    </div >
  );
}

export default App;
