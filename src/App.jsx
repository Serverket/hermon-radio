/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./styles/tailwind.css";
import Church from "./assets/hermon-church.webp";
import { Disclosure } from "@headlessui/react";
import moment from "moment";
import "aos/dist/aos.css";
import AOS from "aos";

function App() {
  /* Dark Mode */
  const [darkToggle, setDarkToggle] = React.useState(
    localStorage.getItem("darkMode") === "true" ? true : false
  );
  const toggleDarkMode = () => {
    const newDarkMode = !darkToggle;
    setDarkToggle(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  // Example image URLs (replace with your actual image URLs)
  const imageUrls = [
    "AlfayOmega.png",
    "Diosysusmaravillas.jpg",
    "EnondaconCristo.jpg",
    "VivenciasenCristo.jpeg",
    "LaFeeslaPalabradeDios.jpeg",
  ];

  // State to keep track of the currently displayed image
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [showImage, setShowImage] = useState(true);
  const [streamIcon, setStreamIcon] = useState("");
  const [HeaderText, setHeaderText] = useState("");
  const [FooterText, setFooterText] = useState("");

  // Function to check if the current image should be hidden
  const shouldHideImage = (startTime) => {
    const currentTime = moment();
    const endTime = moment(startTime).add(1, "hour");
    return currentTime.isAfter(endTime);
  };

  // Function to update the displayed image based on the current time
  const updateDisplayedImage = () => {
    const currentTime = moment();
    const scheduledImages = [
      /* ALFA Y OMEGA */
      {
        dayOfWeek: "Friday",
        time: { hours: 18, minutes: 0 },
        index: 0,
        icon: "bg-green-300 dark:bg-slate-300 rounded-full icon-podcast filter drop-shadow-md animate-pulse",
        header: "Estás en sintonía de",
        footer: "¡Comunícate con nosotros para patrocinarnos!",
      },
      /* PUBLICIDAD */
      {
        dayOfWeek: "Saturday",
        time: { hours: 19, minutes: 0 },
        index: 0,
        icon: "bg-gradient-to-r from-blue-300 to-purple-300 dark:bg-slate-300 rounded-full icon-podcast-1 filter drop-shadow-md animate-pulse",
        header: "No te pierdas el programa",
        footer: "¡Comunícate con nosotros para patrocinarnos!",
      },
      {
        dayOfWeek: "Sunday",
        time: { hours: 19, minutes: 0 },
        index: 0,
        icon: "bg-gradient-to-r from-blue-300 to-purple-300 dark:bg-slate-300 rounded-full icon-podcast-1 filter drop-shadow-md animate-pulse",
        header: "No te pierdas el programa",
        footer: "¡Comunícate con nosotros para patrocinarnos!",
      },
      {
        dayOfWeek: "Monday",
        time: { hours: 19, minutes: 0 },
        index: 0,
        icon: "bg-gradient-to-r from-blue-300 to-purple-300 dark:bg-slate-300 rounded-full icon-podcast-1 filter drop-shadow-md animate-pulse",
        header: "No te pierdas el programa",
        footer: "¡Comunícate con nosotros para patrocinarnos!",
      },
      {
        dayOfWeek: "Tuesday",
        time: { hours: 19, minutes: 0 },
        index: 0,
        icon: "bg-gradient-to-r from-blue-300 to-purple-300 dark:bg-slate-300 rounded-full icon-podcast-1 filter drop-shadow-md animate-pulse",
        header: "No te pierdas el programa",
        footer: "¡Comunícate con nosotros para patrocinarnos!",
      },
      {
        dayOfWeek: "Thursday",
        time: { hours: 19, minutes: 0 },
        index: 0,
        icon: "bg-gradient-to-r from-blue-300 to-purple-300 dark:bg-slate-300 rounded-full icon-podcast-1 filter drop-shadow-md animate-pulse",
        header: "No te pierdas el programa",
        footer: "¡Comunícate con nosotros para patrocinarnos!",
      },
      /* ALFA Y OMEGA */

      /* VIVENCIAS EN CRISTO */
      {
        dayOfWeek: "Saturday",
        time: { hours: 21, minutes: 0 },
        index: 3,
        icon: "bg-green-300 dark:bg-slate-300 rounded-full icon-podcast filter drop-shadow-md animate-pulse",
        header: "Estás en sintonía de",
        footer: "¡Comunícate con nosotros para patrocinarnos!",
      },
      /* VIVENCIAS EN CRISTO */

      /* DIOS Y SYS MARAVILLAS */
      {
        dayOfWeek: "Monday",
        time: { hours: 13, minutes: 0 },
        index: 1,
        icon: "bg-gradient-to-r from-red-300 to-pink-300 dark:bg-slate-300 rounded-full icon-podcast filter drop-shadow-md animate-pulse",
        header: "Estás en sintonía de",
        footer: "Charlas | Música en vivo | Consejos | Reflexión",
      },
      /* EN ONDA CON CRISTO */
      {
        dayOfWeek: "Sunday",
        time: { hours: 13, minutes: 0 },
        index: 2,
        icon: "bg-gradient-to-r from-green-300 to-teal-300 dark:bg-slate-300 rounded-full icon-podcast filter drop-shadow-md animate-pulse",
        header: "Estás en sintonía de",
        footer: "Dios te bendiga",
      },
      /* LA FE ES POR EL OIR LA PALABRA DE DIOS */
      {
        dayOfWeek: "Monday",
        time: [{ hours: 22, minutes: 0 }],
        index: 4,
        icon: "bg-gradient-to-r from-green-300 to-teal-300 dark:bg-slate-300 rounded-full icon-podcast filter drop-shadow-md animate-pulse",
        header: "Estás en sintonía de",
        footer: "Dios te bendiga",
      },
    ];

    const visibleImage = scheduledImages.find(({ dayOfWeek, time, index }) => {
      const startTime = moment().startOf("week").day(dayOfWeek).set({
        hours: time.hours,
        minutes: time.minutes,
      });
      const endTime = startTime.clone().add(1, "hour");

      return (
        showImage &&
        currentTime.isSameOrAfter(startTime) &&
        currentTime.isBefore(endTime)
      );
    });

    if (visibleImage) {
      setCurrentImageIndex(visibleImage.index);
      setStreamIcon(visibleImage.icon);
      setHeaderText(visibleImage.header);
      setFooterText(visibleImage.footer);
    } else {
      setCurrentImageIndex(null);
      setStreamIcon("");
      setHeaderText("");
      setFooterText("");
    }
  };

  // Update the displayed image on component mount
  useEffect(() => {
    updateDisplayedImage();
  }, [showImage]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateDisplayedImage();
    }, 1000); // 1 second in milliseconds

    // Clear the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Hide the image after 1 hour
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowImage(false);
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    // Clear the timeout on component unmount
    return () => clearTimeout(timeout);
  }, [showImage]);

  useEffect(() => {
    AOS.init({
      once: true,
      easing: "ease-out-cubic",
    });
  });

  return (
    <>
      <div
        className="flex items-center justify-center"
        data-aos="fade-in"
        data-aos-delay="200"
      >
        <div className={`h-screen w-full ${darkToggle && "dark"}`}>
          <div className="h-screen w-full flex items-center justify-center flex-col dark:bg-gray-800">
            {/* original background in previous tag is: bg-gray-300 */}
            <img
              src="/charlie-brown.svg"
              className="absolute h-screen w-full bg-no-repeat bg-cover object-cover bg-center opacity-5 dark:opacity-10"
            />
            <label
              className="toggleDarkBtn"
              data-aos="fade-left"
              data-aos-delay="500"
            >
              <input
                type="checkbox"
                checked={darkToggle}
                onChange={toggleDarkMode}
              />
              <span className="slideBtnTg bg-gray-400 round"></span>
            </label>
            {/* Previous opacity from next tag: bg-opacity-40 firefox:bg-opacity-50 opacity-80 */}
            <div
              className="w-[370px] sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-xl mt-4 text-white dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-50"
              data-aos="zoom-in"
              data-aos-delay="700"
            >
              <div className="w-full flex text-center items-center justify-center">
                {/* <div id="fb-root"></div>
            <div className="fb-like-box mb-5 border-4 rounded-sm border-blue-500"
               data-href="https://m.facebook.com/people/Iglesia-Evangelica-Hermon/100064624004737"
               data-width="292" 
               data-show-faces="false" 
               data-header="true" 
               data-stream="true" 
               data-show-border="true">
            </div> */}
              </div>
              <div className="px-6 space-y-2 sm:space-y-3 text-center">
                <div className="text-gray-800 dark:text-gray-200 font-bold text-3xl md:text-2xl filter drop-shadow-md">
                  Radio Hermón
                </div>
                <p className="text-slate-700 font-bold"></p>
                <div>
                  {currentImageIndex !== null && showImage ? (
                    <div className="w-full flex items-center justify-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-sm text-slate-700 dark:text-slate-600 font-bold">
                          <span className="mr-1">
                            <i className={streamIcon} />
                          </span>
                          {HeaderText}
                        </span>
                        <img
                          className="h-48 md:h-80 rounded-xl hover:scale-110 sm:hover:scale-100 transition-all ease-in-out z-40"
                          src={imageUrls[currentImageIndex]}
                          alt={`Image ${currentImageIndex + 1}`}
                        />
                        <marquee className="w-8/12 md:w-full text-gray-800 dark:text-gray-200 drop-shadow-md">
                          {FooterText}
                        </marquee>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* <div className="w-full flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="text-sm text-slate-700 dark:text-slate-500 font-bold">
                            ¡Únete a nuestra fiesta!
                          </span>
                          <img
                            data-aos="zoom-in"
                            data-aos-delay="1500"
                            className="h-48 md:h-80 lg:h-96 rounded-xl hover:scale-110 sm:hover:scale-100 transition-all ease-in-out z-40"
                            src="62aniversario.jpeg"
                            alt="Publicación de 62° Aniversario"
                          />
                          <marquee
                            className="w-8/12 md:w-full text-gray-800 dark:text-gray-200 drop-shadow-md"
                            data-aos="fade-up"
                            data-aos-delay="1000"
                          >
                            ¡Te invitamos a ser parte de este gran evento,
                            visítanos!
                          </marquee>
                        </div>
                      </div> */}
                    </div>
                  )}
                </div>
                <div
                  className="flex justify-center text-sm text-grey-darker"
                  data-aos="fade-right"
                  data-aos-delay="900"
                >
                  <audio
                    className="w-64 sm:w-full rounded-full bg-gradient-to-t from-gray-200 to-gray-600 dark:bg-gradient-to-t dark:from-blue-500 dark:to-blue-100 dark:shadow-lg dark:shadow-blue-500/30 shadow-lg shadow-blue-500/50 border-[1px] border-blue-400 dark:border-none"
                    autoPlay
                    controls
                    src="https://radiointernet.co/8020/stream"
                  ></audio>
                </div>
                <div
                  className="flex flex-row items-center justify-center space-x-2 text-center pt-2"
                  data-aos="fade-up"
                  data-aos-delay="800"
                >
                  <a
                    href="https://www.facebook.com/Hermon95.3"
                    className="pointer-cursor"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button
                      type="button"
                      className="text-white text-md sm:text-sm hover:text-[#3b5998] bg-[#3b5998] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-facebook-squared active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200"
                    >
                      Facebook<div></div>
                    </button>
                  </a>
                  <a
                    href="https://www.instagram.com/radiohermon/"
                    className="pointer-cursor"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button
                      type="button"
                      className="text-white text-md sm:text-sm hover:text-[#bc2a8d] bg-[#bc2a8d] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-instagram-1 active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200"
                    >
                      Instagram<div></div>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 inset-x-0 flex items-center justify-center no-underline focus:underline-none focus:no-underline">
            <div className="mx-auto w-[370px] sm:w-96 bg-transparent no-underline">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="py-2 px-4 w-[370px] sm:w-96 mb-2 overflow-hidden rounded-full text-gray-800 dark:text-gray-200 font-bold text-lg md:text-xl bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80">
                      <div className="ml-2 space-x-1">
                        <i
                          className={
                            open
                              ? "icon-angle-double-down animate-pulse"
                              : "icon-home-circled"
                          }
                        />
                        <span className="filter drop-shadow-md">
                          Iglesia Hermón
                        </span>
                      </div>
                      <img
                        className="absolute opacity-10 transition-all ease-in-out duration-500 hover:opacity-100 blur-sm hover:blur-none inset-0 h-full w-full object-cover rounded-full"
                        src={Church}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="w-[370px] sm:w-96 rounded-bl-none rounded-br-none rounded-tl-3xl rounded-tr-3xl bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80 px-4 pb-2">
                      <div className="flex flex-row items-center justify-center space-x-2 text-center pt-4">
                        <a
                          href="https://www.facebook.com/people/Iglesia-Evangelica-Hermon/100064624004737/"
                          className="pointer-cursor"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <button
                            type="button"
                            className="text-white text-md sm:text-sm hover:text-[#3b5998] bg-[#3b5998] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-facebook-squared active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200"
                          >
                            Facebook<div></div>
                          </button>
                        </a>
                        <a
                          href="https://twitter.com/IglesiaHermon/"
                          className="pointer-cursor"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <button
                            type="button"
                            className="text-white text-md sm:text-sm hover:text-[#00aced] bg-[#00aced] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-twitter-2 active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200"
                          >
                            Twitter<div></div>
                          </button>
                        </a>
                        <a
                          href="https://instagram.com/iglesiaevangelicahermon/"
                          className="pointer-cursor"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <button
                            type="button"
                            className="text-white text-md sm:text-sm hover:text-[#bc2a8d] bg-[#bc2a8d] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-instagram-1 active:no-underline no-underline focus:outline-none rounded-full px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200"
                          >
                            Instagram<div></div>
                          </button>
                        </a>
                      </div>
                      <div className="flex flex-row justify-center items-center mt-2 text-md text-gray-800 dark:text-gray-400 ">
                        {`© ${new Date().getFullYear()}`} Fundación Cultural
                        Hermón RTV
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
