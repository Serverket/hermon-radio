/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import pkg from '../package.json';
import { subscribeOverlay, putOverlay, authCheck } from './overlayClient';
import CustomPlayer from './CustomPlayer';
import DonationInfo from './DonationInfo';
import ImageModal from './components/ImageModal';
import BibleModal from './components/BibleModal';
import ScheduleModal from './components/ScheduleModal';
import Slideshow from './components/Slideshow';
import AnimatedBackground from './components/AnimatedBackground';
import InstallBanner from './components/InstallBanner';
import UpdateBanner from './components/UpdateBanner';
import AdminBroadcastDock from './components/AdminBroadcastDock';
import ProgramAdsPanel from './components/ProgramAdsPanel';
import { DEFAULT_OVERLAY } from './utils/overlayDefaults';
import { DEFAULT_POSTER_THEME, extractPosterTheme, applyPosterTheme } from './utils/posterTheme';
import { getDailyVerse } from './utils/dailyVerse';
import { copyTextSafe } from './utils/clipboard';
import { normalizeProgramAds } from './utils/programAds';
import {
  ShareIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
  BookIcon,
  CalendarIcon,
  LockIcon,
  CloseIcon,
  ZoomIcon,
  FacebookIcon,
  InstagramIcon,
  CheckIcon,
} from './components/Icons';
import './styles/tailwind.css';
import Footer from './Footer';
import moment from 'moment';
import 'aos/dist/aos.css';
import AOS from 'aos';

