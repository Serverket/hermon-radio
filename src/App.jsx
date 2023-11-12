/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./styles/tailwind.css";
import Church from "./assets/hermon-church.webp";
import { Disclosure } from "@headlessui/react";

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

  /* Cover Schedule */
  const image1Url = "/public/programas/jueves_8.jpg";
  const image2Url = "/public/programas/domingos_1-250.jpg";
  const [showImage, setShowImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      // 
      const displaySchedule1 = { day: 6, hours: 23, minutes: 54 };

      // 
      const displaySchedule2 = { day: 6, hours: 23, minutes: 55 };

      const displaySchedules = [displaySchedule1, displaySchedule2];

      for (const displaySchedule of displaySchedules) {
        const displayTime = new Date(now);
        displayTime.setHours(displaySchedule.hours);
        displayTime.setMinutes(displaySchedule.minutes || 0);
        displayTime.setSeconds(0);

        // Check if the current time matches the specified display time
        if (
          now.getDay() === displaySchedule.day &&
          now.getHours() === displaySchedule.hours &&
          now.getMinutes() === displaySchedule.minutes
        ) {
          setCurrentImageUrl(
            displaySchedule === displaySchedule1 ? image1Url : image2Url
          );
          setShowImage(true);

          // Set a timeout to hide the image after 1 hour
          setTimeout(() => {
            setShowImage(false);
            setCurrentImageUrl(null);
          }, 60 * 60 * 1000); // 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
          return;
        }
      }

      setShowImage(false);
      setCurrentImageUrl(null);
    }, 1000 * 60); // Check every minute

    // Cleanup the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center">
        <div className={`h-screen w-full ${darkToggle && "dark"}`}>
          <div className="h-screen w-full flex items-center justify-center flex-col dark:bg-gray-800">
            {/* original background in previous tag is: bg-gray-300 */}
            <img
              src="/charlie-brown.svg"
              className="absolute h-screen w-full bg-no-repeat bg-cover object-cover bg-center opacity-5 dark:opacity-10"
            />
            <label className="toggleDarkBtn">
              <input
                type="checkbox"
                checked={darkToggle}
                onChange={toggleDarkMode}
              />
              <span className="slideBtnTg bg-gray-400 round"></span>
            </label>
            {/* Previous opacity from next tag: bg-opacity-40 firefox:bg-opacity-50 opacity-80 */}
            <div className="w-[370px] sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-xl mt-4 text-white dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-50">
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

                {/*                 <div>
                  {showImage ? (
                    <div>
                    <h1 className="text-slate-700 font-bold">Image Display at Specific Time</h1>
                    <img className="rounded-lg h-52" src={currentImageUrl} alt="Displayed Image" />
                    </div>
                  ) : (
                    <p className="text-slate-700 font-bold"></p>
                  )}
                </div> */}
              </div>
              <div className="px-6 space-y-4 sm:space-y-8 text-center">
                <div className="text-gray-800 dark:text-gray-200 font-bold text-3xl md:text-2xl filter drop-shadow-md">
                  Radio Hermón
                </div>
                {/* <div className="flex flex-col items-center justify-center space-y-2">
                  <span className="text-sm text-slate-700 dark:text-slate-600 font-bold">
                    <span className="bg-green-300 dark:bg-slate-300 rounded-full mr-1">
                      <i className="icon-podcast filter drop-shadow-md animate-pulse" />
                    </span>
                    Estás en sintonía de
                  </span>
                  <img
                    className="rounded-lg h-52 md:h-40 lg:h-72 xl:h-80"
                    src={image2Url}
                    alt="Displayed Image"
                  />
                </div>
                <p className="text-slate-700 font-bold"></p> */}
                <div className="flex justify-center text-sm text-grey-darker">
                  <audio
                    className="w-64 sm:w-full rounded-full bg-gradient-to-t from-gray-200 to-gray-600 dark:bg-gradient-to-t dark:from-blue-500 dark:to-blue-100 dark:shadow-lg dark:shadow-blue-500/30 shadow-lg shadow-blue-500/50 border-[1px] border-blue-400 dark:border-none"
                    autoPlay
                    controls
                    src="https://radiointernet.co/8020/stream"
                  ></audio>
                </div>
                <div className="flex flex-row items-center justify-center space-x-2 text-center pt-2">
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
                    <Disclosure.Button className="py-4 px-4 w-[370px] sm:w-96 overflow-hidden rounded-l-full rounded-r-full rounded-bl-none rounded-br-none text-gray-800 dark:text-gray-200 font-bold text-lg md:text-xl bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80">
                      <img
                        className="absolute inset-0 h-full w-1/3 object-cover"
                        src={Church}
                      />
                      <div className="ml-2 space-x-1">
                        <i
                          className={
                            open
                              ? "icon-angle-double-down animate-pulse"
                              : "icon-home-circled"
                          }
                        />
                        <span>La Iglesia</span>
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className="w-[370px] sm:w-96 rounded-l-xl rounded-r-xl rounded-bl-none rounded-br-none rounded-tl-none rounded-tr-none bg-gray-100 dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80 px-4 pb-4">
                      <div className="flex flex-row items-center justify-center space-x-2 text-center pt-2">
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
                      <div className="flex flex-row justify-center items-center mt-4 text-md text-gray-800 dark:text-gray-400 ">
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
