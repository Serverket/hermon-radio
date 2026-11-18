import { useState } from 'react';
import Church from './assets/hermon-church.webp';
import { ChurchIcon, FacebookIcon, InstagramIcon, XTwitterIcon } from './components/Icons';

const Footer = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-3 pointer-events-none"
      style={{
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
      }}
    >
      <div
        className="pointer-events-auto relative w-full max-w-[440px] min-h-[3.5rem] glass-shell rounded-t-2xl border-b-0 overflow-hidden transition-all duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Softly frosted church facade texture */}
        <img
          src={Church}
          alt="Iglesia Evangélica Hermón"
          className={`object-cover absolute inset-0 w-full h-full blur-[5px] scale-105 transition-opacity duration-500 ${
            isHovered ? 'opacity-25' : 'opacity-15'
          }`}
        />
        <div className="absolute inset-0 bg-white/45 dark:bg-slate-900/50 transition-colors duration-300" />

        <div className="relative z-10 flex items-center justify-between w-full h-14 px-4 sm:px-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="accent-icon flex-shrink-0">
              <ChurchIcon />
            </span>
            <div className="min-w-0 text-left">
              <div className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-tight truncate">
                Iglesia Hermón
              </div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                © {new Date().getFullYear()} Fundación Cultural Hermón RTV
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href="https://www.facebook.com/people/Iglesia-Evangelica-Hermon/100064624004737/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Iglesia Hermón"
              title="Facebook"
              className="glass-pill w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover-accent-icon transition-all hover:scale-105"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://x.com/IglesiaHermon/"
              target="_blank"
              rel="noreferrer"
              aria-label="X Iglesia Hermón"
              title="X"
              className="glass-pill w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover-accent-icon transition-all hover:scale-105"
            >
              <XTwitterIcon />
            </a>
            <a
              href="https://instagram.com/iglesiaevangelicahermon/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Iglesia Hermón"
              title="Instagram"
              className="glass-pill w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover-accent-icon transition-all hover:scale-105"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