const InfoTip = ({ text }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const anchorRef = useRef(null);

  const show = () => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const vw = window.innerWidth || 400;
    const edgePad = Math.min(142, vw / 2);
    const safeLeft = Math.max(edgePad, Math.min(vw - edgePad, r.left + r.width / 2));
    setPos({ top: r.bottom + 8, left: safeLeft });
    setOpen(true);
  };
  const hide = () => setOpen(false);

  useEffect(() => {
    const onScrollOrResize = () => {
      if (open) hide();
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize, true);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize, true);
    };
  }, [open]);

  return (
    <>
      <span
        ref={anchorRef}
        className="inline-block relative ml-1.5 align-middle cursor-help"
        aria-label={text}
        tabIndex={0}
        onMouseEnter={show}
        onFocus={show}
        onMouseLeave={hide}
        onBlur={hide}
      >
        <span className="h-4 w-4 flex items-center justify-center rounded-full pill-gold-soft text-[10px] font-extrabold leading-none select-none focus:outline-none">
          ?
        </span>
      </span>
      {open &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[9999] max-w-[min(260px,calc(100vw-24px))] whitespace-normal text-center rounded-xl bg-slate-900/95 text-white text-xs px-3 py-1.5 shadow-xl pointer-events-none border border-white/15 backdrop-blur-md"
            style={{ top: `${pos.top}px`, left: `${pos.left}px`, transform: 'translateX(-50%)' }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

const formatSlotRange = (time, duration) => {
  if (!time || !duration) return null;
  const start = moment(time, 'HH:mm');
  const end = start.clone().add(duration, 'minutes');
  return `${start.format('h:mm A')} – ${end.format('h:mm A')}`;
};

/**
 * Schedule configuration for program images, advertisements, and static side-panel banners.
 * Any entry may declare `ads: [{ type: 'image' | 'video', src, poster, title, subtitle, badge, url, linkLabel }]`
 * (videos always start muted by default so they never collide with the live audio stream).
 */
const imageSchedule = [
  // Monday
  { day: 1, time: '06:00', duration: 60, image: '/programs/regular/DesayunoEspiritual.webp', name: 'Desayuno Espiritual', header: 'Estás en sintonía de', footer: 'Vivencias, reflexiones y meditaciones a través de la palabra de Dios' },
  { day: 1, time: '09:00', duration: 120, image: '/programs/regular/LasSagradasEscrituras.webp', name: 'Escudriñando Las Sagradas Escrituras', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 1, time: '13:00', duration: 180, image: '/programs/regular/Diosysusmaravillas.webp', name: 'Dios y sus maravillas', header: 'Estás en sintonía de', footer: 'Charlas | Música en vivo | Consejos | Reflexión' },
  { day: 1, time: '15:00', duration: 60, image: '/programs/regular/ElClamordeMiPueblo.webp', name: 'El Clamor de Mi Pueblo', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },

  // Tuesday
  { day: 2, time: '06:00', duration: 60, image: '/programs/regular/DesayunoEspiritual.webp', name: 'Desayuno Espiritual', header: 'Estás en sintonía de', footer: 'Vivencias, reflexiones y meditaciones a través de la palabra de Dios' },
  { day: 2, time: '09:00', duration: 120, image: '/programs/regular/LasSagradasEscrituras.webp', name: 'Escudriñando Las Sagradas Escrituras', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 2, time: '12:00', duration: 120, image: '/programs/regular/LaVozDeLaFederacion.webp', name: 'La Voz de la Federación de Iglesias "Hermón" de Venezuela', header: 'Estás en sintonía de', footer: 'Espacio informativo de opinión, entrevistas, música y el mensaje de la Palabra de Dios | Moderadores: Evang. Rafael Fleitas y Pastor José Miguel Sierra | Contacto: +58 424-329-3508' },
  { day: 2, time: '15:00', duration: 60, image: '/programs/regular/ElClamordeMiPueblo.webp', name: 'El Clamor de Mi Pueblo', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 2, time: '16:00', duration: 120, image: '/programs/regular/LaFevieneporeloír.webp', name: 'La Fe viene por el oír', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },

  // Wednesday
  { day: 3, time: '06:00', duration: 60, image: '/programs/regular/DesayunoEspiritual.webp', name: 'Desayuno Espiritual', header: 'Estás en sintonía de', footer: 'Vivencias, reflexiones y meditaciones a través de la palabra de Dios' },
  { day: 3, time: '09:00', duration: 120, image: '/programs/regular/LasSagradasEscrituras.webp', name: 'Escudriñando Las Sagradas Escrituras', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 3, time: '11:00', duration: 60, image: '/programs/regular/Sumergidosensupresencia.webp', name: 'Sumergidos en Su Presencia', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 3, time: '13:00', duration: 120, image: '/programs/regular/PalabraSaludyVida.webp', name: 'Palabra, Salud y Vida', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 3, time: '15:00', duration: 60, image: '/programs/regular/ElClamordeMiPueblo.webp', name: 'El Clamor de Mi Pueblo', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 3, time: '16:00', duration: 120, image: '/programs/regular/Momentoscristianos.webp', name: 'Momentos Cristianos', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },

  // Thursday
  { day: 4, time: '06:00', duration: 60, image: '/programs/regular/DesayunoEspiritual.webp', name: 'Desayuno Espiritual', header: 'Estás en sintonía de', footer: 'Vivencias, reflexiones y meditaciones a través de la palabra de Dios' },
  { day: 4, time: '09:00', duration: 120, image: '/programs/regular/LasSagradasEscrituras.webp', name: 'Escudriñando Las Sagradas Escrituras', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 4, time: '11:00', duration: 120, image: '/programs/regular/BuenConsejoBiblico.webp', name: 'Un Buen Consejo Bíblico', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 4, time: '13:00', duration: 120, image: '/programs/regular/Mujeresdevaloryfe.webp', name: 'Mujeres de Valor y Fe', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 4, time: '15:00', duration: 60, image: '/programs/regular/ElClamordeMiPueblo.webp', name: 'El Clamor de Mi Pueblo', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 4, time: '20:00', duration: 60, image: '/programs/regular/Horadeldiscipulado.webp', name: 'Hora del Discipulado', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },

  // Friday
  { day: 5, time: '06:00', duration: 60, image: '/programs/regular/DesayunoEspiritual.webp', name: 'Desayuno Espiritual', header: 'Estás en sintonía de', footer: 'Vivencias, reflexiones y meditaciones a través de la palabra de Dios' },
  { day: 5, time: '09:00', duration: 120, image: '/programs/regular/LasSagradasEscrituras.webp', name: 'Escudriñando Las Sagradas Escrituras', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 5, time: '11:00', duration: 60, image: '/programs/regular/Sumergidosensupresencia.webp', name: 'Sumergidos en Su Presencia', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 5, time: '15:00', duration: 60, image: '/programs/regular/ElClamordeMiPueblo.webp', name: 'El Clamor de Mi Pueblo', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 5, time: '16:00', duration: 120, image: '/programs/regular/EncuentroconJesucristo.webp', name: 'Encuentro con Jesucristo', header: 'Estás en sintonía de', footer: 'Una producción del Departamento de Evangelismo con su moderadora Neller de Piñuela' },
  {
    day: 5,
    time: '18:00',
    duration: 60,
    image: '/programs/regular/AlfayOmega.webp',
    name: 'Alfa y Omega',
    header: 'Estás en sintonía de',
    footer: 'Patrocinadores: Panadería La Nonna | Academia Twin Tonges | @longyu.shop',
    ads: [
      {
        id: 'ace-cambio',
        type: 'video',
        src: '/programs/ads/ACE_Cambio_30s.webm',
        alt: 'Publicidad ACE - Monitor Cambiario Gratis',
        title: 'ACE - Monitor Cambiario Gratis',
        url: 'https://acecambio.pro',
        linkLabel: 'acecambio.pro ↗',
        hasAudio: false,
      },
    ],
  },
  { day: 5, time: '19:00', duration: 120, image: '/programs/regular/Tiempoderefrigerio.webp', name: 'Tiempo de Refrigerio', header: 'Estás en sintonía de', footer: 'Patrocinadores: Pincho Pocholin | Kiosco La Bendición | Iglesia Tiempo de Refrigerio | Escríbenos al +58 424-315-7126' },

  // Saturday
  { day: 6, time: '05:00', duration: 120, image: '/programs/regular/AmanecerConCristo.webp', name: 'Amanecer con Cristo', header: 'Estás en sintonía de', footer: 'Patrocinadores: Inversiones y Variedad Yalex A&B | Inversiones Karvican | Cerrajería El Cóndor' },
  { day: 6, time: '16:00', duration: 120, image: '/programs/regular/EnOndaConCristo.webp', name: 'En Onda Con Cristo', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 6, time: '21:00', duration: 60, image: '/programs/regular/VivenciasenCristo.webp', name: 'Vivencias en Cristo', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },

  // Sunday
  { day: 0, time: '07:00', duration: 120, image: '/programs/regular/Micasayyo.webp', name: 'Mi Casa y Yo', header: 'Estás en sintonía de', footer: '¡Comunícate con nosotros para patrocinarnos!' },
  { day: 0, time: '16:00', duration: 120, images: ['/programs/regular/seguidoresdecristo1.webp', '/programs/regular/seguidoresdecristo2.webp', '/programs/regular/seguidoresdecristo4.webp'], name: 'Seguidores de Cristo', header: 'Estás en sintonía de', footer: '¿Con qué limpiará el joven su camino? Con guardar tu palabra. - Salmos 119:9' },
];

const adSchedule = [
  { day: 1, time: '12:00', duration: 45 },
  { day: 3, time: '12:00', duration: 45 },
  { day: 4, time: '17:00', duration: 45 },
  { day: 5, time: '13:00', duration: 45 },
];

const randomAds = [
  { image: '/programs/regular/LasSagradasEscrituras.webp', name: 'Escudriñando Las Sagradas Escrituras', header: 'No te pierdas el programa', footer: '¡Comunícate con nosotros para patrocinarnos!' },
];

const OVERLAY_BASE_URL = import.meta.env.VITE_OVERLAY_BASE_URL;

function App() {
  const [currentImage, setCurrentImage] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(() => getDailyVerse());
  const [activeSlideImage, setActiveSlideImage] = useState(null);
  const [darkToggle, setDarkToggle] = useState(localStorage.getItem('darkMode') === 'true');
  const [showDonationInfo, setShowDonationInfo] = useState(false);
  const [showBibleCard, setShowBibleCard] = useState(false);
  const [bibleInitialSelection, setBibleInitialSelection] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [inspectedAd, setInspectedAd] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const loadOverlayFromStorage = () => {
    try {
      const saved = localStorage.getItem('hermon-radio-overlay');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_OVERLAY,
          type: parsed.type || DEFAULT_OVERLAY.type,
          url: parsed.url || DEFAULT_OVERLAY.url,
          text: parsed.text || DEFAULT_OVERLAY.text,
          bgColor: parsed.bgColor || DEFAULT_OVERLAY.bgColor,
          textColor: parsed.textColor || DEFAULT_OVERLAY.textColor,
          position: parsed.position || DEFAULT_OVERLAY.position,
          fit: parsed.fit || DEFAULT_OVERLAY.fit,
        };
      }
    } catch (error) {
      console.warn('Error loading overlay from localStorage:', error);
    }
    return { ...DEFAULT_OVERLAY };
  };

  const [overlay, setOverlay] = useState(loadOverlayFromStorage);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminUserInput, setAdminUserInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminCreds, setAdminCreds] = useState({ user: '', pass: '' });
  const [adminEnter, setAdminEnter] = useState(false);
  const [adminMinimized, setAdminMinimized] = useState(false);
  const [overlayAnim, setOverlayAnim] = useState(false);
  const [overlayImageModalOpen, setOverlayImageModalOpen] = useState(false);
  const cameraWindow = useRef(null);
  const [customVdoLink, setCustomVdoLink] = useState('');
  const cameraInterval = useRef(null);
  const [cameraTabOpen, setCameraTabOpen] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [externalMode, setExternalMode] = useState(false);
  const [controlsMinimized, setControlsMinimized] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 2400);
  };

  useEffect(() => {
    const currentCamInterval = cameraInterval.current;
    const currentCamWindow = cameraWindow.current;
    return () => {
      if (currentCamInterval) clearInterval(currentCamInterval);
      if (currentCamWindow) currentCamWindow.close();
    };
  }, []);

  useEffect(() => {
    const getCurrentImage = () => {
      const now = moment();
      const currentDay = now.day();
      const currentTime = now.format('HH:mm');

      const dateRangeImage = imageSchedule.find(
        (schedule) =>
          schedule.startDate &&
          schedule.endDate &&
          now.isBetween(moment(schedule.startDate), moment(schedule.endDate).endOf('day'), null, '[]')
      );

      if (dateRangeImage) return dateRangeImage;

      const scheduledAdTime = adSchedule.find((schedule) => {
        const nowTime = moment(currentTime, 'HH:mm');
        const scheduleTime = moment(schedule.time, 'HH:mm');
        const scheduleEndTime = moment(schedule.time, 'HH:mm').add(schedule.duration, 'minutes');
        return schedule.day === currentDay && nowTime.isSameOrAfter(scheduleTime) && nowTime.isBefore(scheduleEndTime);
      });

      if (scheduledAdTime) return randomAds[Math.floor(Math.random() * randomAds.length)];

      const scheduledImage = imageSchedule.find((schedule) => {
        const nowTime = moment(currentTime, 'HH:mm');
        const scheduleTime = moment(schedule.time, 'HH:mm');
        const scheduleEndTime = moment(schedule.time, 'HH:mm').add(schedule.duration, 'minutes');
        return schedule.day === currentDay && nowTime.isSameOrAfter(scheduleTime) && nowTime.isBefore(scheduleEndTime);
      });

      return scheduledImage || null;
    };

    const updateImage = () => {
      setCurrentImage(getCurrentImage());
      setDailyVerse((prev) => {
        const next = getDailyVerse();
        return prev.ref === next.ref ? prev : next;
      });
    };
    updateImage();
    const interval = setInterval(updateImage, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AOS.init({
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkToggle;
    setDarkToggle(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const adminAuthedRef = useRef(adminAuthed);
  useEffect(() => {
    adminAuthedRef.current = adminAuthed;
  }, [adminAuthed]);

  useEffect(() => {
    if (!OVERLAY_BASE_URL) return undefined;
    const stop = subscribeOverlay(OVERLAY_BASE_URL, (data) => {
      if (adminAuthedRef.current) return;

      const cleanData = { ...data };
      if (cleanData.url) {
        if (cleanData.url.includes('vdo.ninja') || cleanData.url.includes('obs.ninja')) {
          cleanData.type = 'vdoninja';
        } else if (cleanData.url.includes('youtube.com') || cleanData.url.includes('youtu.be')) {
          cleanData.type = 'youtube';
        }
      }

      setOverlay((prev) => ({ ...prev, ...cleanData }));
    });
    return stop;
  }, []);

  useEffect(() => {
    if (adminOpen) {
      setAdminEnter(false);
      const id = requestAnimationFrame(() => setAdminEnter(true));
      return () => cancelAnimationFrame(id);
    }
    setAdminEnter(false);
    return undefined;
  }, [adminOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'hermon-radio-overlay',
        JSON.stringify({
          type: overlay.type,
          url: overlay.url,
          text: overlay.text,
          bgColor: overlay.bgColor,
          textColor: overlay.textColor,
          position: overlay.position,
          fit: overlay.fit,
        })
      );
    } catch (error) {
      console.warn('Error saving overlay to localStorage:', error);
    }
  }, [overlay.type, overlay.url, overlay.text, overlay.bgColor, overlay.textColor, overlay.position, overlay.fit]);

  useEffect(() => {
    setOverlayAnim(false);
    const id = requestAnimationFrame(() => setOverlayAnim(true));
    return () => cancelAnimationFrame(id);
  }, [overlay.visible, overlay.url, overlay.type, overlay.position, overlay.fit, overlay.text]);

  const adminLogin = async (e, trapValue = '') => {
    e?.preventDefault?.();
    const domTrap =
      typeof e?.currentTarget?.elements?.namedItem === 'function'
        ? e.currentTarget.elements.namedItem('hp_website')?.value || ''
        : '';
    if (String(trapValue || domTrap).trim() !== '') {
      setAdminAuthed(false);
      showToast('Credenciales inválidas');
      return;
    }
    if (!adminUserInput || !adminPassInput) {
      showToast('Ingrese usuario y contraseña');
      return;
    }
    if (!OVERLAY_BASE_URL) {
      showToast('Configure VITE_OVERLAY_BASE_URL');
      return;
    }
    const creds = { user: adminUserInput.trim(), pass: adminPassInput };
    try {
      await authCheck(OVERLAY_BASE_URL, creds);
      setAdminCreds(creds);
      setAdminAuthed(true);
    } catch {
      setAdminAuthed(false);
      showToast('Credenciales inválidas');
    }
  };

  const saveOverlay = async (payload) => {
    if (!OVERLAY_BASE_URL) {
      showToast('Configure VITE_OVERLAY_BASE_URL');
      return;
    }

    const cleanPayload = { ...payload };
    if (cleanPayload.url) {
      if (cleanPayload.url.includes('vdo.ninja') || cleanPayload.url.includes('obs.ninja')) {
        cleanPayload.type = 'vdoninja';
      } else if (cleanPayload.url.includes('youtube.com') || cleanPayload.url.includes('youtu.be')) {
        cleanPayload.type = 'youtube';
      }
    }

    try {
      await putOverlay(OVERLAY_BASE_URL, { user: adminCreds.user, pass: adminCreds.pass }, cleanPayload);
      showToast('Transmisión actualizada');
    } catch {
      showToast('Error al actualizar la transmisión');
    }
  };

  const closeOverlayContent = async () => {
    setOverlay((o) => ({ ...o, visible: false }));
    if (!adminAuthed || !OVERLAY_BASE_URL) return;
    try {
      await saveOverlay({ ...overlay, visible: false });
    } catch {
      // Ignored cleanly; overlay already hidden locally
    }
  };

  const youtubeEmbedUrl = (url) => {
    if (!url) return '';
    const val = url.trim();
    try {
      const u = new URL(val);
      if (u.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1&mute=0&controls=1&showinfo=1&rel=0`;
      }
      if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}?autoplay=1&mute=0&controls=1&showinfo=1&rel=0`;
      }
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

    if (val.startsWith('<iframe') && val.includes('src="')) {
      const srcMatch = val.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        val = srcMatch[1];
      }
    }

    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      val = `https://${val}`;
    }

    try {
      const u = new URL(val);
      if (u.hostname.includes('vdo.ninja') || u.hostname.includes('obs.ninja')) {
        if (!u.searchParams.has('autoplay')) u.searchParams.set('autoplay', '1');
        return u.toString();
      }
      return val;
    } catch {
      return val;
    }
  };

  const shareApp = () => {
    const urlToShare = 'https://www.radiohermonfm.com';
    const message = encodeURIComponent('Escucha Radio Hermón - Un rocío que desciende de lo alto');
    window.open(`https://api.whatsapp.com/send?text=${message}%0A${urlToShare}`, '_blank');
    window.open(`https://t.me/share/url?url=${urlToShare}&text=${message}`, '_blank');
  };

  const toggleDonationInfo = () => setShowDonationInfo((prev) => !prev);
  const toggleBibleCard = () => {
    setBibleInitialSelection(null);
    setShowBibleCard((prev) => !prev);
  };
  const openDailyVerseInBible = () => {
    setBibleInitialSelection(
      dailyVerse?.book
        ? { book: dailyVerse.book, chapter: dailyVerse.chapter, verse: dailyVerse.verse }
        : null
    );
    setShowBibleCard(true);
  };

  const copyToClipboard = async (text) => {
    const label = text.includes('\n') || text.length > 48 ? 'Datos copiados al portapapeles' : `Copiado: ${text}`;
    const ok = await copyTextSafe(text);
    showToast(ok ? label : 'No se pudo copiar automáticamente');
  };

  const hasInlineOverlay =
    overlay?.visible &&
    overlay?.position === 'inline' &&
    ((overlay?.type === 'text' && !!overlay?.text) ||
      (overlay?.type === 'image' && !!overlay?.url) ||
      (overlay?.type === 'youtube' && !!overlay?.url) ||
      (overlay?.type === 'vdoninja' && !!overlay?.url));

  const activePosterSrc =
    hasInlineOverlay && overlay.type === 'image' && overlay.url
      ? overlay.url
      : currentImage?.images?.length
        ? activeSlideImage && currentImage.images.includes(activeSlideImage)
          ? activeSlideImage
          : currentImage.images[0]
        : currentImage?.image || null;

  useEffect(() => {
    let cancelled = false;
    if (!activePosterSrc) {
      applyPosterTheme(DEFAULT_POSTER_THEME);
      return undefined;
    }
    extractPosterTheme(activePosterSrc).then((theme) => {
      if (!cancelled) {
        applyPosterTheme(theme);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activePosterSrc]);

  const currentSlotText = currentImage ? formatSlotRange(currentImage.time, currentImage.duration) : null;
  const isFullscreenOverlay = overlay?.visible && overlay?.position === 'fullscreen';
  const activeProgramAds = isFullscreenOverlay ? [] : normalizeProgramAds(currentImage);
  const hasSideAds = activeProgramAds.length > 0;
  const programCoverHeightClass = hasSideAds ? 'h-56 sm:h-64' : 'h-44 sm:h-48';

  useEffect(() => {
    setInspectedAd(null);
  }, [currentImage]);

  return (
    <div className={darkToggle ? 'dark' : ''}>
      <InstallBanner />

      <div
        className="min-h-screen w-full flex flex-col justify-center items-center px-3 sm:px-4 pt-14 sm:pt-5 pb-20 relative overflow-hidden"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)',
        }}
      >
        {/* Golden Silk Moving Texture Backdrop */}
        <AnimatedBackground darkMode={darkToggle} />

        {/* PWA Version Update Banner (Service Worker prompt cycle) */}
        <UpdateBanner />

        {/* Non-blocking Toast Feedback Pill */}
        {toastMsg && (
          <div
            className="fixed left-1/2 -translate-x-1/2 z-[1100] glass-shell px-4 py-2 rounded-full flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-white shadow-xl"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
          >
            <span className="text-emerald-600 dark:text-emerald-400">
              <CheckIcon />
            </span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Main Stack Container (expands cleanly on desktop when program ads are active) */}
        <main
          className={`relative z-10 w-full mx-auto transition-all duration-300 ${
            hasSideAds
              ? 'max-w-[440px] lg:max-w-[830px] flex flex-col lg:flex-row lg:items-start lg:justify-center gap-4 lg:gap-5'
              : 'max-w-[440px]'
          }`}
        >
          <div className="w-full max-w-[440px] mx-auto lg:mx-0 flex-shrink-0">
          {/* Uniform 4-Button Header Bar */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-2.5">
            <button
              type="button"
              onClick={shareApp}
              title="Compartir"
              data-aos="fade-down"
              data-aos-duration="500"
              data-aos-once="true"
              className="glass-pill py-2.5 px-1 sm:px-2 rounded-2xl flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-100 hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <span className="accent-icon flex-shrink-0">
                <ShareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span>Compartir</span>
            </button>

            <button
              type="button"
              onClick={toggleDonationInfo}
              title="Donar"
              data-aos="fade-down"
              data-aos-duration="650"
              data-aos-once="true"
              className="glass-pill py-2.5 px-1 sm:px-2 rounded-2xl flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-100 hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <span className="accent-icon flex-shrink-0">
                <HeartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span>Donar</span>
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              title={darkToggle ? 'Modo claro' : 'Modo oscuro'}
              data-aos="fade-down"
              data-aos-duration="800"
              data-aos-once="true"
              className="glass-pill py-2.5 px-1 sm:px-2 rounded-2xl flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-100 hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <span className="accent-icon flex-shrink-0">
                {darkToggle ? (
                  <SunIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <MoonIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </span>
              <span>{darkToggle ? 'Claro' : 'Oscuro'}</span>
            </button>

            <button
              type="button"
              onClick={toggleBibleCard}
              title="Biblia"
              data-aos="fade-down"
              data-aos-duration="950"
              data-aos-once="true"
              className={`glass-pill py-2.5 px-1 sm:px-2 rounded-2xl flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-100 hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                showBibleCard ? 'accent-ring' : ''
              }`}
            >
              <span className="accent-icon flex-shrink-0">
                <BookIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span>Biblia</span>
            </button>
          </div>

          {/* Primary Opal Neo-Glass Card */}
          <div
            className="glass-shell rounded-[28px] p-4 sm:p-5 space-y-4 text-slate-800 dark:text-slate-100"
            {...(overlay.type !== 'hls' && { 'data-aos': 'zoom-in', 'data-aos-delay': '150' })}
          >
            {/* Brand Header with Circular 95.3 FM Logo */}
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-200/70 dark:border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/android-chrome-512x512.png"
                  alt="Logo Radio Hermón 95.3 FM"
                  className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white dark:border-amber-400/40 flex-shrink-0"
                />
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-[17px] sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
                      Radio Hermón
                    </h1>
                    <span className="pill-gold-soft text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      95.3 FM
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    Un rocío que desciende de lo alto
                  </p>
                </div>
              </div>

              <div className="badge-emerald-live px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                EN VIVO
              </div>
            </div>

            {/* Center Dynamic Display: Inline Overlay -> Current Program -> Default Cover */}
            {hasInlineOverlay ? (
              <div className="glass-inner rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="pill-gold-soft text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Transmisión Especial
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {overlay.type === 'vdoninja'
                      ? 'Video directo'
                      : overlay.type === 'youtube'
                      ? 'Video'
                      : overlay.type === 'image'
                      ? 'Imagen'
                      : 'Comunicado'}
                  </span>
                </div>

                <div
                  className={`transition-all duration-300 ${
                    overlayAnim ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
                  }`}
                >
                  {overlay.type === 'image' && (
                    <div className="relative w-full rounded-xl overflow-hidden">
                      <img
                        key={overlay.url}
                        src={overlay.url}
                        alt=""
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        onClick={() => setOverlayImageModalOpen(true)}
                        title="Haz clic para ampliar"
                        className={`w-full max-h-64 rounded-xl cursor-pointer hover:scale-[1.01] transition-transform ${
                          overlay.fit === 'cover' ? 'object-cover' : 'object-contain'
                        }`}
                      />
                      {overlay.text && (
                        <div className="flex absolute inset-0 justify-center items-center p-4 pointer-events-none">
                          <div
                            className="inline-block rounded-xl px-4 py-2.5 shadow-lg pointer-events-auto max-w-full text-center"
                            style={{ backgroundColor: overlay.bgColor }}
                          >
                            <div
                              className="text-base sm:text-lg font-bold whitespace-pre-wrap break-words"
                              style={{ color: overlay.textColor }}
                            >
                              {overlay.text}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {overlay.type === 'youtube' && (
                    <div className="overflow-hidden w-full bg-black rounded-xl shadow-md aspect-video">
                      <iframe
                        key={overlay.url}
                        src={youtubeEmbedUrl(overlay.url)}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-none"
                        title="Superposición de YouTube"
                      />
                    </div>
                  )}

                  {overlay.type === 'vdoninja' && (
                    <div className="overflow-hidden w-full bg-black rounded-xl shadow-md aspect-video">
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

                  {overlay.type === 'text' && (
                    <div
                      className="px-4 py-4 w-full rounded-xl text-center shadow-sm"
                      style={{ backgroundColor: overlay.bgColor }}
                    >
                      <div
                        className="text-base sm:text-lg font-bold whitespace-pre-wrap break-words"
                        style={{ color: overlay.textColor }}
                      >
                        {overlay.text}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : currentImage ? (
              <div className="glass-inner rounded-2xl p-4 space-y-3 text-center">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {currentImage.header}
                  </span>
                  {currentSlotText && (
                    <span className="pill-gold-soft text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {currentSlotText}
                    </span>
                  )}
                </div>

                {currentImage.images ? (
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(true)}
                    title="Haz clic para ampliar"
                    className="relative mx-auto block w-fit max-w-full rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-white/15 bg-white/50 dark:bg-slate-900/50 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <Slideshow
                      images={currentImage.images}
                      interval={4000}
                      imgClassName={`${programCoverHeightClass} w-auto max-w-full object-contain`}
                      title="Haz clic para ampliar"
                      onSlideChange={setActiveSlideImage}
                    />
                    <span className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/25 group-hover:scale-110 transition-transform">
                      <ZoomIcon />
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(true)}
                    title="Haz clic para ampliar"
                    className="relative mx-auto block w-fit max-w-full rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-white/15 bg-white/50 dark:bg-slate-900/50 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <img
                      src={currentImage.image}
                      alt={currentImage.name}
                      className={`${programCoverHeightClass} w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]`}
                    />
                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/25">
                      <ZoomIcon />
                    </span>
                  </button>
                )}

                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white leading-snug">
                    {currentImage.name}
                  </h2>
                  {!hasSideAds && currentImage.footer && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed px-1">
                      {currentImage.footer}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-inner rounded-2xl px-4 py-5 sm:px-6 sm:py-6 space-y-4 text-center">
                <div className="flex items-center justify-between gap-2">
                  <span className="badge-emerald-live px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Espacio disponible
                  </span>
                  <span className="pill-gold-soft text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Versículo del día
                  </span>
                </div>

                <button
                  type="button"
                  onClick={openDailyVerseInBible}
                  className="group block w-full space-y-3 py-1.5 px-2 rounded-xl text-center hover:bg-white/35 dark:hover:bg-white/[0.06] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                  title="Abrir versículo en Santa Biblia"
                  aria-label={`Abrir ${dailyVerse.ref} en Santa Biblia`}
                >
                  <span className="block font-scripture italic text-lg sm:text-[22px] leading-[1.6] font-medium text-slate-800 dark:text-slate-100">
                    “{dailyVerse.text}”
                  </span>
                  <span className="inline-flex items-center gap-2 pill-gold-soft px-4 py-1.5 rounded-full text-sm sm:text-base font-extrabold tracking-wide shadow-sm group-hover:scale-[1.02] transition-transform">
                    <BookIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{dailyVerse.ref} · RVR1960</span>
                  </span>
                </button>
              </div>
            )}

            {/* Audio Player with Live Spectrogram & Audio-Reactive Background Sync */}
            <CustomPlayer darkMode={darkToggle} src="https://app0102.sonicpanelradio.com/8840/stream" />

            {/* Bottom Action Row: Schedule Button + Social Icons */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                title="Ver Programas"
                className="glass-pill px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-100 flex items-center gap-2 hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <span className="accent-icon">
                  <CalendarIcon />
                </span>
                <span>Ver Programas</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href="https://www.facebook.com/Hermon95.3"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook Radio Hermón"
                  title="Facebook Radio Hermón"
                  className="glass-pill w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover-accent-icon hover:scale-105 transition-all"
                >
                  <FacebookIcon />
                </a>
                <a
                  href="https://www.instagram.com/radiohermon/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram Radio Hermón"
                  title="Instagram Radio Hermón"
                  className="glass-pill w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover-accent-icon hover:scale-105 transition-all"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>
          </div>
          </div>

          {hasSideAds && (
            <aside
              aria-label="Publicidad del programa"
              data-aos="fade-up"
              data-aos-duration="350"
              className="w-full max-w-[440px] lg:w-[350px] xl:w-[370px] mx-auto lg:mx-0 lg:mt-[50px] flex-shrink-0"
            >
              <ProgramAdsPanel
                ads={activeProgramAds}
                programName={currentImage?.name || ''}
                onInspectAd={setInspectedAd}
              />
            </aside>
          )}
        </main>

        {/* Modals & Institutional Footer */}
        <DonationInfo
          showDonationInfo={showDonationInfo}
          toggleDonationInfo={toggleDonationInfo}
          copyToClipboard={copyToClipboard}
          darkMode={darkToggle}
        />

        <Footer />

        <BibleModal
          isOpen={showBibleCard}
          onClose={() => {
            setShowBibleCard(false);
            setBibleInitialSelection(null);
          }}
          darkMode={darkToggle}
          initialSelection={bibleInitialSelection}
        />

        {/* Repositionable Admin Broadcast Dock (Top / Bottom / Left / Right) */}
        <AdminBroadcastDock
          adminOpen={adminOpen}
          adminEnter={adminEnter}
          setAdminOpen={setAdminOpen}
          adminAuthed={adminAuthed}
          setAdminAuthed={setAdminAuthed}
          adminLogin={adminLogin}
          adminUserInput={adminUserInput}
          setAdminUserInput={setAdminUserInput}
          adminPassInput={adminPassInput}
          setAdminPassInput={setAdminPassInput}
          adminMinimized={adminMinimized}
          setAdminMinimized={setAdminMinimized}
          isTransmitting={isTransmitting}
          setIsTransmitting={setIsTransmitting}
          overlay={overlay}
          setOverlay={setOverlay}
          saveOverlay={saveOverlay}
          cameraTabOpen={cameraTabOpen}
          setCameraTabOpen={setCameraTabOpen}
          externalMode={externalMode}
          setExternalMode={setExternalMode}
          controlsMinimized={controlsMinimized}
          setControlsMinimized={setControlsMinimized}
          customVdoLink={customVdoLink}
          setCustomVdoLink={setCustomVdoLink}
          cameraWindow={cameraWindow}
          pkgVersion={pkg.version}
          InfoTip={InfoTip}
        />

        {/* Discreet Floating Admin Lock Trigger (top-right, completely hidden until hover) */}
        {!adminOpen && (
          <button
            type="button"
            onClick={() => setAdminOpen(true)}
            title="Admin"
            aria-label="Abrir panel de administración"
            style={{
              top: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)',
              right: 'calc(env(safe-area-inset-right, 0px) + 0.75rem)',
            }}
            className="fixed z-[221] opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center glass-pill text-slate-600 dark:text-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <LockIcon />
          </button>
        )}

        {/* Fullscreen Overlay */}
        {overlay?.visible &&
          overlay?.position === 'fullscreen' &&
          (overlay?.type === 'text' ? !!overlay?.text : !!overlay?.url) && (
            <div
              className={`fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-6 transition-opacity duration-200 backdrop-blur-sm ${
                overlayAnim ? 'bg-slate-900/75 opacity-100' : 'bg-slate-900/0 opacity-0'
              }`}
              onClick={(e) => {
                if (e.target === e.currentTarget) closeOverlayContent();
              }}
            >
              <div
                className={`relative w-full h-full max-w-screen max-h-screen rounded-3xl overflow-hidden bg-slate-950 border border-white/15 transform transition-all duration-200 ${
                  overlayAnim ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeOverlayContent}
                  className="absolute top-4 right-4 z-[160] w-10 h-10 rounded-full glass-pill-dark text-white flex items-center justify-center hover:scale-105 transition-transform focus:outline-none"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <CloseIcon />
                </button>

                {overlay.type === 'image' && (
                  <div className="relative w-full h-full">
                    <img
                      key={overlay.url}
                      src={overlay.url}
                      alt=""
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      onClick={() => setOverlayImageModalOpen(true)}
                      title="Haz clic para ampliar"
                      className={`w-full h-full cursor-zoom-in ${
                        overlay.fit === 'cover' ? 'object-cover' : 'object-contain'
                      }`}
                    />
                    {overlay.text && (
                      <div className="flex absolute inset-0 justify-center items-center p-6 pointer-events-none">
                        <div className="max-w-4xl text-center text-white pointer-events-auto">
                          <div
                            className="inline-block rounded-2xl px-6 py-4 shadow-2xl"
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
                    key={overlay.url}
                    src={youtubeEmbedUrl(overlay.url)}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-none"
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
                      <div
                        className="inline-block rounded-2xl px-6 py-4 shadow-2xl"
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
            </div>
          )}

        {/* Enlarged Program Image Modal */}
        {currentImage && (
          <ImageModal
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            image={currentImage.image}
            images={currentImage.images}
            name={currentImage.name}
            header={currentImage.header}
            footer={hasSideAds ? '' : currentImage.footer}
            darkMode={darkToggle}
          />
        )}

        {/* Enlarged Overlay Image Modal */}
        {overlay?.visible && overlay?.url && overlay.type === 'image' && (
          <ImageModal
            isOpen={overlayImageModalOpen}
            onClose={() => setOverlayImageModalOpen(false)}
            image={overlay.url}
            name={overlay.title || 'Superposición'}
            header={overlay.title}
            footer=""
            darkMode={darkToggle}
          />
        )}

        {/* Enlarged Static Ad Media Modal (Image or Muted Video) */}
        {inspectedAd && inspectedAd.src && (
          <ImageModal
            isOpen={Boolean(inspectedAd)}
            onClose={() => setInspectedAd(null)}
            image={inspectedAd.src}
            mediaType={inspectedAd.mediaType || 'image'}
            poster={inspectedAd.poster}
            name={inspectedAd.title || currentImage?.name || 'Publicidad'}
            header={inspectedAd.badge || 'Publicidad del programa'}
            footer={inspectedAd.subtitle || ''}
            url={inspectedAd.url}
            linkLabel={inspectedAd.linkLabel}
            darkMode={darkToggle}
          />
        )}

        {/* Weekly Schedule Modal */}
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          darkMode={darkToggle}
          schedule={imageSchedule}
        />
      </div>
    </div>
  );
}

export default App;
