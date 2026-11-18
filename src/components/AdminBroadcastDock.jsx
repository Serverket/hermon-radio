/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import {
  CloseIcon,
  ChevronDownIcon,
  ImageIcon,
  TextIcon,
  YouTubeIcon,
  VideoCamIcon,
  InlineModeIcon,
  FullscreenModeIcon,
  TrashIcon,
  SendIcon,
  ExternalLinkIcon,
  StopIcon,
  GripIcon,
  DockEdgeIcon,
} from './Icons';
import { DEFAULT_OVERLAY } from '../utils/overlayDefaults';

const DOCK_EDGE_KEY = 'hermon_admin_dock_edge';
const VALID_EDGES = ['top', 'bottom', 'left', 'right'];
const LONG_PRESS_MS = 500;
const GRIP_PRESS_MS = 160;
const MOVE_THRESHOLD = 10;
const GRIP_DRAG_THRESHOLD = 4;

const EDGE_META = {
  top: { label: 'Arriba', short: 'Arr' },
  bottom: { label: 'Abajo', short: 'Aba' },
  left: { label: 'Izquierda', short: 'Izq' },
  right: { label: 'Derecha', short: 'Der' },
};

const SOURCE_OPTIONS = [
  { id: 'image', label: 'Imagen', icon: ImageIcon },
  { id: 'text', label: 'Texto', icon: TextIcon },
  { id: 'youtube', label: 'YouTube', icon: YouTubeIcon },
  { id: 'vdoninja', label: 'En Vivo', icon: VideoCamIcon },
];

const DEFAULT_VDO_PUSH =
  'https://vdo.ninja/?webcam&quality=1&stereo=1&autostart&device=1&muted&codec=vp9&push=radiohermon_live';
const DEFAULT_VDO_VIEW = 'https://vdo.ninja/?view=radiohermon_live&autoplay=1';

function readStoredEdge() {
  try {
    const stored = localStorage.getItem(DOCK_EDGE_KEY);
    if (VALID_EDGES.includes(stored)) return stored;
  } catch {
    // Ignore storage access errors in restricted contexts
  }
  return 'top';
}

