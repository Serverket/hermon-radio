import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { subscribeOverlay, putOverlay, authCheck } from './overlayClient';
import MultiBibleCard from './MultiBibleCard';
import CustomPlayer from './CustomPlayer';
import DonationInfo from './DonationInfo';
import ImageModal from './components/ImageModal';
import BibleModal from './components/BibleModal';
import HlsPlayer from './components/HlsPlayer';
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
        className="ml-1 inline-block relative cursor-help align-middle"
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
  { day: 1, time: "09:00", duration: 120, image: "LasSagradasEscrituras.png", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 1, time: "13:00", duration: 180, image: "Diosysusmaravillas.jpg", name: "Dios y sus maravillas", header: "Estás en sintonía de", footer: "Charlas | Música en vivo | Consejos | Reflexión" },
  { day: 1, time: "22:00", duration: 60, image: "LaFeeslaPalabradeDios.jpeg", name: "La Fe es la Palabra de Dios", header: "Estás en sintonía de", footer: "Dios te bendiga" },
  
  // Tuesday
  { day: 2, time: "09:00", duration: 120, image: "LasSagradasEscrituras.png", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 2, time: "16:00", duration: 180, image: "LaFevieneporeloír.png", name: "La Fe viene por el oír", header: 'Estás en sintonía de', footer: "¡Comunícate con nosotros para patrocinarnos!" },
  // Wednesday
  { day: 3, time: "09:00", duration: 120, image: "LasSagradasEscrituras.png", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  // Thursday
  { day: 4, time: "09:00", duration: 120, image: "LasSagradasEscrituras.png", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },

  // Friday
  { day: 5, time: "09:00", duration: 120, image: "LasSagradasEscrituras.png", name: "Escudriñando Las Sagradas Escrituras", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 5, time: "18:00", duration: 60, image: "AlfayOmega.png", name: "Alfa y Omega", header: 'Patrocinador: "Panadería La Nonna, el mejor pan, del horno a tu boca | www.longyu.store', footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 5, time: "19:00", duration: 120, image: "Tiempoderefrigerio.png", name: "Tiempo de Refrigerio", header: "Estás en sintonía de", footer: "Patrocinadores: Pincho Pocholin | Kiosco La Bendición | Iglesia Tiempo de Refrigerio | Escríbenos al 0424 315 71 26" },
  
  // Saturday
  { day: 6, time: "21:00", duration: 60, image: "VivenciasenCristo.jpeg", name: "Vivencias en Cristo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 6, time: "05:00", duration: 120, image: "AmanecerConCristo.png", name: "Amanecer con Cristo", header: "Estás en sintonía de", footer: "Patrocinadores: Inversiones y Variedad Yalex A&B | Inversiones Karvican | Cerrajería El Cóndor" },
  
  // Special date-range schedules
  { startDate: "2024-12-04", endDate: "2024-12-07", image: "63aniversario.png", name: "63 Aniversario", header: "Programación de aniversario del 04 al 07 de Diciembre de 6:00 PM a 9:00 PM", footer: 'Deuteronomio 31:6 "Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará."' },
  { startDate: "2024-12-31", endDate: "2024-12-31", image: "Cultodefin.jpeg", name: "Culto Especial de Fin de Año", header: "Culto Especial de Fin de Año | 8:30 PM", footer: 'Ven y adoremos juntos a nuestro Dios, será una noche de bendición, de alegría, de alabanzas al Rey de Reyes con el predicador Leobaldo Barradas.' },
];

// Advertisement schedule configuration
const adSchedule = [
  { day: 1, time: "10:00", duration: 30 }, // Monday 10AM
  { day: 3, time: "14:00", duration: 45 }, // Wednesday 2PM
  { day: 0, time: "16:00", duration: 60 }, // Sunday 4PM
];

// Random advertisements pool
const randomAds = [
  { image: "AlfayOmega.png", name: "Alfa y Omega", header: "No te pierdas el programa", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { image: "LasSagradasEscrituras.png", name: "Escudriñando Las Sagradas Escrituras", header: "No te pierdas el programa", footer: "¡Comunícate con nosotros para patrocinarnos!" },
];

// Overlay backend config
const OVERLAY_BASE_URL = import.meta.env.VITE_OVERLAY_BASE_URL;
// HLS stream URL (e.g., http://localhost:8000/live/stream/index.m3u8)
const STREAM_HLS_URL = import.meta.env.VITE_STREAM_HLS_URL;

function App() {
  // State management
  const [currentImage, setCurrentImage] = useState(null); // Currently displayed program/image
  const [darkToggle, setDarkToggle] = useState( // Dark mode state with localStorage persistence
    localStorage.getItem("darkMode") === "true"
  );
  const [showDonationInfo, setShowDonationInfo] = useState(false); // Donation modal visibility
  const [showBibleCard, setShowBibleCard] = useState(false); // Bible card visibility (closed by default)
  const [imageModalOpen, setImageModalOpen] = useState(false); // Image modal visibility

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
      const scheduledAdTime = adSchedule.find(schedule => 
        schedule.day === currentDay &&
        currentTime >= schedule.time &&
        currentTime < moment(schedule.time, 'HH:mm').add(schedule.duration, 'minutes').format('HH:mm')
      );

      if (scheduledAdTime) return randomAds[Math.floor(Math.random() * randomAds.length)];

      // Check regular program schedule
      const scheduledImage = imageSchedule.find(schedule => 
        schedule.day === currentDay &&
        currentTime >= schedule.time &&
        currentTime < moment(schedule.time, 'HH:mm').add(schedule.duration, 'minutes').format('HH:mm')
      );

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

  // Live overlay via SSE
  useEffect(() => {
    if (!OVERLAY_BASE_URL) return;
    const stop = subscribeOverlay(OVERLAY_BASE_URL, (data) => setOverlay((prev) => ({ ...prev, ...data })));
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
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, '');
      let id = '';
      if (host === 'youtu.be') {
        id = u.pathname.split('/').filter(Boolean)[0] || '';
      } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
        if (u.pathname.startsWith('/watch')) id = u.searchParams.get('v') || '';
        else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2] || '';
        else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2] || '';
      }
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&loop=1` : url;
    } catch {
      return url;
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
          {/* Background texture */}
          <img
            src="/charlie-brown.svg"
            className="object-cover absolute w-full h-screen bg-center bg-no-repeat bg-cover opacity-5 dark:opacity-10"
            alt="Background texture"
          />
          
          {/* Header panel buttons */}
          <div className="flex justify-between w-[370px] sm:w-96 mb-0">
            <div className="flex">
              <button
                onClick={shareApp}
                title="Compartir"
                data-aos="fade-down"
                data-aos-duration="700"
                data-aos-once="true"
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-t-lg mr-1 transition-colors duration-700 ease-in-out dark:bg-gray-900 dark:text-gray-200 hover:text-blue-500 hover:bg-blue-50"
              >
                <i className="text-lg icon-share" />
              </button>
              <button
                onClick={toggleDonationInfo}
                title="Donar"
                data-aos="fade-down"
                data-aos-duration="1100"
                data-aos-once="true"
                className="px-4 py-2 bg-gray-100 text-red-600 rounded-t-lg transition-colors duration-700 ease-in-out dark:bg-gray-900 dark:text-red-400 hover:text-red-500 hover:bg-red-50"
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
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-t-lg mr-1 transition-colors duration-700 ease-in-out dark:bg-gray-900 dark:text-gray-800 hover:bg-yellow-50 dark:hover:bg-gray-900 hover:text-yellow-600 dark:hover:text-gray-800"
              >
                <i className={`text-lg ${darkToggle ? 'icon-sun-filled dark:text-gray-200' : 'icon-moon-3'}`} />
              </button>
              <button
                onClick={toggleBibleCard}
                title="Biblia"
                data-aos="fade-down"
                data-aos-duration="900"
                data-aos-once="true"
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-t-lg transition-colors duration-700 ease-in-out dark:bg-gray-900 dark:text-gray-200 hover:text-blue-500 hover:bg-blue-50"
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
                (overlay?.type === 'youtube' && !!overlay?.url)
              ) ? (
                <div className="flex justify-center items-center w-full">
                  <div className={`flex flex-col justify-center items-center space-y-2 w-full transform transition-all duration-300 ${overlay.type === 'hls' ? 'opacity-100 translate-y-0 scale-100' : overlayAnim ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'}`}>
                    {overlay.type === 'image' && (
                      // Ajuste → object-fit: 'contain' (show full image, may letterbox) or 'cover' (fill area, may crop)
                      <img src={overlay.url} alt="superposición" onClick={() => setOverlayImageModalOpen(true)} title="Haz clic para ampliar" className={`w-full h-auto rounded-xl cursor-pointer hover:scale-[1.02] transition-transform ${overlay.fit === 'cover' ? 'object-cover' : 'object-contain'}`} />
                    )}
                    {overlay.type === 'youtube' && (
                      <div className="w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
                        <iframe
                          src={youtubeEmbedUrl(overlay.url)}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                          title="Superposición de YouTube"
                        />
                      </div>
                    )}
                    {overlay.type === 'hls' && (
                      <HlsPlayer url={STREAM_HLS_URL} autoPlay muted />
                    )}
                    {overlay.type === 'text' && (
                      <div className="w-full rounded-xl px-4 py-3" style={{ backgroundColor: overlay.bgColor }}>
                        <div className="text-lg sm:text-xl font-semibold whitespace-pre-wrap break-words" style={{ color: overlay.textColor }}>{overlay.text}</div>
                      </div>
                    )}
                    
                  </div>
                </div>
              ) : (
                currentImage && (
                  <div className="flex justify-center items-center w-full">
                    <div className="flex flex-col justify-center items-center space-y-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-600">
                        {currentImage.header}
                      </span>
                      <img
                        className="z-10 h-36 rounded-xl transition-all ease-in-out md:h-48 cursor-pointer hover:scale-105"
                        src={currentImage.image}
                        alt={currentImage.name}
                        onClick={() => setImageModalOpen(true)}
                        title="Haz clic para ampliar"
                      />
                      <div className="w-8/12 text-sm text-center overflow-hidden text-gray-800 drop-shadow-md md:w-full dark:text-gray-200">
                        <marquee>
                          {currentImage.footer}
                        </marquee>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Live video (HLS) - Only show when overlay is HLS type and visible */}
              {STREAM_HLS_URL && overlay.visible && overlay.type === 'hls' && overlay.position === 'inline' ? (
                <div className="mt-2">
                  <HlsPlayer url={STREAM_HLS_URL} autoPlay muted />
                </div>
              ) : null}

              {/* Audio player */}
              <div className="flex justify-center text-sm text-grey-darker" data-aos="fade-right" data-aos-delay="900">
                <CustomPlayer
                  darkMode={darkToggle}
                  src="https://app0102.sonicpanelradio.com/8840/stream"
                />
              </div>
              
              {/* Social media links */}
              <div className="flex flex-row justify-center items-center pt-2 space-x-2 text-center" data-aos="fade-up" data-aos-delay="800">
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
              </div>
            </div>

            {/* Donation information modal */}
            <DonationInfo 
              showDonationInfo={showDonationInfo}
              toggleDonationInfo={toggleDonationInfo}
              copyToClipboard={copyToClipboard}
            />
          </div>
          
          {/* ElevenLabs Convai AI Assistant Widget - positioned at bottom */}
          {/* <div className="fixed right-4 bottom-16 z-50">
            <ConvaiAssistant />
          </div> */}
        </div>

        {/* Footer */}
      <Footer />

      {/* Bible Modal */}
      <BibleModal isOpen={showBibleCard} onClose={() => setShowBibleCard(false)} darkMode={darkToggle} />

      {/* Admin Top Utility Bar */}
      {adminOpen && (
        <div className={`fixed top-0 left-0 right-0 z-[220] transition-all duration-200 ${adminEnter ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
          <div className="mx-auto max-w-screen-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">Panel de Transmisión</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAdminMinimized(!adminMinimized)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                  aria-label={adminMinimized ? 'Expandir' : 'Minimizar'}
                  title={adminMinimized ? 'Expandir' : 'Minimizar'}
                >
                  {adminMinimized ? <i className="icon-down-open" /> : <span className="block w-4 h-1 bg-current rounded-sm" />}
                </button>
                <button
                  onClick={() => { setAdminOpen(false); setAdminAuthed(false); setAdminMinimized(false); }}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <i className="icon-cancel text-xl leading-none" />
                </button>
              </div>
            </div>
            {!adminMinimized && (
              <div className="px-3 sm:px-4 pb-3 max-h-[50vh] overflow-y-auto">
                {!adminAuthed ? (
                  <form onSubmit={adminLogin} className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Usuario administrador</label>
                      <input type="text" value={adminUserInput} onChange={(e) => setAdminUserInput(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" placeholder="Ingrese usuario" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                      <input type="password" value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" placeholder="Ingrese contraseña" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Entrar</button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {/* Control Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      {/* Tipo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 lg:mb-2">
                          <span className="inline-flex items-center">Tipo<InfoTip text={"Elige qué tipo de contenido mostrar en pantalla."} /></span>
                        </label>
                        <div className="grid grid-cols-4 gap-1.5 lg:gap-2">
                          {/* Camera Icon - First */}
                          <button
                            type="button"
                            title="Transmisión en vivo desde cámara"
                            onClick={() => setOverlay(o => ({ ...o, type: 'hls' }))}
                            className={`flex flex-col items-center justify-center p-1.5 lg:p-2 rounded-lg border-2 transition-all ${
                              overlay.type === 'hls' 
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-white'
                            }`}
                          >
                            <i className="icon-videocam text-sm lg:text-base mb-0.5 lg:mb-1"></i>
                            <span className="text-2xs lg:text-xs font-medium">Cámara</span>
                          </button>

                          {/* Image Icon - Second */}
                          <button
                            type="button"
                            title="Mostrar imagen"
                            onClick={() => setOverlay(o => ({ ...o, type: 'image' }))}
                            className={`flex flex-col items-center justify-center p-1.5 lg:p-2 rounded-lg border-2 transition-all ${
                              overlay.type === 'image' 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-white'
                            }`}
                          >
                            <i className="icon-picture text-sm lg:text-base mb-0.5 lg:mb-1"></i>
                            <span className="text-2xs lg:text-xs font-medium">Imagen</span>
                          </button>

                          {/* Text Icon - Third */}
                          <button
                            type="button"
                            title="Mostrar mensaje de texto"
                            onClick={() => setOverlay(o => ({ ...o, type: 'text' }))}
                            className={`flex flex-col items-center justify-center p-1.5 lg:p-2 rounded-lg border-2 transition-all ${
                              overlay.type === 'text' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-white'
                            }`}
                          >
                            <i className="icon-edit text-sm lg:text-base mb-0.5 lg:mb-1"></i>
                            <span className="text-2xs lg:text-xs font-medium">Texto</span>
                          </button>

                          {/* YouTube Icon - Fourth */}
                          <button
                            type="button"
                            title="Mostrar video de YouTube"
                            onClick={() => setOverlay(o => ({ ...o, type: 'youtube' }))}
                            className={`flex flex-col items-center justify-center p-1.5 lg:p-2 rounded-lg border-2 transition-all ${
                              overlay.type === 'youtube' 
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-white'
                            }`}
                          >
                            <i className="icon-video text-sm lg:text-base mb-0.5 lg:mb-1"></i>
                            <span className="text-2xs lg:text-xs font-medium">YouTube</span>
                          </button>
                        </div>
                      </div>

                      {/* Presentación & Ajuste Combined */}
                      <div className="grid grid-cols-2 gap-2 lg:space-y-4 lg:grid-cols-1 lg:gap-0">
                        {/* Presentación */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 lg:mb-2">
                            <span className="inline-flex items-center">Presentación<InfoTip text={"Cómo se muestra: Integrado dentro de la tarjeta o en Pantalla completa."} /></span>
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              title="Integrado - Muestra dentro de la tarjeta principal"
                              onClick={() => setOverlay(o => ({ ...o, position: 'inline' }))}
                              className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                                overlay.position === 'inline'
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-white'
                              }`}
                            >
                              <i className="icon-th-large text-xs mb-1"></i>
                              <span className="text-2xs font-medium">Integrado</span>
                            </button>
                            <button
                              type="button"
                              title="Pantalla completa - Ocupa toda la pantalla"
                              onClick={() => setOverlay(o => ({ ...o, position: 'fullscreen' }))}
                              className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                                overlay.position === 'fullscreen'
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-white'
                              }`}
                            >
                              <i className="icon-window-maximize text-xs mb-1"></i>
                              <span className="text-2xs font-medium">Completa</span>
                            </button>
                          </div>
                        </div>

                        {/* Ajuste */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 lg:mb-2">
                            <span className="inline-flex items-center">Ajuste<InfoTip text={"Controla el encuadre de imágenes: Contener muestra todo, Cubrir llena el área."} /></span>
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              title="Contener - Muestra la imagen completa con posibles barras negras"
                              onClick={() => setOverlay(o => ({ ...o, fit: 'contain' }))}
                              disabled={overlay.type !== 'image'}
                              className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                                overlay.fit === 'contain'
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : overlay.type !== 'image'
                                  ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-white'
                              }`}
                            >
                              <i className="icon-resize-small text-xs mb-1"></i>
                              <span className="text-2xs font-medium">Contener</span>
                            </button>
                            <button
                              type="button"
                              title="Cubrir - Llena toda el área, puede recortar la imagen"
                              onClick={() => setOverlay(o => ({ ...o, fit: 'cover' }))}
                              disabled={overlay.type !== 'image'}
                              className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                                overlay.fit === 'cover'
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : overlay.type !== 'image'
                                  ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-white'
                              }`}
                            >
                              <i className="icon-resize-full text-xs mb-1"></i>
                              <span className="text-2xs font-medium">Cubrir</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Text or URL */}
                    <div className="flex flex-col space-y-1">
                      {overlay.type === 'text' ? (
                        <>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span className="inline-flex items-center">Texto<InfoTip text={"Mensaje que se mostrará como sobreimpresión en vivo."} /></span>
                          </label>
                          <textarea
                            value={overlay.text}
                            onChange={(e) => setOverlay(o => ({ ...o, text: e.target.value }))}
                            className="w-full min-h-[80px] px-3 py-2.5 rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 backdrop-blur-sm shadow-sm"
                            placeholder="Escribe el anuncio..."
                          />
                          <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 inline-flex items-center">
                                Fondo<InfoTip text={"Color de fondo del texto."} />
                              </label>
                              <input
                                type="color"
                                value={overlay.bgColor || '#2563eb'}
                                onChange={(e) => setOverlay(o => ({ ...o, bgColor: e.target.value }))}
                                className="h-8 w-10 p-1 rounded border border-gray-300 dark:border-gray-600 bg-transparent cursor-pointer"
                                aria-label="Color de fondo"
                              />
                              <input
                                type="text"
                                value={overlay.bgColor || ''}
                                onChange={(e) => setOverlay(o => ({ ...o, bgColor: e.target.value }))}
                                placeholder="#2563eb"
                                className="w-24 px-2 py-1 text-xs rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                aria-label="HEX color"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 inline-flex items-center">
                                Texto<InfoTip text={"Color del texto."} />
                              </label>
                              <input
                                type="color"
                                value={overlay.textColor || '#ffffff'}
                                onChange={(e) => setOverlay(o => ({ ...o, textColor: e.target.value }))}
                                className="h-8 w-10 p-1 rounded border border-gray-300 dark:border-gray-600 bg-transparent cursor-pointer"
                                aria-label="Color del texto"
                              />
                              <input
                                type="text"
                                value={overlay.textColor || ''}
                                onChange={(e) => setOverlay(o => ({ ...o, textColor: e.target.value }))}
                                placeholder="#ffffff"
                                className="w-24 px-2 py-1 text-xs rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                aria-label="HEX color"
                              />
                            </div>
                          </div>
                        </>
                      ) : overlay.type === 'hls' ? (
                        <>
                          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-medium">Cámara lista</span>
                            </div>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              Configurada para recibir transmisión desde OBS en vivo.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span className="inline-flex items-center">
                              URL ({overlay.type === 'image' ? 'imagen' : 'YouTube'})
                              <InfoTip text={
                                overlay.type === 'image' ? "Pega un enlace directo a una imagen (JPG, PNG, GIF, etc.)" :
                                "Pega un enlace de YouTube (https://youtu.be/... o https://www.youtube.com/watch?v=...)"
                              } />
                            </span>
                          </label>
                          <input
                            type="text"
                            value={overlay.url}
                            onChange={(e) => setOverlay(o => ({ ...o, url: e.target.value }))}
                            placeholder={
                              overlay.type === 'image' ? "https://ejemplo.com/imagen.jpg" :
                              "https://youtu.be/..."
                            }
                            className="w-full px-3 py-2.5 rounded-md border bg-white/60 dark:bg-gray-900/60 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 backdrop-blur-sm shadow-sm"
                          />
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          <span className="inline-flex items-center">Visible<InfoTip text={"Mostrar u ocultar la superposición en vivo."} /></span>
                        </label>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!!overlay.visible}
                          onClick={() => setOverlay(o => ({ ...o, visible: !o.visible }))}
                          className={`inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${overlay.visible ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${overlay.visible ? 'translate-x-5' : 'translate-x-1'}`} />
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
                          className="inline-flex items-center justify-center p-2.5 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:focus:ring-red-400"
                          title="Limpiar y restablecer"
                        >
                          <i className="icon-trash-1"></i>
                        </button>
                        <button 
                          onClick={() => saveOverlay(overlay)} 
                          className="inline-flex items-center justify-center px-4 py-2.5 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:focus:ring-green-400"
                        >
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
        overlay?.type === 'text' ? !!overlay?.text : 
        overlay?.type === 'hls' ? true :
        !!overlay?.url
      ) && (
        <div
          className={`fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-6 transition-opacity duration-200 ${overlay.type === 'hls' ? 'bg-black/70 opacity-100' : overlayAnim ? 'bg-black/70 opacity-100' : 'bg-black/0 opacity-0'}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeOverlayContent(); }}
        >
          <div
            className={`relative w-full h-full max-w-screen max-h-screen rounded-lg overflow-hidden bg-black transform transition-all duration-200 ${overlay.type === 'hls' ? 'opacity-100 scale-100' : overlayAnim ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button for fullscreen content */}
            <button
              onClick={closeOverlayContent}
              className="absolute top-4 right-4 z-[160] w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <i className="icon-cancel text-2xl" />
            </button>
            {overlay.type === 'image' && (
              <img src={overlay.url} alt="superposición" onClick={() => setOverlayImageModalOpen(true)} title="Haz clic para ampliar" className={`w-full h-full cursor-zoom-in ${overlay.fit === 'cover' ? 'object-cover' : 'object-contain'}`} />
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
            {overlay.type === 'hls' && (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <HlsPlayer 
                  url={STREAM_HLS_URL} 
                  autoPlay 
                  muted 
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
            )}
            {overlay.type === 'text' && (
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="max-w-4xl text-center text-white">
                  <div className="inline-block rounded-xl px-6 py-4 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]" style={{ backgroundColor: overlay.bgColor }}>
                    <div className="text-2xl sm:text-4xl lg:text-6xl font-bold whitespace-pre-wrap" style={{ color: overlay.textColor }}>{overlay.text}</div>
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
    </div>
    </div>
  );
}

export default App;
