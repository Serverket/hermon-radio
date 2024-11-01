import React, { useState, useEffect } from "react";  
import Church from "./assets/hermon-church.webp";  
import { Disclosure } from "@headlessui/react";  
import CustomPlayer from './CustomPlayer';  
import "./styles/tailwind.css";  
import moment from "moment";  
import "aos/dist/aos.css";  
import AOS from "aos";  

// Image schedule configuration
const imageSchedule = [
  // Regular schedule
  // Monday
  { day: 1, time: "13:00", duration: 180, image: "Diosysusmaravillas.jpg", name: "Dios y sus maravillas", header: "Estás en sintonía de", footer: "Charlas | Música en vivo | Consejos | Reflexión" },  
  { day: 1, time: "22:00", duration: 60, image: "LaFeeslaPalabradeDios.jpeg", name: "La Fe es la Palabra de Dios", header: "Estás en sintonía de", footer: "Dios te bendiga" },  
  // Tuesday
  // Wednesday
  // Thursday
  // Friday
  { day: 5, time: "18:00", duration: 60, image: "AlfayOmega.png", name: "Alfa y Omega", header: "Comenta en: https://ngl.link/radiohermon", footer: "¡Comunícate con nosotros para patrocinarnos!" },  
  { day: 5, time: "19:00", duration: 120, image: "Tiempoderefrigerio.png", name: "Tiempo de Refrigerio", header: "Estás en sintonía de", footer: "Patrocinadores: Pincho Pocholin | Kiosco La Bendición | Iglesia Tiempo de Refrigerio | Escríbenos al 0424 315 71 26" },  
  // Saturday
  { day: 6, time: "21:00", duration: 60, image: "VivenciasenCristo.jpeg", name: "Vivencias en Cristo", header: "Estás en sintonía de", footer: "¡Comunícate con nosotros para patrocinarnos!" },  
  { day: 6, time: "05:00", duration: 120, image: "AmanecerConCristo.png", name: "Amanecer con Cristo", header: "Estás en sintonía de", footer: "Patrocinadores: Inversiones y Variedad Yalex A&B | Inversiones Karvican | Cerrajería El Cóndor" },  
  // Sunday
  { day: 0, time: "13:00", duration: 60, image: "EnondaconCristo.jpg", name: "En onda con Cristo", header: "Estás en sintonía de", footer: "Dios te bendiga" },  
  // Date range schedule (Anniversary) 
  { startDate: "2024-08-19", endDate: "2024-08-24", image: "8voaniversarioradio.png", name: "8vo Aniversario", header: "Programación de aniversario del 19 al 24 de Agosto de 6:00 AM a 6:00 PM", footer: 'Hechos 13:47 "Te he puesto para luz de los gentiles, a fin de que seas para salvación hasta lo último de la tierra."' },  
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

  return (
    <div className="flex items-center justify-center" data-aos="fade-in" data-aos-delay="200">
      <div className={`h-screen w-full ${darkToggle && "dark"}`}>
        <div className="flex flex-col items-center justify-center w-full h-screen dark:bg-gray-800">
          <img
            src="/charlie-brown.svg"
            className="absolute object-cover w-full h-screen bg-center bg-no-repeat bg-cover opacity-5 dark:opacity-10"
            alt="Background"
          />
          <label className="toggleDarkBtn" data-aos="fade-left" data-aos-delay="500">
            <input type="checkbox" checked={darkToggle} onChange={toggleDarkMode} />
            <span className="bg-gray-400 slideBtnTg round"></span>
          </label>
          <div className="w-[370px] sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-xl mt-4 text-white dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-50" data-aos="zoom-in" data-aos-delay="700">
            <div className="px-6 space-y-2 text-center sm:space-y-3">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 md:text-2xl filter drop-shadow-md">
                Radio Hermón
              </div>
              <div>
                {currentImage && (
                  <div className="flex items-center justify-center w-full">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-600">
                        {currentImage.header}
                      </span>
                      <img
                        className="z-40 h-48 transition-all ease-in-out md:h-80 rounded-xl hover:scale-110 sm:hover:scale-100"
                        src={currentImage.image}
                        alt={currentImage.name}
                      />
                      <marquee className="w-8/12 text-gray-800 md:w-full dark:text-gray-200 drop-shadow-md">
                        {currentImage.footer}
                      </marquee>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center text-sm text-grey-darker" data-aos="fade-right" data-aos-delay="900">
                <CustomPlayer
                  darkMode={darkToggle}
                  src="https://radiointernet.co/8020/stream"
                />
              </div>
              <div className="flex flex-row items-center justify-center pt-2 space-x-2 text-center" data-aos="fade-up" data-aos-delay="800">
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
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 flex items-center justify-center no-underline focus:underline-none focus:no-underline">
          <div className="mx-auto w-[370px] sm:w-96 bg-transparent no-underline">
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="py-2 px-4 w-[370px] sm:w-96 mb-2 overflow-hidden rounded-full text-gray-800 dark:text-gray-200 font-bold text-lg md:text-xl bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80">
                    <div className="ml-2 space-x-1">
                      <i className={open ? "icon-angle-double-down animate-pulse" : "icon-home-circled"} />
                      <span className="filter drop-shadow-md">Iglesia Hermón</span>
                    </div>
                    <img
                      className="absolute inset-0 object-cover w-full h-full transition-all duration-500 ease-in-out rounded-full opacity-10 hover:opacity-100 blur-sm hover:blur-none"
                      src={Church}
                      alt="Church"
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="w-[370px] sm:w-96 rounded-bl-none rounded-br-none rounded-tl-3xl rounded-tr-3xl bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80 px-4 pb-2">
                    <div className="flex flex-row items-center justify-center pt-4 space-x-2 text-center">
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
                    <div className="flex flex-row items-center justify-center mt-2 text-gray-800 text-md dark:text-gray-400">
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