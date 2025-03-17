import React, { useState, useEffect } from "react";
import Church from "./assets/hermon-church.webp";
import { Disclosure } from "@headlessui/react";
import CustomPlayer from './CustomPlayer';
import "./styles/tailwind.css";
import moment from "moment";
import "aos/dist/aos.css";
import AOS from "aos";

const imageSchedule = [
  // Monday  
  { day: 1, time: "13:00", duration: 180, image: "Diosysusmaravillas.jpg", name: "Dios y sus maravillas", header: "Estás en sintonía de", footer: "Charlas | Música en vivo | Consejos | Reflexión" },
  { day: 1, time: "22:00", duration: 60, image: "LaFeeslaPalabradeDios.jpeg", name: "La Fe es la Palabra de Dios", header: "Estás en sintonía de", footer: "Dios te bendiga" },
  // Tuesday  
  // Wednesday  
  // Thursday  
  // Friday  
  { day: 5, time: "18:00", duration: 60, image: "AlfayOmega.png", name: "Alfa y Omega", header: 'Patrocinador: "Panadería La Nonna, el mejor pan, del horno a tu boca | www.longyu.store', footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 5, time: "19:00", duration: 120, image: "Tiempoderefrigerio.png", name: "Tiempo de Refrigerio", header: "Estás en sintonía de", footer: "Patrocinadores: Pincho Pocholin | Kiosco La Bendición | Iglesia Tiempo de Refrigerio | Escríbenos al 0424 315 71 26" },
  // Saturday  
  { day: 6, time: "21:00", duration: 60, image: "VivenciasenCristo.jpeg", name: "Vivencias en Cristo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },
  { day: 6, time: "05:00", duration: 120, image: "AmanecerConCristo.png", name: "Amanecer con Cristo", header: "Estás en sintonía de", footer: "Patrocinadores: Inversiones y Variedad Yalex A&B | Inversiones Karvican | Cerrajería El Cóndor" },
  // Sunday  
  { day: 0, time: "13:00", duration: 60, image: "EnondaconCristo.jpg", name: "En onda con Cristo", header: "Estás en sintonía de", footer: "Dios te bendiga" },
  // Date range schedule (Anniversary)   
  { startDate: "2024-12-04", endDate: "2024-12-07", image: "63aniversario.png", name: "63 Aniversario", header: "Programación de aniversario del 04 al 07 de Diciembre de 6:00 PM a 9:00 PM", footer: 'Deuteronomio 31:6 "Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará, ni te desamparará."' },
  // Date range schedule (For just a day)   
  { startDate: "2024-12-31", endDate: "2024-12-31", image: "Cultodefin.jpeg", name: "Culto Especial de Fin de Año", header: "Culto Especial de Fin de Año | 8:30 PM", footer: 'Ven y adoremos juntos a nuestro Dios, será una noche de bendición, de alegría, de alabanzas al Rey de Reyes con el predicador Leobaldo Barradas.' },
];

// Ad configuration with schedules  
const adSchedule = [
  { day: 1, time: "10:00", duration: 30 }, // Monday, 10:00 AM, 30 minutes  
  { day: 3, time: "14:00", duration: 45 }, // Wednesday, 2:00 PM, 45 minutes  
  { day: 0, time: "16:00", duration: 60 }, // Sunday, 4:00 PM, 60 minutes  
];

const randomAds = [
  { image: "AlfayOmega.png", name: "Alfa y Omega", header: "No te pierdas el programa", footer: "¡Comunícate con nosotros para patrocinarnos!" },
];

function App() {
  const [currentImage, setCurrentImage] = useState(null);
  const [darkToggle, setDarkToggle] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [showDonationInfo, setShowDonationInfo] = useState(false); // State to control donation info visibility  

  useEffect(() => {
    // Function to get the current scheduled image, ad, or a fallback image  
    const getCurrentImage = () => {
      const now = moment();
      const currentDay = now.day(); // 0 (Sunday) to 6 (Saturday)  
      const currentTime = now.format('HH:mm');

      // Check for date range images first  
      const dateRangeImage = imageSchedule.find(schedule => {
        return schedule.startDate && schedule.endDate &&
          now.isBetween(moment(schedule.startDate), moment(schedule.endDate).endOf('day'), null, '[]');
      });

      if (dateRangeImage) {
        return dateRangeImage;
      }

      // Check if it's time for a scheduled ad  
      const scheduledAdTime = adSchedule.find(schedule => {
        return schedule.day === currentDay &&
          currentTime >= schedule.time &&
          currentTime < moment(schedule.time, 'HH:mm').add(schedule.duration, 'minutes').format('HH:mm');
      });

      if (scheduledAdTime) {
        // If it's ad time, return a random ad  
        return randomAds[Math.floor(Math.random() * randomAds.length)];
      }

      // If it's not ad time, check for scheduled programs  
      const scheduledImage = imageSchedule.find(schedule => {
        return schedule.day === currentDay &&
          currentTime >= schedule.time &&
          currentTime < moment(schedule.time, 'HH:mm').add(schedule.duration, 'minutes').format('HH:mm');
      });

      // If no scheduled image is found, return null  
      return scheduledImage || null;
    };

    // Update the current image  
    const updateImage = () => {
      setCurrentImage(getCurrentImage());
    };

    // Initial update  
    updateImage();

    // Set interval to check every minute  
    const interval = setInterval(updateImage, 60000);

    // Clean up interval on component unmount  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AOS.init({
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkToggle;
    setDarkToggle(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  const shareApp = () => {
    const urlToShare = "https://www.radiohermonfm.com";
    const message = encodeURIComponent("Escucha Radio Hermón - Un rocío que desciende de lo alto");

    // WhatsApp sharing link  
    const whatsappLink = `https://api.whatsapp.com/send?text=${message}%0A${urlToShare}`;

    // Telegram sharing link  
    const telegramLink = `https://t.me/share/url?url=${urlToShare}&text=${message}`;

    // Open both sharing links in new tabs  
    window.open(whatsappLink, "_blank"); // Opens WhatsApp share  
    window.open(telegramLink, "_blank"); // Opens Telegram share  
  };

  const toggleDonationInfo = () => {
    setShowDonationInfo(prevState => !prevState);
  };

  const copyToClipboard = (text) => {
    // Use the Clipboard API if available  
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        alert("Información copiada: " + text);
      }).catch(err => {
        console.error('Error copying to clipboard: ', err);
      });
    } else {
      // Fallback for older browsers or non-secure contexts  
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Avoid scrolling to bottom  
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        alert("Información copiada: " + text);
      } catch (err) {
        console.error('Error copying to clipboard: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="flex justify-center items-center" data-aos="fade-in" data-aos-delay="200">
      <div className={`h-screen w-full ${darkToggle && "dark"}`}>
        <div className="flex flex-col justify-center items-center w-full h-screen dark:bg-gray-800">
          <img
            src="/charlie-brown.svg"
            className="object-cover absolute w-full h-screen bg-center bg-no-repeat bg-cover opacity-5 dark:opacity-10"
            alt="Background"
          />
          <label className="toggleDarkBtn" data-aos="fade-left" data-aos-delay="500">
            <input type="checkbox" checked={darkToggle} onChange={toggleDarkMode} />
            <span className="bg-gray-400 slideBtnTg round"></span>
          </label>
          <div className="w-[370px] sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-xl mt-4 text-white dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-50" data-aos="zoom-in" data-aos-delay="700">
            <div className="flex justify-between items-center -mb-4">
              <button
                onClick={shareApp}
                title="Compartir"
                className="p-2 text-gray-800 rounded-full backdrop-blur-sm transition-all duration-300 dark:text-gray-200 hover:text-blue-500 hover:scale-105"
              >
                <i className="text-lg icon-share" />
              </button>
              <button
                onClick={toggleDonationInfo}
                title="Donar"
                className="p-2 text-red-600 rounded-full backdrop-blur-sm transition-all duration-300 dark:text-red-400 hover:text-red-500 hover:scale-105"
              >
                <i className="text-lg icon-heart" />
              </button>
            </div>
            <div className="px-6 space-y-2 text-center sm:space-y-3">
              <div className="text-3xl font-bold text-gray-800 filter drop-shadow-md dark:text-gray-200 md:text-2xl">
                Radio Hermón
              </div>
              <div>
                {currentImage && (
                  <div className="flex justify-center items-center w-full">
                    <div className="flex flex-col justify-center items-center space-y-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-600">
                        {currentImage.header}
                      </span>
                      <img
                        className="z-40 h-48 rounded-xl transition-all ease-in-out md:h-80 hover:scale-110 sm:hover:scale-100"
                        src={currentImage.image}
                        alt={currentImage.name}
                      />
                      <marquee className="w-8/12 text-gray-800 drop-shadow-md md:w-full dark:text-gray-200">
                        {currentImage.footer}
                      </marquee>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center text-sm text-grey-darker" data-aos="fade-right" data-aos-delay="900">
                <CustomPlayer
                  darkMode={darkToggle}
                  src="https://app0102.sonicpanelradio.com/8840/stream"
                />
              </div>
              <div className="flex flex-row justify-center items-center pt-2 space-x-2 text-center" data-aos="fade-up" data-aos-delay="800">
                <a href="https://www.facebook.com/Hermon95.3" className="pointer-cursor" target="_blank" rel="noreferrer">
                  <button type="button" className="text-white text-md sm:text-sm hover:text-[#3b5998] bg-[#3b5998] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-facebook-squared active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200">
                    Facebook
                  </button>
                </a>
                <a href="https://www.instagram.com/radiohermon/" className="pointer-cursor" target="_blank" rel="noreferrer">
                  <button type="button" className="text-white text-md sm:text-sm hover:text-[#bc2a8d] bg-[#bc2a8d] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-instagram-1 active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200">
                    Instagram
                  </button>
                </a>
              </div>
            </div>

            {/* Donation Info Popup */}
            {showDonationInfo && (
              <div className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"> {/* Overlay */}
                <div className="p-4 w-full text-gray-800 bg-gray-100 rounded-lg shadow-lg transition-transform duration-300 ease-in-out transform scale-100 dark:bg-gray-900 dark:text-gray-200">
                  <h2 className="mb-2 text-xl font-bold text-center">Donaciones (Venezuela)</h2>
                  <ul className="pl-5 list-disc">
                    <li>
                      Banco: <b onClick={() => copyToClipboard("Bancaribe (0114)")} className="text-blue-500 cursor-pointer hover:underline">Bancaribe (0114)</b>
                    </li>
                    <li>
                      Cuenta: <b onClick={() => copyToClipboard("01140370113700093360")} className="text-blue-500 cursor-pointer hover:underline">01140370113700093360</b>
                    </li>
                    <li>
                      RIF: <b onClick={() => copyToClipboard("J306723072")} className="text-blue-500 cursor-pointer hover:underline">J306723072</b>
                    </li>
                    <li>
                      Nombre: <b onClick={() => copyToClipboard("ASOCIACION CIVIL IGLESIA EVANGELICA HERMON")} className="text-blue-500 cursor-pointer hover:underline">ASOCIACION CIVIL IGLESIA EVANGELICA HERMON</b>
                    </li>
                  </ul>
                  <button
                    onClick={toggleDonationInfo}
                    className="py-1 mt-4 w-full text-white bg-red-600 rounded-lg transition duration-200 hover:bg-red-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex fixed inset-x-0 bottom-0 justify-center items-center no-underline focus:underline-none focus:no-underline">
          <div className="mx-auto w-[370px] sm:w-96 bg-transparent no-underline">
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="py-2 px-4 w-[370px] sm:w-96 mb-2 overflow-hidden rounded-full text-gray-800 dark:text-gray-200 font-bold text-lg md:text-xl bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80">
                    <div className="ml-2 space-x-1">
                      <i className={open ? "animate-pulse icon-angle-double-down" : "icon-home-circled"} />
                      <span className="filter drop-shadow-md">Iglesia Hermón</span>
                    </div>
                    <img
                      className="object-cover absolute inset-0 w-full h-full rounded-full opacity-10 blur-sm transition-all duration-500 ease-in-out hover:opacity-100 hover:blur-none"
                      src={Church}
                      alt="Church"
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="w-[370px] sm:w-96 rounded-bl-none rounded-br-none rounded-tl-3xl rounded-tr-3xl bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80 px-4 pb-2">
                    <div className="flex flex-row justify-center items-center pt-4 space-x-2 text-center">
                      <a href="https://www.facebook.com/people/Iglesia-Evangelica-Hermon/100064624004737/" className="pointer-cursor" target="_blank" rel="noreferrer">
                        <button type="button" className="text-white text-md sm:text-sm hover:text-[#3b5998] bg-[#3b5998] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-facebook-squared active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200">
                          Facebook
                        </button>
                      </a>
                      <a href="https://twitter.com/IglesiaHermon/" className="pointer-cursor" target="_blank" rel="noreferrer">
                        <button type="button" className="text-white text-md sm:text-sm hover:text-[#00aced] bg-[#00aced] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-twitter-2 active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200">
                          Twitter
                        </button>
                      </a>
                      <a href="https://instagram.com/iglesiaevangelicahermon/" className="pointer-cursor" target="_blank" rel="noreferrer">
                        <button type="button" className="text-white text-md sm:text-sm hover:text-[#bc2a8d] bg-[#bc2a8d] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-instagram-1 active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200">
                          Instagram
                        </button>
                      </a>
                    </div>
                    <div className="flex flex-row justify-center items-center mt-2 text-gray-800 text-md dark:text-gray-400">
                      © {new Date().getFullYear()} Fundación Cultural Hermón RTV
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;