function saveStoredEdge(edge) {
  try {
    localStorage.setItem(DOCK_EDGE_KEY, edge);
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

/**
 * Aspect-normalized quadrant calculation so top/bottom/left/right snap
 * uniformly across desktop monitors and narrow portrait phones.
 */
function computeNearestEdge(x, y) {
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const cx = vw / 2;
  const cy = vh / 2;
  const nx = (x - cx) / Math.max(cx, 1);
  const ny = (y - cy) / Math.max(cy, 1);

  if (Math.abs(nx) > Math.abs(ny)) {
    return nx < 0 ? 'left' : 'right';
  }
  return ny < 0 ? 'top' : 'bottom';
}

function getEdgeContainerLayout(edge) {
  const isVert = edge === 'left' || edge === 'right';
  const sb = 'env(safe-area-inset-bottom, 0px)';
  const st = 'env(safe-area-inset-top, 0px)';
  const sl = 'env(safe-area-inset-left, 0px)';
  const sr = 'env(safe-area-inset-right, 0px)';

  const baseClass = isVert
    ? 'fixed inset-y-0 flex items-center pointer-events-none'
    : 'fixed inset-x-0 px-3 sm:px-6 flex justify-center pointer-events-none';

  let style;
  switch (edge) {
    case 'bottom':
      style = { bottom: `calc(${sb} + 0.75rem)` };
      break;
    case 'left':
      style = { left: `calc(${sl} + 0.75rem)` };
      break;
    case 'right':
      style = { right: `calc(${sr} + 0.75rem)` };
      break;
    case 'top':
    default:
      style = { top: `calc(${st} + 0.75rem)` };
      break;
  }

  return { isVert, baseClass, style };
}

const ColorField = ({ label, tip, value, placeholder, onChange, InfoTip }) => (
  <div className="flex gap-2 items-center">
    <label className="inline-flex items-center text-xs font-bold text-slate-600 dark:text-slate-300">
      {label}
      <InfoTip text={tip} />
    </label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-7 rounded-lg border border-white/60 cursor-pointer flex-shrink-0"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="glass-inner px-2.5 py-1 w-24 text-xs font-mono rounded-lg text-slate-800 dark:text-white"
    />
  </div>
);

const OverlayColorControls = ({ bgColor, textColor, onChangeBg, onChangeText, bgTip, textTip, InfoTip }) => (
  <div className="flex flex-wrap gap-3 sm:gap-4">
    <ColorField
      label="Fondo"
      tip={bgTip}
      value={bgColor || '#1f2937'}
      placeholder="#1f2937"
      onChange={onChangeBg}
      InfoTip={InfoTip}
    />
    <ColorField
      label="Texto"
      tip={textTip}
      value={textColor || '#ffffff'}
      placeholder="#ffffff"
      onChange={onChangeText}
      InfoTip={InfoTip}
    />
  </div>
);

const VisibleSwitch = ({ checked, onToggle }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Visible</span>
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      onClick={onToggle}
      className={`inline-flex h-6 w-11 items-center rounded-full transition-colors p-0.5 flex-shrink-0 ${
        checked ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
      }`}
    >
      <span className="inline-block h-5 w-5 rounded-full bg-white shadow" />
    </button>
  </div>
);

const EdgeDockSwitcher = ({ edge, onSelectEdge, isVertical = false }) => (
  <div
    data-no-drag="true"
    role="group"
    aria-label="Posición del panel"
    className={`glass-inner p-1 rounded-xl flex items-center gap-0.5 ${
      isVertical ? 'w-full justify-between' : 'w-full sm:w-auto justify-between sm:justify-start'
    }`}
  >
    {VALID_EDGES.map((targetEdge) => {
      const active = edge === targetEdge;
      const meta = EDGE_META[targetEdge];
      return (
        <button
          key={targetEdge}
          type="button"
          onClick={() => onSelectEdge(targetEdge)}
          aria-pressed={active}
          aria-label={`Anclar panel ${meta.label.toLowerCase()}`}
          title={`Mover panel a: ${meta.label}`}
          className={`flex items-center justify-center gap-1 rounded-lg text-[11px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            isVertical ? 'flex-1 py-1.5 px-1.5' : 'flex-1 sm:flex-none py-1.5 px-2'
          } ${
            active
              ? 'btn-opal-gold shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/45 dark:hover:bg-white/10'
          }`}
        >
          <DockEdgeIcon edge={targetEdge} className="w-3.5 h-3.5 flex-shrink-0" />
          <span className={isVertical ? '' : 'sm:hidden'}>{meta.short}</span>
        </button>
      );
    })}
  </div>
);

/**
 * Repositionable dock for the Broadcast Admin Panel supporting top, bottom, left, and right
 * edges via long-press, drag grip handle, or direct edge switcher buttons.
 */
const AdminBroadcastDock = ({
  adminOpen,
  adminEnter,
  setAdminOpen,
  adminAuthed,
  setAdminAuthed,
  adminLogin,
  adminUserInput,
  setAdminUserInput,
  adminPassInput,
  setAdminPassInput,
  adminMinimized,
  setAdminMinimized,
  isTransmitting,
  setIsTransmitting,
  overlay,
  setOverlay,
  saveOverlay,
  cameraTabOpen,
  setCameraTabOpen,
  externalMode,
  setExternalMode,
  controlsMinimized,
  setControlsMinimized,
  customVdoLink,
  setCustomVdoLink,
  cameraWindow,
  pkgVersion,
  InfoTip,
}) => {
  const [edge, setEdge] = useState(readStoredEdge);
  const [dragState, setDragState] = useState('idle'); // 'idle' | 'pressing' | 'dragging' | 'snapping'
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewEdge, setPreviewEdge] = useState(edge);
  const [honeypot, setHoneypot] = useState('');
  const dockRef = useRef(null);
  const honeypotRef = useRef(null);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startRect: null,
    isGrip: false,
    timer: null,
  });

  const beginDrag = (x, y) => {
    const rect = dockRef.current?.getBoundingClientRect();
    dragRef.current.startRect = rect
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      : { left: 0, top: 0, width: 320, height: 180 };
    setDragState('dragging');
    setPreviewEdge(computeNearestEdge(x, y));
  };

  const selectEdge = (nextEdge) => {
    if (!VALID_EDGES.includes(nextEdge)) return;
    setDragState('snapping');
    setEdge(nextEdge);
    setPreviewEdge(nextEdge);
    saveStoredEdge(nextEdge);
    setTimeout(() => {
      setDragState((curr) => (curr === 'snapping' ? 'idle' : curr));
    }, 280);
  };

  useEffect(() => {
    if (!adminOpen) setHoneypot('');
  }, [adminOpen]);

  useEffect(() => {
    if (dragState !== 'dragging') return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [dragState]);

  const handlersRef = useRef({ onMove: () => {}, onUp: () => {} });

  handlersRef.current.onMove = (e) => {
    const d = dragRef.current;
    if (dragState === 'pressing') {
      const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
      if (d.isGrip) {
        if (dist >= GRIP_DRAG_THRESHOLD) {
          clearTimeout(d.timer);
          d.timer = null;
          beginDrag(e.clientX, e.clientY);
        }
      } else if (dist > MOVE_THRESHOLD) {
        clearTimeout(d.timer);
        d.timer = null;
        setDragState('idle');
      }
      return;
    }

    if (dragState === 'dragging') {
      d.currentX = e.clientX;
      d.currentY = e.clientY;
      setPreviewEdge(computeNearestEdge(e.clientX, e.clientY));

      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      const sr = d.startRect || { left: 0, top: 0, width: 320, height: 180 };

      const targetX = e.clientX - d.startX;
      const targetY = e.clientY - d.startY;
      const minX = 8 - sr.left;
      const maxX = Math.max(minX, vw - sr.width - 8 - sr.left);
      const minY = 8 - sr.top;
      const maxY = Math.max(minY, vh - sr.height - 8 - sr.top);

      setDragOffset({
        x: Math.max(minX, Math.min(maxX, targetX)),
        y: Math.max(minY, Math.min(maxY, targetY)),
      });
    }
  };

  handlersRef.current.onUp = (e) => {
    const d = dragRef.current;
    clearTimeout(d.timer);
    d.timer = null;

    if (dragState === 'pressing') {
      setDragState('idle');
      return;
    }

    if (dragState === 'dragging') {
      const targetEdge = computeNearestEdge(e.clientX, e.clientY);
      setDragOffset({ x: 0, y: 0 });
      selectEdge(targetEdge);
    }
  };

  useEffect(() => {
    if (dragState !== 'pressing' && dragState !== 'dragging') return undefined;
    const handleMove = (e) => handlersRef.current.onMove(e);
    const handleUp = (e) => handlersRef.current.onUp(e);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragState]);

  const handleHeaderPointerDown = (e) => {
    if (dragState !== 'idle') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const isGrip = Boolean(e.target.closest('[data-dock-grip]'));
    if (!isGrip && e.target.closest('button, a, input, textarea, select, [data-no-drag]')) {
      return;
    }

    const d = dragRef.current;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.currentX = e.clientX;
    d.currentY = e.clientY;
    d.isGrip = isGrip;
    setDragState('pressing');

    clearTimeout(d.timer);
    d.timer = setTimeout(() => {
      if (dragRef.current.timer) {
        dragRef.current.timer = null;
        beginDrag(d.currentX, d.currentY);
      }
    }, isGrip ? GRIP_PRESS_MS : LONG_PRESS_MS);
  };

  if (!adminOpen) return null;

  const isVertical = edge === 'left' || edge === 'right';
  const isVerticalRail = isVertical && adminMinimized;
  const { baseClass, style: containerPosStyle } = getEdgeContainerLayout(edge);

  const resetOverlay = async () => {
    const fresh = { ...DEFAULT_OVERLAY };
    setOverlay(fresh);
    try {
      await saveOverlay(fresh);
      setIsTransmitting(false);
    } catch (e) {
      console.error(e);
    }
  };

  const renderEnterAnim = () => {
    if (adminEnter) return 'opacity-100 translate-x-0 translate-y-0 scale-100';
    if (edge === 'left') return 'opacity-0 -translate-x-4 scale-95';
    if (edge === 'right') return 'opacity-0 translate-x-4 scale-95';
    if (edge === 'bottom') return 'opacity-0 translate-y-4 scale-95';
    return 'opacity-0 -translate-y-4 scale-95';
  };

  const renderDockContent = () => (
    <div className="space-y-4">
      {/* Row 1: Source Type + Display Position + Fit */}
      <div className={isVertical ? 'space-y-2.5' : 'flex flex-wrap items-center gap-3'}>
        <div
          className={`glass-inner p-1 rounded-2xl ${
            isVertical ? 'grid grid-cols-2 gap-1' : 'flex flex-wrap items-center gap-1'
          }`}
        >
          {SOURCE_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                title={opt.label}
                onClick={() => setOverlay((o) => ({ ...o, type: opt.id }))}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  overlay.type === opt.id
                    ? 'btn-opal-gold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <IconComp />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {!isVertical && <div className="hidden sm:block w-px h-7 bg-slate-200/70 dark:bg-white/10" />}

        <div
          className={`glass-inner p-1 rounded-2xl ${
            isVertical ? 'grid grid-cols-2 gap-1' : 'flex items-center gap-1'
          }`}
        >
          <button
            type="button"
            onClick={() => setOverlay((o) => ({ ...o, position: 'inline' }))}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              overlay.position === 'inline'
                ? 'pill-gold-soft'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-white/5'
            }`}
          >
            <InlineModeIcon /> Integrado
          </button>
          <button
            type="button"
            onClick={() => setOverlay((o) => ({ ...o, position: 'fullscreen' }))}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              overlay.position === 'fullscreen'
                ? 'pill-gold-soft'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-white/5'
            }`}
          >
            <FullscreenModeIcon /> Completa
          </button>
        </div>

        {overlay.type === 'image' && (
          <>
            {!isVertical && <div className="hidden sm:block w-px h-7 bg-slate-200/70 dark:bg-white/10" />}
            <div
              className={`glass-inner p-1 rounded-2xl ${
                isVertical ? 'grid grid-cols-2 gap-1' : 'flex items-center gap-1'
              }`}
            >
              <button
                type="button"
                onClick={() => setOverlay((o) => ({ ...o, fit: 'contain' }))}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  overlay.fit === 'contain'
                    ? 'pill-gold-soft'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-white/5'
                }`}
              >
                Contener
              </button>
              <button
                type="button"
                onClick={() => setOverlay((o) => ({ ...o, fit: 'cover' }))}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  overlay.fit === 'cover'
                    ? 'pill-gold-soft'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-white/5'
                }`}
              >
                Cubrir
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content Inputs */}
      <div className="space-y-3">
        {overlay.type === 'text' && (
          <div className="space-y-3">
            <div>
              <label className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Texto
                <InfoTip text="Mensaje que se mostrará como sobreimpresión en vivo." />
              </label>
              <textarea
                value={overlay.text}
                onChange={(e) => setOverlay((o) => ({ ...o, text: e.target.value }))}
                className="w-full min-h-[70px] px-3.5 py-2.5 glass-inner rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Escribe el anuncio..."
              />
            </div>
            <OverlayColorControls
              bgColor={overlay.bgColor}
              textColor={overlay.textColor}
              onChangeBg={(val) => setOverlay((o) => ({ ...o, bgColor: val }))}
              onChangeText={(val) => setOverlay((o) => ({ ...o, textColor: val }))}
              bgTip="Color de fondo del texto."
              textTip="Color del texto."
              InfoTip={InfoTip}
            />
          </div>
        )}

        {overlay.type === 'image' && (
          <div className={`grid grid-cols-1 gap-3 ${!isVertical ? 'lg:grid-cols-2' : ''}`}>
            <div>
              <label className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                URL de imagen
                <InfoTip text="Pega un enlace directo a una imagen (JPG, PNG, GIF, etc.)" />
              </label>
              <input
                type="text"
                value={overlay.url}
                onChange={(e) => {
                  const val = e.target.value;
                  let newType = 'image';
                  if (val.includes('vdo.ninja') || val.includes('obs.ninja')) newType = 'vdoninja';
                  if (val.includes('youtube.com') || val.includes('youtu.be')) newType = 'youtube';
                  if (newType !== 'image') {
                    setOverlay((o) => ({ ...o, type: newType, url: val }));
                  } else {
                    setOverlay((o) => ({ ...o, url: val }));
                  }
                }}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full glass-inner px-3.5 py-2.5 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Texto superpuesto
                <InfoTip text="Texto que aparecerá sobre la imagen." />
              </label>
              <input
                type="text"
                value={overlay.text || ''}
                onChange={(e) => setOverlay((o) => ({ ...o, text: e.target.value }))}
                placeholder="Texto sobre la imagen..."
                className="w-full glass-inner px-3.5 py-2.5 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className={!isVertical ? 'lg:col-span-2' : ''}>
              <OverlayColorControls
                bgColor={overlay.bgColor}
                textColor={overlay.textColor}
                onChangeBg={(val) => setOverlay((o) => ({ ...o, bgColor: val }))}
                onChangeText={(val) => setOverlay((o) => ({ ...o, textColor: val }))}
                bgTip="Color de fondo del texto sobre la imagen."
                textTip="Color del texto sobre la imagen."
                InfoTip={InfoTip}
              />
            </div>
          </div>
        )}

        {overlay.type === 'vdoninja' && (
          <div className="space-y-3">
            <label className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Transmisión en Vivo (VDO.ninja)
              <InfoTip text="Controles detallados para la transmisión en vivo." />
            </label>

            {!cameraTabOpen ? (
              <button
                type="button"
                onClick={() => setCameraTabOpen(true)}
                className="btn-opal-gold w-full flex flex-col items-center justify-center py-6 rounded-2xl transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <VideoCamIcon className="w-8 h-8 mb-1.5" />
                <span className="font-bold text-sm">Activar Cámara</span>
              </button>
            ) : (
              <div className="relative w-full aspect-video max-h-56 md:max-h-72 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/70 dark:border-white/15 shadow-xl">
                <div className="absolute top-2.5 right-2.5 z-20">
                  {externalMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setExternalMode(false);
                        if (cameraWindow.current) {
                          cameraWindow.current.close();
                          cameraWindow.current = null;
                        }
                      }}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500/90 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg backdrop-blur-md"
                      title="Recuperar iframe local"
                    >
                      <InlineModeIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const url = customVdoLink.trim() !== '' ? customVdoLink.trim() : DEFAULT_VDO_PUSH;
                        cameraWindow.current = window.open(url, '_blank');
                        setExternalMode(true);
                      }}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/55 hover:bg-black/80 border border-white/25 text-white flex items-center justify-center shadow-lg backdrop-blur-md"
                      title="Delegar a otra pestaña"
                    >
                      <ExternalLinkIcon />
                    </button>
                  )}
                </div>

                {externalMode ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center text-slate-300 bg-slate-900">
                    <h3 className="text-sm font-bold text-white mb-1">Cámara Delegada</h3>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      Estás emitiendo desde otra pestaña para evitar conflictos de recursos locales.
                    </p>
                  </div>
                ) : (
                  <iframe
                    src={customVdoLink.trim() !== '' ? customVdoLink.trim() : DEFAULT_VDO_PUSH}
                    allow="camera; microphone; autoplay; fullscreen"
                    className="w-full h-full object-cover border-none"
                    title="VDO.ninja Camera Preview"
                  />
                )}

                {!controlsMinimized ? (
                  <div
                    className={`glass-shell-dark absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full shadow-2xl z-10 ${
                      isVertical ? 'gap-1.5 px-2.5 py-1.5' : 'gap-2 px-3 py-2'
                    }`}
                  >
                    {isTransmitting ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const newOverlay = { ...overlay, visible: false };
                          setOverlay(newOverlay);
                          try {
                            await saveOverlay(newOverlay);
                            setIsTransmitting(false);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-xs font-extrabold whitespace-nowrap"
                        title="Pausar Transmisión"
                      >
                        Pausar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          const liveViewUrl = customVdoLink.trim() !== '' ? customVdoLink.trim() : DEFAULT_VDO_VIEW;
                          const newOverlay = { ...overlay, type: 'vdoninja', url: liveViewUrl, visible: true };
                          setOverlay(newOverlay);
                          try {
                            await saveOverlay(newOverlay);
                            setIsTransmitting(true);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold whitespace-nowrap"
                        title="Transmitir En Vivo"
                      >
                        Transmitir
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        setCameraTabOpen(false);
                        setExternalMode(false);
                        if (cameraWindow.current) {
                          cameraWindow.current.close();
                          cameraWindow.current = null;
                        }
                        const newOverlay = { ...overlay, visible: false };
                        setOverlay(newOverlay);
                        try {
                          await saveOverlay(newOverlay);
                          setIsTransmitting(false);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow flex-shrink-0"
                      title="Cerrar Cámara"
                    >
                      <StopIcon />
                    </button>

                    <div className="w-px h-5 bg-white/20" />

                    <button
                      type="button"
                      onClick={() => setControlsMinimized(true)}
                      className="w-7 h-7 rounded-full text-white/75 hover:text-white flex items-center justify-center flex-shrink-0"
                      title="Minimizar Controles"
                    >
                      <ChevronDownIcon />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setControlsMinimized(false)}
                    className="glass-shell-dark absolute bottom-3 right-3 w-9 h-9 rounded-full text-white flex items-center justify-center shadow-lg z-10 rotate-180"
                    title="Restaurar Controles"
                  >
                    <ChevronDownIcon />
                  </button>
                )}

                {isTransmitting && (
                  <div className="absolute top-2.5 left-2.5 bg-red-600/95 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow flex items-center gap-1.5 z-10">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    AL AIRE
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {overlay.type === 'youtube' && (
          <div>
            <label className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              URL de YouTube
              <InfoTip text="Pega un enlace de YouTube (https://youtu.be/... o https://www.youtube.com/watch?v=...)" />
            </label>
            <input
              type="text"
              value={overlay.url}
              onChange={(e) => setOverlay((o) => ({ ...o, url: e.target.value }))}
              placeholder="https://youtu.be/..."
              className="w-full glass-inner px-3.5 py-2.5 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}
      </div>

      {/* Actions Footer */}
      {overlay.type === 'vdoninja' ? (
        <details className="group glass-inner rounded-2xl overflow-hidden">
          <summary className="flex items-center justify-between gap-2 p-3 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 select-none">
            <span>Controles Manuales (Link VDO.ninja / Visible / Transmitir)</span>
            <span className="transition-transform group-open:rotate-180 flex-shrink-0">
              <ChevronDownIcon />
            </span>
          </summary>
          <div className="p-3.5 space-y-3 border-t border-slate-200/70 dark:border-white/10">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Link personalizado de VDO.ninja (opcional)
              </label>
              <input
                type="text"
                value={customVdoLink}
                onChange={(e) => {
                  setCustomVdoLink(e.target.value);
                  setOverlay((o) => ({ ...o, url: e.target.value }));
                }}
                placeholder="https://vdo.ninja/..."
                className="mt-1 w-full glass-inner px-3 py-2 rounded-xl text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between pt-2 border-t border-slate-200/70 dark:border-white/10">
              <VisibleSwitch
                checked={overlay.visible}
                onToggle={() => {
                  let finalUrl = overlay.url;
                  if (!finalUrl || finalUrl.trim() === '') {
                    finalUrl = customVdoLink.trim() !== '' ? customVdoLink.trim() : DEFAULT_VDO_VIEW;
                  }
                  setOverlay((o) => ({ ...o, visible: !o.visible, url: finalUrl }));
                }}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetOverlay}
                  className="glass-pill px-3 py-2 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5"
                  title="Limpiar"
                >
                  <TrashIcon /> Limpiar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    let finalUrl = overlay.url;
                    if (!finalUrl || finalUrl.trim() === '') {
                      finalUrl = customVdoLink.trim() !== '' ? customVdoLink.trim() : DEFAULT_VDO_VIEW;
                    }
                    const newOverlay = { ...overlay, url: finalUrl };
                    setOverlay(newOverlay);
                    try {
                      await saveOverlay(newOverlay);
                      setIsTransmitting(newOverlay.visible);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="btn-opal-gold px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  <SendIcon /> Transmitir
                </button>
              </div>
            </div>
          </div>
        </details>
      ) : (
        <div className="flex flex-wrap gap-2.5 items-center justify-between pt-3 border-t border-slate-200/70 dark:border-white/10">
          <VisibleSwitch
            checked={overlay.visible}
            onToggle={() => setOverlay((o) => ({ ...o, visible: !o.visible }))}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetOverlay}
              className="glass-pill px-3 py-2 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5"
              title="Limpiar"
            >
              <TrashIcon /> Limpiar
            </button>
            <button
              type="button"
              onClick={() => saveOverlay(overlay)}
              className="btn-opal-gold px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5"
            >
              <SendIcon /> Transmitir
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Ghost edge previews while dragging (all 4 screen edges) */}
      {dragState === 'dragging' &&
        VALID_EDGES.map((gEdge) => {
          const { isVert: gVert, baseClass: gBaseClass, style: gStyle } = getEdgeContainerLayout(gEdge);
          const isNearest = previewEdge === gEdge;
          return (
            <div key={gEdge} className={`${gBaseClass} z-[9985]`} style={gStyle}>
              <div
                className={`rounded-[24px] backdrop-blur-xl transition-all duration-150 flex items-center justify-center ${
                  gVert ? 'w-20 sm:w-24 h-[min(52dvh,320px)] flex-col gap-1.5 px-2 py-4 text-center' : 'w-[min(420px,82vw)] h-14 px-4 gap-2'
                } ${
                  isNearest
                    ? 'pill-gold-soft accent-ring shadow-2xl scale-105'
                    : 'bg-white/35 dark:bg-slate-900/40 border border-dashed border-slate-400/50 dark:border-white/25 text-slate-500 dark:text-slate-300 opacity-75'
                }`}
              >
                <DockEdgeIcon edge={gEdge} className="w-5 h-5 flex-shrink-0" />
                <span className="text-[11px] font-extrabold tracking-wide leading-tight">
                  {isNearest ? (
                    gVert ? (
                      <>
                        Soltar
                        <br />
                        {EDGE_META[gEdge].label}
                      </>
                    ) : (
                      `Soltar • ${EDGE_META[gEdge].label}`
                    )
                  ) : (
                    EDGE_META[gEdge].label
                  )}
                </span>
              </div>
            </div>
          );
        })}

      {/* Floating Repositionable Admin Broadcast Dock */}
      <div
        className={`${baseClass} ${dragState === 'dragging' ? 'z-[9990]' : 'z-[220]'} transition-opacity duration-200 ${renderEnterAnim()}`}
        style={containerPosStyle}
      >
        <div
          ref={dockRef}
          className={`pointer-events-auto glass-shell !bg-white/[0.92] dark:!bg-[#161c27]/[0.92] text-left text-slate-800 dark:text-slate-100 transition-[opacity,box-shadow,border-radius] ${
            dragState === 'dragging' ? 'duration-0 shadow-2xl ring-2 ring-[#C49E2D]/70 select-none' : 'duration-200'
          } ${
            isVerticalRail
              ? 'w-14 sm:w-[62px] rounded-[2rem] py-3 px-1.5 flex flex-col items-center gap-2 max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] overflow-y-auto no-scrollbar'
              : isVertical
              ? 'w-[min(368px,calc(100vw-1.5rem))] rounded-[24px] p-3.5 sm:p-4 flex flex-col gap-3 max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))]'
              : 'w-full max-w-screen-lg rounded-[24px] p-4 sm:p-5 space-y-4 max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex flex-col'
          }`}
          style={{
            transform:
              dragState === 'dragging'
                ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.02)`
                : undefined,
          }}
        >
          {isVerticalRail ? (
            /* Compact vertical rail when minimized on Left/Right edge (mirroring jdriveroweb vertical pill) */
            <div onPointerDown={handleHeaderPointerDown} className="flex flex-col items-center gap-2 w-full">
              <button
                type="button"
                data-dock-grip="true"
                aria-label="Arrastrar barra de transmisión a cualquier borde"
                title="Arrastra para mover de borde"
                className="w-9 h-7 rounded-xl glass-pill flex items-center justify-center text-slate-500 dark:text-slate-300 cursor-grab active:cursor-grabbing hover-accent-icon"
              >
                <GripIcon className="w-4 h-4 rotate-90" />
              </button>

              <button
                type="button"
                onClick={() => setAdminMinimized(false)}
                title="Expandir Panel de Transmisión"
                aria-label="Expandir panel de transmisión"
                className="relative group focus:outline-none"
              >
                <img
                  src="/android-chrome-512x512.png"
                  alt="Logo Radio Hermón"
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-amber-400/50 shadow-sm object-cover group-hover:scale-105 transition-transform"
                />
                {isTransmitting && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
                )}
              </button>

              <div className="w-6 h-px bg-slate-200/80 dark:bg-white/10" />

              {adminAuthed &&
                SOURCE_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const active = overlay.type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      title={`${opt.label} (abrir)`}
                      aria-label={opt.label}
                      onClick={() => {
                        setOverlay((o) => ({ ...o, type: opt.id }));
                        setAdminMinimized(false);
                      }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        active
                          ? 'btn-opal-gold shadow-sm'
                          : 'glass-pill text-slate-600 dark:text-slate-300 hover:scale-105'
                      }`}
                    >
                      <IconComp />
                    </button>
                  );
                })}

              {adminAuthed && <div className="w-6 h-px bg-slate-200/80 dark:bg-white/10" />}

              <button
                type="button"
                onClick={() => selectEdge(edge === 'left' ? 'right' : 'left')}
                title={`Cambiar a ${edge === 'left' ? 'Derecha' : 'Izquierda'}`}
                aria-label={`Mover al borde ${edge === 'left' ? 'derecho' : 'izquierdo'}`}
                className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center text-slate-600 dark:text-slate-200 hover-accent-icon"
              >
                <DockEdgeIcon edge={edge === 'left' ? 'right' : 'left'} className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setAdminMinimized(false)}
                className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center text-slate-600 dark:text-slate-200"
                aria-label="Expandir"
                title="Expandir"
              >
                <span className={edge === 'left' ? '-rotate-90' : 'rotate-90'}>
                  <ChevronDownIcon />
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminOpen(false);
                  setAdminAuthed(false);
                  setAdminMinimized(false);
                }}
                className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center text-slate-600 dark:text-slate-200"
                aria-label="Cerrar"
                title="Cerrar"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Full Dock Header + Scrollable Content (Horizontal Top/Bottom OR Vertical Sidebar Left/Right) */
            <>
              <div
                onPointerDown={handleHeaderPointerDown}
                className="flex-shrink-0 pb-3 border-b border-slate-200/70 dark:border-white/10 cursor-grab active:cursor-grabbing touch-none select-none flex flex-wrap justify-between items-center gap-2.5"
              >
                <div className="order-1 flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                  <button
                    type="button"
                    data-dock-grip="true"
                    aria-label="Arrastrar panel de transmisión a otro borde"
                    title="Arrastra para mover a arriba, abajo, izquierda o derecha (o mantén presionada la cabecera)"
                    className="w-7 h-7 rounded-xl glass-pill flex items-center justify-center text-slate-500 dark:text-slate-300 cursor-grab active:cursor-grabbing hover-accent-icon flex-shrink-0"
                  >
                    <GripIcon className="w-4 h-4" />
                  </button>

                  <img
                    src="/android-chrome-512x512.png"
                    alt="Logo Radio Hermón"
                    className="w-8 h-8 rounded-full border border-white dark:border-amber-400/40 shadow-sm object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white leading-tight truncate">
                      Panel de Transmisión{' '}
                      <span className="text-xs font-semibold text-slate-400 ml-0.5">v{pkgVersion}</span>
                    </h3>
                  </div>

                  {isTransmitting && (
                    <span className="badge-emerald-live px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Transmitiendo
                    </span>
                  )}
                </div>

                <div className={isVertical ? 'order-3 w-full' : 'order-3 w-full sm:order-2 sm:w-auto'}>
                  <EdgeDockSwitcher edge={edge} onSelectEdge={selectEdge} isVertical={isVertical} />
                </div>

                <div
                  className={`flex gap-1.5 items-center flex-shrink-0 ${
                    isVertical ? 'order-2' : 'order-2 sm:order-3'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setAdminMinimized(!adminMinimized)}
                    className="w-8 h-8 rounded-xl glass-pill flex justify-center items-center text-slate-600 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    aria-label={adminMinimized ? 'Expandir' : 'Minimizar'}
                    title={adminMinimized ? 'Expandir' : 'Minimizar'}
                  >
                    {adminMinimized ? <ChevronDownIcon /> : <span className="block w-3.5 h-0.5 bg-current rounded-full" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminOpen(false);
                      setAdminAuthed(false);
                      setAdminMinimized(false);
                    }}
                    className="w-8 h-8 rounded-xl glass-pill flex justify-center items-center text-slate-600 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    aria-label="Cerrar"
                    title="Cerrar"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!adminMinimized && (
                <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-1 pb-3 space-y-4">
                  {!adminAuthed ? (
                    <form
                      onSubmit={(e) => adminLogin(e, honeypotRef.current?.value || honeypot)}
                      className={`flex flex-col gap-3 ${!isVertical ? 'sm:flex-row sm:items-end' : ''}`}
                    >
                      {/* Offscreen anti-bot honeypot field (ignored by assistive tech & password managers) */}
                      <div
                        aria-hidden="true"
                        className="fixed -left-[9999px] -top-[9999px] w-px h-px overflow-hidden opacity-0 pointer-events-none"
                      >
                        <label htmlFor="hp_website">Sitio web</label>
                        <input
                          ref={honeypotRef}
                          id="hp_website"
                          name="hp_website"
                          type="text"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-bwignore="true"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Usuario administrador
                        </label>
                        <input
                          name="username"
                          type="text"
                          autoComplete="username"
                          value={adminUserInput}
                          onChange={(e) => setAdminUserInput(e.target.value)}
                          className="mt-1 px-3.5 py-2.5 w-full glass-inner rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                          placeholder="Ingrese usuario"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Contraseña
                        </label>
                        <input
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          value={adminPassInput}
                          onChange={(e) => setAdminPassInput(e.target.value)}
                          className="mt-1 px-3.5 py-2.5 w-full glass-inner rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                          placeholder="Ingrese contraseña"
                        />
                      </div>
                      <button
                        type="submit"
                        className={`btn-opal-gold px-6 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                          isVertical ? 'w-full' : ''
                        }`}
                      >
                        Entrar
                      </button>
                    </form>
                  ) : (
                    renderDockContent()
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminBroadcastDock;
