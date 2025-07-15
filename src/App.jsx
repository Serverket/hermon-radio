import React, { useState, useEffect } from "react";
/* import ConvaiAssistant from './ConvaiAssistant'; */
import MultiBibleCard from './MultiBibleCard';
import CustomPlayer from './CustomPlayer';
import DonationInfo from './DonationInfo';
import "./styles/tailwind.css";
import Footer from './Footer';
import moment from "moment";
import "aos/dist/aos.css";
import AOS from "aos";

/**
 * Schedule configuration for program images and advertisements
 * Contains time-based and date-range based schedules for content display
 */
const imageSchedule = [
  // Monday
  { day: 1, time: "13:00", duration: 180, image: "Diosysusmaravillas.jpg", name: "Dios y sus maravillas", header: "Estás en sintonía de", footer: "Charlas | Música en vivo | Consejos | Reflexión" },
  { day: 1, time: "22:00", duration: 60, image: "LaFeeslaPalabradeDios.jpeg", name: "La Fe es la Palabra de Dios", header: "Estás en sintonía de", footer: "Dios te bendiga" },
  
  // Tuesday
  { day: 2, time: "16:00", duration: 180, image: "LaFevieneporeloír.png", name: "La Fe viene por el oír", header: 'Estás en sintonía de', footer: "¡Comunícate con nosotros para patrocinarnos!" },
  // Wednesday
  // Thursday

  // Friday
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
];

function App() {
  // State management
  const [currentImage, setCurrentImage] = useState(null); // Currently displayed program/image
  const [darkToggle, setDarkToggle] = useState( // Dark mode state with localStorage persistence
    localStorage.getItem("darkMode") === "true"
  );
  const [showDonationInfo, setShowDonationInfo] = useState(false); // Donation modal visibility
  const [showBibleCard, setShowBibleCard] = useState(false); // Bible card visibility (closed by default)

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
          
          {/* Dark mode toggle switch */}
          <label className="toggleDarkBtn" data-aos="fade-left" data-aos-delay="500">
            <input type="checkbox" checked={darkToggle} onChange={toggleDarkMode} />
            <span className="bg-gray-400 slideBtnTg round"></span>
          </label>

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
          
          {/* Main content card */}
          <div className="w-[370px] sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-b-xl text-white dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-50" data-aos="zoom-in" data-aos-delay="700">

            {/* Main content area */}
            <div className="px-6 space-y-2 text-center sm:space-y-3">
              <div className="text-3xl font-bold text-gray-800 filter drop-shadow-md dark:text-gray-200 md:text-2xl">
                Radio Hermón
              </div>
              
              {/* Program image display */}
              {currentImage && (
                <div className="flex justify-center items-center w-full">
                  <div className="flex flex-col justify-center items-center space-y-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-600">
                      {currentImage.header}
                    </span>
                    <img
                      className="z-10 h-48 rounded-xl transition-all ease-in-out md:h-80 hover:scale-110 sm:hover:scale-100"
                      src={currentImage.image}
                      alt={currentImage.name}
                    />
                    <marquee className="w-8/12 text-gray-800 drop-shadow-md md:w-full dark:text-gray-200">
                      {currentImage.footer}
                    </marquee>
                  </div>
                </div>
              )}

              {/* Audio player */}
              <div className="flex justify-center text-sm text-grey-darker" data-aos="fade-right" data-aos-delay="900">
                <CustomPlayer
                  darkMode={darkToggle}
                  src="https://app0102.sonicpanelradio.com/8840/stream"
                />
              </div>
              
              {/* Bible Card */}
              <MultiBibleCard isVisible={showBibleCard} darkMode={darkToggle} />

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

        {/* Footer component */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
