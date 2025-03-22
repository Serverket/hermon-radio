import React from 'react';
import { Disclosure } from "@headlessui/react";
import Church from "./assets/hermon-church.webp";

const Footer = () => (
  <div className="flex fixed inset-x-0 bottom-0 z-20 justify-center items-center no-underline focus:underline-none focus:no-underline">
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
);

export default Footer;