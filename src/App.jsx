/* eslint-disable no-unused-vars */
import React from "react";
import "./styles/tailwind.css";
import Church from "./assets/hermon-church.webp";
import { Disclosure } from "@headlessui/react";

function App() {
  const [darkToggle, setDarkToggle] = React.useState(false);
  return (
    <>
      <div className="flex items-center justify-center">
        <div className={`h-screen w-full ${darkToggle && "dark"}`}>
          <div className="h-screen w-full flex items-center justify-center flex-col bg-gray-300 dark:bg-gray-800">
            <img
              src="/charlie-brown.svg"
              className="absolute h-screen w-full bg-no-repeat bg-cover object-cover bg-center opacity-5 dark:opacity-10"
            />
            <label className="toggleDarkBtn">
              <input
                type="checkbox"
                onClick={() => setDarkToggle(!darkToggle)}
              />
              <span className="slideBtnTg bg-gray-400 round"></span>
            </label>
            <div className="w-[370px] sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-xl mt-4 text-white dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80">
              <div className="md:w-1/3 flex items-start justify-center">
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
              <div className="px-6 space-y-6 sm:space-y-8 text-center">
                <div className="text-gray-800 dark:text-gray-200 font-bold text-3xl md:text-2xl">
                  Radio Hermón
                </div>
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
                        {`© ${new Date().getFullYear()}`} Fundación Cultural Hermón RTV
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
